import { prisma } from "@/lib/prisma";
import { RecipeCard } from "@/components/RecipeCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const recipes = await prisma.recipe.findMany({
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <>
      <h1>Recipes</h1>
      {recipes.length === 0 && <p className="muted">No recipes yet. Run the seed script to add a few.</p>}
      <div className="grid">
        {recipes.map((r) => (
          <RecipeCard
            key={r.id}
            id={r.id}
            title={r.title}
            description={r.description}
            totalMinutes={(r.prepMinutes ?? 0) + (r.cookMinutes ?? 0) || null}
            tags={r.tags.map((t) => t.tag.name)}
          />
        ))}
      </div>
    </>
  );
}
