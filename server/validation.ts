import { z } from "zod";

// Assessment output schemas
export const innerFieldSchema = z.object({
  soulPortrait: z.string(),
  rootSystemReport: z.string(),
  motivationalDriverMap: z.string(),
  metanoiaInvitation: z.string(),
  freedomPathway: z.string(),
  supportFlag: z.string(),
  supportNote: z.string(),
});

export const sendSchema = z.object({
  leaderProfile: z.string(),
  moduleScores: z.string(),
  strategicPlan: z.string(),
  ninetyDayPlan: z.string(),
  coachingInsights: z.string(),
  resourceRecommendations: z.string(),
});

export const fieldSchema = z.object({
  fieldReport: z.string(),
  greenhouseOrWildField: z.string(),
  oneNextStep: z.string(),
  pipelineGapMap: z.string(),
  movementPathway: z.string(),
});

// Agent output schemas
export const agentSchemas = {
  "inner-field": innerFieldSchema,
  "send": sendSchema,
  "field": fieldSchema,
} as const;

export type AssessmentType = keyof typeof agentSchemas;

export function validateAssessmentOutput(type: AssessmentType, data: unknown) {
  const schema = agentSchemas[type];
  try {
    return schema.parse(data);
  } catch (error) {
    console.error(`Validation failed for ${type} assessment:`, error);
    return null;
  }
}

export function sanitizeJsonOutput(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  return sanitizeObject(data as Record<string, unknown>);
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === "object") return sanitizeObject(value as Record<string, unknown>);
  return value;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) sanitized[key] = sanitizeValue(value);
  }
  return sanitized;
}