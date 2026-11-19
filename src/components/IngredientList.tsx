"use client";

import { useState } from "react";
import { formatQuantity, scaleQuantity } from "@/lib/scale";

type Ingredient = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  note: string | null;
};

export function IngredientList({ servings, ingredients }: { servings: number; ingredients: Ingredient[] }) {
  const [target, setTarget] = useState(servings);

  return (
    <div>
      <label className="servings">
        Servings
        <button type="button" onClick={() => setTarget((s) => Math.max(1, s - 1))} aria-label="Fewer servings">-</button>
        <strong>{target}</strong>
        <button type="button" onClick={() => setTarget((s) => Math.min(100, s + 1))} aria-label="More servings">+</button>
      </label>
      <ul>
        {ingredients.map((i) => (
          <li key={i.id}>
            {formatQuantity(scaleQuantity(i.quantity, servings, target))} {i.unit ?? ""} {i.name}
            {i.note && <span className="muted"> ({i.note})</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
