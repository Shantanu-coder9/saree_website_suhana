export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  color: string;
  fabric: string;
  occasion: string;
  rating: number;
  reviews: number;
  images: string[];
  description: string;
  inStock: boolean;
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface TryOnResult {
  id: string;
  productImage: string;
  userPhoto: string;
  composite: string;
  productName: string;
  createdAt: number;
}
