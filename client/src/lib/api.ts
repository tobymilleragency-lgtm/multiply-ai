import { supabase } from "@/lib/supabase";

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return {
    "Content-Type": "application/json",
    Authorization: session?.access_token ? `Bearer ${session.access_token}` : "",
  };
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: await authHeaders() });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Request failed");
  return json;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body || {}),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Request failed");
  return json;
}
