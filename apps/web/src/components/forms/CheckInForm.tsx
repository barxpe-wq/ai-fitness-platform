"use client";

import { useState } from "react";
import { z } from "zod";
import {
  checkInCreateSchema,
  checkInUpdateSchema,
  mapZodErrors
} from "../../lib/validation";

export type CheckInFormValues = {
  date?: string;
  weightKg?: number | null;
  waistCm?: number | null;
  notes?: string | null;
};

type CheckInFormProps = {
  mode: "create" | "update";
  initialValues?: CheckInFormValues;
  onSubmit: (values: CheckInFormValues) => Promise<void>;
};

function numberFromInput(
  value: string,
  mode: CheckInFormProps["mode"]
): number | null | undefined {
  if (value.trim() === "") {
    return mode === "update" ? null : undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export default function CheckInForm({
  mode,
  initialValues,
  onSubmit
}: CheckInFormProps) {
  const [date, setDate] = useState(initialValues?.date ?? "");
  const [weightKg, setWeightKg] = useState(
    initialValues?.weightKg === null || initialValues?.weightKg === undefined
      ? ""
      : initialValues.weightKg.toString()
  );
  const [waistCm, setWaistCm] = useState(
    initialValues?.waistCm === null || initialValues?.waistCm === undefined
      ? ""
      : initialValues.waistCm.toString()
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const payload: CheckInFormValues = {
      date: date.trim() || undefined,
      weightKg: numberFromInput(weightKg, mode),
      waistCm: numberFromInput(waistCm, mode),
      notes: notes === "" ? (mode === "update" ? null : undefined) : notes
    };

    const schema = mode === "create" ? checkInCreateSchema : checkInUpdateSchema;
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
          htmlFor="checkin-date"
          className="text-sm font-semibold text-slate-700"
        >
          Data
        </label>
        <input
          id="checkin-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400"
          required={mode === "create"}
        />
        {errors.date ? (
          <p className="mt-1 text-xs text-rose-500">{errors.date}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="checkin-weight"
            className="text-sm font-semibold text-slate-700"
          >
            Waga (kg)
          </label>
          <input
            id="checkin-weight"
            type="number"
            step="0.1"
            value={weightKg}
            onChange={(event) => setWeightKg(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400"
            placeholder="np. 82.5"
          />
          {errors.weightKg ? (
            <p className="mt-1 text-xs text-rose-500">{errors.weightKg}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="checkin-waist"
            className="text-sm font-semibold text-slate-700"
          >
            Talia (cm)
          </label>
          <input
            id="checkin-waist"
            type="number"
            step="0.1"
            value={waistCm}
            onChange={(event) => setWaistCm(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400"
            placeholder="np. 84"
          />
          {errors.waistCm ? (
            <p className="mt-1 text-xs text-rose-500">{errors.waistCm}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="checkin-notes"
          className="text-sm font-semibold text-slate-700"
        >
          Notatki
        </label>
        <textarea
          id="checkin-notes"
          value={notes ?? ""}
          onChange={(event) => setNotes(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-slate-400"
          placeholder="Opcjonalna notatka"
          rows={3}
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
        {saving
          ? "Zapisywanie..."
          : mode === "create"
            ? "Dodaj check-in"
            : "Zapisz zmiany"}
      </button>
    </form>
  );
}
