export type AcademicYear = {
  academic_year_id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
};

export type TermName = "Term 1" | "Term 2" | "Term 3";

export type Term = {
  term_id: number;
  academic_year_id: number;
  name: TermName;
  start_date: string | null;
  end_date: string | null;
  is_current: number;
  is_active: number;
  created_at?: string;
  updated_at?: string;
};

export type ClassTemplate = {
  class_template_id: number;
  class_name: string;
  level_order: number;
  is_active: number;
};

export type YearClass = {
  year_class_id: number;
  academic_year_id: number;
  class_template_id: number;
  class_name?: string;
  section: string | null;
  capacity: number | null;
  is_active: number;
};
