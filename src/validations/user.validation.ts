import * as z from 'zod';

export const UserSchema = z.object({
  username: z.string().min(1, 'Username is required'),

  email: z.string().min(1, 'Username is required'),

  password: z.string().min(1, 'password is required'),

  role: z.string().min(1, 'password is required'),
});
