import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { MessageCircle, Tag, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreSettings } from "@/types";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  storeSettings?: StoreSettings;
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  discount_type: string;
  active: boolean;
}

export default function CheckoutModal({ open, onClose, storeSettings }: CheckoutModalProps) {
  const { items, total, clearCart } = useCart();
	  const [customerName, setCustomerName] = useState("");
	  const [address, setAddress] = useState("");
	  const [paymentMethod, setPaymentMethod] = useState("Dinheiro"); // Novo estado
	  const [changeNeeded, setChangeNeeded] = useState(false); // Novo estado para troco
	  const [changeAmount, setChangeAmount] = useState(""); // Novo estado para valor do troco
	  const [couponCode, setCouponCode] = useState("");
	  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Fetch coupons from database
  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("active", true);
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const deliveryFee = storeSettings?.deliveryFee ?? 8;
  const storeName = storeSettings?.name ?? "Central Burguer";
  const storeWhatsapp = storeSettings?.whatsapp ?? "5511999999999";

  const discount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? (total * appliedCoupon.discount) / 100
      : appliedCoupon.discount
    : 0;

  const finalTotal = total + deliveryFee - discount;

  const handleApplyCoupon = () => {
    const coupon = coupons.find(
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
    let message = `🍔 *NOVO PEDIDO - ${storeName}*\n\n`;
	    message += `👤 *Cliente:* ${customerName}\n`;
	    message += `📍 *Endereço:* ${address}\n`;
	    message += `💳 *Pagamento:* ${paymentMethod}\n`;
	    if (paymentMethod === "Dinheiro" && changeNeeded && changeAmount) {
	      message += `💵 *Troco para:* ${formatPrice(Number(changeAmount))}\n`;
	    }
	    message += `\n`; // Adicionar quebra de linha após o pagamento
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

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Por favor, informe seu nome");
      return;
    }
	    if (!address.trim()) {
	      toast.error("Por favor, informe seu endereço");
	      return;
	    }
	    if (!paymentMethod) {
	      toast.error("Por favor, selecione a forma de pagamento");
	      return;
	    }
	    if (paymentMethod === "Dinheiro" && changeNeeded && (!changeAmount || Number(changeAmount) <= finalTotal)) {
	      toast.error("Por favor, informe um valor válido para o troco (maior que o total)");
	      return;
	    }

    // Save order to database
    const orderItems = items.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      additionals: item.additionals,
      notes: item.notes,
      meat_point: item.meatPoint,
    }));

    const { error } = await supabase.from("orders").insert({
      customer_name: customerName,
      customer_address: address,
      items: orderItems as unknown as import("@/integrations/supabase/types").Json,
      subtotal: total,
	      delivery_fee: deliveryFee,
	      discount: discount,
	      coupon_code: appliedCoupon?.code || null,
	      total: finalTotal,
	    });

    if (error) {
      console.error("Error saving order:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      toast.error(`Erro ao salvar pedido: ${error.message || 'Erro desconhecido'}`);
      return;
    }

    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${storeWhatsapp}?text=${message}`;

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
	
	          {/* Payment Method */}
	          <div className="space-y-2">
	            <Label htmlFor="payment">Forma de Pagamento</Label>
	            <select
	              id="payment"
	              value={paymentMethod}
	              onChange={(e) => setPaymentMethod(e.target.value)}
	              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
	            >
	              <option value="Dinheiro">Dinheiro</option>
	              <option value="Cartão de Crédito/Débito">Cartão de Crédito/Débito</option>
	              <option value="Pix">Pix</option>
	            </select>
	          </div>
	
	          {/* Change Needed */}
	          {paymentMethod === "Dinheiro" && (
	            <div className="space-y-2">
	              <div className="flex items-center space-x-2">
	                <input
	                  type="checkbox"
	                  id="changeNeeded"
	                  checked={changeNeeded}
	                  onChange={(e) => setChangeNeeded(e.target.checked)}
	                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
	                />
	                <Label htmlFor="changeNeeded">Precisa de troco?</Label>
	              </div>
	
	              {changeNeeded && (
	                <Input
	                  type="number"
	                  placeholder="Troco para quanto? (Ex: 50)"
	                  value={changeAmount}
	                  onChange={(e) => setChangeAmount(e.target.value)}
	                  min={finalTotal + 0.01}
	                />
	              )}
	            </div>
	          )}

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
