import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { mockStoreSettings, mockCoupons } from "@/data/mockData";
import { toast } from "sonner";
import { MessageCircle, Tag, Check } from "lucide-react";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, total, clearCart } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<typeof mockCoupons[0] | null>(null);

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const deliveryFee = mockStoreSettings.deliveryFee;

  const discount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? (total * appliedCoupon.discount) / 100
      : appliedCoupon.discount
    : 0;

  const finalTotal = total + deliveryFee - discount;

  const handleApplyCoupon = () => {
    const coupon = mockCoupons.find(
      (c) => c.code.toLowerCase() === couponCode.toLowerCase() && c.active
    );

    if (coupon) {
      setAppliedCoupon(coupon);
      toast.success(`Cupom "${coupon.code}" aplicado!`);
    } else {
      toast.error("Cupom inválido ou expirado");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const generateWhatsAppMessage = () => {
    let message = `🍔 *NOVO PEDIDO - ${mockStoreSettings.name}*\n\n`;
    message += `👤 *Cliente:* ${customerName}\n`;
    message += `📍 *Endereço:* ${address}\n\n`;
    message += `📋 *Itens do Pedido:*\n`;

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
    message += `Subtotal: ${formatPrice(total)}\n`;
    message += `Taxa de entrega: ${formatPrice(deliveryFee)}\n`;
    if (appliedCoupon) {
      message += `Desconto (${appliedCoupon.code}): -${formatPrice(discount)}\n`;
    }
    message += `*TOTAL: ${formatPrice(finalTotal)}*\n`;

    return encodeURIComponent(message);
  };

  const handleSubmit = () => {
    if (!customerName.trim()) {
      toast.error("Por favor, informe seu nome");
      return;
    }
    if (!address.trim()) {
      toast.error("Por favor, informe seu endereço");
      return;
    }

    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${mockStoreSettings.whatsapp}?text=${message}`;

    window.open(whatsappUrl, "_blank");
    clearCart();
    onClose();
    toast.success("Pedido enviado com sucesso!");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">
            Finalizar Pedido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Seu Nome</Label>
              <Input
                id="name"
                placeholder="Digite seu nome"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço de Entrega</Label>
              <Textarea
                id="address"
                placeholder="Rua, número, bairro, complemento..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Coupon */}
          <div className="space-y-2">
            <Label>Cupom de Desconto</Label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="font-medium text-primary">{appliedCoupon.code}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCoupon}
                  className="text-destructive hover:text-destructive"
                >
                  Remover
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o código"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button variant="outline" onClick={handleApplyCoupon}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-2 p-4 rounded-lg bg-secondary/30">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de entrega</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-primary">
                <span>Desconto ({appliedCoupon.code})</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span className="text-primary">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <Button onClick={handleSubmit} className="w-full gap-2" size="lg">
            <MessageCircle className="w-5 h-5" />
            Enviar Pedido via WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
