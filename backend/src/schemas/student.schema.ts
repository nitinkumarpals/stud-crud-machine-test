import { z } from "zod";

export const registerStudent = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().positive("Age must be a positive number"),
});

export const updateStudent = z.object({
  firstName: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  age: z.number().positive("Age must be a positive number"),
});
