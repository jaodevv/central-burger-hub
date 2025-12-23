export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

export interface Additional {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  additionals: Additional[];
  notes: string;
  meatPoint?: string;
}

export interface StoreSettings {
  id?: string;
  name: string;
  whatsapp: string;
  deliveryFee: number;
  isOpen: boolean;
  openingHours: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  active: boolean;
}
