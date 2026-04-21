import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";

export async function GET() {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `
      SELECT
        category_id,
        category_name,
        description,
        is_active
      FROM student_category
      WHERE is_active = 1
      ORDER BY category_name ASC
      `
    );

    return successResponse(rows, "Student categories fetched successfully");
  } catch (error: any) {
    return errorResponse(error?.sqlMessage || "Failed to fetch student categories", 500);
  }
}