import { redis } from "./redis";

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
