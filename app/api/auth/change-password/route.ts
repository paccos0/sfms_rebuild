import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/response";
import { validateChangePasswordPayload } from "@/lib/validators";

type PasswordRow = RowDataPacket & {
  password_hash: string;
};

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);

    if (authResult.response || !authResult.user) {
      return authResult.response;
    }

    const body = await request.json();
    const validation = validateChangePasswordPayload(body);

    if (!validation.isValid) {
      return errorResponse("Validation failed", 422, validation.errors);
    }

    const [rows] = await db.query<PasswordRow[]>(
      `
        SELECT password_hash
        FROM admin
        WHERE admin_id = :adminId
        LIMIT 1
      `,
      { adminId: authResult.user.admin_id }
    );

    const admin = rows[0];

    if (!admin) {
      return errorResponse("Authenticated admin not found", 404);
    }

    const currentPasswordMatches = await bcrypt.compare(
      body.current_password,
      admin.password_hash
    );

    if (!currentPasswordMatches) {
      return errorResponse("Current password is incorrect", 400);
    }

    const newPasswordHash = await bcrypt.hash(body.new_password, 12);

    await db.query(
      `
        UPDATE admin
        SET password_hash = :passwordHash
        WHERE admin_id = :adminId
      `,
      {
        passwordHash: newPasswordHash,
        adminId: authResult.user.admin_id
      }
    );

    return successResponse(
      {
        updated: true
      },
      "Password changed successfully"
    );
  } catch (error) {
    console.error("Change password route error:", error);
    return errorResponse("Unable to change password right now", 500);
  }
}
