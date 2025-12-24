export interface Product {
  id: string;
  name: string;
  description: string | null; // Ajustado para aceitar null
  price: number;
  category: string;
  image: string | null; // Ajustado para aceitar null
  available: boolean;
}

export interface Additional {
  id: string;
  name: string;
  price: number;
  available?: boolean; // Adicionado para cobrir o Admin.tsx
}

export interface CartItem {
  product: Product;
  quantity: number;
  additionals: Additional[];
  notes: string;
  meatPoint?: string;
}

export interface StoreSettings {
  id: string; // Removido '?' para refletir o uso no Admin.tsx
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
  type: "percentage" | "fixed" | string; // Ajustado para string para cobrir o Admin.tsx
  active: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  applicable_categories: string[] | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}
