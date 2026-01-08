"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken } from "../../../src/lib/auth";
import { apiFetch } from "../../../src/lib/api";
import { formatDate } from "../../../src/lib/format";
import type { ClientListItem } from "../../../src/types/api";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ClientListItem[]>("/clients");
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się pobrać klientów");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }
    loadClients();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
        Ładowanie klientów...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700">
        <p>{error}</p>
        <button
          onClick={loadClients}
          className="mt-4 rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-500"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-600">
        Brak klientów
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <Link
          key={client.id}
          href={`/clients/${client.id}`}
          data-testid="client-card"
          className="block rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-slate-300"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                {client.firstName} {client.lastName}
              </h2>
              <p className="text-sm text-slate-500">{client.email}</p>
            </div>
            <div className="text-sm text-slate-400">
              Dołączono: {formatDate(client.createdAt)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
