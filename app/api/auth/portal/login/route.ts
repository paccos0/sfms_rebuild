import { NextRequest } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { errorResponse, successResponse } from "@/lib/response";
import {
  verifyParentPortalAccess,
  verifyStudentPortalAccess
} from "@/lib/auth";
import { validatePortalLoginPayload } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validatePortalLoginPayload(body);

    if (!validation.isValid) {
      return errorResponse("Validation failed", 422, validation.errors);
    }

    const user =
      body.accountType === "parent"
        ? await verifyParentPortalAccess(body.regNo, body.password)
        : await verifyStudentPortalAccess(body.regNo, body.password);

    if (!user) {
      return errorResponse("Invalid credentials for selected account type.", 401);
    }

    const token = await createSessionToken(user);
    await setSessionCookie(token);

    return successResponse({ user }, "Login successful");
  } catch (error) {
    console.error("Portal login route error:", error);
    return errorResponse("Unable to login right now", 500);
  }
}