import * as z from 'zod';

export const EnrollmentSchema = z.object({
  student: z.string().min(1, 'Student is required'),

  course: z.string().min(1, 'Course is required'),

  status: z.enum(['active', 'completed', 'dropped']),

  progress: z.number().nonnegative('Price must be 0 or more'),
});

export const UpdateEnrollmentSchema = EnrollmentSchema.partial();
