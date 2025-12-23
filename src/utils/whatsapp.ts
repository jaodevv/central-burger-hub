import { formatPrice } from "./formatters";
import { CartItem } from "@/types";

interface WhatsAppMessageParams {
  storeName: string;
  customerName: string;
  address: string;
  paymentMethod: string;
  changeNeeded: boolean;
  changeAmount: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  finalTotal: number;
}

/**
 * Gera a mensagem formatada para envio via WhatsApp
 */
export function generateWhatsAppMessage(params: WhatsAppMessageParams): string {
  const {
    storeName,
    customerName,
    address,
    paymentMethod,
    changeNeeded,
    changeAmount,
    items,
    subtotal,
    deliveryFee,
    discount,
    couponCode,
    finalTotal,
  } = params;

  let message = `🍔 *NOVO PEDIDO - ${storeName}*\n\n`;
  message += `👤 *Cliente:* ${customerName}\n`;
  message += `📍 *Endereço:* ${address}\n`;
  message += `💳 *Pagamento:* ${paymentMethod}\n`;
  
  if (paymentMethod === "Dinheiro" && changeNeeded && changeAmount) {
    message += `💵 *Troco para:* ${formatPrice(Number(changeAmount))}\n`;
  }
  
  message += `\n📋 *Itens do Pedido:*\n`;

  items.forEach((item, index) => {
    const additionalsTotal = item.additionals.reduce((sum, a) => sum + a.price, 0);
    const itemTotal = (item.product.price + additionalsTotal) * item.quantity;

    message += `\n${index + 1}. *${item.product.name}* x${item.quantity}\n`;
    if (item.meatPoint) message += `   Ponto: ${item.meatPoint}\n`;
    if (item.additionals.length > 0) {
      message += `   Adicionais: ${item.additionals.map((a) => a.name).join(", ")}\n`;
    }
    if (item.notes) message += `   Obs: ${item.notes}\n`;
    message += `   ${formatPrice(itemTotal)}\n`;
  });

  message += `\n━━━━━━━━━━━━━━━\n`;
  message += `Subtotal: ${formatPrice(subtotal)}\n`;
  message += `Taxa de entrega: ${formatPrice(deliveryFee)}\n`;
  
  if (couponCode && discount > 0) {
    message += `Desconto (${couponCode}): -${formatPrice(discount)}\n`;
  }
  
  message += `*TOTAL: ${formatPrice(finalTotal)}*\n`;

  return message;
}

/**
 * Gera a URL do WhatsApp com a mensagem
 */
export function generateWhatsAppUrl(phoneNumber: string, message: string): string {
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}
