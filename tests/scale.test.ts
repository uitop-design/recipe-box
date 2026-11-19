import { describe, expect, it } from "vitest";
import { formatQuantity, scaleQuantity } from "@/lib/scale";

describe("scaleQuantity", () => {
  it("scales proportionally to servings", () => {
    expect(scaleQuantity(200, 2, 4)).toBe(400);
    expect(scaleQuantity(3, 3, 1)).toBe(1);
  });

  it("rounds to two decimals", () => {
    expect(scaleQuantity(1, 3, 2)).toBe(0.67);
  });

  it("keeps empty quantities empty", () => {
    expect(scaleQuantity(null, 2, 4)).toBeNull();
    expect(scaleQuantity(undefined, 2, 4)).toBeNull();
  });

  it("rejects non-positive servings", () => {
    expect(() => scaleQuantity(1, 0, 2)).toThrow(RangeError);
    expect(() => scaleQuantity(1, 2, -1)).toThrow(RangeError);
  });
});

describe("formatQuantity", () => {
  it("uses unicode fractions for common values", () => {
    expect(formatQuantity(0.5)).toBe("\u00bd");
    expect(formatQuantity(1.25)).toBe("1 \u00bc");
    expect(formatQuantity(2.75)).toBe("2 \u00be");
  });

  it("prints whole numbers as is and rounds big ones", () => {
    expect(formatQuantity(3)).toBe("3");
    expect(formatQuantity(412.4)).toBe("412");
  });

  it("returns an empty string for missing values", () => {
    expect(formatQuantity(null)).toBe("");
  });
});
