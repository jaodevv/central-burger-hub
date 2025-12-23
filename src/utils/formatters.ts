import { STORE_CONFIG } from "@/config/store";

/**
 * Formata um valor numérico como moeda brasileira (BRL)
 */
export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null) {
    return "R$ 0,00";
  }
  return price.toLocaleString(STORE_CONFIG.currency.locale, {
    style: "currency",
    currency: STORE_CONFIG.currency.code,
  });
}

/**
 * Formata uma data para exibição
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(STORE_CONFIG.currency.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Formata uma data e hora para exibição
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(STORE_CONFIG.currency.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
