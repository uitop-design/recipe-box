import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cached } from "@/lib/cache";
import { recipeInput, slugify } from "@/lib/validation";

const SEARCH_TTL = Number(process.env.SEARCH_CACHE_TTL ?? 120);

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const tag = req.nextUrl.searchParams.get("tag")?.trim().toLowerCase() ?? "";
  const key = `recipes:search:${q.toLowerCase()}:${tag}`;

  const recipes = await cached(key, SEARCH_TTL, () =>
    prisma.recipe.findMany({
      where: {
        ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
        ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
      },
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  );
  return NextResponse.json(recipes);
}

export async function POST(req: NextRequest) {
  const parsed = recipeInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { tags, ingredients, ...data } = parsed.data;
  const recipe = await prisma.recipe.create({
    data: {
      ...data,
      slug: `${slugify(data.title)}-${Date.now().toString(36)}`,
      ingredients: { create: ingredients.map((i, position) => ({ ...i, position })) },
      tags: {
        create: tags.map((name) => ({
          tag: { connectOrCreate: { where: { name }, create: { name } } },
        })),
      },
    },
  });
  return NextResponse.json(recipe, { status: 201 });
}
