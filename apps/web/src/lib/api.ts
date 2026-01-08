import { clearToken, getToken } from "./auth";
import type { ErrorResponse } from "../types/api";
import { API_BASE_URL } from "./config";

type ApiFetchOptions = RequestInit & {
  rawResponse?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getToken();
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (error) {
    throw new Error(`Network error calling ${url}: ${String(error)}`);
  }

  if (response.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as ErrorResponse;
      if (data?.error?.message) {
        message = `${message}: ${data.error.message}`;
      }
    } catch {
      // Ignore JSON parsing errors.
    }
    throw new Error(message);
  }

  if (options.rawResponse) {
    return response as unknown as T;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
