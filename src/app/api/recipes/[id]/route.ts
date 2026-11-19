import { NextRequest, NextResponse } from "next/server";
import { deleteRecipe, getRecipe, updateRecipe } from "@/lib/recipes";
import { recipeInput } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 });

export async function GET(_req: NextRequest, { params }: Ctx) {
  const recipe = await getRecipe((await params).id);
  return recipe ? NextResponse.json(recipe) : notFound();
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const parsed = recipeInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const recipe = await updateRecipe((await params).id, parsed.data);
  return recipe ? NextResponse.json(recipe) : notFound();
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const removed = await deleteRecipe((await params).id);
  return removed ? new NextResponse(null, { status: 204 }) : notFound();
}
