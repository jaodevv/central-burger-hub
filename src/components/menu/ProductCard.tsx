import { Product } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="product"
        className="overflow-hidden group cursor-pointer"
        onClick={() => onSelect(product)}
      >
        <div className="relative h-48 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          {!product.available && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <span className="text-muted-foreground font-medium">Indisponível</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-display text-xl tracking-wide text-foreground mb-1">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3 min-h-[40px]">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-primary font-bold text-lg">
              {formatPrice(product.price)}
            </span>
            <Button
              size="icon"
              disabled={!product.available}
              className="rounded-full"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
