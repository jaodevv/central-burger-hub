import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

export default function CartDrawer({ open, onOpenChange, onCheckout }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, total } = useCart();

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl tracking-wide flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            Seu Carrinho
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">Seu carrinho está vazio</p>
              <p className="text-sm text-muted-foreground/70">
                Adicione itens do cardápio
              </p>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {items.map((item, index) => {
                  const additionalsTotal = item.additionals.reduce(
                    (sum, a) => sum + a.price,
                    0
                  );
                  const itemTotal =
                    (item.product.price + additionalsTotal) * item.quantity;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-secondary/30 rounded-lg p-4"
                    >
                      <div className="flex gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-foreground truncate">
                            {item.product.name}
                          </h4>
                          {item.meatPoint && (
                            <p className="text-xs text-muted-foreground">
                              {item.meatPoint}
                            </p>
                          )}
                          {item.additionals.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              + {item.additionals.map((a) => a.name).join(", ")}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-muted-foreground italic">
                              "{item.notes}"
                            </p>
                          )}
                          <p className="text-primary font-medium mt-1">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border pt-4 space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-bold text-foreground">{formatPrice(total)}</span>
            </div>
            <Button onClick={onCheckout} className="w-full" size="lg">
              Finalizar Pedido
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
