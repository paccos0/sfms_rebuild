import { NextRequest } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type EnrollmentRow = RowDataPacket & {
  enrollment_id: number;
  student_id: number;
  academic_year_id: number;
  year_class_id: number;
  category_id: number;
  student_name: string;
  registration_number: string;
  academic_year_name: string;
  class_display_name: string;
  category_name: string;
  admission_type: string;
  enrollment_status: string;
  enrollment_date: string;
  notes: string | null;
  enrollment_label: string;
};

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);

  if (authResult.response) {
    return authResult.response;
  }

  try {
    const [rows] = await db.query<EnrollmentRow[]>(
      `
        SELECT
          se.enrollment_id,
          se.student_id,
          se.academic_year_id,
          se.year_class_id,
          se.category_id,

          CONCAT(s.first_name, ' ', s.last_name) AS student_name,
          s.registration_number,

          ay.name AS academic_year_name,

          CONCAT(
            ct.class_name,
            IF(
              yc.section IS NOT NULL AND yc.section != '',
              CONCAT(' ', yc.section),
              ''
            )
          ) AS class_display_name,

          sc.category_name,
          se.admission_type,
          se.enrollment_status,
          DATE_FORMAT(se.enrollment_date, '%Y-%m-%d') AS enrollment_date,
          se.notes,

          CONCAT(
            s.registration_number,
            ' - ',
            s.first_name,
            ' ',
            s.last_name,
            ' | ',
            ay.name,
            ' | ',
            ct.class_name,
            IF(
              yc.section IS NOT NULL AND yc.section != '',
              CONCAT(' ', yc.section),
              ''
            )
          ) AS enrollment_label

        FROM student_enrollment se
        INNER JOIN student s
          ON s.student_id = se.student_id
        INNER JOIN academic_year ay
          ON ay.academic_year_id = se.academic_year_id
        INNER JOIN year_class yc
          ON yc.year_class_id = se.year_class_id
        INNER JOIN class_template ct
          ON ct.class_template_id = yc.class_template_id
        INNER JOIN student_category sc
          ON sc.category_id = se.category_id
        ORDER BY se.enrollment_id DESC
      `
    );

    return successResponse(
      {
        items: rows
      },
      "Enrollments fetched successfully"
    );
  } catch (error: any) {
    console.error("Enrollments GET route error:", error);
    return errorResponse(
      error?.sqlMessage || "Failed to fetch enrollments",
      500
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);

  if (authResult.response) {
    return authResult.response;
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const body = await request.json();

    const {
      mode,
      student_id,
      academic_year_id,
      year_class_id,
      category_id,
      admission_type,
      enrollment_status,
      enrollment_date,
      notes,

      registration_number,
      first_name,
      last_name,
      gender,
      date_of_birth,
      phone,
      parent_name,
      parent_phone,
      address
    } = body;

    if (
      !academic_year_id ||
      !year_class_id ||
      !category_id ||
      !admission_type ||
      !enrollment_status ||
      !enrollment_date
    ) {
      await connection.rollback();
      return errorResponse("Missing required enrollment fields", 400);
    }

    let finalStudentId = student_id;

    if (mode === "new") {
      if (!registration_number || !first_name || !last_name || !gender) {
        await connection.rollback();
        return errorResponse("Missing required new student fields", 400);
      }

      const [existingStudent] = await connection.query<RowDataPacket[]>(
        `
          SELECT student_id
          FROM student
          WHERE registration_number = ?
          LIMIT 1
        `,
        [registration_number]
      );

      if (existingStudent.length > 0) {
        await connection.rollback();
        return errorResponse("Registration number already exists", 409);
      }

      const [studentInsert] = await connection.query<ResultSetHeader>(
        `
          INSERT INTO student (
            registration_number,
            first_name,
            last_name,
            gender,
            date_of_birth,
            phone,
            parent_name,
            parent_phone,
            address,
            student_status
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `,
        [
          registration_number,
          first_name,
          last_name,
          gender,
          date_of_birth || null,
          phone || null,
          parent_name || null,
          parent_phone || null,
          address || null
        ]
      );

      finalStudentId = studentInsert.insertId;
    } else {
      if (!student_id) {
        await connection.rollback();
        return errorResponse("Student is required", 400);
      }
    }

    const [existingEnrollment] = await connection.query<RowDataPacket[]>(
      `
        SELECT enrollment_id
        FROM student_enrollment
        WHERE student_id = ?
          AND academic_year_id = ?
        LIMIT 1
      `,
      [finalStudentId, academic_year_id]
    );

    if (existingEnrollment.length > 0) {
      await connection.rollback();
      return errorResponse(
        "This student is already enrolled in the selected academic year",
        409
      );
    }

    const [yearClassRows] = await connection.query<RowDataPacket[]>(
      `
        SELECT
          year_class_id,
          academic_year_id
        FROM year_class
        WHERE year_class_id = ?
        LIMIT 1
      `,
      [year_class_id]
    );

    if (yearClassRows.length === 0) {
      await connection.rollback();
      return errorResponse("Selected class does not exist", 404);
    }

    if (
      String(yearClassRows[0].academic_year_id) !== String(academic_year_id)
    ) {
      await connection.rollback();
      return errorResponse(
        "Selected class does not belong to the selected academic year",
        400
      );
    }

    const [result] = await connection.query<ResultSetHeader>(
      `
        INSERT INTO student_enrollment (
          student_id,
          academic_year_id,
          year_class_id,
          category_id,
          admission_type,
          enrollment_status,
          enrollment_date,
          notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        finalStudentId,
        academic_year_id,
        year_class_id,
        category_id,
        admission_type,
        enrollment_status,
        enrollment_date,
        notes || null
      ]
    );

    await connection.commit();

    return successResponse(
      {
        enrollment_id: result.insertId,
        student_id: finalStudentId
      },
      "Enrollment created successfully",
      201
    );
  } catch (error: any) {
    await connection.rollback();
    console.error("Enrollments POST route error:", error);
    return errorResponse(
      error?.sqlMessage || "Failed to create enrollment",
      500
    );
  } finally {
    connection.release();
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
      return errorResponse("Enrollment id is required", 400);
    }

    const [result] = await db.query<ResultSetHeader>(
      `
        DELETE FROM student_enrollment
        WHERE enrollment_id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return errorResponse("Enrollment not found", 404);
    }

    return successResponse({}, "Enrollment deleted successfully");
  } catch (error: any) {
    console.error("Enrollments DELETE route error:", error);
    return errorResponse(
      error?.sqlMessage || "Failed to delete enrollment",
      500
    );
  }
}