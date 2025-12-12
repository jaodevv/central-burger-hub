import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartFooterProps {
  onOpen: () => void;
}

export default function CartFooter({ onOpen }: CartFooterProps) {
  const { itemCount, total } = useCart();

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-lg border-t border-border"
        >
          <div className="max-w-4xl mx-auto">
            <Button onClick={onOpen} className="w-full h-14 text-base gap-3" size="lg">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                </div>
                <span>Ver Carrinho</span>
              </div>
              <span className="ml-auto font-bold">{formatPrice(total)}</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
