import { redis } from "./redis";

const SEARCH_VERSION_KEY = "recipes:search:version";

/**
 * Read-through cache. If Redis is unavailable the loader is called directly,
 * so the app keeps working without a cache.
 */
export async function cached<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch {
    return loader();
  }

  const value = await loader();
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // ignore cache write errors
  }
  return value;
}

/** Search keys include a version number, bumping it makes all old entries unreachable. */
export async function searchKey(q: string, tag: string): Promise<string> {
  let version = "0";
  try {
    version = (await redis.get(SEARCH_VERSION_KEY)) ?? "0";
  } catch {
    // fall through with default version
  }
  return `recipes:search:v${version}:${q.toLowerCase()}:${tag}`;
}

export async function invalidateSearch(): Promise<void> {
  try {
    await redis.incr(SEARCH_VERSION_KEY);
  } catch {
    // entries will expire by TTL
  }
}
