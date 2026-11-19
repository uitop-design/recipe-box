import { NextResponse } from "next/server";
import { listTags } from "@/lib/recipes";

export async function GET() {
  const tags = await listTags();
  return NextResponse.json(
    tags.map((t) => ({ id: t.id, name: t.name, recipes: t._count.recipes })),
  );
}
