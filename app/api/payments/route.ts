import { NextRequest } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";
import { generatePaymentReference } from "@/lib/utils";

type Row = RowDataPacket & { payment_id:number; enrollment_id:number; term_id:number; payment_ref:string; student_name:string; academic_year_name:string; term_name:string; amount_paid:number; amount_paid_display:string; payment_method:string; paid_at:string; note:string|null; };

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response) return authResult.response;
  try {
    const [rows] = await db.query<Row[]>(`
      SELECT p.payment_id, p.enrollment_id, p.term_id, p.payment_ref,
        CONCAT(s.first_name, ' ', s.last_name) AS student_name,
        ay.name AS academic_year_name, t.name AS term_name,
        p.amount_paid, FORMAT(p.amount_paid, 0) AS amount_paid_display,
        p.payment_method, DATE_FORMAT(p.paid_at, '%Y-%m-%dT%H:%i') AS paid_at, p.note
      FROM payment p
      INNER JOIN student_enrollment se ON se.enrollment_id = p.enrollment_id
      INNER JOIN student s ON s.student_id = se.student_id
      INNER JOIN academic_year ay ON ay.academic_year_id = se.academic_year_id
      INNER JOIN term t ON t.term_id = p.term_id
      ORDER BY p.paid_at DESC, p.payment_id DESC
    `);
    return successResponse({ items: rows }, "Payments fetched successfully");
  } catch (error) {
    console.error("Payments GET route error:", error);
    return errorResponse("Unable to fetch payments", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response || !authResult.user) return authResult.response;
  try {
    const body=await request.json();
    if(!body.enrollment_id || !body.term_id || body.amount_paid === null || body.amount_paid === undefined || !body.payment_method || !body.paid_at) return errorResponse("enrollment_id, term_id, amount_paid, payment_method and paid_at are required",422);
    const [result]=await db.query<ResultSetHeader>(`INSERT INTO payment (enrollment_id, term_id, payment_ref, amount_paid, payment_method, paid_at, received_by_admin_id, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [body.enrollment_id, body.term_id, generatePaymentReference(), body.amount_paid, body.payment_method, body.paid_at, authResult.user.admin_id, body.note || null]);
    return successResponse({ payment_id: result.insertId }, "Payment created successfully", 201);
  } catch (error:any) {
    console.error("Payments POST route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to create payment", 500);
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response || !authResult.user) return authResult.response;
  try {
    const body=await request.json();
    if(!body.payment_id || !body.enrollment_id || !body.term_id || body.amount_paid === null || body.amount_paid === undefined || !body.payment_method || !body.paid_at) return errorResponse("payment_id, enrollment_id, term_id, amount_paid, payment_method and paid_at are required",422);
    await db.query(`UPDATE payment SET enrollment_id=?, term_id=?, amount_paid=?, payment_method=?, paid_at=?, received_by_admin_id=?, note=? WHERE payment_id=?`, [body.enrollment_id, body.term_id, body.amount_paid, body.payment_method, body.paid_at, authResult.user.admin_id, body.note || null, body.payment_id]);
    return successResponse({}, "Payment updated successfully");
  } catch (error:any) {
    console.error("Payments PUT route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to update payment", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const id=request.nextUrl.searchParams.get("id"); if(!id) return errorResponse("id is required",422);
    await db.query(`DELETE FROM payment WHERE payment_id=?`, [id]);
    return successResponse({}, "Payment deleted successfully");
  } catch (error:any) {
    console.error("Payments DELETE route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to delete payment", 500);
  }
}
