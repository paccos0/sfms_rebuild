import { NextRequest } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";

type EnrollmentRow = RowDataPacket & {
  enrollment_id: number;
  academic_year_id: number;
  category_id: number;
  admission_type: "new" | "continuing";
  student_name: string;
};

type TermRow = RowDataPacket & {
  term_id: number;
  academic_year_id: number;
  name: string;
};

type FeeRow = RowDataPacket & {
  amount: number;
};

type PaidRow = RowDataPacket & {
  total_paid: number | null;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const enrollmentId = searchParams.get("enrollment_id");
    const termId = searchParams.get("term_id");
    const amountInput = Number(searchParams.get("amount") || 0);

    if (!enrollmentId || !termId) {
      return errorResponse("Enrollment and term are required", 400);
    }

    const [enrollmentRows] = await db.query<EnrollmentRow[]>(
      `
      SELECT
        se.enrollment_id,
        se.academic_year_id,
        se.category_id,
        se.admission_type,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name
      FROM student_enrollment se
      INNER JOIN student s ON s.student_id = se.student_id
      WHERE se.enrollment_id = ?
      LIMIT 1
      `,
      [enrollmentId]
    );

    if (enrollmentRows.length === 0) {
      return errorResponse("Enrollment not found", 404);
    }

    const enrollment = enrollmentRows[0];

    const [termRows] = await db.query<TermRow[]>(
      `
      SELECT term_id, academic_year_id, name
      FROM term
      WHERE term_id = ?
      LIMIT 1
      `,
      [termId]
    );

    if (termRows.length === 0) {
      return errorResponse("Term not found", 404);
    }

    const term = termRows[0];

    if (String(term.academic_year_id) !== String(enrollment.academic_year_id)) {
      return errorResponse(
        "Selected term does not belong to the student's academic year",
        400
      );
    }

    const [feeRows] = await db.query<FeeRow[]>(
      `
      SELECT amount
      FROM fee_structure
      WHERE academic_year_id = ?
        AND term_id = ?
        AND category_id = ?
        AND admission_type = ?
        AND is_active = 1
      LIMIT 1
      `,
      [
        enrollment.academic_year_id,
        termId,
        enrollment.category_id,
        enrollment.admission_type,
      ]
    );

    if (feeRows.length === 0) {
      return errorResponse("No matching fee structure found", 404);
    }

    const expectedFee = Number(feeRows[0].amount);

    const [paidRows] = await db.query<PaidRow[]>(
      `
      SELECT COALESCE(SUM(amount_paid), 0) AS total_paid
      FROM payment
      WHERE enrollment_id = ?
        AND term_id = ?
      `,
      [enrollmentId, termId]
    );

    const totalPaid = Number(paidRows[0]?.total_paid || 0);
    const outstanding = Math.max(expectedFee - totalPaid, 0);
    const credit = Math.max(totalPaid - expectedFee, 0);

    const projectedTotal = totalPaid + Math.max(amountInput, 0);
    const projectedOutstanding = Math.max(expectedFee - projectedTotal, 0);
    const projectedCredit = Math.max(projectedTotal - expectedFee, 0);

    return successResponse(
      {
        student_name: enrollment.student_name,
        expected_fee: expectedFee,
        total_paid: totalPaid,
        outstanding,
        credit,
        projected_total: projectedTotal,
        projected_outstanding: projectedOutstanding,
        projected_credit: projectedCredit,
      },
      "Payment preview generated successfully"
    );
  } catch (error: any) {
    return errorResponse(error?.sqlMessage || "Failed to preview payment", 500);
  }
}