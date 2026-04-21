export type UserRole = "admin" | "bursar";
export type Gender = "male" | "female";
export type AdmissionType = "new" | "continuing";

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors?: unknown;
};

export * from "./auth";
export * from "./academic";
export * from "./student";
export * from "./finance";
