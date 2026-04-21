import { NextRequest } from "next/server";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type Row = RowDataPacket & { class_template_id:number; class_name:string; level_order:number; is_active:number; active_status:string };

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]); if (authResult.response) return authResult.response;
  try {
    const [rows] = await db.query<Row[]>(`SELECT class_template_id, class_name, level_order, is_active, CASE WHEN is_active=1 THEN 'Yes' ELSE 'No' END AS active_status FROM class_template ORDER BY level_order ASC, class_name ASC`);
    return successResponse({ items: rows }, "Class templates fetched successfully");
  } catch (error) {
    console.error("Class templates GET route error:", error);
    return errorResponse("Unable to fetch class templates", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const body=await request.json(); if(!body.class_name) return errorResponse("class_name is required",422);
    const [result]=await db.query<ResultSetHeader>(`INSERT INTO class_template (class_name, level_order, is_active) VALUES (?, ?, ?)`, [body.class_name, body.level_order || 0, body.is_active === 0 ? 0 : 1]);
    return successResponse({ class_template_id: result.insertId }, "Class template created successfully", 201);
  } catch (error:any) {
    console.error("Class templates POST route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to create class template", 500);
  }
}

export async function PUT(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const body=await request.json(); if(!body.class_template_id || !body.class_name) return errorResponse("class_template_id and class_name are required",422);
    await db.query(`UPDATE class_template SET class_name=?, level_order=?, is_active=? WHERE class_template_id=?`, [body.class_name, body.level_order || 0, body.is_active === 0 ? 0 : 1, body.class_template_id]);
    return successResponse({}, "Class template updated successfully");
  } catch (error:any) {
    console.error("Class templates PUT route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to update class template", 500);
  }
}

export async function DELETE(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]); if (authResult.response) return authResult.response;
  try {
    const id=request.nextUrl.searchParams.get("id"); if(!id) return errorResponse("id is required",422);
    await db.query(`DELETE FROM class_template WHERE class_template_id=?`, [id]);
    return successResponse({}, "Class template deleted successfully");
  } catch (error:any) {
    console.error("Class templates DELETE route error:", error);
    return errorResponse(error?.sqlMessage || error?.message || "Unable to delete class template", 500);
  }
}
