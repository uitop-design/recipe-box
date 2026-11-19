import Link from "next/link";
import { listRecipes, listTags } from "@/lib/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

type Search = Promise<{ q?: string; tag?: string }>;

export default async function HomePage({ searchParams }: { searchParams: Search }) {
  const { q = "", tag = "" } = await searchParams;

  const [recipes, tags] = await Promise.all([listRecipes({ q, tag }), listTags()]);

  return (
    <>
      <h1>Recipes</h1>
      <SearchBar q={q} tag={tag} />
      <nav className="tags">
        <Link href={q ? `/?q=${encodeURIComponent(q)}` : "/"} className={tag ? "chip" : "chip active"}>all</Link>
        {tags.map((t) => (
          <Link
            key={t.id}
            href={`/?tag=${encodeURIComponent(t.name)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={t.name === tag ? "chip active" : "chip"}
          >
            {t.name}
          </Link>
        ))}
      </nav>
      {recipes.length === 0 && <p className="muted">Nothing found.</p>}
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
