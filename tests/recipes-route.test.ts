import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/recipes", () => ({
  listRecipes: vi.fn(),
  createRecipe: vi.fn(),
  getRecipe: vi.fn(),
  updateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
}));

import * as service from "@/lib/recipes";
import { GET, POST } from "@/app/api/recipes/route";
import { DELETE, GET as GET_ONE } from "@/app/api/recipes/[id]/route";

const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

describe("/api/recipes", () => {
  beforeEach(() => vi.clearAllMocks());

  it("passes search params to the service", async () => {
    vi.mocked(service.listRecipes).mockResolvedValue([]);
    const res = await GET(new NextRequest("http://localhost/api/recipes?q=soup&tag=vegan"));
    expect(res.status).toBe(200);
    expect(service.listRecipes).toHaveBeenCalledWith({ q: "soup", tag: "vegan" });
  });

  it("returns 400 for an invalid body", async () => {
    const req = new NextRequest("http://localhost/api/recipes", {
      method: "POST",
      body: JSON.stringify({ title: "x" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(service.createRecipe).not.toHaveBeenCalled();
  });

  it("creates a recipe", async () => {
    vi.mocked(service.createRecipe).mockResolvedValue({ id: "r1" } as never);
    const req = new NextRequest("http://localhost/api/recipes", {
      method: "POST",
      body: JSON.stringify({
        title: "Toast",
        steps: ["Toast the bread"],
        ingredients: [{ name: "bread", quantity: 2, unit: "slices" }],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "r1" });
  });
});

describe("/api/recipes/:id", () => {
  it("returns 404 for unknown recipes", async () => {
    vi.mocked(service.getRecipe).mockResolvedValue(null);
    const res = await GET_ONE(new NextRequest("http://localhost/api/recipes/nope"), ctx("nope"));
    expect(res.status).toBe(404);
  });

  it("returns 204 after delete", async () => {
    vi.mocked(service.deleteRecipe).mockResolvedValue(true);
    const res = await DELETE(new NextRequest("http://localhost/api/recipes/r1"), ctx("r1"));
    expect(res.status).toBe(204);
  });
});
