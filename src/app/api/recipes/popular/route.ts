import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { topViewed } from "@/lib/views";

export async function GET() {
  const top = await topViewed(5);
  if (top.length === 0) return NextResponse.json([]);

  const recipes = await prisma.recipe.findMany({
    where: { id: { in: top.map((t) => t.id) } },
    select: { id: true, title: true, slug: true },
  });
  const byId = new Map(recipes.map((r) => [r.id, r]));
  return NextResponse.json(
    top.flatMap((t) => {
      const r = byId.get(t.id);
      return r ? [{ ...r, views: t.views }] : [];
    }),
  );
}
