import { NextRequest } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type StudentRow = RowDataPacket & { student_id:number; registration_number:string; first_name:string; last_name:string; gender:string; date_of_birth:string|null; phone:string|null; parent_name:string|null; parent_phone:string|null; address:string|null; student_status:string; student_label:string; };

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response) return authResult.response;
  try {
    const [rows] = await db.query<StudentRow[]>(`
      SELECT student_id, registration_number, first_name, last_name, gender,
        DATE_FORMAT(date_of_birth, '%Y-%m-%d') AS date_of_birth,
        phone, parent_name, parent_phone, address, student_status,
        CONCAT(registration_number, ' - ', first_name, ' ', last_name) AS student_label
      FROM student ORDER BY student_id DESC
    `);
    return successResponse({ items: rows }, "Students fetched successfully");
  } catch (error) {
    console.error("Students GET route error:", error);
    return errorResponse("Unable to fetch students", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const body = await request.json();
    if (!body.registration_number || !body.first_name || !body.last_name || !body.gender) return errorResponse("registration_number, first_name, last_name and gender are required", 422);
    const [result] = await db.query<ResultSetHeader>(`INSERT INTO student (registration_number, first_name, last_name, gender, date_of_birth, phone, parent_name, parent_phone, address, student_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [body.registration_number, body.first_name, body.last_name, body.gender, body.date_of_birth || null, body.phone || null, body.parent_name || null, body.parent_phone || null, body.address || null, body.student_status || 'active']);
    return successResponse({ student_id: result.insertId }, "Student created successfully", 201);
  } catch (error:any) {
    console.error("Students POST route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to create student", 500);
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const body = await request.json();
    if (!body.student_id || !body.registration_number || !body.first_name || !body.last_name || !body.gender) return errorResponse("student_id, registration_number, first_name, last_name and gender are required", 422);
    await db.query(`UPDATE student SET registration_number=?, first_name=?, last_name=?, gender=?, date_of_birth=?, phone=?, parent_name=?, parent_phone=?, address=?, student_status=? WHERE student_id=?`, [body.registration_number, body.first_name, body.last_name, body.gender, body.date_of_birth || null, body.phone || null, body.parent_name || null, body.parent_phone || null, body.address || null, body.student_status || 'active', body.student_id]);
    return successResponse({}, "Student updated successfully");
  } catch (error:any) {
    console.error("Students PUT route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to update student", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const id=request.nextUrl.searchParams.get("id"); if(!id) return errorResponse("id is required",422);
    await db.query(`DELETE FROM student WHERE student_id=?`, [id]);
    return successResponse({}, "Student deleted successfully");
  } catch (error:any) {
    console.error("Students DELETE route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to delete student", 500);
  }
}
