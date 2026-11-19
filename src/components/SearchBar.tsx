export function SearchBar({ q, tag }: { q: string; tag: string }) {
  return (
    <form className="search" action="/" method="get">
      <input type="search" name="q" defaultValue={q} placeholder="Search recipes" aria-label="Search recipes" />
      {tag && <input type="hidden" name="tag" value={tag} />}
      <button type="submit">Search</button>
    </form>
  );
}
