import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { successResponse } from "@/lib/response";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);

  if (authResult.response) {
    return authResult.response;
  }

  return successResponse(
    {
      user: authResult.user
    },
    "Authenticated user fetched successfully"
  );
}
