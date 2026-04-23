import type {
  ChangePasswordPayload,
  LoginPayload,
  ParentRegistrationPayload,
  PortalLoginPayload
} from "@/types";

export function validateLoginPayload(payload: Partial<LoginPayload>) {
  const errors: Record<string, string> = {};

  if (!payload.username?.trim()) {
    errors.username = "Username is required.";
  }

  if (!payload.password?.trim()) {
    errors.password = "Password is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validatePortalLoginPayload(
  payload: Partial<PortalLoginPayload>
) {
  const errors: Record<string, string> = {};

  if (!payload.regNo?.trim()) {
    errors.regNo = "Student RegNo is required.";
  }

  if (!payload.accountType) {
    errors.accountType = "Account type is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateParentRegistrationPayload(
  payload: Partial<ParentRegistrationPayload>
) {
  const errors: Record<string, string> = {};

  if (!payload.full_name?.trim()) {
    errors.full_name = "Full name is required.";
  }

  if (!payload.regNo?.trim()) {
    errors.regNo = "Student RegNo is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateChangePasswordPayload(
  payload: Partial<ChangePasswordPayload>
) {
  const errors: Record<string, string> = {};

  if (!payload.current_password?.trim()) {
    errors.current_password = "Current password is required.";
  }

  if (!payload.new_password?.trim()) {
    errors.new_password = "New password is required.";
  } else if (payload.new_password.length < 8) {
    errors.new_password = "New password must be at least 8 characters.";
  }

  if (!payload.confirm_password?.trim()) {
    errors.confirm_password = "Confirm password is required.";
  }

  if (
    payload.new_password?.trim() &&
    payload.confirm_password?.trim() &&
    payload.new_password !== payload.confirm_password
  ) {
    errors.confirm_password = "Passwords do not match.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}