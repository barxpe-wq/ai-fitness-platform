import { apiFetch } from "./api";
import type { CheckIn, Plan } from "../types/api";

export type PlanCreatePayload = {
  title: string;
  notes?: string;
};

export type PlanUpdatePayload = {
  title?: string;
  notes?: string | null;
};

export type CheckInCreatePayload = {
  date: string;
  weightKg?: number;
  waistCm?: number;
  notes?: string;
};

export type CheckInUpdatePayload = {
  date?: string;
  weightKg?: number | null;
  waistCm?: number | null;
  notes?: string | null;
};

export function createPlan(clientId: string, payload: PlanCreatePayload) {
  return apiFetch<Plan>(`/clients/${clientId}/plans`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updatePlan(planId: string, payload: PlanUpdatePayload) {
  return apiFetch<Plan>(`/plans/${planId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deletePlan(planId: string) {
  return apiFetch<{ ok: boolean }>(`/plans/${planId}`, {
    method: "DELETE"
  });
}

export function createCheckIn(
  clientId: string,
  payload: CheckInCreatePayload
) {
  return apiFetch<CheckIn>(`/clients/${clientId}/checkins`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCheckIn(
  checkInId: string,
  payload: CheckInUpdatePayload
) {
  return apiFetch<CheckIn>(`/checkins/${checkInId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteCheckIn(checkInId: string) {
  return apiFetch<{ ok: boolean }>(`/checkins/${checkInId}`, {
    method: "DELETE"
  });
}
