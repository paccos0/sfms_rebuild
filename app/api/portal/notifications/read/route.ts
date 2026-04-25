import { NextRequest } from "next/server";
import { ResultSetHeader } from "mysql2";
import db from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";

export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["student", "parent"]);

  if (authResult.response || !authResult.user) {
    return authResult.response;
  }

  try {
    const sessionUser = authResult.user;

    const targetStudentId =
      sessionUser.role === "parent"
        ? sessionUser.linked_student_id
        : sessionUser.student_id;

    if (!targetStudentId) {
      return errorResponse("Student context not found.", 422);
    }

    const [result] = await db.query<ResultSetHeader>(
      `
        UPDATE portal_notification
        SET is_read = 1
        WHERE student_id = ?
      `,
      [targetStudentId]
    );

    return successResponse(
      {
        updated: result.affectedRows
      },
      "Notifications marked as read"
    );
  } catch (error) {
    console.error("Portal notification read route error:", error);
    return errorResponse("Unable to update notifications", 500);
  }
}