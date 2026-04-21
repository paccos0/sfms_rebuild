import type { AdmissionType } from "./index";

export type Student = {
  student_id: number;
  registration_number: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  date_of_birth: string | null;
  phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  student_status: "active" | "inactive";
};

export type StudentCategory = {
  category_id: number;
  category_name: string;
  description: string | null;
  is_active: number;
};

export type EnrollmentStatus =
  | "active"
  | "transferred"
  | "graduated"
  | "repeated"
  | "completed"
  | "cancelled";

export type StudentEnrollment = {
  enrollment_id: number;
  student_id: number;
  academic_year_id: number;
  year_class_id: number;
  category_id: number;
  admission_type: AdmissionType;
  enrollment_status: EnrollmentStatus;
  enrollment_date: string;
  notes: string | null;
};
