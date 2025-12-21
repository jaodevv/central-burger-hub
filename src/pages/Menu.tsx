import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product, Additional as AdditionalType } from "@/types";
import { ComboItem, SimpleProduct } from "@/components/menu/CustomizationModal";
import CategoryTabs from "@/components/menu/CategoryTabs";
import ProductCard from "@/components/menu/ProductCard";
import CartFooter from "@/components/menu/CartFooter";
import CartDrawer from "@/components/menu/CartDrawer";
import CustomizationModal from "@/components/menu/CustomizationModal";
import CheckoutModal from "@/components/menu/CheckoutModal";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("Lanches");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Fetch products from database
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("available", true)
        .order("category");
      if (error) {
        console.error("Erro ao buscar produtos:", error);
        toast.error("Erro ao carregar o cardápio. Tente novamente.");
        throw error;
      }
      return data.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || "",
        price: Number(p.price),
        category: p.category,
        image: p.image_url || "/placeholder.svg",
        available: p.available,
      })) as Product[];
    },
  });

  // Fetch additionals from database
  const { data: additionals = [] } = useQuery({
    queryKey: ["additionals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("additionals")
        .select("*")
        .eq("available", true);
      if (error) throw error;
      return data.map((a) => ({
        id: a.id,
        name: a.name,
        price: Number(a.price),
      })) as AdditionalType[];
    },
  });

  // Fetch active promotions
  const { data: promotions = [] } = useQuery({
    queryKey: ["promotions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("active", true);
      if (error) {
        console.error("Erro ao buscar promoções:", error);
        throw error;
      }
      return data;
    },
  });

  // Fetch store settings
  const { data: storeSettings } = useQuery({
    queryKey: ["storeSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  // Mapeamento de categorias do banco para exibição
  const categoryMapping: Record<string, string> = {
    "Burgers": "Lanches",
    "Bebidas": "Bebidas",
    "Porções": "Porções",
    "Combos": "Combos",
    "Acompanhamentos": "Porções", // Mapeia Acompanhamentos para Porções
  };

  // Ordem fixa das categorias: Lanches → Bebidas → Porções → Combos
  const categoryOrder = ["Lanches", "Bebidas", "Porções", "Combos"];

  const categories = useMemo(() => {
    return categoryOrder;
  }, []);

	  // --- Lógica de Formatação de Combo ---
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
	
	  const allComboItemIds = useMemo(() => {
	    return products
	      .filter(p => p.category === "Combos")
	      .flatMap(p => getComboItemIds(p.description));
	  }, [products]);
	
	  const { data: comboProductsNames = [] } = useQuery({
	    queryKey: ["comboProductsNames", allComboItemIds],
	    queryFn: async () => {
	      if (allComboItemIds.length === 0) return [];
	      const { data, error } = await supabase
	        .from("products")
	        .select("id, name")
	        .in("id", allComboItemIds);
	      if (error) throw error;
	      return data as SimpleProduct[];
	    },
	    enabled: allComboItemIds.length > 0,
	  });
	
	  const formatComboDescription = (product: Product): string => {
	    if (product.category !== "Combos") return product.description;
	
	    const comboItemsMarker = "--- COMBO ITEMS ---";
	    const parts = product.description.split(comboItemsMarker);
	    if (parts.length < 2) return product.description;
	
	    const comboItemsJson = parts[1].trim();
	    try {
	      const comboItems: ComboItem[] = JSON.parse(comboItemsJson);
	      if (!Array.isArray(comboItems)) return product.description;
	
	      const formattedItems = comboItems.map((item) => {
	        const comboProduct = comboProductsNames.find(p => p.id === item.product_id);
	        return `${item.quantity}x ${comboProduct ? comboProduct.name : 'Produto Desconhecido'}`;
	      }).join(", ");
	
	      return `Contém: ${formattedItems}`;
	
	    } catch (e) {
	      return product.description;
	    }
	  };
	  // --- Fim Lógica de Formatação de Combo ---
	
  const filteredProducts = useMemo(() => {
    // Filtra produtos baseado no mapeamento de categorias
    return products.filter((p) => {
      const mappedCategory = categoryMapping[p.category] || p.category;
      return mappedCategory === activeCategory;
    });
  }, [activeCategory, products]);

  const handleShare = async () => {
    const shareData = {
      title: storeSettings?.name || "Central Burguer",
      text: `Confira o cardápio do ${storeSettings?.name || "Central Burguer"}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para a área de transferência!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="text-center">
              <h1 className="font-display text-2xl tracking-wide">
                <span className="gradient-text">{storeSettings?.name || "Central Burguer"}</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {storeSettings?.is_open ? (
                  <span className="text-primary">● Aberto</span>
                ) : (
                  <span className="text-destructive">● Fechado</span>
                )}{" "}
                • {storeSettings?.opening_hours || "18:00 - 23:00"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>



	      {/* Categories */}
	      <div className="sticky top-[73px] z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      </div>

      {/* Products Grid */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
	              <ProductCard
	                product={{
	                  ...product,
	                  description: formatComboDescription(product),
	                }}
	                onSelect={setSelectedProduct}
	              />
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Modals & Drawers */}
      <CustomizationModal
        product={selectedProduct}
        additionals={additionals}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
      />

      <CheckoutModal 
        open={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)}
        storeSettings={storeSettings ? {
          name: storeSettings.name,
          whatsapp: storeSettings.whatsapp,
          deliveryFee: Number(storeSettings.delivery_fee),
          isOpen: storeSettings.is_open,
          openingHours: storeSettings.opening_hours,
        } : undefined}
      />

      {/* Cart Footer */}
      <CartFooter onOpen={() => setCartOpen(true)} />
    </div>
  );
}
