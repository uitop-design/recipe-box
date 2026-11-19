import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { position: "asc" } },
      tags: { include: { tag: true } },
    },
  });
  if (!recipe) notFound();

  return (
    <article className="recipe">
      <h1>{recipe.title}</h1>
      {recipe.description && <p className="muted">{recipe.description}</p>}
      <div className="card-meta">
        {recipe.prepMinutes != null && <span>Prep {recipe.prepMinutes} min</span>}
        {recipe.cookMinutes != null && <span>Cook {recipe.cookMinutes} min</span>}
        {recipe.tags.map((t) => (
          <span key={t.tagId} className="chip">{t.tag.name}</span>
        ))}
      </div>

      <h2>Ingredients</h2>
      <p className="muted">For {recipe.servings} servings</p>
      <ul>
        {recipe.ingredients.map((i) => (
          <li key={i.id}>
            {i.quantity ?? ""} {i.unit ?? ""} {i.name}
            {i.note && <span className="muted"> ({i.note})</span>}
          </li>
        ))}
      </ul>

      <h2>Steps</h2>
      <ol className="steps">
        {recipe.steps.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ol>
    </article>
  );
}
