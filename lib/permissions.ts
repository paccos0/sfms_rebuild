import type { UserRole } from "@/types";

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]) {
  return allowedRoles.includes(userRole);
}

export function isAdmin(role: UserRole) {
  return role === "admin";
}

export function isBursar(role: UserRole) {
  return role === "bursar";
}
