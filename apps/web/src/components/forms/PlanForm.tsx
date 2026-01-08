"use client";

import { useState } from "react";
import { planCreateSchema, planUpdateSchema, mapZodErrors } from "../../lib/validation";
import { z } from "zod";

export type PlanFormValues = {
  title?: string;
  notes?: string | null;
};

type PlanFormProps = {
  mode: "create" | "update";
  initialValues?: PlanFormValues;
  onSubmit: (values: PlanFormValues) => Promise<void>;
};

export default function PlanForm({
  mode,
  initialValues,
  onSubmit
}: PlanFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const payload: PlanFormValues = {
      title: title.trim() || undefined,
      notes: notes === "" ? (mode === "update" ? null : undefined) : notes
    };

    const schema = mode === "create" ? planCreateSchema : planUpdateSchema;
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setErrors(mapZodErrors(parsed.error));
      return;
    }

    setSaving(true);
    try {
      await onSubmit(parsed.data as z.infer<typeof schema>);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="plan-title"
          className="text-sm font-semibold text-slate-700"
        >
          Tytuł
        </label>
        <input
          id="plan-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400"
          placeholder="np. Plan siłowy"
          required={mode === "create"}
        />
        {errors.title ? (
          <p className="mt-1 text-xs text-rose-500">{errors.title}</p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor="plan-notes"
          className="text-sm font-semibold text-slate-700"
        >
          Notatki
        </label>
        <textarea
          id="plan-notes"
          value={notes ?? ""}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400"
          placeholder="Dodaj krótkie notatki"
          rows={4}
        />
        {errors.notes ? (
          <p className="mt-1 text-xs text-rose-500">{errors.notes}</p>
        ) : null}
      </div>

      {errors.form ? (
        <p className="text-xs text-rose-500">{errors.form}</p>
      ) : null}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {saving ? "Zapisywanie..." : mode === "create" ? "Dodaj plan" : "Zapisz zmiany"}
      </button>
    </form>
  );
}
