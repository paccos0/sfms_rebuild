import { NextRequest } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type Row = RowDataPacket & { enrollment_id:number; student_id:number; academic_year_id:number; year_class_id:number; category_id:number; student_name:string; academic_year_name:string; class_display_name:string; category_name:string; admission_type:string; enrollment_status:string; enrollment_date:string; notes:string|null; enrollment_label:string; };

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response) return authResult.response;
  try {
    const [rows] = await db.query<Row[]>(`
      SELECT se.enrollment_id, se.student_id, se.academic_year_id, se.year_class_id, se.category_id,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        ay.name AS academic_year_name,
        CONCAT(ct.class_name, IF(yc.section IS NOT NULL AND yc.section != '', CONCAT(' ', yc.section), '')) AS class_display_name,
        sc.category_name, se.admission_type, se.enrollment_status,
        DATE_FORMAT(se.enrollment_date, '%Y-%m-%d') AS enrollment_date,
        se.notes,
        CONCAT(s.registration_number, ' - ', s.first_name, ' ', s.last_name, ' (', ay.name, ')') AS enrollment_label
      FROM student_enrollment se
      INNER JOIN student s ON s.student_id = se.student_id
      INNER JOIN academic_year ay ON ay.academic_year_id = se.academic_year_id
      INNER JOIN year_class yc ON yc.year_class_id = se.year_class_id
      INNER JOIN class_template ct ON ct.class_template_id = yc.class_template_id
      INNER JOIN student_category sc ON sc.category_id = se.category_id
      ORDER BY ay.start_date DESC, se.enrollment_id DESC
    `);
    return successResponse({ items: rows }, "Enrollments fetched successfully");
  } catch (error) {
    console.error("Enrollments GET route error:", error);
    return errorResponse("Unable to fetch enrollments", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const body=await request.json();
    if(!body.student_id || !body.academic_year_id || !body.year_class_id || !body.category_id || !body.admission_type || !body.enrollment_status || !body.enrollment_date) return errorResponse("student_id, academic_year_id, year_class_id, category_id, admission_type, enrollment_status and enrollment_date are required",422);
    const [result]=await db.query<ResultSetHeader>(`INSERT INTO student_enrollment (student_id, academic_year_id, year_class_id, category_id, admission_type, enrollment_status, enrollment_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [body.student_id, body.academic_year_id, body.year_class_id, body.category_id, body.admission_type, body.enrollment_status, body.enrollment_date, body.notes || null]);
    return successResponse({ enrollment_id: result.insertId }, "Enrollment created successfully", 201);
  } catch (error:any) {
    console.error("Enrollments POST route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to create enrollment", 500);
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const body=await request.json();
    if(!body.enrollment_id || !body.student_id || !body.academic_year_id || !body.year_class_id || !body.category_id || !body.admission_type || !body.enrollment_status || !body.enrollment_date) return errorResponse("enrollment_id, student_id, academic_year_id, year_class_id, category_id, admission_type, enrollment_status and enrollment_date are required",422);
    await db.query(`UPDATE student_enrollment SET student_id=?, academic_year_id=?, year_class_id=?, category_id=?, admission_type=?, enrollment_status=?, enrollment_date=?, notes=? WHERE enrollment_id=?`, [body.student_id, body.academic_year_id, body.year_class_id, body.category_id, body.admission_type, body.enrollment_status, body.enrollment_date, body.notes || null, body.enrollment_id]);
    return successResponse({}, "Enrollment updated successfully");
  } catch (error:any) {
    console.error("Enrollments PUT route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to update enrollment", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const id=request.nextUrl.searchParams.get("id"); if(!id) return errorResponse("id is required",422);
    await db.query(`DELETE FROM student_enrollment WHERE enrollment_id=?`, [id]);
    return successResponse({}, "Enrollment deleted successfully");
  } catch (error:any) {
    console.error("Enrollments DELETE route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to delete enrollment", 500);
  }
}
