import Link from "next/link";

export function PopularList({ items }: { items: { id: string; title: string; views: number }[] }) {
  if (items.length === 0) return null;
  return (
    <aside className="popular">
      <h2>Popular right now</h2>
      <ol>
        {items.map((r) => (
          <li key={r.id}>
            <Link href={`/recipes/${r.id}`}>{r.title}</Link> <span className="muted">{r.views} views</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
