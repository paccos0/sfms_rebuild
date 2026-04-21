import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { errorResponse } from "@/lib/response";
import { hasRole } from "@/lib/permissions";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import type { SessionUser, UserRole } from "@/types";

type AdminRow = RowDataPacket & {
  admin_id: number;
  username: string;
  password_hash: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  is_active: number;
};

export async function findAdminByUsername(username: string) {
  const [rows] = await db.query<AdminRow[]>(
    `
      SELECT
        admin_id,
        username,
        password_hash,
        role,
        first_name,
        last_name,
        is_active
      FROM admin
      WHERE username = :username
      LIMIT 1
    `,
    { username }
  );

  return rows[0] ?? null;
}

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<SessionUser | null> {
  const admin = await findAdminByUsername(username);

  if (!admin || !admin.is_active) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, admin.password_hash);

  if (!passwordMatches) {
    return null;
  }

  return {
    admin_id: admin.admin_id,
    username: admin.username,
    first_name: admin.first_name,
    last_name: admin.last_name,
    role: admin.role
  };
}

export async function updateLastLogin(adminId: number) {
  await db.query(
    `
      UPDATE admin
      SET last_login_at = NOW()
      WHERE admin_id = :adminId
    `,
    { adminId }
  );
}

export async function getRequestUser(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function requireAuth(request: NextRequest) {
  const user = await getRequestUser(request);

  if (!user) {
    return {
      user: null,
      response: errorResponse("Unauthorized", 401)
    };
  }

  return {
    user,
    response: null
  };
}

export async function requireRole(
  request: NextRequest,
  roles: UserRole[]
) {
  const authResult = await requireAuth(request);

  if (authResult.response || !authResult.user) {
    return authResult;
  }

  if (!hasRole(authResult.user.role, roles)) {
    return {
      user: null,
      response: errorResponse("Forbidden", 403)
    };
  }

  return authResult;
}
