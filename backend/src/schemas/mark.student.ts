import { z } from "zod";

export const SUBJECT_ENUM = z.enum([
  "Math",
  "Science",
  "English",
  "Social_Studies",
  "Art",
]);

export const createMarkSchema = z.object({
  subject: SUBJECT_ENUM,
  score: z.number().int().min(0).max(100),
  studentId: z.string().uuid(),
});

export const updateMarkSchema = z.object({
  subject: SUBJECT_ENUM.optional(),
  score: z.number().int().min(0).max(100).optional(),
});