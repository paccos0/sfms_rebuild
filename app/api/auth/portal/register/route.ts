import { NextRequest } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { errorResponse, successResponse } from "@/lib/response";
import { registerParentAccount } from "@/lib/auth";
import { validateParentRegistrationPayload } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateParentRegistrationPayload(body);

    if (!validation.isValid) {
      return errorResponse("Validation failed", 422, validation.errors);
    }

    const result = await registerParentAccount(body.full_name, body.regNo);

    if ("error" in result) {
      return errorResponse(result.error, result.status);
    }

    const token = await createSessionToken(result);
    await setSessionCookie(token);

    return successResponse(
      { user: result },
      "Parent registration successful"
    );
  } catch (error) {
    console.error("Portal register route error:", error);
    return errorResponse("Unable to register parent right now", 500);
  }
}