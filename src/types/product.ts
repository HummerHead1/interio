export interface ProductVariant {
  name: string;
  color: string;
  modelSrc?: string;
}

export interface Product {
  id: string;
  name: string;
  category: "beds" | "sofas" | "tables" | "chairs" | "storage" | "decor";
  price: number;
  currency: "EUR" | "CZK";
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  description: string;
  modelSrc: string;
  iosSrc?: string;
  thumbnail: string;
  buyUrl: string;
  store: string;
  variants: ProductVariant[];
  featured?: boolean;
}
