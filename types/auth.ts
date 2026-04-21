export type UserRole = "admin" | "bursar";

export type SessionUser = {
  admin_id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: UserRole;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};
