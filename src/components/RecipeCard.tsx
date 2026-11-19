import Link from "next/link";

type Props = {
  id: string;
  title: string;
  description: string | null;
  totalMinutes: number | null;
  tags: string[];
};

export function RecipeCard({ id, title, description, totalMinutes, tags }: Props) {
  return (
    <article className="card">
      <h2 className="card-title">
        <Link href={`/recipes/${id}`}>{title}</Link>
      </h2>
      {description && <p className="muted">{description}</p>}
      <div className="card-meta">
        {totalMinutes ? <span>{totalMinutes} min</span> : null}
        {tags.map((t) => (
          <span key={t} className="chip">{t}</span>
        ))}
      </div>
    </article>
  );
}
