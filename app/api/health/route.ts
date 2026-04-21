import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";

type HealthRow = RowDataPacket & {
  server_time: string;
  db_name: string;
};

export async function GET() {
  try {
    const [rows] = await db.query<HealthRow[]>(
      "SELECT NOW() AS server_time, DATABASE() AS db_name"
    );

    return successResponse(
      {
        database: "connected",
        database_name: rows[0]?.db_name ?? null,
        current_time: rows[0]?.server_time ?? null,
      },
      "Health check successful"
    );
  } catch (error: any) {
    console.error("Health check error:", error);

    return errorResponse(
      error?.sqlMessage || error?.message || "Database connection failed",
      500
    );
  }
}