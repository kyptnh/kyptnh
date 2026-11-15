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

export type Opportunity = {
  id: string; title: string; organisation: string | null; category: string; url: string | null; deadline_at: string | null;
  all_day: boolean; status: string; fit_score: number | null; strategic_value: number | null; effort_hours: number | null; notes: string | null; verified: boolean; source: string; source_url: string | null;
};
export type Application = {
  id: string; organisation: string; role: string; track: string; url: string | null; deadline_at: string | null;
  status: string; next_step: string | null; next_step_at: string | null; notes: string | null;
};
export const OPP_COLS = "id,title,organisation,category,url,deadline_at,all_day,status,fit_score,strategic_value,effort_hours,notes,verified,source,source_url";
export const APP_COLS = "id,organisation,role,track,url,deadline_at,status,next_step,next_step_at,notes";
export const OPP_CATEGORIES = [["fellowship", "Fellowship / scholarship"], ["competition", "Competition"], ["conference", "Conference / summit"], ["think_tank", "Think tank"], ["volunteering", "Volunteering"], ["research", "Research role"], ["accelerator", "Accelerator / grant"], ["leadership", "Club / leadership"], ["course", "Course"], ["other", "Other"]] as const;
export const OPP_STATUSES = [["discovered", "Discovered"], ["shortlisted", "Shortlisted"], ["preparing", "Preparing"], ["submitted", "Submitted"], ["interview", "Interview"], ["accepted", "Accepted"], ["rejected", "Rejected"], ["dropped", "Dropped"]] as const;
export const OPP_CLOSED = ["accepted", "rejected", "dropped"];
export const APP_TRACKS = [["private", "Private sector"], ["diplomacy", "Diplomacy / DFAE"], ["io", "International organisation"], ["startup", "Startup"], ["other", "Other"]] as const;
export const APP_STATUSES = [["researching", "Researching"], ["preparing", "Preparing"], ["applied", "Applied"], ["interview", "Interview"], ["offer", "Offer"], ["rejected", "Rejected"], ["withdrawn", "Withdrawn"]] as const;
export const APP_CLOSED = ["offer", "rejected", "withdrawn"];
