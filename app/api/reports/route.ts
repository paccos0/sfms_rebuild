import { NextRequest } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type Row = RowDataPacket & {
  class_name: string;
  student_count: number;
  expected_fees_display: string;
  collected_fees_display: string;
  outstanding_balance_display: string;
};

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);
  if (authResult.response) return authResult.response;

  try {
    const [settingsRows] = await db.query<RowDataPacket[]>(`
      SELECT current_academic_year_id, current_term_id
      FROM school_setting
      ORDER BY setting_id ASC
      LIMIT 1
    `);

    const settings = settingsRows[0];
    if (!settings?.current_academic_year_id || !settings?.current_term_id) {
      return successResponse({ items: [] }, "No current academic context configured yet");
    }

    const [rows] = await db.query<Row[]>(`
      SELECT
        CONCAT(ct.class_name, IF(yc.section IS NOT NULL, CONCAT(' ', yc.section), '')) AS class_name,
        COUNT(se.enrollment_id) AS student_count,
        FORMAT(COALESCE(SUM(fs.amount), 0), 0) AS expected_fees_display,
        FORMAT(COALESCE(SUM(payments.total_paid), 0), 0) AS collected_fees_display,
        FORMAT(COALESCE(SUM(fs.amount - COALESCE(payments.total_paid, 0)), 0), 0) AS outstanding_balance_display
      FROM student_enrollment se
      INNER JOIN year_class yc ON yc.year_class_id = se.year_class_id
      INNER JOIN class_template ct ON ct.class_template_id = yc.class_template_id
      INNER JOIN fee_structure fs
        ON fs.academic_year_id = se.academic_year_id
       AND fs.term_id = ?
       AND fs.category_id = se.category_id
       AND fs.admission_type = se.admission_type
      LEFT JOIN (
        SELECT enrollment_id, term_id, SUM(amount_paid) AS total_paid
        FROM payment
        GROUP BY enrollment_id, term_id
      ) payments
        ON payments.enrollment_id = se.enrollment_id
       AND payments.term_id = fs.term_id
      WHERE se.academic_year_id = ?
        AND se.enrollment_status = 'active'
      GROUP BY yc.year_class_id, ct.class_name, yc.section
      ORDER BY ct.class_name ASC, yc.section ASC
    `, [settings.current_term_id, settings.current_academic_year_id]);

    return successResponse({ items: rows }, "Outstanding report fetched successfully");
  } catch (error) {
    console.error("Reports GET route error:", error);
    return errorResponse("Unable to fetch reports", 500);
  }
}
