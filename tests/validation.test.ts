import { describe, expect, it } from "vitest";
import { recipeInput, slugify } from "@/lib/validation";

const base = {
  title: "Tomato pasta",
  steps: ["Boil", "Mix"],
  ingredients: [{ name: "spaghetti", quantity: 200, unit: "g" }],
};

describe("recipeInput", () => {
  it("applies defaults", () => {
    const parsed = recipeInput.parse(base);
    expect(parsed.servings).toBe(2);
    expect(parsed.tags).toEqual([]);
  });

  it("normalizes and de-duplicates tags", () => {
    const parsed = recipeInput.parse({ ...base, tags: ["Pasta", " pasta ", "Quick"] });
    expect(parsed.tags).toEqual(["pasta", "quick"]);
  });

  it("requires at least one step and ingredient", () => {
    expect(recipeInput.safeParse({ ...base, steps: [] }).success).toBe(false);
    expect(recipeInput.safeParse({ ...base, ingredients: [] }).success).toBe(false);
  });

  it("rejects negative quantities", () => {
    const bad = { ...base, ingredients: [{ name: "salt", quantity: -1 }] };
    expect(recipeInput.safeParse(bad).success).toBe(false);
  });
});

describe("slugify", () => {
  it("builds url friendly slugs", () => {
    expect(slugify("Creme Brulee, classic!")).toBe("creme-brulee-classic");
    expect(slugify("  Pad  Thai ")).toBe("pad-thai");
  });
});
