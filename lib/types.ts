export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type ProductImage = {
  id: string;
  url: string;
  position: number;
  is_cover: boolean;
};

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string | null;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
  categories?: Category | null;
};

export type CartItem = {
  variantId: string;
  productId: string;
  productName: string;
  variantInfo: string;
  price: number;
  image: string | null;
  quantity: number;
  maxStock: number;
};
