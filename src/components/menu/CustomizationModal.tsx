import { useState } from "react";
import { Product, Additional } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface CustomizationModalProps {
  product: Product | null;
  additionals: Additional[];
  open: boolean;
  onClose: () => void;
}

const meatPoints = ["Mal passado", "Ao ponto", "Bem passado"];

export default function CustomizationModal({
  product,
  additionals,
  open,
  onClose,
}: CustomizationModalProps) {
  const { addItem } = useCart();
  const [selectedAdditionals, setSelectedAdditionals] = useState<Additional[]>([]);
  const [notes, setNotes] = useState("");
  const [meatPoint, setMeatPoint] = useState("Ao ponto");

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleAdditionalToggle = (additional: Additional) => {
    setSelectedAdditionals((prev) =>
      prev.find((a) => a.id === additional.id)
        ? prev.filter((a) => a.id !== additional.id)
        : [...prev, additional]
    );
  };

  const totalPrice =
    (product?.price || 0) +
    selectedAdditionals.reduce((sum, a) => sum + a.price, 0);

  const handleAddToCart = () => {
    if (!product) return;

    const isBurger = product.category === "Burgers";
    addItem(product, selectedAdditionals, notes, isBurger ? meatPoint : undefined);
    
    toast.success(`${product.name} adicionado ao carrinho!`);
    handleClose();
  };

  const handleClose = () => {
    setSelectedAdditionals([]);
    setNotes("");
    setMeatPoint("Ao ponto");
    onClose();
  };

  if (!product) return null;

  const isBurger = product.category === "Burgers";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          <div className="relative h-48 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-muted-foreground text-sm">{product.description}</p>

          {/* Meat Point - Only for burgers */}
          {isBurger && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Ponto da Carne</h4>
              <RadioGroup value={meatPoint} onValueChange={setMeatPoint}>
                {meatPoints.map((point) => (
                  <div key={point} className="flex items-center space-x-3">
                    <RadioGroupItem value={point} id={point} />
                    <Label htmlFor={point} className="text-sm cursor-pointer">
                      {point}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Additionals */}
          {additionals.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Adicionais</h4>
              <div className="space-y-2">
                {additionals.map((additional) => (
                  <div
                    key={additional.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={additional.id}
                        checked={selectedAdditionals.some((a) => a.id === additional.id)}
                        onCheckedChange={() => handleAdditionalToggle(additional)}
                      />
                      <Label htmlFor={additional.id} className="text-sm cursor-pointer">
                        {additional.name}
                      </Label>
                    </div>
                    <span className="text-primary text-sm font-medium">
                      +{formatPrice(additional.price)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Sem cebola, sem picles..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Add to Cart Button */}
          <Button onClick={handleAddToCart} className="w-full" size="lg">
            Adicionar • {formatPrice(totalPrice)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
