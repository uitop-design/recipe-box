import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const recipes = [
  {
    title: "Shakshuka",
    slug: "shakshuka",
    description: "Eggs poached in a spiced tomato and pepper sauce.",
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 20,
    tags: ["breakfast", "vegetarian"],
    steps: [
      "Saute onion and pepper in olive oil until soft.",
      "Add garlic, cumin and paprika, cook for a minute.",
      "Pour in tomatoes and simmer for 10 minutes.",
      "Make wells, crack in the eggs, cover and cook until set.",
    ],
    ingredients: [
      { name: "eggs", quantity: 4, unit: "pcs" },
      { name: "canned tomatoes", quantity: 400, unit: "g" },
      { name: "red bell pepper", quantity: 1, unit: "pcs" },
      { name: "onion", quantity: 1, unit: "pcs" },
      { name: "garlic", quantity: 2, unit: "cloves" },
      { name: "ground cumin", quantity: 1, unit: "tsp" },
      { name: "olive oil", quantity: 2, unit: "tbsp" },
    ],
  },
  {
    title: "Lentil Soup",
    slug: "lentil-soup",
    description: "Thick red lentil soup with lemon.",
    servings: 4,
    prepMinutes: 15,
    cookMinutes: 30,
    tags: ["soup", "vegan"],
    steps: [
      "Cook onion and carrot until soft.",
      "Add lentils and stock, simmer for 25 minutes.",
      "Blend half of the soup and stir back in.",
      "Season and finish with lemon juice.",
    ],
    ingredients: [
      { name: "red lentils", quantity: 250, unit: "g" },
      { name: "vegetable stock", quantity: 1.2, unit: "l" },
      { name: "carrot", quantity: 1, unit: "pcs" },
      { name: "onion", quantity: 1, unit: "pcs" },
      { name: "lemon", quantity: 0.5, unit: "pcs" },
    ],
  },
  {
    title: "Pancakes",
    slug: "pancakes",
    description: "Fluffy weekend pancakes.",
    servings: 3,
    prepMinutes: 10,
    cookMinutes: 15,
    tags: ["breakfast", "sweet"],
    steps: [
      "Whisk dry ingredients together.",
      "Add milk, egg and melted butter, mix until just combined.",
      "Cook on a hot pan until bubbles form, flip once.",
    ],
    ingredients: [
      { name: "flour", quantity: 200, unit: "g" },
      { name: "milk", quantity: 300, unit: "ml" },
      { name: "egg", quantity: 1, unit: "pcs" },
      { name: "baking powder", quantity: 2, unit: "tsp" },
      { name: "butter", quantity: 30, unit: "g" },
    ],
  },
];

async function main() {
  for (const r of recipes) {
    const { tags, ingredients, ...data } = r;
    await prisma.recipe.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        ...data,
        ingredients: {
          create: ingredients.map((i, position) => ({ ...i, position })),
        },
        tags: {
          create: tags.map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
    });
  }
  console.log(`Seeded ${recipes.length} recipes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
