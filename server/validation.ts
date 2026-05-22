import { z } from "zod";

// Assessment output schemas
// Gemini often returns nested structured sections. The frontend renderer supports
// strings, arrays, and objects, so production validation should enforce required
// section keys without rejecting useful structured output.
const sectionValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.array(z.unknown()),
  z.record(z.string(), z.unknown()),
]);

export const innerFieldSchema = z.object({
  soulPortrait: sectionValue,
  rootSystemReport: sectionValue,
  motivationalDriverMap: sectionValue,
  metanoiaInvitation: sectionValue,
  freedomPathway: sectionValue,
  supportFlag: sectionValue,
  supportNote: sectionValue,
});

export const sendSchema = z.object({
  leaderProfile: sectionValue,
  moduleScores: sectionValue,
  strategicPlan: sectionValue,
  ninetyDayPlan: sectionValue,
  coachingInsights: sectionValue,
  resourceRecommendations: sectionValue,
});

export const fieldSchema = z.object({
  fieldReport: sectionValue,
  greenhouseOrWildField: sectionValue,
  oneNextStep: sectionValue,
  pipelineGapMap: sectionValue,
  movementPathway: sectionValue,
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