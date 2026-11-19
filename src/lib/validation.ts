import { z } from "zod";

export const ingredientInput = z.object({
  name: z.string().trim().min(1).max(120),
  quantity: z.number().positive().optional(),
  unit: z.string().trim().max(20).optional(),
  note: z.string().trim().max(200).optional(),
});

export const recipeInput = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
  servings: z.number().int().min(1).max(100).default(2),
  prepMinutes: z.number().int().min(0).max(1440).optional(),
  cookMinutes: z.number().int().min(0).max(1440).optional(),
  steps: z.array(z.string().trim().min(1)).min(1),
  ingredients: z.array(ingredientInput).min(1),
  tags: z
    .array(z.string().trim().toLowerCase().min(1).max(40))
    .max(10)
    .default([])
    .transform((tags) => [...new Set(tags)]),
});

export type RecipeInput = z.infer<typeof recipeInput>;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
