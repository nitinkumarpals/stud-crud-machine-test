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
  score: z.number().min(0).max(100),
});

export const updateMarkSchema = z.object({
  subject: SUBJECT_ENUM,
  score: z.number().min(0).max(100),
});

export const registerStudent = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().positive("Age must be a positive number"),
  marks: z.array(createMarkSchema).optional(),
});

export const updateStudent = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  age: z.number().positive("Age must be a positive number").optional(),
  marks: z.array(updateMarkSchema).optional(),
});

export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .refine(
      (val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))),
      {
        message: "Page must be a positive integer",
      }
    ),

  limit: z
    .string()
    .optional()
    .refine(
      (val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))),
      {
        message: "Limit must be a positive integer",
      }
    ),
});
