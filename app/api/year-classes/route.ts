import { NextRequest } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type Row = RowDataPacket & { year_class_id:number; academic_year_id:number; class_template_id:number; academic_year_name:string; class_name:string; section:string|null; section_label:string; capacity:number|null; is_active:number; active_status:string; year_class_label:string };

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response) return authResult.response;
  try {
    const [rows] = await db.query<Row[]>(`
      SELECT yc.year_class_id, yc.academic_year_id, yc.class_template_id, ay.name AS academic_year_name, ct.class_name, yc.section,
        COALESCE(yc.section, '—') AS section_label, yc.capacity, yc.is_active,
        CASE WHEN yc.is_active=1 THEN 'Yes' ELSE 'No' END AS active_status,
        CONCAT(ay.name, ' - ', ct.class_name, IF(yc.section IS NOT NULL AND yc.section != '', CONCAT(' ', yc.section), '')) AS year_class_label
      FROM year_class yc
      INNER JOIN academic_year ay ON ay.academic_year_id=yc.academic_year_id
      INNER JOIN class_template ct ON ct.class_template_id=yc.class_template_id
      ORDER BY ay.start_date DESC, ct.level_order ASC, yc.section ASC
    `);
    return successResponse({ items: rows }, "Year classes fetched successfully");
  } catch (error) {
    console.error("Year classes GET route error:", error);
    return errorResponse("Unable to fetch year classes", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const body=await request.json(); if(!body.academic_year_id || !body.class_template_id) return errorResponse("academic_year_id and class_template_id are required",422);
    const [result]=await db.query<ResultSetHeader>(`INSERT INTO year_class (academic_year_id, class_template_id, section, capacity, is_active) VALUES (?, ?, ?, ?, ?)`, [body.academic_year_id, body.class_template_id, body.section || null, body.capacity || null, body.is_active === 0 ? 0 : 1]);
    return successResponse({ year_class_id: result.insertId }, "Year class created successfully", 201);
  } catch (error:any) {
    console.error("Year classes POST route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to create year class", 500);
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const body=await request.json(); if(!body.year_class_id || !body.academic_year_id || !body.class_template_id) return errorResponse("year_class_id, academic_year_id and class_template_id are required",422);
    await db.query(`UPDATE year_class SET academic_year_id=?, class_template_id=?, section=?, capacity=?, is_active=? WHERE year_class_id=?`, [body.academic_year_id, body.class_template_id, body.section || null, body.capacity || null, body.is_active === 0 ? 0 : 1, body.year_class_id]);
    return successResponse({}, "Year class updated successfully");
  } catch (error:any) {
    console.error("Year classes PUT route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to update year class", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const id=request.nextUrl.searchParams.get("id"); if(!id) return errorResponse("id is required",422);
    await db.query(`DELETE FROM year_class WHERE year_class_id=?`, [id]);
    return successResponse({}, "Year class deleted successfully");
  } catch (error:any) {
    console.error("Year classes DELETE route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to delete year class", 500);
  }
}
