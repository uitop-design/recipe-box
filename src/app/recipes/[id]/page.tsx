import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/recipes";
import { IngredientList } from "@/components/IngredientList";
import { trackView } from "@/lib/views";

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = await getRecipe(id);
  if (!recipe) notFound();
  await trackView(recipe.id);

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
      <IngredientList servings={recipe.servings} ingredients={recipe.ingredients} />

      <h2>Steps</h2>
      <ol className="steps">
        {recipe.steps.map((s, idx) => (
          <li key={idx}>{s}</li>
        ))}
      </ol>
    </article>
  );
}
