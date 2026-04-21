import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";

type HealthRow = RowDataPacket & {
  current_time: string;
  database_name: string;
};

export async function GET() {
  try {
    const [rows] = await db.query<HealthRow[]>(
      `
      SELECT NOW() AS current_time, DATABASE() AS database_name
      `
    );

    return successResponse(
      {
        database: "connected",
        database_name: rows[0]?.database_name ?? null,
        current_time: rows[0]?.current_time ?? null
      },
      "Health check successful"
    );
  } catch (error) {
    console.error("Health check error:", error);
    return errorResponse("Database connection failed", 500);
  }
}
