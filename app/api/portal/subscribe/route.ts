import { NextRequest } from "next/server";
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

    const subscription = await request.json();
    const subscriptionJson = JSON.stringify(subscription);

    await db.query(
      `
        DELETE FROM push_subscription
        WHERE student_id = ?
          AND subscription_json = ?
      `,
      [targetStudentId, subscriptionJson]
    );

    await db.query(
      `
        INSERT INTO push_subscription (
          student_id,
          subscription_json
        )
        VALUES (?, ?)
      `,
      [targetStudentId, subscriptionJson]
    );

    return successResponse({}, "Push notifications enabled");
  } catch (error) {
    console.error("Portal push subscribe route error:", error);
    return errorResponse("Unable to enable push notifications", 500);
  }
}