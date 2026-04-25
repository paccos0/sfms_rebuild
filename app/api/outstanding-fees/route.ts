import { NextRequest } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type OutstandingFeeRow = RowDataPacket & {
  student_id: number;
  enrollment_id: number;
  student_name: string;
  registration_number: string;
  academic_year_name: string;
  term_name: string;
  class_name: string;
  current_term_fee: number | null;
  previous_balance: number | null;
  current_term_paid: number | null;
};

type CurrentContextRow = RowDataPacket & {
  academic_year_id: number | null;
  term_id: number | null;
};

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);

  if (authResult.response) {
    return authResult.response;
  }

  try {
    const searchParams = request.nextUrl.searchParams;

    let academicYearId = searchParams.get("academic_year_id");
    let termId = searchParams.get("term_id");
    const yearClassId = searchParams.get("year_class_id");

    if (!academicYearId || !termId) {
      const [contextRows] = await db.query<CurrentContextRow[]>(
        `
          SELECT
            current_academic_year_id AS academic_year_id,
            current_term_id AS term_id
          FROM school_setting
          ORDER BY setting_id ASC
          LIMIT 1
        `
      );

      const context = contextRows[0];

      if (!academicYearId && context?.academic_year_id) {
        academicYearId = String(context.academic_year_id);
      }

      if (!termId && context?.term_id) {
        termId = String(context.term_id);
      }
    }

    if (!academicYearId || !termId) {
      return errorResponse("Academic year and term are required.", 422);
    }

    const params: Array<string | number> = [
      Number(termId),
      Number(termId),
      Number(academicYearId)
    ];

    let classFilterSql = "";

    if (yearClassId && yearClassId !== "all") {
      classFilterSql = "AND se.year_class_id = ?";
      params.push(Number(yearClassId));
    }

    const [rows] = await db.query<OutstandingFeeRow[]>(
      `
        SELECT
          s.student_id,
          se.enrollment_id,
          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          s.registration_number,
          ay.name AS academic_year_name,
          selected_term.name AS term_name,
          CONCAT(
            ct.class_name,
            IF(yc.section IS NOT NULL AND yc.section != '', CONCAT(' ', yc.section), '')
          ) AS class_name,

          current_fee.amount AS current_term_fee,

          COALESCE((
            SELECT
              SUM(
                COALESCE(previous_fee.amount, 0) - COALESCE(previous_payment.total_paid, 0)
              )
            FROM student_enrollment previous_enrollment
            INNER JOIN term previous_term
              ON previous_term.academic_year_id = previous_enrollment.academic_year_id
            INNER JOIN term selected_term_lookup
              ON selected_term_lookup.term_id = ?
            LEFT JOIN fee_structure previous_fee
              ON previous_fee.academic_year_id = previous_enrollment.academic_year_id
             AND previous_fee.term_id = previous_term.term_id
             AND previous_fee.category_id = previous_enrollment.category_id
             AND previous_fee.admission_type = previous_enrollment.admission_type
             AND previous_fee.is_active = 1
            LEFT JOIN (
              SELECT
                enrollment_id,
                term_id,
                SUM(amount_paid) AS total_paid
              FROM payment
              GROUP BY enrollment_id, term_id
            ) previous_payment
              ON previous_payment.enrollment_id = previous_enrollment.enrollment_id
             AND previous_payment.term_id = previous_term.term_id
            WHERE previous_enrollment.student_id = s.student_id
              AND previous_term.term_id <> selected_term_lookup.term_id
              AND (
                (
                  selected_term_lookup.start_date IS NOT NULL
                  AND previous_term.end_date IS NOT NULL
                  AND previous_term.end_date < selected_term_lookup.start_date
                )
                OR
                (
                  selected_term_lookup.start_date IS NULL
                  AND previous_term.term_id < selected_term_lookup.term_id
                )
              )
          ), 0) AS previous_balance,

          COALESCE(current_payment.total_paid, 0) AS current_term_paid

        FROM student_enrollment se
        INNER JOIN student s
          ON s.student_id = se.student_id
        INNER JOIN academic_year ay
          ON ay.academic_year_id = se.academic_year_id
        INNER JOIN term selected_term
          ON selected_term.term_id = ?
        INNER JOIN year_class yc
          ON yc.year_class_id = se.year_class_id
        INNER JOIN class_template ct
          ON ct.class_template_id = yc.class_template_id
        INNER JOIN fee_structure current_fee
          ON current_fee.academic_year_id = se.academic_year_id
         AND current_fee.term_id = selected_term.term_id
         AND current_fee.category_id = se.category_id
         AND current_fee.admission_type = se.admission_type
         AND current_fee.is_active = 1
        LEFT JOIN (
          SELECT
            enrollment_id,
            term_id,
            SUM(amount_paid) AS total_paid
          FROM payment
          GROUP BY enrollment_id, term_id
        ) current_payment
          ON current_payment.enrollment_id = se.enrollment_id
         AND current_payment.term_id = selected_term.term_id

        WHERE se.academic_year_id = ?
          AND se.enrollment_status IN ('active', 'repeated')
          ${classFilterSql}

        ORDER BY ct.level_order ASC, yc.section ASC, s.first_name ASC, s.last_name ASC
      `,
      params
    );

    const normalizedRows = rows.map((row) => {
      const currentTermFee = Number(row.current_term_fee ?? 0);
      const previousBalance = Number(row.previous_balance ?? 0);
      const currentTermPaid = Number(row.current_term_paid ?? 0);

      const fee = currentTermFee + previousBalance;
      const amount = fee - currentTermPaid;

      return {
        student_id: row.student_id,
        enrollment_id: row.enrollment_id,
        names: `${row.student_name} (${row.registration_number})`,
        student_name: row.student_name,
        registration_number: row.registration_number,
        academic_year_name: row.academic_year_name,
        term_name: row.term_name,
        class_name: row.class_name,
        fee,
        amount
      };
    });

    const totals = normalizedRows.reduce(
      (acc, row) => {
        acc.fee += row.fee;
        acc.amount += row.amount;
        return acc;
      },
      {
        students: normalizedRows.length,
        fee: 0,
        amount: 0
      }
    );

    return successResponse(
      {
        items: normalizedRows,
        totals,
        filters: {
          academic_year_id: Number(academicYearId),
          term_id: Number(termId),
          year_class_id: yearClassId || "all"
        }
      },
      "Outstanding fees fetched successfully"
    );
  } catch (error: any) {
    console.error("Outstanding fees route error:", error);
    return errorResponse(
      error?.sqlMessage || "Unable to fetch outstanding fees",
      500
    );
  }
}