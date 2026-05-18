import * as z from 'zod';

export const StudentSchema = z.object({
  firstName: z.string().min(1, 'Firstname is required'),
  lastName: z.string().min(1, 'Lastname is required'),
  email: z.email({ message: 'Invalid email format' }),
  phone: z
    .string()
    .regex(/^09\d{9}$/, 'Phone must be a valid PH number (09XXXXXXXXX)'),
  birthDate: z
    .string()
    .regex(
      /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])-\d{4}$/,
      'Birthdate must be in MM-DD-YYYY format',
    ),
  status: z.enum(['active', 'inactive']),
});

export const UpdateStudentSchema = StudentSchema.partial();
