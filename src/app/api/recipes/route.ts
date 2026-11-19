import { NextRequest, NextResponse } from "next/server";
import { createRecipe, listRecipes } from "@/lib/recipes";
import { recipeInput } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const recipes = await listRecipes({
    q: params.get("q") ?? undefined,
    tag: params.get("tag") ?? undefined,
  });
  return NextResponse.json(recipes);
}

export async function POST(req: NextRequest) {
  const parsed = recipeInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const recipe = await createRecipe(parsed.data);
  return NextResponse.json(recipe, { status: 201 });
}
