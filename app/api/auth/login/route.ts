import { NextRequest } from "next/server";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { errorResponse, successResponse } from "@/lib/response";
import { updateLastLogin, verifyAdminCredentials } from "@/lib/auth";
import { validateLoginPayload } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateLoginPayload(body);

    if (!validation.isValid) {
      return errorResponse("Validation failed", 422, validation.errors);
    }

    const user = await verifyAdminCredentials(body.username, body.password);

    if (!user) {
      return errorResponse("Invalid username or password", 401);
    }

    // ✅ Ensure admin_id is valid
    const adminId = user.admin_id;

    if (typeof adminId !== "number") {
      return errorResponse("Invalid admin account.", 500);
    }

    const token = await createSessionToken(user);

    await setSessionCookie(token);
    await updateLastLogin(adminId);

    return successResponse(
      {
        user
      },
      "Login successful"
    );
  } catch (error) {
    console.error("Login route error:", error);
    return errorResponse("Unable to login right now", 500);
  }
}