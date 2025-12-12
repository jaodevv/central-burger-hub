import { Product, Additional, StoreSettings, Coupon } from "@/types";

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Classic Burger",
    description: "Hambúrguer artesanal 180g, queijo cheddar, alface, tomate e molho especial",
    price: 28.90,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    available: true,
  },
  {
    id: "2",
    name: "Bacon Lovers",
    description: "Hambúrguer artesanal 180g, bacon crocante, cheddar, cebola caramelizada",
    price: 34.90,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400",
    available: true,
  },
  {
    id: "3",
    name: "Smash Duplo",
    description: "Dois hambúrgueres smash 90g, queijo americano, picles e molho da casa",
    price: 32.90,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400",
    available: true,
  },
  {
    id: "4",
    name: "Veggie Burger",
    description: "Hambúrguer de grão de bico, queijo mussarela, rúcula e maionese verde",
    price: 29.90,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400",
    available: true,
  },
  {
    id: "5",
    name: "Batata Frita",
    description: "Porção generosa de batatas fritas crocantes",
    price: 14.90,
    category: "Acompanhamentos",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
    available: true,
  },
  {
    id: "6",
    name: "Onion Rings",
    description: "Anéis de cebola empanados e crocantes",
    price: 16.90,
    category: "Acompanhamentos",
    image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=400",
    available: true,
  },
  {
    id: "7",
    name: "Coca-Cola 350ml",
    description: "Refrigerante gelado",
    price: 6.90,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400",
    available: true,
  },
  {
    id: "8",
    name: "Milkshake",
    description: "Milkshake cremoso (Chocolate, Morango ou Baunilha)",
    price: 18.90,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400",
    available: true,
  },
];

export const mockAdditionals: Additional[] = [
  { id: "1", name: "Bacon extra", price: 5.00 },
  { id: "2", name: "Queijo cheddar", price: 4.00 },
  { id: "3", name: "Ovo", price: 3.00 },
  { id: "4", name: "Cebola caramelizada", price: 3.50 },
  { id: "5", name: "Molho especial", price: 2.00 },
];

export const mockStoreSettings: StoreSettings = {
  name: "Central Burger",
  whatsapp: "5511999999999",
  deliveryFee: 8.00,
  isOpen: true,
  openingHours: "18:00 - 23:00",
};

export const mockCoupons: Coupon[] = [
  { id: "1", code: "PRIMEIRO10", discount: 10, type: "percentage", active: true },
  { id: "2", code: "FRETE", discount: 8, type: "fixed", active: true },
];
