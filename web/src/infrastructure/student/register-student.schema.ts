import { z } from 'zod';

// Edge schema: mirrors the backend RegisterStudentDto + STUDENT domain rules.
// Server remains the source of truth for uniqueness (409).
export const registerStudentSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(8, 'Password must have at least 8 characters'),
  studentNumber: z.string().trim().min(1, 'Student number is required'),
});

export type RegisterStudentFormValues = z.infer<typeof registerStudentSchema>;
