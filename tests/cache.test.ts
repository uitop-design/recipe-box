import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, string>();

vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(async (k: string) => store.get(k) ?? null),
    set: vi.fn(async (k: string, v: string) => {
      store.set(k, v);
      return "OK";
    }),
    incr: vi.fn(async (k: string) => {
      const next = Number(store.get(k) ?? 0) + 1;
      store.set(k, String(next));
      return next;
    }),
  },
}));

import { cached, invalidateSearch, searchKey } from "@/lib/cache";
import { redis } from "@/lib/redis";

describe("cache helpers", () => {
  beforeEach(() => store.clear());

  it("calls the loader only on a miss", async () => {
    const loader = vi.fn(async () => ({ n: 1 }));
    await cached("k", 60, loader);
    const second = await cached("k", 60, loader);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(second).toEqual({ n: 1 });
  });

  it("falls back to the loader when redis fails", async () => {
    vi.mocked(redis.get).mockRejectedValueOnce(new Error("down"));
    const loader = vi.fn(async () => "fresh");
    await expect(cached("k", 60, loader)).resolves.toBe("fresh");
  });

  it("changes search keys after invalidation", async () => {
    const before = await searchKey("Soup", "vegan");
    await invalidateSearch();
    const after = await searchKey("Soup", "vegan");
    expect(before).toBe("recipes:search:v0:soup:vegan");
    expect(after).toBe("recipes:search:v1:soup:vegan");
  });
});
