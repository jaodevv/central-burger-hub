/**
 * Configurações centralizadas da loja
 * 
 * Este arquivo contém todas as configurações padrão da loja.
 * Os valores podem ser sobrescritos pelas configurações do banco de dados (store_settings).
 */

export const STORE_CONFIG = {
  /** Nome da loja */
  name: "Central Burguer",
  
  /** Número do WhatsApp para receber pedidos (formato internacional sem +) */
  whatsapp: "5538998094834",
  
  /** Taxa de entrega padrão em reais */
  defaultDeliveryFee: 4.00,
  
  /** Valor mínimo para pedido em reais */
  minimumOrderValue: 0,
  
  /** Tempo estimado de entrega em minutos */
  estimatedDeliveryTime: 45,
  
  /** Horário de funcionamento */
  businessHours: {
    open: "18:00",
    close: "23:00",
  },
  
  /** Configurações de moeda */
  currency: {
    locale: "pt-BR",
    code: "BRL",
  },
} as const;

/**
 * Opções de pagamento disponíveis
 */
export const PAYMENT_OPTIONS = [
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Cartão de Crédito/Débito", label: "Cartão de Crédito/Débito" },
  { value: "Pix", label: "Pix" },
] as const;

/**
 * Opções de ponto da carne
 */
export const MEAT_POINT_OPTIONS = [
  { value: "Mal passado", label: "Mal passado" },
  { value: "Ao ponto", label: "Ao ponto" },
  { value: "Bem passado", label: "Bem passado" },
] as const;

/**
 * Categorias de produtos com ordem de exibição
 */
export const PRODUCT_CATEGORIES = [
  { key: "Lanches", label: "Lanches", order: 1 },
  { key: "Bebidas", label: "Bebidas", order: 2 },
  { key: "Porções", label: "Porções", order: 3 },
  { key: "Combos", label: "Combos", order: 4 },
] as const;

/**
 * Mapeamento de categorias do banco para exibição
 */
export const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  "Burgers": "Lanches",
  "Acompanhamentos": "Porções",
};

/**
 * Ordem de exibição das categorias
 */
export const CATEGORY_ORDER = ["Lanches", "Bebidas", "Porções", "Combos"];

/**
 * Limite de adicionais por categoria
 */
export const ADDITIONALS_LIMIT: Record<string, number> = {
  "Porções": 2,
  "Acompanhamentos": 2,
  default: 10,
};

export type PaymentOption = typeof PAYMENT_OPTIONS[number]["value"];
export type MeatPoint = typeof MEAT_POINT_OPTIONS[number]["value"];
export type ProductCategory = typeof PRODUCT_CATEGORIES[number]["key"];
