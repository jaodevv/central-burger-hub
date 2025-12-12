import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="font-display text-8xl gradient-text mb-4">404</h1>
        <h2 className="font-display text-3xl tracking-wide text-foreground mb-2">
          PÁGINA NÃO ENCONTRADA
        </h2>
        <p className="text-muted-foreground mb-8">
          Ops! Parece que você se perdeu. A página que você procura não existe ou foi movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button variant="hero" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Voltar ao Início
            </Button>
          </Link>
          <Link to="/menu">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              Ver Cardápio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
