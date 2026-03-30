import { Product } from "@/types/product";

export const products: Product[] = [
  // ==================== CHAIRS ====================

  // Alza – Garden Lounger
  {
    id: "chair-lehatko-alza",
    name: "Tectake Rattan Garden Lounger",
    category: "chairs",
    price: 5490,
    currency: "CZK",
    dimensions: { width: 70, depth: 190, height: 30 },
    description:
      "Adjustable rattan garden lounger with aluminium frame and wheels. 6-position backrest, removable padded mat and pillow. Max load 150 kg.",
    modelSrc: "/models/chair-lehatko-alza.glb",
    thumbnail: "",
    buyUrl:
      "https://www.alza.cz/hobby/ratanove-zahradni-lehatko-s-kolecky-a-hlinikovym-ramem-sede-d7636673.htm",
    store: "Alza",
    variants: [
      { name: "Grey", color: "#808080" },
      { name: "Brown", color: "#5C3A1E" },
    ],
    featured: true,
  },
  // Bonami – Dining Chair
  {
    id: "chair-addi-bonami",
    name: "Actona Addi Dining Chair",
    category: "chairs",
    price: 4869,
    currency: "CZK",
    dimensions: { width: 56, depth: 54, height: 76 },
    description:
      "Bouclé-upholstered dining chair with armrests and oil-treated solid oak legs. FSC-certified wood frame, max load 110 kg. Scandinavian design by Actona.",
    modelSrc: "/models/chair-addi-bonami.glb",
    thumbnail: "",
    buyUrl: "https://www.bonami.cz/p/hneda-jidelni-zidle-addi-actona",
    store: "Bonami",
    variants: [
      { name: "Brown", color: "#8B6F4E" },
      { name: "Beige", color: "#D4C5A0" },
      { name: "Cognac", color: "#A0522D" },
    ],
    featured: true,
  },

  // ==================== TABLES ====================

  // Alza – Round Garden Table
  {
    id: "table-wilder-alza",
    name: "Noela Wilder Round Garden Table",
    category: "tables",
    price: 2999,
    currency: "CZK",
    dimensions: { width: 105, depth: 105, height: 74 },
    description:
      "Round garden table with steel frame and artwood tabletop — a maintenance-free synthetic material with natural wood appearance. Adjustable feet for uneven surfaces. Seats 4.",
    modelSrc: "/models/table-wilder-alza.glb",
    thumbnail: "",
    buyUrl:
      "https://www.alza.cz/hobby/noela-zahradni-stul-kulaty-wilder-105-cm-d13023370.htm",
    store: "Alza",
    variants: [{ name: "Black / Wood", color: "#3D3122" }],
    featured: true,
  },
  // Bonami – Coffee Table
  {
    id: "table-arlon-bonami",
    name: "Actona Arlon Coffee Table",
    category: "tables",
    price: 6273,
    currency: "CZK",
    dimensions: { width: 120, depth: 60, height: 40 },
    description:
      "Modern coffee table with oak wood veneer in a warm natural tone. Clean lines and generous 120×60 cm surface for everyday living room use.",
    modelSrc: "/models/table-arlon-bonami.glb",
    thumbnail: "",
    buyUrl:
      "https://www.bonami.cz/p/konferencni-stolek-v-dekoru-dubu-v-prirodni-barve-60x120-cm-arlon-actona",
    store: "Bonami",
    variants: [{ name: "Natural Oak", color: "#C4A882" }],
    featured: true,
  },

  // ==================== SOFAS ====================

  // XXXLutz – Three-seater Leather Sofa
  {
    id: "sofa-cantus-xxxlutz",
    name: "Cantus Leather Three-Seater Sofa",
    category: "sofas",
    price: 23999,
    currency: "CZK",
    dimensions: { width: 198, depth: 99, height: 95 },
    description:
      "Premium three-seater sofa in genuine leather with light grey upholstery. Solid build with comfortable cushioning and elegant minimalist design by Cantus.",
    modelSrc: "/models/sofa-cantus-xxxlutz.glb",
    thumbnail: "",
    buyUrl:
      "https://www.xxxlutz.cz/p/cantus-trimistna-pohovka-svetle-seda-prava-kuze-002424003301",
    store: "XXXLutz",
    variants: [
      { name: "Light Grey", color: "#B0ADA8" },
      { name: "Brown", color: "#6B4226" },
    ],
    featured: true,
  },
  // Bonami – Corner Sofa
  {
    id: "sofa-tori-bonami",
    name: "Bonami Selection Tori Corner Sofa",
    category: "sofas",
    price: 43199,
    currency: "CZK",
    dimensions: { width: 240, depth: 187, height: 82 },
    description:
      "L-shaped corduroy corner sofa with pull-out sleeping function and built-in storage. Medium-firm PUR foam seat, pet-friendly fabric. Left corner configuration.",
    modelSrc: "/models/sofa-tori-bonami.glb",
    thumbnail: "",
    buyUrl:
      "https://www.bonami.cz/p/svetle-zelena-mansestrova-rozkladaci-rohova-pohovka-levy-roh-tori-bonami-selection",
    store: "Bonami",
    variants: [
      { name: "Light Green", color: "#8BA87A" },
      { name: "Turquoise", color: "#5BA8A0" },
      { name: "Beige", color: "#D4C5A0" },
    ],
    featured: true,
  },

  // ==================== BEDS ====================

  // Bonami – Upholstered Bed
  {
    id: "bed-noira-bonami",
    name: "Bonami Selection Noira Slim 180×200",
    category: "beds",
    price: 7799,
    currency: "CZK",
    dimensions: { width: 188, depth: 210, height: 95 },
    description:
      "Czech-made upholstered bed with slatted base included and adjustable headboard height. OEKO-TEX certified, pet-friendly bouclé fabric. Assembly in 30 minutes.",
    modelSrc: "/models/bed-noira-bonami.glb",
    thumbnail: "",
    buyUrl:
      "https://www.bonami.cz/p/calounena-dvouluzkova-postel-s-rostem-180x200-cm-v-horcicove-barve-noira-slim-bonami-selection",
    store: "Bonami",
    variants: [
      { name: "Mustard", color: "#C8A23D" },
      { name: "Grey", color: "#808080" },
      { name: "Beige", color: "#D4C5A0" },
      { name: "Blue", color: "#4A6A8B" },
    ],
    featured: true,
  },
];

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return products;
  const terms = q.split(/\s+/);
  return products.filter((p) => {
    const searchable = [
      p.name,
      p.category,
      p.description,
      p.store,
      ...p.variants.map((v) => v.name),
      ...p.variants.map((v) => v.color),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
}

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
