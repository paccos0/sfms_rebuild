import { NextRequest } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type SummaryRow = RowDataPacket & {
  total_collected_today: number;
  total_collected_current_term: number;
  total_outstanding_current_term: number;
  active_students_current_year: number;
};

type TermPaymentRow = RowDataPacket & {
  term_name: string;
  academic_year_name: string;
  total_collected: number;
};

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);

  if (authResult.response) {
    return authResult.response;
  }

  try {
    const [summaryRows] = await db.query<SummaryRow[]>(
      `
        SELECT
          (
            SELECT COALESCE(SUM(amount_paid), 0)
            FROM payment
            WHERE DATE(paid_at) = CURRENT_DATE()
          ) AS total_collected_today,

          (
            SELECT COALESCE(SUM(p.amount_paid), 0)
            FROM payment p
            INNER JOIN school_setting ss
              ON ss.current_term_id = p.term_id
          ) AS total_collected_current_term,

          (
            SELECT COALESCE(SUM(
              GREATEST(COALESCE(fs.amount, 0) - COALESCE(pay.total_paid, 0), 0)
              + COALESCE(pen.unpaid_penalties, 0)
            ), 0)
            FROM school_setting ss
            INNER JOIN student_enrollment se
              ON se.academic_year_id = ss.current_academic_year_id
             AND se.enrollment_status IN ('active', 'repeated')
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
          ) AS total_outstanding_current_term,

          (
            SELECT COUNT(*)
            FROM school_setting ss
            INNER JOIN student_enrollment se
              ON se.academic_year_id = ss.current_academic_year_id
             AND se.enrollment_status IN ('active', 'repeated')
          ) AS active_students_current_year
      `
    );

    const [termRows] = await db.query<TermPaymentRow[]>(
      `
        SELECT
          t.name AS term_name,
          ay.name AS academic_year_name,
          COALESCE(SUM(p.amount_paid), 0) AS total_collected
        FROM school_setting ss
        INNER JOIN term t
          ON t.academic_year_id = ss.current_academic_year_id
        INNER JOIN academic_year ay
          ON ay.academic_year_id = t.academic_year_id
        LEFT JOIN payment p
          ON p.term_id = t.term_id
        GROUP BY t.term_id, t.name, ay.name
        ORDER BY t.term_id ASC
      `
    );

    const summary = summaryRows[0];

    return successResponse(
      {
        summary: {
          total_collected_today: Number(summary.total_collected_today ?? 0),
          total_collected_current_term: Number(
            summary.total_collected_current_term ?? 0
          ),
          total_outstanding_current_term: Number(
            summary.total_outstanding_current_term ?? 0
          ),
          active_students_current_year: Number(
            summary.active_students_current_year ?? 0
          )
        },
        payments_by_term: termRows.map((row) => ({
          term_name: row.term_name,
          academic_year_name: row.academic_year_name,
          total_collected: Number(row.total_collected ?? 0)
        }))
      },
      "Dashboard analytics fetched successfully"
    );
  } catch (error: any) {
    console.error("Dashboard analytics route error:", error);
    return errorResponse(
      error?.sqlMessage || "Unable to fetch dashboard analytics",
      500
    );
  }
}