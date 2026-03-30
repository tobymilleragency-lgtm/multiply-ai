// Basic type definitions for Supabase database tables
// Generated from migration schema

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  ministry_name: string | null;
  ministry_context: string | null;
  church_name: string | null;
}

export interface ChurchProfile {
  id: string;
  user_id: string;
  weekly_attendance: number | null;
  congregation_size_category: string | null;
  church_age_category: string | null;
  percent_under_18: number | null;
  percent_18_to_35: number | null;
  percent_35_to_55: number | null;
  percent_55_plus: number | null;
  ethnic_composition: string | null;
  socioeconomic_background: string | null;
  is_bivocational: boolean;
  staff_count: number;
  has_childrens_ministry: boolean;
  has_youth_ministry: boolean;
  preaching_style: string;
  community_town: string | null;
  community_state: string | null;
  community_population: number | null;
  community_median_income: number | null;
  community_ethnic_demographics: string | null;
  community_primary_industries: string | null;
  community_population_trend: string | null;
  community_distance_to_city: number | null;
  community_classification: string | null;
  census_year: number | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentSubmission {
  id: string;
  user_id: string;
  assessment_type: "inner-field" | "send" | "field";
  status: string;
  answers_json: Record<string, string | number>;
  started_at: string;
  completed_at: string | null;
  output_json: Record<string, unknown>;
  raw_model_output: string | null;
  model_used: string | null;
}

export interface CombinedReport {
  id: string;
  user_id: string;
  inner_field_submission_id: string;
  send_submission_id: string;
  field_submission_id: string;
  output_json: Record<string, unknown>;
  raw_model_output: string;
  model_used: string;
}