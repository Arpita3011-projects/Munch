const { z } = require('zod');

const addressFields = {
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name is required')
    .max(100, 'Full name cannot exceed 100 characters'),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(/^[+]?[\d\s-]{10,15}$/, 'Enter a valid phone number'),
  house: z
    .string({ required_error: 'House / Flat No. is required' })
    .trim()
    .min(1, 'House / Flat No. is required')
    .max(100, 'House / Flat No. cannot exceed 100 characters'),
  street: z
    .string({ required_error: 'Street / Area is required' })
    .trim()
    .min(1, 'Street / Area is required')
    .max(200, 'Street / Area cannot exceed 200 characters'),
  landmark: z
    .string()
    .trim()
    .max(200, 'Landmark cannot exceed 200 characters')
    .optional()
    .default(''),
  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City is required')
    .max(100, 'City cannot exceed 100 characters'),
  state: z
    .string({ required_error: 'State is required' })
    .trim()
    .min(2, 'State is required')
    .max(100, 'State cannot exceed 100 characters'),
  pincode: z
    .string({ required_error: 'Pincode is required' })
    .trim()
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  type: z
    .enum(['home', 'work', 'other'], { required_error: 'Address type is required' })
    .optional()
    .default('home'),
  isDefault: z.boolean().optional().default(false),
};

const createAddressSchema = z.object(addressFields);

// Partial for updates — any subset of fields may be provided.
const updateAddressSchema = z.object(addressFields).partial();

const addressParamsSchema = z.object({
  id: z
    .string({ required_error: 'Address ID is required' })
    .regex(/^[a-f\d]{24}$/i, 'Invalid address ID format'),
});

module.exports = {
  createAddressSchema,
  updateAddressSchema,
  addressParamsSchema,
};

