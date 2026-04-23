import { NextRequest } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { errorResponse, successResponse } from "@/lib/response";
import { registerStudentAccount } from "@/lib/auth";
import { validateStudentRegistrationPayload } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateStudentRegistrationPayload(body);

    if (!validation.isValid) {
      return errorResponse("Validation failed", 422, validation.errors);
    }

    const result = await registerStudentAccount(body.regNo, body.password);

    if ("error" in result) {
      return errorResponse(result.error, result.status);
    }

    const token = await createSessionToken(result);
    await setSessionCookie(token);

    return successResponse(
      { user: result },
      "Student registration successful"
    );
  } catch (error) {
    console.error("Student portal register route error:", error);
    return errorResponse("Unable to register student right now", 500);
  }
}   