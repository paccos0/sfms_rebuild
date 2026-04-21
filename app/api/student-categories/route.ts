import { NextRequest } from "next/server";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

type Row = RowDataPacket & { category_id: number; category_name: string; description: string | null; is_active: number };

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "bursar"]);
  if (authResult.response) return authResult.response;

  try {
    const [rows] = await db.query<Row[]>(`SELECT category_id, category_name, description, is_active FROM student_category ORDER BY category_name ASC`);
    return successResponse({ items: rows }, "Student categories fetched successfully");
  } catch (error) {
    console.error("Student categories GET route error:", error);
    return errorResponse("Unable to fetch student categories", 500);
  }
}
