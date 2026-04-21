import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
  try {
    // 🔒 Block in production
    if (process.env.ALLOW_DEV_SIGNUP !== "true") {
      return errorResponse("Signup disabled", 403);
    }

    const body = await req.json();

    const {
      username,
      password,
      first_name,
      last_name,
      role = "admin",
    } = body;

    // Basic validation
    if (!username || !password || !first_name || !last_name) {
      return errorResponse("Missing required fields");
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters");
    }

    // Check existing user
    const [existing]: any = await db.query(
      "SELECT admin_id FROM admin WHERE username = ?",
      [username]
    );

    if (existing.length > 0) {
      return errorResponse("Username already exists");
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 12);

    // Insert admin
    const [result]: any = await db.query(
      `
      INSERT INTO admin (
        username,
        password_hash,
        role,
        first_name,
        last_name,
        is_active
      )
      VALUES (?, ?, ?, ?, ?, 1)
      `,
      [username, password_hash, role, first_name, last_name]
    );

    return successResponse(
      {
        admin_id: result.insertId,
        username,
        role,
      },
      "Admin created successfully"
    );
  } catch (error) {
    console.error(error);
    return errorResponse("Signup failed", 500);
  }
}