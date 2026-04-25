import { NextRequest } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";
import { createPortalNotification } from "@/lib/portal-notifications";
import { sendPushToStudent } from "@/lib/push";

type PaymentRow = RowDataPacket & {
  payment_id: number;
  enrollment_id: number;
  term_id: number;
  payment_ref: string;
  student_name: string;
  registration_number: string;
  academic_year_name: string;
  term_name: string;
  amount_paid: number;
  amount_paid_display: string;
  payment_method: string;
  paid_at: string;
  note: string | null;
};

type PaymentContextRow = RowDataPacket & {
  student_id: number;
  student_name: string;
  amount_paid: number;
  payment_ref: string;
  fee_due: number | null;
  total_paid: number | null;
  unpaid_penalties: number | null;
};

function generatePaymentRef() {
  const now = new Date();
  const stamp = now.toISOString().replace(/[-:T.Z]/g, "").slice(0, 14);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `PAY-${stamp}-${random}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency: "RWF",
    maximumFractionDigits: 0
  }).format(value || 0);
}

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);

  if (authResult.response) {
    return authResult.response;
  }

  try {
    const [rows] = await db.query<PaymentRow[]>(
      `
        SELECT
          p.payment_id,
          p.enrollment_id,
          p.term_id,
          p.payment_ref,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          s.registration_number,
          ay.name AS academic_year_name,
          t.name AS term_name,
          p.amount_paid,
          CONCAT(FORMAT(p.amount_paid, 0), ' RWF') AS amount_paid_display,
          p.payment_method,
          DATE_FORMAT(p.paid_at, '%Y-%m-%d %H:%i') AS paid_at,
          p.note
        FROM payment p
        INNER JOIN student_enrollment se
          ON se.enrollment_id = p.enrollment_id
        INNER JOIN student s
          ON s.student_id = se.student_id
        INNER JOIN term t
          ON t.term_id = p.term_id
        INNER JOIN academic_year ay
          ON ay.academic_year_id = t.academic_year_id
        ORDER BY p.paid_at DESC, p.payment_id DESC
      `
    );

    return successResponse(
      {
        items: rows
      },
      "Payments fetched successfully"
    );
  } catch (error: any) {
    console.error("Payments GET route error:", error);
    return errorResponse(error?.sqlMessage || "Failed to fetch payments", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);

  if (authResult.response || !authResult.user) {
    return authResult.response;
  }

  const connection = await db.getConnection();

  try {
    const body = await request.json();

    const enrollmentId = Number(body.enrollment_id);
    const termId = Number(body.term_id);
    const amountPaid = Number(body.amount_paid);
    const paymentMethod = body.payment_method || "cash";
    const paidAt = body.paid_at;
    const note = body.note || null;

    if (!enrollmentId || !termId || !amountPaid || !paidAt) {
      return errorResponse("Missing required payment fields", 400);
    }

    if (amountPaid <= 0) {
      return errorResponse("Amount paid must be greater than zero", 400);
    }

    const receivedByAdminId = authResult.user.admin_id;

    if (!receivedByAdminId) {
      return errorResponse("Admin context not found", 401);
    }

    await connection.beginTransaction();

    const paymentRef = generatePaymentRef();

    const [result] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO payment (
          enrollment_id,
          term_id,
          payment_ref,
          amount_paid,
          payment_method,
          paid_at,
          received_by_admin_id,
          note
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        enrollmentId,
        termId,
        paymentRef,
        amountPaid,
        paymentMethod,
        paidAt,
        receivedByAdminId,
        note
      ]
    );

    const paymentId = result.insertId;

    await connection.commit();

    const [contextRows] = await db.query<PaymentContextRow[]>(
      `
        SELECT
          s.student_id,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          p.amount_paid,
          p.payment_ref,
          fs.amount AS fee_due,
          COALESCE(pay.total_paid, 0) AS total_paid,
          COALESCE(pen.unpaid_penalties, 0) AS unpaid_penalties
        FROM payment p
        INNER JOIN student_enrollment se
          ON se.enrollment_id = p.enrollment_id
        INNER JOIN student s
          ON s.student_id = se.student_id
        LEFT JOIN fee_structure fs
          ON fs.academic_year_id = se.academic_year_id
         AND fs.term_id = p.term_id
         AND fs.category_id = se.category_id
         AND fs.admission_type = se.admission_type
        LEFT JOIN (
          SELECT enrollment_id, term_id, SUM(amount_paid) AS total_paid
          FROM payment
          GROUP BY enrollment_id, term_id
        ) pay
          ON pay.enrollment_id = se.enrollment_id
         AND pay.term_id = p.term_id
        LEFT JOIN (
          SELECT
            enrollment_id,
            SUM(CASE WHEN penalty_status = 'unpaid' THEN amount ELSE 0 END) AS unpaid_penalties
          FROM student_penalty
          GROUP BY enrollment_id
        ) pen
          ON pen.enrollment_id = se.enrollment_id
        WHERE p.payment_id = ?
        LIMIT 1
      `,
      [paymentId]
    );

    const context = contextRows[0];

    if (context) {
      const feeDue = Number(context.fee_due ?? 0);
      const totalPaid = Number(context.total_paid ?? 0);
      const unpaidPenalties = Number(context.unpaid_penalties ?? 0);
      const totalOutstanding = Math.max(feeDue - totalPaid, 0) + unpaidPenalties;

      const title = "Payment recorded";
      const message = `A payment of ${formatCurrency(
        Number(context.amount_paid ?? 0)
      )} was recorded for ${context.student_name}. Remaining balance: ${formatCurrency(
        totalOutstanding
      )}. Ref: ${context.payment_ref}.`;

      await createPortalNotification({
        student_id: context.student_id,
        title,
        message,
        notification_type: "payment"
      });

      await sendPushToStudent(context.student_id, {
        title,
        body: message,
        url: "/portal/dashboard"
      });
    }

    return successResponse(
      {
        payment_id: paymentId,
        payment_ref: paymentRef
      },
      "Payment recorded successfully",
      201
    );
  } catch (error: any) {
    await connection.rollback();
    console.error("Payments POST route error:", error);
    return errorResponse(error?.sqlMessage || "Failed to record payment", 500);
  } finally {
    connection.release();
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);

  if (authResult.response) {
    return authResult.response;
  }

  try {
    const body = await request.json();

    const paymentId = Number(body.payment_id || body.id);
    const enrollmentId = Number(body.enrollment_id);
    const termId = Number(body.term_id);
    const amountPaid = Number(body.amount_paid);
    const paymentMethod = body.payment_method || "cash";
    const paidAt = body.paid_at;
    const note = body.note || null;

    if (!paymentId) {
      return errorResponse("Payment id is required", 400);
    }

    if (!enrollmentId || !termId || !amountPaid || !paidAt) {
      return errorResponse("Missing required payment fields", 400);
    }

    if (amountPaid <= 0) {
      return errorResponse("Amount paid must be greater than zero", 400);
    }

    const [result] = await db.query<ResultSetHeader>(
      `
        UPDATE payment
        SET
          enrollment_id = ?,
          term_id = ?,
          amount_paid = ?,
          payment_method = ?,
          paid_at = ?,
          note = ?
        WHERE payment_id = ?
      `,
      [
        enrollmentId,
        termId,
        amountPaid,
        paymentMethod,
        paidAt,
        note,
        paymentId
      ]
    );

    if (result.affectedRows === 0) {
      return errorResponse("Payment not found", 404);
    }

    return successResponse({}, "Payment updated successfully");
  } catch (error: any) {
    console.error("Payments PUT route error:", error);
    return errorResponse(error?.sqlMessage || "Failed to update payment", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);

  if (authResult.response) {
    return authResult.response;
  }

  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return errorResponse("Payment id is required", 400);
    }

    const [result] = await db.query<ResultSetHeader>(
      `
        DELETE FROM payment
        WHERE payment_id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return errorResponse("Payment not found", 404);
    }

    return successResponse({}, "Payment deleted successfully");
  } catch (error: any) {
    console.error("Payments DELETE route error:", error);
    return errorResponse(error?.sqlMessage || "Failed to delete payment", 500);
  }
}