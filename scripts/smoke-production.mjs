#!/usr/bin/env node
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const live =
  process.env.MULTIPLY_AI_SMOKE_URL || "https://multiply-ai.vercel.app";
const supabaseUrl = process.env.MULTIPLY_AI_SUPABASE_URL;
const serviceKey = process.env.MULTIPLY_AI_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_MULTIPLY_AI_SUPABASE_ANON_KEY;
const expectedModel =
  process.env.MULTIPLY_AI_GEMINI_MODEL || "gemini-2.5-flash";

if (!supabaseUrl || !serviceKey || !anonKey) {
  throw new Error(
    "Missing Supabase smoke env: MULTIPLY_AI_SUPABASE_URL, MULTIPLY_AI_SUPABASE_SERVICE_ROLE_KEY, and VITE_MULTIPLY_AI_SUPABASE_ANON_KEY are required."
  );
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const anon = createClient(supabaseUrl, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const stamp = Date.now();
const email = `multiply-smoke-${stamp}@example.com`;
const password = `Smoke-${stamp}-A1!`;
let userId = null;

const assessmentAnswers = {
  "inner-field": {
    currentSeason:
      "Carrying steady ministry pressure while trying to stay spiritually healthy.",
    pressurePoints:
      "Decision fatigue, leadership gaps, and concern about disciple-making depth.",
    supportSystem: "A few trusted elders and a praying spouse.",
    desiredOutcome: "Clear next faithful steps without burnout.",
  },
  send: {
    teamReadiness: "Small but willing team with inconsistent ownership.",
    leadershipPipeline: "Informal, needs clarity and repeatable next steps.",
    discipleMaking:
      "Happening relationally but not yet measured or multiplied.",
    missionFocus: "Local outreach and follow-up need better structure.",
  },
  field: {
    communityContext:
      "Rural county seat with strong relationships and quiet spiritual need.",
    congregationHealth:
      "Faithful core, aging volunteer base, and desire to reach families.",
    multiplicationBarriers:
      "Limited leadership bench and unclear pathway from visitor to disciple-maker.",
    nextMove: "Clarify a simple disciple-making path and assign owners.",
  },
};

async function api(path, token, options = {}) {
  const attempts = options.attempts || 3;
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await fetch(`${live}${path}`, {
        method: options.method || "GET",
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const text = await res.text();
      let json;
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = { raw: text };
      }
      return { status: res.status, ok: res.ok, json };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }
  }
  throw lastError;
}

function assert(condition, message, detail) {
  if (!condition) {
    const suffix = detail ? ` :: ${JSON.stringify(detail).slice(0, 600)}` : "";
    throw new Error(`${message}${suffix}`);
  }
}

async function cleanup() {
  if (!userId) return;
  const tables = [
    "agent_outputs",
    "combined_reports",
    "assessment_submissions",
    "usage_tracking",
    "church_profiles",
    "profiles",
  ];
  for (const table of tables) {
    try {
      await admin.from(table).delete().eq("user_id", userId);
    } catch {
      // Continue cleanup across tables even if one table is missing or already clear.
    }
  }
  try {
    await admin.auth.admin.deleteUser(userId);
  } catch {
    // Auth cleanup is best-effort after data cleanup.
  }
}

async function verifyNoSmokeUsersRemain() {
  const { data, error } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;
  const smokeUsers = data.users.filter(user =>
    (user.email || "").startsWith("multiply-smoke-")
  );
  assert(
    smokeUsers.length === 0,
    "Smoke auth cleanup left users behind",
    smokeUsers.map(user => user.email)
  );
}

try {
  console.log(`SMOKE_TARGET ${live}`);

  const health = await api("/api/health", null);
  console.log("HEALTH_STATUS", health.status);
  assert(health.ok && health.json?.ok === true, "Health check failed", health);

  const unauth = await Promise.all([
    api("/api/submissions", null),
    api("/api/church-profile", null),
    api("/api/agent/outputs", null),
  ]);
  console.log("UNAUTH_STATUSES", unauth.map(result => result.status).join(","));
  assert(
    unauth.every(result => result.status === 401),
    "Protected routes must reject unauthenticated calls",
    unauth
  );

  const { data: userData, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
  if (createError) throw createError;
  userId = userData.user.id;
  console.log("AUTH_USER_CREATED", userId);

  const { data: sessionData, error: signInError } =
    await anon.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;
  const token = sessionData.session?.access_token;
  assert(token, "Missing access token");

  const profile = await api("/api/profile", token, {
    method: "POST",
    body: {
      email,
      first_name: "Multiply",
      last_name: "Smoke",
      role: "Pastor",
      ministry_name: "Smoke Test Church",
      ministry_context: "Rural church production smoke fixture",
      church_name: "Smoke Test Church",
    },
  });
  console.log("PROFILE_STATUS", profile.status);
  assert(profile.ok, "Profile upsert failed", profile);
  await admin
    .from("profiles")
    .update({ subscription_tier: "multiply" })
    .eq("user_id", userId);

  const church = await api("/api/church-profile", token, {
    method: "POST",
    body: {
      church_name: "Smoke Test Church",
      community_town: "Oswego",
      community_state: "KS",
      community_classification: "rural",
      weekly_attendance: 75,
      congregation_size_category: "small",
      is_bivocational: false,
      has_childrens_ministry: true,
      has_youth_ministry: true,
      preaching_style: "expository and pastoral",
    },
  });
  console.log(
    "CHURCH_PROFILE_STATUS",
    church.status,
    "id",
    church.json.id || null
  );
  assert(church.ok, "Church profile upsert failed", church);

  for (const type of ["inner-field", "send", "field"]) {
    const started = Date.now();
    const result = await api("/api/assessment/submit", token, {
      method: "POST",
      body: { assessmentType: type, answers: assessmentAnswers[type] },
    });
    console.log(
      "ASSESSMENT_STATUS",
      type,
      result.status,
      "ms",
      Date.now() - started,
      "id",
      result.json.id || null,
      result.json.error
        ? `error=${String(result.json.error).slice(0, 120)}`
        : ""
    );
    assert(result.ok && result.json.id, `${type} assessment failed`, result);
  }

  const rows = await admin
    .from("assessment_submissions")
    .select("id,assessment_type,status,model_used,output_json")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (rows.error) throw rows.error;
  const assessmentRows = rows.data.filter(row =>
    ["inner-field", "send", "field"].includes(row.assessment_type)
  );
  console.log(
    "ASSESSMENT_ROWS",
    assessmentRows
      .map(
        row =>
          `${row.assessment_type}:${row.status}:${row.model_used || "NO_MODEL"}:${row.output_json?.status || "json"}`
      )
      .join(",")
  );
  assert(
    assessmentRows.length >= 3 &&
      assessmentRows.every(
        row =>
          row.status === "completed" &&
          row.model_used === expectedModel &&
          row.output_json &&
          row.output_json.status !== "error"
      ),
    "Assessment rows/provenance invalid",
    assessmentRows
  );

  const combined = await api("/api/combined-reports", token, {
    method: "POST",
    body: {},
  });
  console.log(
    "COMBINED_REPORT_STATUS",
    combined.status,
    "id",
    combined.json.id || null,
    combined.json.error
      ? `error=${String(combined.json.error).slice(0, 120)}`
      : ""
  );
  assert(combined.ok && combined.json.id, "Combined report failed", combined);
  const reportRow = await admin
    .from("combined_reports")
    .select("id,model_used,output_json")
    .eq("id", combined.json.id)
    .single();
  if (reportRow.error) throw reportRow.error;
  console.log(
    "COMBINED_REPORT_ROW",
    reportRow.data.id,
    reportRow.data.model_used || "NO_MODEL",
    Object.keys(reportRow.data.output_json || {}).length
  );
  assert(
    reportRow.data.model_used === expectedModel && reportRow.data.output_json,
    "Combined report provenance invalid",
    reportRow.data
  );

  const agent = await api("/api/agent/run", token, {
    method: "POST",
    body: {
      agentId: "sermon_steward",
      inputData: {
        passage: "Matthew 28:18-20",
        audience: "small rural congregation",
        goal: "equip the church for disciple-making obedience this month",
      },
    },
  });
  console.log(
    "AGENT_RUN_STATUS",
    agent.status,
    "id",
    agent.json.id || null,
    agent.json.error ? `error=${String(agent.json.error).slice(0, 120)}` : ""
  );
  assert(agent.ok && agent.json.id, "Agent run failed", agent);
  const agentRow = await admin
    .from("agent_outputs")
    .select("id,agent_id,model_used,output_json")
    .eq("id", agent.json.id)
    .single();
  if (agentRow.error) throw agentRow.error;
  console.log(
    "AGENT_ROW",
    agentRow.data.id,
    agentRow.data.agent_id,
    agentRow.data.model_used || "NO_MODEL",
    Object.keys(agentRow.data.output_json || {}).length
  );
  assert(
    agentRow.data.model_used === expectedModel && agentRow.data.output_json,
    "Agent output provenance invalid",
    agentRow.data
  );

  await cleanup();
  userId = null;
  await verifyNoSmokeUsersRemain();
  console.log("CLEANUP_OK");
  console.log("LIVE_SMOKE_OK");
} catch (error) {
  console.error("LIVE_SMOKE_FAILED", error?.message || error);
  await cleanup();
  process.exit(1);
}
