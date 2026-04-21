import { NextRequest } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/response";

type SettingsRow = RowDataPacket & {
  current_academic_year_id: number | null;
  current_term_id: number | null;
  academic_year_name: string | null;
  term_name: string | null;
};

type MetricRow = RowDataPacket & {
  total_students: number;
  collected_fees: number;
  unpaid_students: number;
  unpaid_balance: number;
  total_credit: number;
  total_penalties: number;
};

type ClassRow = RowDataPacket & {
  class_name: string;
  students: number;
  unpaid_students: number;
  outstanding_balance: number;
};

type TermRow = RowDataPacket & {
  term_name: string;
  expected_fees: number;
  collected_fees: number;
  outstanding_balance: number;
};

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);
  if (authResult.response) {
    return authResult.response;
  }

  try {
    const [settingsRows] = await db.query<SettingsRow[]>(`
      SELECT
        ss.current_academic_year_id,
        ss.current_term_id,
        ay.name AS academic_year_name,
        t.name AS term_name
      FROM school_setting ss
      LEFT JOIN academic_year ay ON ay.academic_year_id = ss.current_academic_year_id
      LEFT JOIN term t ON t.term_id = ss.current_term_id
      ORDER BY ss.setting_id ASC
      LIMIT 1
    `);

    const settings = settingsRows[0];

    if (!settings?.current_academic_year_id || !settings?.current_term_id) {
      return successResponse(
        {
          metrics: {
            academic_year: null,
            term: null,
            total_students: 0,
            collected_fees: 0,
            unpaid_students: 0,
            unpaid_balance: 0,
            total_credit: 0,
            total_penalties: 0
          },
          class_overview: [],
          term_tracking: []
        },
        "Dashboard loaded without current academic context"
      );
    }

    const currentAcademicYearId = settings.current_academic_year_id;
    const currentTermId = settings.current_term_id;

    const [metricRows] = await db.query<MetricRow[]>(`
      SELECT
        COUNT(*) AS total_students,
        COALESCE(SUM(COALESCE(current_term_payments.total_paid_current_term, 0)), 0) AS collected_fees,
        COALESCE(SUM(CASE WHEN fee_structure_current.amount - COALESCE(current_term_payments.total_paid_current_term, 0) > 0 THEN 1 ELSE 0 END), 0) AS unpaid_students,
        COALESCE(SUM(CASE WHEN fee_structure_current.amount - COALESCE(current_term_payments.total_paid_current_term, 0) > 0 THEN fee_structure_current.amount - COALESCE(current_term_payments.total_paid_current_term, 0) ELSE 0 END), 0) AS unpaid_balance,
        COALESCE(SUM(CASE WHEN COALESCE(current_term_payments.total_paid_current_term, 0) - fee_structure_current.amount > 0 THEN COALESCE(current_term_payments.total_paid_current_term, 0) - fee_structure_current.amount ELSE 0 END), 0) AS total_credit,
        COALESCE((
          SELECT SUM(CASE WHEN sp.penalty_status = 'unpaid' THEN sp.amount ELSE 0 END)
          FROM student_penalty sp
          INNER JOIN student_enrollment se2 ON se2.enrollment_id = sp.enrollment_id
          WHERE se2.academic_year_id = ?
        ), 0) AS total_penalties
      FROM student_enrollment se
      INNER JOIN fee_structure fee_structure_current
        ON fee_structure_current.academic_year_id = se.academic_year_id
       AND fee_structure_current.term_id = ?
       AND fee_structure_current.category_id = se.category_id
       AND fee_structure_current.admission_type = se.admission_type
      LEFT JOIN (
        SELECT enrollment_id, SUM(amount_paid) AS total_paid_current_term
        FROM payment
        WHERE term_id = ?
        GROUP BY enrollment_id
      ) current_term_payments ON current_term_payments.enrollment_id = se.enrollment_id
      WHERE se.academic_year_id = ?
        AND se.enrollment_status = 'active'
    `, [currentAcademicYearId, currentTermId, currentTermId, currentAcademicYearId]);

    const [classRows] = await db.query<ClassRow[]>(`
      SELECT
        CONCAT(ct.class_name, IF(yc.section IS NOT NULL, CONCAT(' ', yc.section), '')) AS class_name,
        COUNT(se.enrollment_id) AS students,
        SUM(CASE WHEN fee_structure_current.amount - COALESCE(current_term_payments.total_paid_current_term, 0) > 0 THEN 1 ELSE 0 END) AS unpaid_students,
        SUM(CASE WHEN fee_structure_current.amount - COALESCE(current_term_payments.total_paid_current_term, 0) > 0 THEN fee_structure_current.amount - COALESCE(current_term_payments.total_paid_current_term, 0) ELSE 0 END) AS outstanding_balance
      FROM student_enrollment se
      INNER JOIN year_class yc ON yc.year_class_id = se.year_class_id
      INNER JOIN class_template ct ON ct.class_template_id = yc.class_template_id
      INNER JOIN fee_structure fee_structure_current
        ON fee_structure_current.academic_year_id = se.academic_year_id
       AND fee_structure_current.term_id = ?
       AND fee_structure_current.category_id = se.category_id
       AND fee_structure_current.admission_type = se.admission_type
      LEFT JOIN (
        SELECT enrollment_id, SUM(amount_paid) AS total_paid_current_term
        FROM payment
        WHERE term_id = ?
        GROUP BY enrollment_id
      ) current_term_payments ON current_term_payments.enrollment_id = se.enrollment_id
      WHERE se.academic_year_id = ?
        AND se.enrollment_status = 'active'
      GROUP BY yc.year_class_id, ct.class_name, yc.section
      ORDER BY ct.class_name ASC, yc.section ASC
    `, [currentTermId, currentTermId, currentAcademicYearId]);

    const [termRows] = await db.query<TermRow[]>(`
      SELECT
        t.name AS term_name,
        COALESCE(SUM(fs.amount), 0) AS expected_fees,
        COALESCE(SUM(COALESCE(term_payments.total_paid, 0)), 0) AS collected_fees,
        COALESCE(SUM(CASE WHEN fs.amount - COALESCE(term_payments.total_paid, 0) > 0 THEN fs.amount - COALESCE(term_payments.total_paid, 0) ELSE 0 END), 0) AS outstanding_balance
      FROM term t
      LEFT JOIN student_enrollment se
        ON se.academic_year_id = t.academic_year_id
       AND se.enrollment_status = 'active'
      LEFT JOIN fee_structure fs
        ON fs.academic_year_id = se.academic_year_id
       AND fs.term_id = t.term_id
       AND fs.category_id = se.category_id
       AND fs.admission_type = se.admission_type
      LEFT JOIN (
        SELECT enrollment_id, term_id, SUM(amount_paid) AS total_paid
        FROM payment
        GROUP BY enrollment_id, term_id
      ) term_payments
        ON term_payments.enrollment_id = se.enrollment_id
       AND term_payments.term_id = t.term_id
      WHERE t.academic_year_id = ?
      GROUP BY t.term_id, t.name
      ORDER BY t.term_id ASC
    `, [currentAcademicYearId]);

    const metrics = metricRows[0] ?? {
      total_students: 0,
      collected_fees: 0,
      unpaid_students: 0,
      unpaid_balance: 0,
      total_credit: 0,
      total_penalties: 0
    };

    return successResponse(
      {
        metrics: {
          academic_year: settings.academic_year_name,
          term: settings.term_name,
          total_students: Number(metrics.total_students ?? 0),
          collected_fees: Number(metrics.collected_fees ?? 0),
          unpaid_students: Number(metrics.unpaid_students ?? 0),
          unpaid_balance: Number(metrics.unpaid_balance ?? 0),
          total_credit: Number(metrics.total_credit ?? 0),
          total_penalties: Number(metrics.total_penalties ?? 0)
        },
        class_overview: classRows.map((row) => ({
          class_name: row.class_name,
          students: Number(row.students ?? 0),
          unpaid_students: Number(row.unpaid_students ?? 0),
          outstanding_balance: Number(row.outstanding_balance ?? 0)
        })),
        term_tracking: termRows.map((row) => ({
          term_name: row.term_name,
          expected_fees: Number(row.expected_fees ?? 0),
          collected_fees: Number(row.collected_fees ?? 0),
          outstanding_balance: Number(row.outstanding_balance ?? 0)
        }))
      },
      "Dashboard fetched successfully"
    );
  } catch (error) {
    console.error("Dashboard GET route error:", error);
    return errorResponse("Unable to fetch dashboard data", 500);
  }
}
