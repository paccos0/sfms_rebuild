import { NextRequest } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type AcademicYearRow = RowDataPacket & {
  academic_year_id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: number;
  is_active: number;
  current_status: string;
  active_status: string;
};

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);
  if (authResult.response) return authResult.response;

  try {
    const [rows] = await db.query<AcademicYearRow[]>(`
      SELECT academic_year_id, name,
        DATE_FORMAT(start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(end_date, '%Y-%m-%d') AS end_date,
        is_current, is_active,
        CASE WHEN is_current = 1 THEN 'Yes' ELSE 'No' END AS current_status,
        CASE WHEN is_active = 1 THEN 'Yes' ELSE 'No' END AS active_status
      FROM academic_year
      ORDER BY start_date DESC
    `);
    return successResponse({ items: rows }, "Academic years fetched successfully");
  } catch (error) {
    console.error("Academic years GET route error:", error);
    return errorResponse("Unable to fetch academic years", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);
  if (authResult.response) return authResult.response;

  const connection = await db.getConnection();
  try {
    const body = await request.json();
    if (!body.name || !body.start_date || !body.end_date) return errorResponse("name, start_date and end_date are required", 422);
    await connection.beginTransaction();
    if (body.is_current) {
      await connection.query(`UPDATE academic_year SET is_current = 0`);
    }
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO academic_year (name, start_date, end_date, is_current, is_active) VALUES (?, ?, ?, ?, ?)`,
      [body.name, body.start_date, body.end_date, body.is_current ? 1 : 0, body.is_active === 0 ? 0 : 1]
    );
    if (body.is_current) {
      await connection.query(`UPDATE school_setting SET current_academic_year_id = ? ORDER BY setting_id ASC LIMIT 1`, [result.insertId]);
    }
    await connection.commit();
    return successResponse({ academic_year_id: result.insertId }, "Academic year created successfully", 201);
  } catch (error: any) {
    await connection.rollback();
    console.error("Academic years POST route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to create academic year", 500);
  } finally {
    connection.release();
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);
  if (authResult.response) return authResult.response;
  const connection = await db.getConnection();
  try {
    const body = await request.json();
    if (!body.academic_year_id || !body.name || !body.start_date || !body.end_date) return errorResponse("academic_year_id, name, start_date and end_date are required", 422);
    await connection.beginTransaction();
    if (body.is_current) {
      await connection.query(`UPDATE academic_year SET is_current = 0`);
    }
    await connection.query(
      `UPDATE academic_year SET name=?, start_date=?, end_date=?, is_current=?, is_active=? WHERE academic_year_id=?`,
      [body.name, body.start_date, body.end_date, body.is_current ? 1 : 0, body.is_active === 0 ? 0 : 1, body.academic_year_id]
    );
    if (body.is_current) {
      await connection.query(`UPDATE school_setting SET current_academic_year_id = ? ORDER BY setting_id ASC LIMIT 1`, [body.academic_year_id]);
    }
    await connection.commit();
    return successResponse({}, "Academic year updated successfully");
  } catch (error: any) {
    await connection.rollback();
    console.error("Academic years PUT route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to update academic year", 500);
  } finally {
    connection.release();
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);
  if (authResult.response) return authResult.response;
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return errorResponse("id is required", 422);
    await db.query(`DELETE FROM academic_year WHERE academic_year_id = ?`, [id]);
    return successResponse({}, "Academic year deleted successfully");
  } catch (error: any) {
    console.error("Academic years DELETE route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to delete academic year", 500);
  }
}
