export type UserRole = "admin" | "bursar" | "student" | "parent";

export type SessionUser = {
  role: UserRole;
  display_name: string;
  admin_id?: number;
  parent_id?: number;
  student_id?: number;
  linked_student_id?: number;
  username?: string;
  registration_number?: string;
  first_name?: string;
  last_name?: string;
  parent_name?: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type PortalLoginPayload = {
  regNo: string;
  accountType: "student" | "parent";
};

export type ParentRegistrationPayload = {
  full_name: string;
  regNo: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};