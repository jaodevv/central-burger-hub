import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, CheckoutFormValues } from "@/schemas/checkout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { MessageCircle, Tag, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StoreSettings } from "@/types";
import { STORE_CONFIG, PAYMENT_OPTIONS } from "@/config/store";

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
  const [changeNeeded, setChangeNeeded] = useState(false); // Novo estado para troco

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "",
      address: "",
      notes: "",
      paymentMethod: "Dinheiro",
      change: 0,
    },
  });

  const { isSubmitting, isValid } = form.formState;
  const paymentMethod = form.watch("paymentMethod");
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

  const deliveryFee = storeSettings?.deliveryFee ?? STORE_CONFIG.defaultDeliveryFee;
  const storeName = storeSettings?.name ?? STORE_CONFIG.name;
  const storeWhatsapp = storeSettings?.whatsapp ?? STORE_CONFIG.whatsapp;

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

  const generateWhatsAppMessage = (data: CheckoutFormValues) => {
    let message = `🍔 *NOVO PEDIDO - ${storeName}*\n\n`;
message += `👤 *Cliente:* ${data.name}\n`;
		    message += `📍 *Endereço:* ${data.address}\n`;
		    message += `💳 *Pagamento:* ${data.paymentMethod}\n`;
		    if (data.paymentMethod === "Dinheiro" && changeNeeded && data.change) {
		      message += `💵 *Troco para:* ${formatPrice(data.change)}\n`;
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

const handleSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("Seu carrinho está vazio. Adicione itens antes de finalizar.");
      return;
    }

    if (paymentMethod === "Dinheiro" && changeNeeded && (!values.change || values.change <= finalTotal)) {
      form.setError("change", { type: "manual", message: "O valor do troco deve ser maior que o total do pedido." });
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
      customer_name: values.name,
      customer_address: values.address,
      items: orderItems as unknown as import("@/integrations/supabase/types").Json,
      subtotal: total,
	      delivery_fee: deliveryFee,
	      discount: discount,
	      coupon_code: appliedCoupon?.code || null,
	      total: finalTotal,
	    });

    if (error) {
      toast.error(`Erro ao salvar pedido: ${error.message || 'Erro desconhecido'}`);
      return;
    }

    const message = generateWhatsAppMessage(values);
    const whatsappUrl = `https://wa.me/${storeWhatsapp}?text=${message}`;

    window.open(whatsappUrl, "_blank");
    clearCart();
    onClose();
    toast.success("Pedido enviado com sucesso!");
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); form.reset(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">
            Finalizar Pedido
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
{/* Customer Info */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seu Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço de Entrega</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Rua, número, bairro, complemento..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
	
{/* Payment Method */}
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <FormControl>
                      <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        {PAYMENT_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
	
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
                <FormField
                  control={form.control}
                  name="change"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Troco para quanto? (Ex: 50)"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          min={finalTotal + 0.01}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
          <Button type="submit" disabled={!isValid || isSubmitting || items.length === 0} className="w-full gap-2" size="lg">
            <MessageCircle className="w-5 h-5" />
            Enviar Pedido via WhatsApp
                    </form>
        </Form>
	        </div>
	      </DialogContent>>
    </Dialog>
  );
}
