import { NextRequest } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type Row = RowDataPacket & { penalty_id:number; enrollment_id:number; student_name:string; academic_year_name:string; title:string; description:string|null; amount:number; amount_display:string; penalty_status:string; issued_at:string; paid_at:string|null; };

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response) return authResult.response;
  try {
    const [rows] = await db.query<Row[]>(`
      SELECT sp.penalty_id, sp.enrollment_id, CONCAT(s.first_name, ' ', s.last_name) AS student_name, ay.name AS academic_year_name, sp.title, sp.description, sp.amount, FORMAT(sp.amount, 0) AS amount_display, sp.penalty_status, DATE_FORMAT(sp.issued_at, '%Y-%m-%dT%H:%i') AS issued_at, DATE_FORMAT(sp.paid_at, '%Y-%m-%dT%H:%i') AS paid_at
      FROM student_penalty sp
      INNER JOIN student_enrollment se ON se.enrollment_id = sp.enrollment_id
      INNER JOIN student s ON s.student_id = se.student_id
      INNER JOIN academic_year ay ON ay.academic_year_id = se.academic_year_id
      ORDER BY sp.issued_at DESC, sp.penalty_id DESC
    `);
    return successResponse({ items: rows }, "Penalties fetched successfully");
  } catch (error) {
    console.error("Penalties GET route error:", error);
    return errorResponse("Unable to fetch penalties", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response || !authResult.user) return authResult.response;
  try {
    const body=await request.json();
    if(!body.enrollment_id || !body.title || body.amount === null || body.amount === undefined || !body.penalty_status || !body.issued_at) return errorResponse("enrollment_id, title, amount, penalty_status and issued_at are required",422);
    const [result]=await db.query<ResultSetHeader>(`INSERT INTO student_penalty (enrollment_id, title, description, amount, penalty_status, issued_at, paid_at, created_by_admin_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [body.enrollment_id, body.title, body.description || null, body.amount, body.penalty_status, body.issued_at, body.paid_at || null, authResult.user.admin_id]);
    return successResponse({ penalty_id: result.insertId }, "Penalty created successfully", 201);
  } catch (error:any) {
    console.error("Penalties POST route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to create penalty", 500);
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response || !authResult.user) return authResult.response;
  try {
    const body=await request.json();
    if(!body.penalty_id || !body.enrollment_id || !body.title || body.amount === null || body.amount === undefined || !body.penalty_status || !body.issued_at) return errorResponse("penalty_id, enrollment_id, title, amount, penalty_status and issued_at are required",422);
    await db.query(`UPDATE student_penalty SET enrollment_id=?, title=?, description=?, amount=?, penalty_status=?, issued_at=?, paid_at=?, created_by_admin_id=? WHERE penalty_id=?`, [body.enrollment_id, body.title, body.description || null, body.amount, body.penalty_status, body.issued_at, body.paid_at || null, authResult.user.admin_id, body.penalty_id]);
    return successResponse({}, "Penalty updated successfully");
  } catch (error:any) {
    console.error("Penalties PUT route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to update penalty", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const id=request.nextUrl.searchParams.get("id"); if(!id) return errorResponse("id is required",422);
    await db.query(`DELETE FROM student_penalty WHERE penalty_id=?`, [id]);
    return successResponse({}, "Penalty deleted successfully");
  } catch (error:any) {
    console.error("Penalties DELETE route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to delete penalty", 500);
  }
}
