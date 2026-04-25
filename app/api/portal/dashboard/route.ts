import { NextRequest } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type DashboardRow = RowDataPacket & {
  student_id: number;
  registration_number: string;
  first_name: string;
  last_name: string;
  parent_name: string | null;
  class_name: string | null;
  academic_year_name: string | null;
  term_name: string | null;
  enrollment_id: number | null;
  fee_due: number | null;
  amount_paid: number | null;
  unpaid_penalties: number | null;
};

type BankRow = RowDataPacket & {
  bank_account_id: number;
  bank_name: string;
  account_name: string;
  account_number: string;
};

type PaymentHistoryRow = RowDataPacket & {
  payment_id: number;
  payment_ref: string;
  amount_paid: number;
  payment_method: string;
  paid_at: string;
  term_name: string;
  academic_year_name: string;
};

type NotificationRow = RowDataPacket & {
  notification_id: number;
  title: string;
  message: string;
  notification_type: "payment" | "general" | "warning";
  is_read: number;
  created_at: string;
};

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["student", "parent"]);

  if (authResult.response || !authResult.user) {
    return authResult.response;
  }

  try {
    const sessionUser = authResult.user;

    const targetStudentId =
      sessionUser.role === "parent"
        ? sessionUser.linked_student_id
        : sessionUser.student_id;

    if (!targetStudentId) {
      return errorResponse("Student context not found.", 422);
    }

    const [rows] = await db.query<DashboardRow[]>(
      `
        SELECT
          s.student_id,
          s.registration_number,
          s.first_name,
          s.last_name,
          s.parent_name,
          CONCAT(
            ct.class_name,
            IF(yc.section IS NOT NULL AND yc.section != '', CONCAT(' ', yc.section), '')
          ) AS class_name,
          ay.name AS academic_year_name,
          t.name AS term_name,
          se.enrollment_id,
          fs.amount AS fee_due,
          COALESCE(pay.total_paid, 0) AS amount_paid,
          COALESCE(pen.unpaid_penalties, 0) AS unpaid_penalties
        FROM school_setting ss
        INNER JOIN student s
          ON s.student_id = ?
        LEFT JOIN academic_year ay
          ON ay.academic_year_id = ss.current_academic_year_id
        LEFT JOIN term t
          ON t.term_id = ss.current_term_id
        LEFT JOIN student_enrollment se
          ON se.student_id = s.student_id
         AND se.academic_year_id = ss.current_academic_year_id
         AND se.enrollment_status IN ('active', 'repeated')
        LEFT JOIN year_class yc
          ON yc.year_class_id = se.year_class_id
        LEFT JOIN class_template ct
          ON ct.class_template_id = yc.class_template_id
        LEFT JOIN fee_structure fs
          ON fs.academic_year_id = se.academic_year_id
         AND fs.term_id = ss.current_term_id
         AND fs.category_id = se.category_id
         AND fs.admission_type = se.admission_type
        LEFT JOIN (
          SELECT enrollment_id, term_id, SUM(amount_paid) AS total_paid
          FROM payment
          GROUP BY enrollment_id, term_id
        ) pay
          ON pay.enrollment_id = se.enrollment_id
         AND pay.term_id = ss.current_term_id
        LEFT JOIN (
          SELECT
            enrollment_id,
            SUM(CASE WHEN penalty_status = 'unpaid' THEN amount ELSE 0 END) AS unpaid_penalties
          FROM student_penalty
          GROUP BY enrollment_id
        ) pen
          ON pen.enrollment_id = se.enrollment_id
        LIMIT 1
      `,
      [targetStudentId]
    );

    const student = rows[0];

    if (!student) {
      return errorResponse("Student dashboard data not found.", 404);
    }

    const feeDue = Number(student.fee_due ?? 0);
    const amountPaid = Number(student.amount_paid ?? 0);
    const unpaidPenalties = Number(student.unpaid_penalties ?? 0);
    const tuitionBalance = Math.max(feeDue - amountPaid, 0);
    const totalOutstanding = tuitionBalance + unpaidPenalties;

    const [bankRows] = await db.query<BankRow[]>(
      `
        SELECT
          bank_account_id,
          bank_name,
          account_name,
          account_number
        FROM school_bank_account
        WHERE is_active = 1
        ORDER BY sort_order ASC, bank_name ASC
      `
    );

    const [paymentHistoryRows] = await db.query<PaymentHistoryRow[]>(
      `
        SELECT
          p.payment_id,
          p.payment_ref,
          p.amount_paid,
          p.payment_method,
          DATE_FORMAT(p.paid_at, '%Y-%m-%d %H:%i') AS paid_at,
          t.name AS term_name,
          ay.name AS academic_year_name
        FROM payment p
        INNER JOIN student_enrollment se
          ON se.enrollment_id = p.enrollment_id
        INNER JOIN term t
          ON t.term_id = p.term_id
        INNER JOIN academic_year ay
          ON ay.academic_year_id = t.academic_year_id
        WHERE se.student_id = ?
        ORDER BY p.paid_at DESC, p.payment_id DESC
        LIMIT 20
      `,
      [targetStudentId]
    );

    const [notificationRows] = await db.query<NotificationRow[]>(
      `
        SELECT
          notification_id,
          title,
          message,
          notification_type,
          is_read,
          DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at
        FROM portal_notification
        WHERE student_id = ?
        ORDER BY created_at DESC, notification_id DESC
        LIMIT 10
      `,
      [targetStudentId]
    );

    const unreadNotifications = notificationRows.filter(
      (notification) => Number(notification.is_read) === 0
    ).length;

    return successResponse(
      {
        viewer: {
          role: sessionUser.role,
          display_name: sessionUser.display_name
        },
        student: {
          student_id: student.student_id,
          registration_number: student.registration_number,
          full_name: `${student.first_name} ${student.last_name}`,
          parent_name: student.parent_name,
          class_name: student.class_name,
          academic_year: student.academic_year_name,
          term: student.term_name
        },
        finance: {
          fee_due: feeDue,
          amount_paid: amountPaid,
          tuition_balance: tuitionBalance,
          unpaid_penalties: unpaidPenalties,
          total_outstanding: totalOutstanding
        },
        bank_accounts: bankRows.map((row) => ({
          bank_name: row.bank_name,
          account_name: row.account_name,
          account_number: row.account_number
        })),
        payment_history: paymentHistoryRows.map((row) => ({
          payment_id: row.payment_id,
          payment_ref: row.payment_ref,
          amount_paid: Number(row.amount_paid ?? 0),
          payment_method: row.payment_method,
          paid_at: row.paid_at,
          term_name: row.term_name,
          academic_year_name: row.academic_year_name
        })),
        notifications: {
          unread_count: unreadNotifications,
          items: notificationRows.map((row) => ({
            notification_id: row.notification_id,
            title: row.title,
            message: row.message,
            notification_type: row.notification_type,
            is_read: Boolean(row.is_read),
            created_at: row.created_at
          }))
        }
      },
      "Portal dashboard fetched successfully"
    );
  } catch (error: any) {
    console.error("Portal dashboard route error:", error);
    return errorResponse(
      error?.sqlMessage || "Unable to fetch portal dashboard data",
      500
    );
  }
}