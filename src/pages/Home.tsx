import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShoppingBag, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBurger from "@/assets/hero-burger.jpg";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroBurger}
            alt="Delicious burger"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-6xl md:text-8xl tracking-wider mb-4">
              <span className="gradient-text">CENTRAL</span>{" "}
              <span className="text-foreground">BURGUER</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-12 max-w-xl mx-auto">
              Os melhores hambúrgueres artesanais da cidade, feitos com ingredientes
              selecionados e muito amor.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/menu">
              <Button variant="hero" size="xl" className="gap-3 min-w-[200px]">
                <ShoppingBag className="w-5 h-5" />
                FAZER PEDIDO
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" size="xl" className="gap-3 min-w-[200px]">
                <Settings className="w-5 h-5" />
                PAINEL ADMIN
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground text-sm border-t border-border/50">
        <p>© 2024 Central Burguer. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
