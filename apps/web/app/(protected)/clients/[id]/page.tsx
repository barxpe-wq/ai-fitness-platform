"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "../../../../src/lib/api";
import { getToken } from "../../../../src/lib/auth";
import { formatDate, formatNumber } from "../../../../src/lib/format";
import type { CheckIn, ClientDetails, Plan } from "../../../../src/types/api";
import Modal from "../../../../src/components/Modal";
import PlanForm, {
  type PlanFormValues
} from "../../../../src/components/forms/PlanForm";
import CheckInForm, {
  type CheckInFormValues
} from "../../../../src/components/forms/CheckInForm";
import {
  createPlan,
  updatePlan,
  deletePlan,
  createCheckIn,
  updateCheckIn,
  deleteCheckIn
} from "../../../../src/lib/api-endpoints";

type LoadState = "idle" | "loading" | "error" | "ready";

export default function ClientDetailsPage() {
  const params = useParams<{ id: string }>();
  const clientId = params?.id;
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [checkinsLoading, setCheckinsLoading] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }

    if (!clientId) {
      setState("error");
      setError("Brak identyfikatora klienta");
      return;
    }

    const load = async () => {
      setState("loading");
      setError(null);
      try {
        const [clientData, plansData, checkinsData] = await Promise.all([
          apiFetch<ClientDetails>(`/clients/${clientId}`),
          apiFetch<Plan[]>(`/clients/${clientId}/plans`),
          apiFetch<CheckIn[]>(`/clients/${clientId}/checkins`)
        ]);

        setClient(clientData);
        setPlans(plansData);
        setCheckins(checkinsData);
        setState("ready");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nie udało się pobrać danych");
        setState("error");
      }
    };

    load();
  }, [clientId]);

  const sortedCheckins = useMemo(() => {
    return [...checkins].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [checkins]);

  const refreshPlans = async () => {
    if (!clientId) {
      return;
    }
    setPlansLoading(true);
    try {
      const plansData = await apiFetch<Plan[]>(`/clients/${clientId}/plans`);
      setPlans(plansData);
    } finally {
      setPlansLoading(false);
    }
  };

  const refreshCheckins = async () => {
    if (!clientId) {
      return;
    }
    setCheckinsLoading(true);
    try {
      const checkinsData = await apiFetch<CheckIn[]>(
        `/clients/${clientId}/checkins`
      );
      setCheckins(checkinsData);
    } finally {
      setCheckinsLoading(false);
    }
  };

  const handlePlanSubmit = async (values: PlanFormValues) => {
    if (!clientId) {
      return;
    }
    setActionError(null);
    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, values);
        setStatusMessage("Plan został zaktualizowany");
      } else {
        await createPlan(clientId, values as { title: string; notes?: string });
        setStatusMessage("Plan został dodany");
      }
      setPlanModalOpen(false);
      setEditingPlan(null);
      await refreshPlans();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Nie udało się zapisać planu");
    }
  };

  const handlePlanDelete = async (planId: string) => {
    if (!window.confirm("Usunąć plan?")) {
      return;
    }
    setActionError(null);
    try {
      await deletePlan(planId);
      setStatusMessage("Plan został usunięty");
      await refreshPlans();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Nie udało się usunąć planu");
    }
  };

  const handleCheckInSubmit = async (values: CheckInFormValues) => {
    if (!clientId) {
      return;
    }
    setActionError(null);
    try {
      if (editingCheckIn) {
        await updateCheckIn(editingCheckIn.id, values);
        setStatusMessage("Check-in został zaktualizowany");
      } else {
        await createCheckIn(clientId, values as { date: string });
        setStatusMessage("Check-in został dodany");
      }
      setCheckinModalOpen(false);
      setEditingCheckIn(null);
      await refreshCheckins();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nie udało się zapisać check-inu";
      if (message.includes("409")) {
        setActionError("Check-in dla tej daty już istnieje");
      } else {
        setActionError(message);
      }
    }
  };

  const handleCheckInDelete = async (checkInId: string) => {
    if (!window.confirm("Usunąć check-in?")) {
      return;
    }
    setActionError(null);
    try {
      await deleteCheckIn(checkInId);
      setStatusMessage("Check-in został usunięty");
      await refreshCheckins();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Nie udało się usunąć check-inu");
    }
  };

  const openCreatePlan = () => {
    setEditingPlan(null);
    setPlanModalOpen(true);
  };

  const openEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanModalOpen(true);
  };

  const openCreateCheckIn = () => {
    setEditingCheckIn(null);
    setCheckinModalOpen(true);
  };

  const openEditCheckIn = (checkin: CheckIn) => {
    setEditingCheckIn(checkin);
    setCheckinModalOpen(true);
  };

  if (state === "loading") {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
        Ładowanie danych klienta...
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700">
        <p>{error}</p>
        <Link
          href="/clients"
          className="mt-4 inline-flex rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-500"
        >
          Wróć do listy
        </Link>
      </div>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Link href="/clients" className="text-sm font-semibold text-slate-500">
        ← Wróć do listy
      </Link>

      <section
        data-testid="client-details"
        className="rounded-3xl border border-slate-200 bg-white p-8"
      >
        <h1 className="text-2xl font-semibold text-slate-900">
          {client.firstName} {client.lastName}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{client.email}</p>
        <p className="mt-1 text-sm text-slate-400">
          Dołączono: {formatDate(client.createdAt)}
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Plany</h2>
          <button
            onClick={openCreatePlan}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            + Dodaj plan
          </button>
        </div>
        {plansLoading ? (
          <p className="mt-3 text-sm text-slate-500">Odświeżanie planów...</p>
        ) : plans.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Brak planów</p>
        ) : (
          <div className="mt-4 space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-semibold text-slate-900">
                    {plan.title}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Aktualizacja: {formatDate(plan.updatedAt)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {plan.notes || "Brak notatek"}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEditPlan(plan)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handlePlanDelete(plan.id)}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-400"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Check-ins</h2>
          <button
            onClick={openCreateCheckIn}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            + Dodaj check-in
          </button>
        </div>
        {checkinsLoading ? (
          <p className="mt-3 text-sm text-slate-500">Odświeżanie check-inów...</p>
        ) : sortedCheckins.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Brak check-inów</p>
        ) : (
          <div className="mt-4 space-y-4">
            {sortedCheckins.map((checkin) => (
              <div
                key={checkin.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-base font-semibold text-slate-900">
                    {formatDate(checkin.date)}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Dodano: {formatDate(checkin.createdAt)}
                  </span>
                </div>
                <div className="mt-2 grid gap-2 text-sm text-slate-600 sm:grid-cols-3">
                  <div>Waga: {formatNumber(checkin.weightKg)} kg</div>
                  <div>Talia: {formatNumber(checkin.waistCm)} cm</div>
                  <div>Notatka: {checkin.notes || "-"}</div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEditCheckIn(checkin)}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-400"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleCheckInDelete(checkin.id)}
                    className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-400"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {statusMessage ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {statusMessage}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {actionError}
        </div>
      ) : null}

      <Modal
        isOpen={planModalOpen}
        title={editingPlan ? "Edytuj plan" : "Dodaj plan"}
        onClose={() => {
          setPlanModalOpen(false);
          setEditingPlan(null);
        }}
      >
        <PlanForm
          mode={editingPlan ? "update" : "create"}
          initialValues={
            editingPlan
              ? { title: editingPlan.title, notes: editingPlan.notes }
              : undefined
          }
          onSubmit={handlePlanSubmit}
        />
      </Modal>

      <Modal
        isOpen={checkinModalOpen}
        title={editingCheckIn ? "Edytuj check-in" : "Dodaj check-in"}
        onClose={() => {
          setCheckinModalOpen(false);
          setEditingCheckIn(null);
        }}
      >
        <CheckInForm
          mode={editingCheckIn ? "update" : "create"}
          initialValues={
            editingCheckIn
              ? {
                  date: editingCheckIn.date
                    ? new Date(editingCheckIn.date).toISOString().slice(0, 10)
                    : "",
                  weightKg: editingCheckIn.weightKg,
                  waistCm: editingCheckIn.waistCm,
                  notes: editingCheckIn.notes
                }
              : undefined
          }
          onSubmit={handleCheckInSubmit}
        />
      </Modal>
    </div>
  );
}
