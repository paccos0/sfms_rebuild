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
  parent_phone: string | null;
  student_status: "active" | "inactive";
};

type ParentRow = RowDataPacket & {
  parent_id: number;
  student_id: number;
  full_name: string;
  phone: string;
  password_hash: string;
  is_active: number;
};

type StudentAccountRow = RowDataPacket & {
  student_account_id: number;
  student_id: number;
  password_hash: string;
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
        parent_phone,
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
        parent_id,
        student_id,
        full_name,
        phone,
        password_hash,
        is_active
      FROM parent_account
      WHERE student_id = ?
      LIMIT 1
    `,
    [studentId]
  );

  return rows[0] ?? null;
}

export async function findStudentAccountByStudentId(studentId: number) {
  const [rows] = await db.query<StudentAccountRow[]>(
    `
      SELECT
        student_account_id,
        student_id,
        password_hash,
        is_active
      FROM student_account
      WHERE student_id = ?
      LIMIT 1
    `,
    [studentId]
  );

  return rows[0] ?? null;
}


export async function verifyStudentPortalAccess(
  regNo: string,
  password: string
): Promise<SessionUser | null> {
  const student = await findStudentByRegNo(regNo);

  if (!student || student.student_status !== "active") {
    return null;
  }

  const account = await findStudentAccountByStudentId(student.student_id);

  if (!account || !account.is_active) {
    return null;
  }

  const matches = await bcrypt.compare(password, account.password_hash);

  if (!matches) {
    return null;
  }

  return {
    role: "student",
    student_id: student.student_id,
    registration_number: student.registration_number,
    first_name: student.first_name,
    last_name: student.last_name,
    parent_name: student.parent_name,
    parent_phone: student.parent_phone,
    display_name: `${student.first_name} ${student.last_name}`
  };
}

export async function verifyParentPortalAccess(
  regNo: string,
  password: string
): Promise<SessionUser | null> {
  const student = await findStudentByRegNo(regNo);

  if (!student || student.student_status !== "active") {
    return null;
  }

  const parent = await findParentByStudentId(student.student_id);

  if (!parent || !parent.is_active) {
    return null;
  }

  const matches = await bcrypt.compare(password, parent.password_hash);

  if (!matches) {
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
    parent_phone: parent.phone,
    display_name: parent.full_name
  };
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizePhone(value: string) {
  return value.trim().replace(/\s+/g, "");
}

export async function registerParentAccount(
  fullName: string,
  phone: string,
  regNo: string,
  password: string
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
  const incomingPhone = normalizePhone(phone);
  const currentParentName = normalizeName(student.parent_name ?? "");
  const currentParentPhone = normalizePhone(student.parent_phone ?? "");

  if (student.parent_name?.trim() && currentParentName !== incomingName) {
    return {
      error: "This student is already assigned to another parent name.",
      status: 409
    };
  }

  if (student.parent_phone?.trim() && currentParentPhone !== incomingPhone) {
    return {
      error: "This student is already assigned to another parent phone number.",
      status: 409
    };
  }

  if (!student.parent_name?.trim() || !student.parent_phone?.trim()) {
    await db.query(
      `
        UPDATE student
        SET
          parent_name = COALESCE(NULLIF(parent_name, ''), ?),
          parent_phone = COALESCE(NULLIF(parent_phone, ''), ?)
        WHERE student_id = ?
      `,
      [fullName.trim(), phone.trim(), student.student_id]
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [result] = await db.query<ResultSetHeader>(
    `
      INSERT INTO parent_account (student_id, full_name, phone, password_hash)
      VALUES (?, ?, ?, ?)
    `,
    [student.student_id, fullName.trim(), phone.trim(), passwordHash]
  );

  return {
    role: "parent",
    parent_id: result.insertId,
    linked_student_id: student.student_id,
    registration_number: student.registration_number,
    first_name: student.first_name,
    last_name: student.last_name,
    parent_name: fullName.trim(),
    parent_phone: phone.trim(),
    display_name: fullName.trim()
  };
}

export async function registerStudentAccount(
  regNo: string,
  password: string
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

  const existingAccount = await findStudentAccountByStudentId(student.student_id);

  if (existingAccount) {
    return {
      error: "Student account already exists. Please login instead.",
      status: 409
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.query<ResultSetHeader>(
    `
      INSERT INTO student_account (student_id, password_hash)
      VALUES (?, ?)
    `,
    [student.student_id, passwordHash]
  );

  return {
    role: "student",
    student_id: student.student_id,
    registration_number: student.registration_number,
    first_name: student.first_name,
    last_name: student.last_name,
    parent_name: student.parent_name,
    parent_phone: student.parent_phone,
    display_name: `${student.first_name} ${student.last_name}`
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