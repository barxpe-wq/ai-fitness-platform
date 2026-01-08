import { z } from "zod";

const dateString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Nieprawidłowa data"
  });

export const planCreateSchema = z.object({
  title: z.string().min(2, "Tytuł musi mieć min. 2 znaki"),
  notes: z.string().optional()
});

export const planUpdateSchema = z
  .object({
    title: z.string().min(2, "Tytuł musi mieć min. 2 znaki").optional(),
    notes: z.string().nullable().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Wprowadź przynajmniej jedno pole"
  });

export const checkInCreateSchema = z.object({
  date: dateString,
  weightKg: z
    .number()
    .min(0, "Waga nie może być ujemna")
    .max(400, "Waga jest zbyt wysoka")
    .optional(),
  waistCm: z
    .number()
    .min(0, "Talia nie może być ujemna")
    .max(300, "Talia jest zbyt wysoka")
    .optional(),
  notes: z.string().optional()
});

export const checkInUpdateSchema = z
  .object({
    date: dateString.optional(),
    weightKg: z
      .number()
      .min(0, "Waga nie może być ujemna")
      .max(400, "Waga jest zbyt wysoka")
      .nullable()
      .optional(),
    waistCm: z
      .number()
      .min(0, "Talia nie może być ujemna")
      .max(300, "Talia jest zbyt wysoka")
      .nullable()
      .optional(),
    notes: z.string().nullable().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Wprowadź przynajmniej jedno pole"
  });

export function mapZodErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
