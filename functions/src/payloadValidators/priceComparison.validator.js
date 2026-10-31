const { z } = require("zod");

const mapCompetitorSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  competitorProductUrl: z.string().url("Must be a valid URL"),
  isBlacklisted: z.boolean().optional().default(false),
});

const refreshBatchSchema = z.object({
  productIds: z
    .array(z.string().min(1))
    .min(1, "At least one productId is required")
    .max(50, "Cannot refresh more than 50 products at once"),
});

module.exports = { mapCompetitorSchema, refreshBatchSchema };
