export type Course = { id: string; code: string | null; title: string; semester: string | null; ects: number | null; grade: number | null; color: string };
export type Item = {
  id: string; kind: string; assessment_type: string | null; title: string; course_id: string | null;
  due_at: string; all_day: boolean; tz: string; weight_pct: number | null; est_hours: number | null; status: string; notes: string | null;
};
export const KINDS = [["assessment", "Assessment"], ["deadline", "Deadline"], ["event", "Event"], ["task", "Task"]] as const;
export const ASSESSMENT_TYPES = [["assignment", "Assignment"], ["exam", "Exam"], ["presentation", "Presentation"], ["group_work", "Group work"], ["paper", "Paper"], ["other", "Other"]] as const;
export const COLORS = ["slate", "moss", "ochre", "clay", "plum", "teal"] as const;
export const ITEM_COLS = "id,kind,assessment_type,title,course_id,due_at,all_day,tz,weight_pct,est_hours,status,notes";
export const COURSE_COLS = "id,code,title,semester,ects,grade,color";
