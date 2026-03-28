import { Product } from "@/types/product";

export const products: Product[] = [
  {
    id: "chair-stefan-ikea",
    name: "STEFAN Dining Chair",
    category: "chairs",
    price: 1490,
    currency: "CZK",
    dimensions: { width: 42, depth: 49, height: 90 },
    description:
      "Solid wood dining chair with a timeless design. The sturdy frame of solid pine will last for years. Stackable to save space when not in use.",
    modelSrc:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/main/2.0/SheenChair/glTF-Binary/SheenChair.glb",
    thumbnail: "",
    buyUrl: "https://www.ikea.com/cz/cs/p/stefan-zidle-cernohneda-00211088/",
    store: "IKEA",
    variants: [
      { name: "Black-Brown", color: "#2C2420" },
      { name: "Natural Pine", color: "#C4A882" },
      { name: "White", color: "#F5F5F5" },
    ],
    featured: true,
  },
  {
    id: "chair-cazar-bonami",
    name: "Actona Cazar Accent Chair",
    category: "chairs",
    price: 8490,
    currency: "CZK",
    dimensions: { width: 72, depth: 68, height: 80 },
    description:
      "Elegant accent chair with faux leather upholstery and a sleek modern silhouette. The perfect statement piece for your living room or reading corner.",
    modelSrc:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/ChairDamaskPurplegold/glTF-Binary/ChairDamaskPurplegold.glb",
    thumbnail: "",
    buyUrl: "https://www.bonami.cz/p/cerne-kreslo-actona-cazar",
    store: "Bonami",
    variants: [
      { name: "Black", color: "#1A1A1A" },
      { name: "Cognac", color: "#8B4513" },
      { name: "Grey", color: "#6B6B6B" },
    ],
    featured: true,
  },
  {
    id: "chair-alzaergo-wave",
    name: "AlzaErgo Chair Wave 1",
    category: "chairs",
    price: 4990,
    currency: "CZK",
    dimensions: { width: 65, depth: 65, height: 115 },
    description:
      "Ergonomic mesh office chair with adjustable lumbar support, breathable back, and smooth-rolling castors. Built for all-day comfort.",
    modelSrc:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenChair/glTF-Binary/SheenChair.glb",
    thumbnail: "",
    buyUrl: "https://www.alza.cz/alzaergo-chair-wave-1-cerna-d9785218.htm",
    store: "Alza",
    variants: [
      { name: "Black", color: "#1A1A1A" },
      { name: "Grey", color: "#9E9E9E" },
    ],
    featured: true,
  },
  {
    id: "sofa-glamvelvet",
    name: "Velvet Lounge Sofa",
    category: "sofas",
    price: 24990,
    currency: "CZK",
    dimensions: { width: 220, depth: 90, height: 82 },
    description:
      "Luxurious velvet sofa with deep cushions and brass-finished legs. A showpiece for any modern living room.",
    modelSrc:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb",
    thumbnail: "",
    buyUrl: "https://www.bonami.cz/",
    store: "Bonami",
    variants: [
      { name: "Emerald", color: "#2E8B57" },
      { name: "Blush", color: "#DE9E9E" },
      { name: "Navy", color: "#1B2A4A" },
    ],
    featured: true,
  },
  {
    id: "lamp-stainedglass",
    name: "Tiffany Table Lamp",
    category: "decor",
    price: 3490,
    currency: "CZK",
    dimensions: { width: 30, depth: 30, height: 45 },
    description:
      "Hand-crafted stained glass table lamp inspired by Art Nouveau design. Casts warm, colourful light for a cozy atmosphere.",
    modelSrc:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/StainedGlassLamp/glTF-Binary/StainedGlassLamp.glb",
    thumbnail: "",
    buyUrl: "https://www.alza.cz/",
    store: "Alza",
    variants: [
      { name: "Classic", color: "#D4A574" },
      { name: "Blue", color: "#4682B4" },
    ],
    featured: false,
  },
  // --- BEDS ---
  {
    id: "bed-hemnes-ikea",
    name: "HEMNES Day-Bed Frame",
    category: "beds",
    price: 7999,
    currency: "CZK",
    dimensions: { width: 207, depth: 86, height: 91 },
    description:
      "Versatile day-bed with 3 drawers. Use it as a single bed, a sofa or extend it to a king-size bed. Solid pine frame built to last.",
    modelSrc: "/models/bed-single.glb",
    thumbnail: "",
    buyUrl: "https://www.ikea.com/cz/cs/p/hemnes-ram-rozkladaci-postele-3-zasuvky-bila-90349326/",
    store: "IKEA",
    variants: [
      { name: "White", color: "#F5F5F5" },
      { name: "Grey", color: "#808080" },
      { name: "Black-Brown", color: "#2C2420" },
    ],
    featured: true,
  },
  {
    id: "bed-senza-bonami",
    name: "Karup Design Senza Bed",
    category: "beds",
    price: 12990,
    currency: "CZK",
    dimensions: { width: 200, depth: 160, height: 40 },
    description:
      "Minimalist Japanese-inspired platform bed in natural pine. Clean lines and a floating aesthetic. Fits a 160×200 cm mattress.",
    modelSrc: "/models/bed-double.glb",
    thumbnail: "",
    buyUrl: "https://www.bonami.cz/p/dvouluzkova-postel-karup-design-senza-bed-natural-160-x-200-cm",
    store: "Bonami",
    variants: [
      { name: "Natural", color: "#C4A882" },
      { name: "Black", color: "#1A1A1A" },
    ],
    featured: false,
  },
  {
    id: "bed-bunk-ikea",
    name: "SMÅSTAD Bunk Bed with Desk",
    category: "beds",
    price: 15999,
    currency: "CZK",
    dimensions: { width: 207, depth: 107, height: 182 },
    description:
      "Space-saving bunk bed with integrated desk and 4 drawers. Perfect for kids' rooms and small spaces.",
    modelSrc: "/models/bed-king.glb",
    thumbnail: "",
    buyUrl: "https://www.ikea.com/cz/cs/p/smastad-detska-patrova-postel-bila-bila-s-psacim-stolem-se-4-zasuvkami-s99428866/",
    store: "IKEA",
    variants: [
      { name: "White", color: "#F5F5F5" },
      { name: "Birch", color: "#D4C5A0" },
    ],
    featured: false,
  },
  // --- TABLES ---
  {
    id: "table-micke-ikea",
    name: "MICKE Desk",
    category: "tables",
    price: 3499,
    currency: "CZK",
    dimensions: { width: 105, depth: 50, height: 75 },
    description:
      "Compact desk with built-in cable management and a clean look. Perfect for home office or study.",
    modelSrc: "/models/dining-table.glb",
    thumbnail: "",
    buyUrl: "https://www.ikea.com/cz/cs/p/micke-psaci-stul-bila-80213074/",
    store: "IKEA",
    variants: [
      { name: "White", color: "#F5F5F5" },
      { name: "Black-Brown", color: "#2C2420" },
      { name: "Oak", color: "#C4A882" },
    ],
    featured: true,
  },
  {
    id: "table-ufo-bonami",
    name: "UFO Coffee Table",
    category: "tables",
    price: 4290,
    currency: "CZK",
    dimensions: { width: 70, depth: 70, height: 35 },
    description:
      "Round coffee table with a playful Scandinavian design. The smooth tabletop and angled legs add a modern touch to any living room.",
    modelSrc: "/models/round-table.glb",
    thumbnail: "",
    buyUrl: "https://www.bonami.cz/p/konferencni-stolek-ufo-70-cm-bily",
    store: "Bonami",
    variants: [
      { name: "White", color: "#F5F5F5" },
      { name: "Mint", color: "#98D4BB" },
      { name: "Grey", color: "#808080" },
    ],
    featured: false,
  },
  {
    id: "table-desk-alza",
    name: "Office Desk 120×60",
    category: "tables",
    price: 2490,
    currency: "CZK",
    dimensions: { width: 120, depth: 60, height: 75 },
    description:
      "Simple and sturdy office desk with a large work surface. White finish fits any interior. Easy assembly.",
    modelSrc: "/models/coffee-table.glb",
    thumbnail: "",
    buyUrl: "https://www.alza.cz/psaci-stul-120-x-60-x-75-cm-bily-d6614962.htm",
    store: "Alza",
    variants: [
      { name: "White", color: "#F5F5F5" },
      { name: "Oak", color: "#C4A882" },
    ],
    featured: false,
  },
  // --- SOFAS ---
  {
    id: "sofa-leather-wood",
    name: "Wood & Leather Sofa",
    category: "sofas",
    price: 32990,
    currency: "CZK",
    dimensions: { width: 200, depth: 85, height: 78 },
    description:
      "Sophisticated sofa combining premium leather upholstery with exposed wood frame. Scandinavian-inspired design meets enduring comfort.",
    modelSrc:
      "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/SheenWoodLeatherSofa/glTF-Binary/SheenWoodLeatherSofa.glb",
    thumbnail: "",
    buyUrl: "https://www.ikea.com/cz/cs/",
    store: "IKEA",
    variants: [
      { name: "Tan", color: "#C4956A" },
      { name: "Dark Brown", color: "#3E2723" },
    ],
    featured: false,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products;
  return products.filter((p) => p.category === category);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}
