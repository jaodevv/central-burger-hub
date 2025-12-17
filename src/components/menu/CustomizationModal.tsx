import { useState, useEffect } from "react";
import { Product, Additional } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CustomizationModalProps {
  product: Product | null;
  additionals: Additional[];
  open: boolean;
  onClose: () => void;
}

// Interface para os itens do combo (salvos na descrição)
interface ComboItem {
  product_id: string;
  quantity: number;
}

// Interface para o produto com apenas o ID e o nome
interface SimpleProduct {
  id: string;
  name: string;
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
  const [quantity, setQuantity] = useState(1);

  const isCombo = product?.category === "Combos";

  // --- Lógica de Busca de Produtos do Combo ---
  const getComboItemIds = (description: string): string[] => {
    const comboItemsMarker = "--- COMBO ITEMS ---";
    const parts = description.split(comboItemsMarker);
    if (parts.length < 2) return [];

    const comboItemsJson = parts[1].trim();
    try {
      const comboItems: ComboItem[] = JSON.parse(comboItemsJson);
      return comboItems.map(item => item.product_id);
    } catch (e) {
      return [];
    }
  };

  const comboItemIds = product && isCombo ? getComboItemIds(product.description) : [];
  const { data: comboProducts = [] } = useQuery({
    queryKey: ["comboProducts", comboItemIds],
    queryFn: async () => {
      if (comboItemIds.length === 0) return [];
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .in("id", comboItemIds);
      if (error) throw error;
      return data as SimpleProduct[];
    },
    enabled: isCombo && comboItemIds.length > 0,
  });

  const formatComboDescription = (description: string) => {
    const comboItemsMarker = "--- COMBO ITEMS ---";
    const parts = description.split(comboItemsMarker);
    if (parts.length < 2) return description;

    const comboItemsJson = parts[1].trim();
    try {
      const comboItems: ComboItem[] = JSON.parse(comboItemsJson);
      if (!Array.isArray(comboItems)) return description;

      const formattedItems = comboItems.map((item) => {
        const product = comboProducts.find(p => p.id === item.product_id);
        return `${item.quantity}x ${product ? product.name : 'Produto Desconhecido'}`;
      }).join(", ");

      return `Contém: ${formattedItems}`;

    } catch (e) {
      return description;
    }
  };
  // --- Fim Lógica de Busca de Produtos do Combo ---

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

  const unitPrice =
    (product?.price || 0) +
    selectedAdditionals.reduce((sum, a) => sum + a.price, 0);

  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!product) return;

    const isBurger = product.category === "Burgers";
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedAdditionals, notes, isBurger ? meatPoint : undefined);
    }
    
    toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
    handleClose();
  };

  const handleClose = () => {
    setSelectedAdditionals([]);
    setNotes("");
    setMeatPoint("Ao ponto");
    setQuantity(1);
    onClose();
  };

  if (!product) return null;

  const isBurger = product.category === "Burgers";
  const isDrink = product.category === "Bebidas";

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

          {/* Descrição do Produto/Combo */}
          <p className="text-muted-foreground text-sm">
            {isCombo ? formatComboDescription(product.description) : product.description}
          </p>

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

          {/* Additionals - Not for drinks or combos */}
          {!isDrink && !isCombo && additionals.length > 0 && (
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

          {/* Notes - Not for drinks */}
          {!isDrink && (
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
          )}

          {/* Quantity Selector - For drinks */}
          {isDrink && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Quantidade</h4>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-xl font-bold min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <Button onClick={handleAddToCart} className="w-full" size="lg">
            Adicionar {quantity > 1 ? `${quantity}x` : ""} • {formatPrice(totalPrice)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
