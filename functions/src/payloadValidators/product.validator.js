const { z } = require("zod");

const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  originalPrice: z.number().positive().optional(),
  currency: z.string().default("INR"),
  category: z.enum(["cookware", "storage", "cutlery", "bakeware", "other"]),
  brand: z.string().min(1, "Brand is required"),
  material: z.string().optional(),
  capacity: z.string().optional(),
  images: z.array(z.string().url()).min(1, "At least one product image is required"),
  arModelUrl: z.string().url("Must be a valid URL to a .glb file").optional().nullable(),
  inStock: z.boolean().default(true),
  stockCount: z.number().int().min(0).default(0),
  gtin: z.string().optional(),
  modelNumber: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

const updateProductSchema = createProductSchema.partial();

const productQuerySchema = z.object({
  category: z.enum(["cookware", "storage", "cutlery", "bakeware", "other"]).optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  inStock: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

module.exports = { createProductSchema, updateProductSchema, productQuerySchema };
