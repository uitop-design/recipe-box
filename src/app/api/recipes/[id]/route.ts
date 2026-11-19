import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recipeInput } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { position: "asc" } },
      tags: { include: { tag: true } },
    },
  });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(recipe);
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const parsed = recipeInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const exists = await prisma.recipe.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { tags, ingredients, ...data } = parsed.data;
  const recipe = await prisma.$transaction(async (tx) => {
    await tx.ingredient.deleteMany({ where: { recipeId: id } });
    await tx.recipeTag.deleteMany({ where: { recipeId: id } });
    return tx.recipe.update({
      where: { id },
      data: {
        ...data,
        ingredients: { create: ingredients.map((i, position) => ({ ...i, position })) },
        tags: {
          create: tags.map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
    });
  });
  return NextResponse.json(recipe);
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const deleted = await prisma.recipe.deleteMany({ where: { id } });
  if (deleted.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
