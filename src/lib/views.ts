import { redis } from "./redis";

const VIEWS_KEY = "recipes:views";

export async function trackView(recipeId: string): Promise<void> {
  try {
    await redis.zincrby(VIEWS_KEY, 1, recipeId);
  } catch {
    // view counters are best effort
  }
}

export async function topViewed(limit = 5): Promise<{ id: string; views: number }[]> {
  try {
    const raw = await redis.zrevrange(VIEWS_KEY, 0, limit - 1, "WITHSCORES");
    const out: { id: string; views: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) out.push({ id: raw[i], views: Number(raw[i + 1]) });
    return out;
  } catch {
    return [];
  }
}

export async function forgetViews(recipeId: string): Promise<void> {
  try {
    await redis.zrem(VIEWS_KEY, recipeId);
  } catch {
    // ignore
  }
}
