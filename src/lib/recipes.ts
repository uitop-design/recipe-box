import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { cached, invalidateSearch, searchKey } from "./cache";
import { forgetViews, topViewed } from "./views";
import { slugify, type RecipeInput } from "./validation";

const SEARCH_TTL = Number(process.env.SEARCH_CACHE_TTL ?? 120);

export type RecipeFilter = { q?: string; tag?: string };

const listInclude = { tags: { include: { tag: true } } } satisfies Prisma.RecipeInclude;

const detailInclude = {
  ingredients: { orderBy: { position: "asc" } },
  tags: { include: { tag: true } },
} satisfies Prisma.RecipeInclude;

function buildWhere({ q, tag }: RecipeFilter): Prisma.RecipeWhereInput {
  return {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
  };
}

function nestedWrites(input: RecipeInput) {
  return {
    ingredients: { create: input.ingredients.map((i, position) => ({ ...i, position })) },
    tags: {
      create: input.tags.map((name) => ({
        tag: { connectOrCreate: { where: { name }, create: { name } } },
      })),
    },
  };
}

export async function listRecipes(filter: RecipeFilter) {
  const q = filter.q?.trim() ?? "";
  const tag = filter.tag?.trim().toLowerCase() ?? "";
  const key = await searchKey(q, tag);
  return cached(key, SEARCH_TTL, () =>
    prisma.recipe.findMany({
      where: buildWhere({ q, tag }),
      include: listInclude,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  );
}

export function listTags() {
  return prisma.tag.findMany({
    include: { _count: { select: { recipes: true } } },
    orderBy: { name: "asc" },
  });
}

export function getRecipe(id: string) {
  return prisma.recipe.findUnique({ where: { id }, include: detailInclude });
}

export async function createRecipe(input: RecipeInput) {
  const { tags: _tags, ingredients: _ingredients, ...data } = input;
  const recipe = await prisma.recipe.create({
    data: {
      ...data,
      slug: `${slugify(data.title)}-${Date.now().toString(36)}`,
      ...nestedWrites(input),
    },
  });
  await invalidateSearch();
  return recipe;
}

/** Returns null when the recipe does not exist. */
export async function updateRecipe(id: string, input: RecipeInput) {
  const exists = await prisma.recipe.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return null;

  const { tags: _tags, ingredients: _ingredients, ...data } = input;
  const recipe = await prisma.$transaction(async (tx) => {
    await tx.ingredient.deleteMany({ where: { recipeId: id } });
    await tx.recipeTag.deleteMany({ where: { recipeId: id } });
    return tx.recipe.update({ where: { id }, data: { ...data, ...nestedWrites(input) } });
  });
  await invalidateSearch();
  return recipe;
}

export async function deleteRecipe(id: string): Promise<boolean> {
  const { count } = await prisma.recipe.deleteMany({ where: { id } });
  if (count === 0) return false;
  await Promise.all([invalidateSearch(), forgetViews(id)]);
  return true;
}

export async function popularRecipes(limit = 5) {
  const top = await topViewed(limit);
  if (top.length === 0) return [];
  const recipes = await prisma.recipe.findMany({
    where: { id: { in: top.map((t) => t.id) } },
    select: { id: true, title: true, slug: true },
  });
  const byId = new Map(recipes.map((r) => [r.id, r]));
  return top.flatMap((t) => {
    const r = byId.get(t.id);
    return r ? [{ ...r, views: t.views }] : [];
  });
}
