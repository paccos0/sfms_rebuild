import type { AdmissionType } from "./index";

export type FeeStructure = {
  fee_structure_id: number;
  academic_year_id: number;
  term_id: number;
  category_id: number;
  admission_type: AdmissionType;
  amount: number;
  currency: string;
  is_active: number;
  notes: string | null;
};

export type PaymentMethod = "cash" | "bank" | "mobile_money" | "other";

export type Payment = {
  payment_id: number;
  enrollment_id: number;
  term_id: number;
  payment_ref: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  paid_at: string;
  received_by_admin_id: number;
  note: string | null;
};

export type PenaltyStatus = "unpaid" | "paid" | "waived";

export type StudentPenalty = {
  penalty_id: number;
  enrollment_id: number;
  title: string;
  description: string | null;
  amount: number;
  penalty_status: PenaltyStatus;
  issued_at: string;
  paid_at: string | null;
  created_by_admin_id: number;
};
