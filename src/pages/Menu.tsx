import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockProducts, mockAdditionals, mockStoreSettings } from "@/data/mockData";
import { Product } from "@/types";
import CategoryTabs from "@/components/menu/CategoryTabs";
import ProductCard from "@/components/menu/ProductCard";
import CartFooter from "@/components/menu/CartFooter";
import CartDrawer from "@/components/menu/CartDrawer";
import CustomizationModal from "@/components/menu/CustomizationModal";
import CheckoutModal from "@/components/menu/CheckoutModal";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(mockProducts.map((p) => p.category))];
    return ["Todos", ...cats];
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return mockProducts;
    return mockProducts.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const handleShare = async () => {
    const shareData = {
      title: mockStoreSettings.name,
      text: `Confira o cardápio do ${mockStoreSettings.name}!`,
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
                <span className="gradient-text">{mockStoreSettings.name}</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {mockStoreSettings.isOpen ? (
                  <span className="text-primary">● Aberto</span>
                ) : (
                  <span className="text-destructive">● Fechado</span>
                )}{" "}
                • {mockStoreSettings.openingHours}
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
                product={product}
                onSelect={setSelectedProduct}
              />
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Modals & Drawers */}
      <CustomizationModal
        product={selectedProduct}
        additionals={mockAdditionals}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
      />

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      {/* Cart Footer */}
      <CartFooter onOpen={() => setCartOpen(true)} />
    </div>
  );
}
