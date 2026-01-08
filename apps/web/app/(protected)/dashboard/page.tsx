"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../../src/lib/api";
import { getToken } from "../../../src/lib/auth";
import { API_BASE_URL } from "../../../src/lib/config";
import type { MeResponse } from "../../../src/types/api";

export default function DashboardPage() {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [apiOk, setApiOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }

    const load = async () => {
      try {
        const [me, health] = await Promise.all([
          apiFetch<MeResponse>("/auth/me"),
          apiFetch<{ ok: boolean }>("/health")
        ]);
        setUser(me);
        setApiOk(health.ok);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
        Ładowanie dashboardu...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-600">
        <p>{error}</p>
        <p className="mt-2 text-sm text-rose-500">API: {API_BASE_URL}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          Panel trenera
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          Witaj, {user?.email}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Rola: {user?.role}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8">
        <h2 className="text-lg font-semibold text-slate-900">Status API</h2>
        <p className="mt-2 text-sm text-slate-600">
          {apiOk === null
            ? "Sprawdzanie..."
            : apiOk
              ? "API online"
              : "API offline"}
        </p>
        <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
          API: {API_BASE_URL}
        </div>
        <div className="mt-2 text-sm text-slate-600">
          Me: {user?.email} ({user?.role})
        </div>
      </div>
    </div>
  );
}
