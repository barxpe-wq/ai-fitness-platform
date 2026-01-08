import { AppError } from "../middleware/error";
import { config } from "../config";

const timeoutMs = 5000;

type PredictFeatures = {
  last_weight: number;
  last_waist: number;
  rolling_mean_7: number;
  rolling_mean_14: number;
  delta_7: number;
  day_of_week: number;
};

export async function mlHealth() {
  return request<{ ok: boolean }>("/health", { method: "GET" });
}

export async function predictWeight(features: PredictFeatures) {
  return request<{ predicted_weight_kg: number }>("/predict-weight", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ features })
  });
}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${config.mlApiBaseUrl}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });

    const text = await response.text();
    const data = text ? safeJson(text) : null;

    if (!response.ok) {
      if (response.status >= 500) {
        throw new AppError(502, "INTERNAL_ERROR", "ML API unavailable");
      }
      const message =
        (data as { detail?: string })?.detail ??
        `ML API error (${response.status})`;
      throw new AppError(400, "VALIDATION_ERROR", message);
    }

    return (data as T) ?? ({} as T);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    if ((error as Error).name === "AbortError") {
      throw new AppError(502, "INTERNAL_ERROR", "ML API timeout");
    }
    throw new AppError(502, "INTERNAL_ERROR", "ML API unreachable");
  } finally {
    clearTimeout(id);
  }
}

function safeJson(payload: string) {
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
