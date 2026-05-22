import { createClient } from "@supabase/supabase-js";
import { validateAssessmentOutput, sanitizeJsonOutput, type AssessmentType } from "./validation.js";

// Supabase client will be initialized when first accessed
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.MULTIPLY_AI_SUPABASE_URL;
    const key = process.env.MULTIPLY_AI_SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('Multiply.ai Supabase setup required: MULTIPLY_AI_SUPABASE_URL and MULTIPLY_AI_SUPABASE_SERVICE_ROLE_KEY must be configured');
    }
    supabaseClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseClient;
}

// Export a proxy that will initialize the client on first use
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabase();
    return (client as any)[prop];
  }
});

export function googleApiKey() {
  return process.env.MULTIPLY_AI_GOOGLE_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || "";
}

export function modelName() {
  return process.env.MULTIPLY_AI_GEMINI_MODEL || "gemini-2.5-flash";
}

function extractGeminiText(json: unknown): string {
  const data = json as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
    promptFeedback?: unknown;
  };
  const text = data.candidates?.[0]?.content?.parts
    ?.map(part => part.text || "")
    .join("")
    .trim();
  if (!text) {
    throw new Error(`Empty Gemini response${data.promptFeedback ? `: ${JSON.stringify(data.promptFeedback)}` : ""}`);
  }
  return text;
}

export async function generateJsonWithValidation(system: string, payload: unknown, assessmentType?: AssessmentType) {
  const apiKey = googleApiKey();
  if (!apiKey) {
    throw new Error("Multiply.ai Gemini setup required: set MULTIPLY_AI_GOOGLE_API_KEY, GOOGLE_AI_API_KEY, or GEMINI_API_KEY");
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName())}:generateContent?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: system }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: JSON.stringify(payload, null, 2) }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) throw new Error(await response.text());
  const content = extractGeminiText(await response.json());
  
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid Gemini JSON response: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
  
  // Validate against schema if assessment type is provided
  if (assessmentType) {
    const validated = validateAssessmentOutput(assessmentType, parsed);
    if (!validated) {
      throw new Error(`Generated output failed validation for ${assessmentType} assessment`);
    }
    return { raw: content, parsed: validated };
  }
  
  // Sanitize the output in any case
  const sanitized = sanitizeJsonOutput(parsed);
  if (!sanitized) {
    throw new Error("Failed to sanitize JSON output");
  }
  
  return { raw: content, parsed: sanitized };
}

export function validateAssessmentType(value: unknown): value is "inner-field" | "send" | "field" {
  return value === "inner-field" || value === "send" || value === "field";
}

export function parseAnswers(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, string | number>;
}

export function promptFor(type: string) {
  if (type === "inner-field") return `You are the Inner Field Guide. Output only valid JSON with keys soulPortrait, rootSystemReport, motivationalDriverMap, metanoiaInvitation, freedomPathway, supportFlag, supportNote.`;
  if (type === "send") return `You are the Strategy General. Output only valid JSON with keys leaderProfile, moduleScores, strategicPlan, ninetyDayPlan, coachingInsights, resourceRecommendations.`;
  return `You are the Field Guide. Output only valid JSON with keys fieldReport, greenhouseOrWildField, oneNextStep, pipelineGapMap, movementPathway.`;
}

export function buildCommunityContext(cp: Record<string, unknown>): string {
  return `
COMMUNITY AND CHURCH CONTEXT — READ THIS BEFORE GENERATING ANY OUTPUT:

Church: ${cp.church_name ?? "Unknown"}
Location: ${cp.community_town ?? "Unknown"}, ${cp.community_state ?? "Unknown"}
Community Classification: ${cp.community_classification ?? "Unknown"}
Population: ${cp.community_population ? Number(cp.community_population).toLocaleString() : "Unknown"}
Median Household Income: ${cp.community_median_income ? `$${Number(cp.community_median_income).toLocaleString()}` : "Unknown"}
Ethnic Composition: ${cp.community_ethnic_demographics ?? "Unknown"}
Primary Industries: ${cp.community_primary_industries ?? "Unknown"}
Population Trend: ${cp.community_population_trend ?? "Unknown"}
Distance from Nearest City (50k+): ${cp.community_distance_to_city ? `${cp.community_distance_to_city} miles` : "Unknown"}

Congregation:
- Weekly Attendance: ${cp.weekly_attendance ?? "Unknown"}
- Size Category: ${cp.congregation_size_category ?? "Unknown"}
- Age Breakdown: Under 18: ${cp.percent_under_18 ?? "?"}%, 18-35: ${cp.percent_18_to_35 ?? "?"}%, 35-55: ${cp.percent_35_to_55 ?? "?"}%, 55+: ${cp.percent_55_plus ?? "?"}%
- Ethnic Composition: ${cp.ethnic_composition ?? "Unknown"}
- Socioeconomic Background: ${cp.socioeconomic_background ?? "Unknown"}
- Bi-vocational Pastor: ${cp.is_bivocational ? "Yes" : "No"}
- Children's Ministry: ${cp.has_childrens_ministry ? "Yes" : "No"}
- Youth Ministry: ${cp.has_youth_ministry ? "Yes" : "No"}
- Preaching Style: ${cp.preaching_style ?? "Unknown"}

CRITICAL INSTRUCTION: Every illustration, example, strategy recommendation, objection response, and application suggestion you generate MUST be contextualized to this specific church and community. Never generate generic outputs.
  `.trim();
}

export const THEOLOGICAL_FRAMEWORK = `
THEOLOGICAL FRAMEWORK — THIS GOVERNS ALL OUTPUTS:

1. METANOIA — Transformation precedes multiplication. Metanoia means a complete change of mind, a turning away from lies toward truth, and an ongoing continuous process (Romans 12:2). Your outputs serve metanoia — not behavior modification, not program compliance, but genuine Spirit-empowered inner transformation.

2. PISTEUŌ — Biblical trust, not merely intellectual agreement. The goal is not that people know more about Jesus but that they entrust themselves to him — genuinely relying on him, making him the foundation of actual daily decisions.

3. MARK 3:14 — Withness before sentness. Jesus appointed twelve that they might be WITH him and that he might SEND them out. You cannot send what you have not shaped. Every output prioritizes formation over function, presence over production, depth over scale.

OUTPUT RULE — NON-NEGOTIABLE: You MUST output ONLY valid JSON matching the exact structure specified. No preamble. No explanation. No markdown code fences. No text before or after the JSON. If you cannot complete a section write an empty string rather than omitting the field.
`.trim();