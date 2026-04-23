import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "@/lib/db";
import { errorResponse } from "@/lib/response";
import { hasRole } from "@/lib/permissions";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import type { SessionUser, UserRole } from "@/types";

type AdminRow = RowDataPacket & {
  admin_id: number;
  username: string;
  password_hash: string;
  role: "admin" | "bursar";
  first_name: string;
  last_name: string;
  is_active: number;
};

type StudentRow = RowDataPacket & {
  student_id: number;
  registration_number: string;
  first_name: string;
  last_name: string;
  parent_name: string | null;
  student_status: "active" | "inactive";
};

type ParentRow = RowDataPacket & {
  parent_id: number;
  student_id: number;
  full_name: string;
  is_active: number;
  registration_number: string;
  first_name: string;
  last_name: string;
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
      WHERE username = ?
      LIMIT 1
    `,
    [username]
  );

  return rows[0] ?? null;
}

export async function verifyAdminCredentials(
  username: string,
  password: string
): Promise<SessionUser | null> {
  const admin = await findAdminByUsername(username);

  if (!admin || !admin.is_active) return null;

  const passwordMatches = await bcrypt.compare(password, admin.password_hash);

  if (!passwordMatches) return null;

  return {
    role: admin.role,
    admin_id: admin.admin_id,
    username: admin.username,
    first_name: admin.first_name,
    last_name: admin.last_name,
    display_name: `${admin.first_name} ${admin.last_name}`
  };
}

export async function updateLastLogin(adminId: number) {
  await db.query(
    `
      UPDATE admin
      SET last_login_at = NOW()
      WHERE admin_id = ?
    `,
    [adminId]
  );
}

export async function findStudentByRegNo(regNo: string) {
  const [rows] = await db.query<StudentRow[]>(
    `
      SELECT
        student_id,
        registration_number,
        first_name,
        last_name,
        parent_name,
        student_status
      FROM student
      WHERE registration_number = ?
      LIMIT 1
    `,
    [regNo]
  );

  return rows[0] ?? null;
}

export async function findParentByStudentId(studentId: number) {
  const [rows] = await db.query<ParentRow[]>(
    `
      SELECT
        pa.parent_id,
        pa.student_id,
        pa.full_name,
        pa.is_active,
        s.registration_number,
        s.first_name,
        s.last_name
      FROM parent_account pa
      INNER JOIN student s ON s.student_id = pa.student_id
      WHERE pa.student_id = ?
      LIMIT 1
    `,
    [studentId]
  );

  return rows[0] ?? null;
}

export async function verifyStudentPortalAccess(
  regNo: string
): Promise<SessionUser | null> {
  const student = await findStudentByRegNo(regNo);

  if (!student || student.student_status !== "active") {
    return null;
  }

  return {
    role: "student",
    student_id: student.student_id,
    registration_number: student.registration_number,
    first_name: student.first_name,
    last_name: student.last_name,
    parent_name: student.parent_name,
    display_name: `${student.first_name} ${student.last_name}`
  };
}

export async function verifyParentPortalAccess(
  regNo: string
): Promise<SessionUser | null> {
  const student = await findStudentByRegNo(regNo);

  if (!student || student.student_status !== "active") {
    return null;
  }

  const parent = await findParentByStudentId(student.student_id);

  if (!parent || !parent.is_active) {
    return null;
  }

  return {
    role: "parent",
    parent_id: parent.parent_id,
    linked_student_id: student.student_id,
    registration_number: student.registration_number,
    first_name: student.first_name,
    last_name: student.last_name,
    parent_name: parent.full_name,
    display_name: parent.full_name
  };
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function registerParentAccount(
  fullName: string,
  regNo: string
): Promise<SessionUser | { error: string; status: number }> {
  const student = await findStudentByRegNo(regNo);

  if (!student) {
    return {
      error: "RegNo not available.",
      status: 404
    };
  }

  if (student.student_status !== "active") {
    return {
      error: "This student account is not active.",
      status: 422
    };
  }

  const existingParent = await findParentByStudentId(student.student_id);

  if (existingParent) {
    return {
      error: "A parent account is already registered for this student.",
      status: 409
    };
  }

  const incomingName = normalizeName(fullName);
  const existingParentName = normalizeName(student.parent_name ?? "");

  if (student.parent_name?.trim() && existingParentName !== incomingName) {
    return {
      error: "This student is already assigned to another parent name.",
      status: 409
    };
  }

  if (!student.parent_name?.trim()) {
    await db.query(
      `
        UPDATE student
        SET parent_name = ?
        WHERE student_id = ?
      `,
      [fullName.trim(), student.student_id]
    );
  }

  const [result] = await db.query<ResultSetHeader>(
    `
      INSERT INTO parent_account (student_id, full_name)
      VALUES (?, ?)
    `,
    [student.student_id, fullName.trim()]
  );

  return {
    role: "parent",
    parent_id: result.insertId,
    linked_student_id: student.student_id,
    registration_number: student.registration_number,
    first_name: student.first_name,
    last_name: student.last_name,
    parent_name: fullName.trim(),
    display_name: fullName.trim()
  };
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

export async function requireRole(request: NextRequest, roles: UserRole[]) {
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