import type {
  ChangePasswordPayload,
  LoginPayload,
  ParentRegistrationPayload,
  PortalLoginPayload,
  StudentRegistrationPayload
} from "@/types";

function isEmpty(value?: string | null) {
  return !value || !value.trim();
}

export function validateLoginPayload(payload: Partial<LoginPayload>) {
  const errors: Record<string, string> = {};

  if (isEmpty(payload.username)) {
    errors.username = "Username is required.";
  }

  if (isEmpty(payload.password)) {
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

  if (isEmpty(payload.regNo)) {
    errors.regNo = "Student RegNo is required.";
  }

  if (isEmpty(payload.password)) {
    errors.password = "Password is required.";
  }

  if (!payload.accountType) {
    errors.accountType = "Account type is required.";
  } else if (!["student", "parent"].includes(payload.accountType)) {
    errors.accountType = "Invalid account type.";
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

  if (isEmpty(payload.full_name)) {
    errors.full_name = "Full name is required.";
  } else if (payload.full_name!.trim().length < 3) {
    errors.full_name = "Full name must be at least 3 characters.";
  }

  if (isEmpty(payload.phone)) {
    errors.phone = "Phone number is required.";
  } else if (!/^[0-9+\-\s()]{7,20}$/.test(payload.phone!.trim())) {
    errors.phone = "Enter a valid phone number.";
  }

  if (isEmpty(payload.regNo)) {
    errors.regNo = "Student RegNo is required.";
  }

  if (isEmpty(payload.password)) {
    errors.password = "Password is required.";
  } else if (payload.password!.length < 4) {
    errors.password = "Password/PIN must be at least 4 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateStudentRegistrationPayload(
  payload: Partial<StudentRegistrationPayload>
) {
  const errors: Record<string, string> = {};

  if (isEmpty(payload.regNo)) {
    errors.regNo = "Student RegNo is required.";
  }

  if (isEmpty(payload.password)) {
    errors.password = "Password is required.";
  } else if (payload.password!.length < 4) {
    errors.password = "Password/PIN must be at least 4 characters.";
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

  if (isEmpty(payload.current_password)) {
    errors.current_password = "Current password is required.";
  }

  if (isEmpty(payload.new_password)) {
    errors.new_password = "New password is required.";
  } else if (payload.new_password!.length < 8) {
    errors.new_password = "New password must be at least 8 characters.";
  }

  if (isEmpty(payload.confirm_password)) {
    errors.confirm_password = "Confirm password is required.";
  }

  if (
    !isEmpty(payload.new_password) &&
    !isEmpty(payload.confirm_password) &&
    payload.new_password !== payload.confirm_password
  ) {
    errors.confirm_password = "Passwords do not match.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}