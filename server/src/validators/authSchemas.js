const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(1, 'Name cannot be empty')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .transform((e) => e.toLowerCase()),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password cannot exceed 128 characters'),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .transform((e) => e.toLowerCase()),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

const googleAuthSchema = z.object({
  idToken: z
    .union([
      z.string().min(1, 'ID token cannot be empty'),
      z.object({
        sub: z.string().min(1),
        email: z.string().email(),
        name: z.string().optional(),
      }),
    ])
    .describe('Google ID token (string) or pre-verified payload object (MVP)'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .transform((e) => e.toLowerCase()),
  name: z.string().trim().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  googleAuthSchema,
};
