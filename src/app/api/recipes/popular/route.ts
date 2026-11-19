import { NextResponse } from "next/server";
import { popularRecipes } from "@/lib/recipes";

export async function GET() {
  return NextResponse.json(await popularRecipes(5));
}
