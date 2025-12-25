import { useState } from "react";
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

// IMPORTAÇÃO UNIFICADA DO TICKET
import { ThermalTicket } from "../ThermalTicket";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  storeSettings?: StoreSettings;
}

export default function CheckoutModal({ open, onClose, storeSettings }: CheckoutModalProps) {
  const { items, total, clearCart } = useCart();
  const [changeNeeded, setChangeNeeded] = useState(false);
  const [orderToPrint, setOrderToPrint] = useState<any>(null); // Estado unificado

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
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const deliveryFee = storeSettings?.deliveryFee ?? STORE_CONFIG.defaultDeliveryFee;
  const storeWhatsapp = storeSettings?.whatsapp ?? STORE_CONFIG.whatsapp;
  
  const discount = appliedCoupon 
    ? (appliedCoupon.discount_type === "percentage" ? (total * appliedCoupon.discount) / 100 : appliedCoupon.discount) 
    : 0;

  const finalTotal = total + deliveryFee - discount;

  const handleSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      toast.error("Carrinho vazio!");
      return;
    }

    // 1. SNAPSHOT DOS ITENS (Unificado com detalhes de carne/adicionais)
    const currentItemsSnapshot = items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price + item.additionals.reduce((sum, a) => sum + a.price, 0),
      details: item.additionals.map(a => a.name).join(", ") + (item.meatPoint ? ` (${item.meatPoint})` : "")
    }));

    try {
      // 2. SALVAMENTO COMPLETO NO SUPABASE
      const { data: savedOrder, error } = await supabase.from("orders").insert({
        customer_name: values.name,
        customer_address: values.address,
        items: items as any,
        subtotal: total,
        delivery_fee: deliveryFee,
        discount: discount,
        total: finalTotal,
        payment_method: values.paymentMethod,
        coupon_code: appliedCoupon?.code || null,
        status: 'pending'
      }).select().single();

      if (error) throw error;

      // 3. PREPARAÇÃO DO TICKET COM DADOS DO FORM + SNAPSHOT
      setOrderToPrint({
        ...values,
        id: savedOrder.id,
        items: currentItemsSnapshot,
        subtotal: total,
        delivery_fee: deliveryFee,
        discount: discount,
        total: finalTotal,
        created_at: new Date().toISOString()
      });

      // 4. ENVIO WHATSAPP
      const message = generateWhatsAppMessage(values);
      window.open(`https://wa.me/${storeWhatsapp}?text=${message}`, "_blank");

      // 5. AUTO-PRINT E CLEANUP
      setTimeout(() => {
        window.print();
        clearCart();
        onClose();
        toast.success("Pedido concluído e impresso!");
      }, 500);

    } catch (err: any) {
      toast.error(`Falha no processo: ${err.message}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => { onClose(); form.reset(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* ... Campos de Input (Nome, Endereço, Pagamento) ... */}
            
            <Button type="submit" disabled={!isValid || isSubmitting} className="w-full gap-2" size="lg">
              <MessageCircle className="w-5 h-5" />
              Enviar Pedido e Imprimir
            </Button>
          </form>
        </Form>

        {/* COMPONENTE DE IMPRESSÃO (Renderiza apenas se houver pedido) */}
        {orderToPrint && <ThermalTicket order={orderToPrint} />}
        
      </DialogContent>
    </Dialog>
  );
}
