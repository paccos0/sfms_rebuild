import { NextRequest } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type TermRow = RowDataPacket & { term_id:number; academic_year_id:number; academic_year_name:string; name:string; start_date:string|null; end_date:string|null; is_current:number; is_active:number; current_status:string; active_status:string; term_label:string; };

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);
  if (authResult.response) return authResult.response;
  try {
    const [rows] = await db.query<TermRow[]>(`
      SELECT t.term_id, t.academic_year_id, ay.name AS academic_year_name, t.name,
        DATE_FORMAT(t.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(t.end_date, '%Y-%m-%d') AS end_date,
        t.is_current, t.is_active,
        CASE WHEN t.is_current = 1 THEN 'Yes' ELSE 'No' END AS current_status,
        CASE WHEN t.is_active = 1 THEN 'Yes' ELSE 'No' END AS active_status,
        CONCAT(ay.name, ' - ', t.name) AS term_label
      FROM term t INNER JOIN academic_year ay ON ay.academic_year_id=t.academic_year_id
      ORDER BY ay.start_date DESC, t.term_id ASC
    `);
    return successResponse({ items: rows }, "Terms fetched successfully");
  } catch (error) {
    console.error("Terms GET route error:", error);
    return errorResponse("Unable to fetch terms", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  const connection = await db.getConnection();
  try {
    const body = await request.json();
    if (!body.academic_year_id || !body.name) return errorResponse("academic_year_id and name are required", 422);
    await connection.beginTransaction();
    if (body.is_current) await connection.query(`UPDATE term SET is_current = 0`);
    const [result] = await connection.query<ResultSetHeader>(`INSERT INTO term (academic_year_id, name, start_date, end_date, is_current, is_active) VALUES (?, ?, ?, ?, ?, ?)`, [body.academic_year_id, body.name, body.start_date || null, body.end_date || null, body.is_current ? 1 : 0, body.is_active === 0 ? 0 : 1]);
    if (body.is_current) await connection.query(`UPDATE school_setting SET current_academic_year_id = ?, current_term_id = ? ORDER BY setting_id ASC LIMIT 1`, [body.academic_year_id, result.insertId]);
    await connection.commit();
    return successResponse({ term_id: result.insertId }, "Term created successfully", 201);
  } catch (error:any) {
    await connection.rollback();
    console.error("Terms POST route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to create term", 500);
  } finally { connection.release(); }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  const connection = await db.getConnection();
  try {
    const body = await request.json();
    if (!body.term_id || !body.academic_year_id || !body.name) return errorResponse("term_id, academic_year_id and name are required", 422);
    await connection.beginTransaction();
    if (body.is_current) await connection.query(`UPDATE term SET is_current = 0`);
    await connection.query(`UPDATE term SET academic_year_id=?, name=?, start_date=?, end_date=?, is_current=?, is_active=? WHERE term_id=?`, [body.academic_year_id, body.name, body.start_date || null, body.end_date || null, body.is_current ? 1 : 0, body.is_active === 0 ? 0 : 1, body.term_id]);
    if (body.is_current) await connection.query(`UPDATE school_setting SET current_academic_year_id = ?, current_term_id = ? ORDER BY setting_id ASC LIMIT 1`, [body.academic_year_id, body.term_id]);
    await connection.commit();
    return successResponse({}, "Term updated successfully");
  } catch (error:any) {
    await connection.rollback();
    console.error("Terms PUT route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to update term", 500);
  } finally { connection.release(); }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const id=request.nextUrl.searchParams.get("id"); if(!id) return errorResponse("id is required",422);
    await db.query(`DELETE FROM term WHERE term_id=?`, [id]);
    return successResponse({}, "Term deleted successfully");
  } catch (error:any) {
    console.error("Terms DELETE route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to delete term", 500);
  }
}
