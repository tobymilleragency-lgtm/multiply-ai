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

async function parseApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  const json = contentType.includes("application/json") && text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      json && typeof json === "object" && "error" in json && typeof json.error === "string"
        ? json.error
        : `${response.status} ${response.statusText || "Request failed"}`;
    throw new Error(message);
  }

  if (!json) {
    const preview = text.trim().slice(0, 120);
    throw new Error(preview ? `Expected JSON response, received: ${preview}` : "Expected JSON response");
  }

  return json as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path, { headers: await authHeaders() });
  return parseApiResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(body || {}),
  });
  return parseApiResponse<T>(response);
}
