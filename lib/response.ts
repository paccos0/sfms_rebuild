import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  message = "Request successful",
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data
    },
    { status }
  );
}

export function errorResponse(
  message = "Request failed",
  status = 400,
  errors?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors !== undefined ? { errors } : {})
    },
    { status }
  );
}
