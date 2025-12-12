import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, Plus, Coffee, Tag, Percent, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockProducts, mockAdditionals, mockCoupons, mockStoreSettings } from "@/data/mockData";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Admin() {
  const [storeOpen, setStoreOpen] = useState(mockStoreSettings.isOpen);

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleToggleStore = (open: boolean) => {
    setStoreOpen(open);
    toast.success(open ? "Loja aberta!" : "Loja fechada!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-display text-2xl tracking-wide">
                  PAINEL ADMIN
                </h1>
                <p className="text-xs text-muted-foreground">
                  Gerencie seu cardápio e configurações
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="store-toggle" className="text-sm text-muted-foreground">
                Loja {storeOpen ? "Aberta" : "Fechada"}
              </Label>
              <Switch
                id="store-toggle"
                checked={storeOpen}
                onCheckedChange={handleToggleStore}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
            <TabsTrigger value="products" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="additionals" className="gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Adicionais</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-2">
              <Tag className="w-4 h-4" />
              <span className="hidden sm:inline">Cupons</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="gap-2">
              <Percent className="w-4 h-4" />
              <span className="hidden sm:inline">Promoções</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl tracking-wide">Produtos</h2>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Produto
                </Button>
              </div>

              <div className="grid gap-4">
                {mockProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground">{product.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-primary font-bold">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={product.available} />
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Additionals Tab */}
          <TabsContent value="additionals">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl tracking-wide">Adicionais</h2>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Adicional
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockAdditionals.map((additional) => (
                  <Card key={additional.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{additional.name}</h3>
                        <span className="text-primary font-bold">
                          +{formatPrice(additional.price)}
                        </span>
                      </div>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl tracking-wide">Cupons</h2>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Cupom
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockCoupons.map((coupon) => (
                  <Card key={coupon.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-primary text-lg">
                          {coupon.code}
                        </span>
                        <Switch defaultChecked={coupon.active} />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {coupon.type === "percentage"
                          ? `${coupon.discount}% de desconto`
                          : `${formatPrice(coupon.discount)} de desconto`}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Promotions Tab */}
          <TabsContent value="promotions">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl tracking-wide">Promoções</h2>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nova Promoção
                </Button>
              </div>

              <Card>
                <CardContent className="p-8 text-center">
                  <Percent className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma promoção ativa</p>
                  <p className="text-sm text-muted-foreground/70">
                    Crie promoções para atrair mais clientes
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="font-display text-xl tracking-wide">Configurações</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Informações da Loja</CardTitle>
                  <CardDescription>
                    Configure as informações gerais do seu estabelecimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Nome da Loja</Label>
                    <Input
                      id="store-name"
                      defaultValue={mockStoreSettings.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      defaultValue={mockStoreSettings.whatsapp}
                      placeholder="5511999999999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery-fee">Taxa de Entrega</Label>
                    <Input
                      id="delivery-fee"
                      type="number"
                      defaultValue={mockStoreSettings.deliveryFee}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Horário de Funcionamento</Label>
                    <Input
                      id="hours"
                      defaultValue={mockStoreSettings.openingHours}
                    />
                  </div>
                  <Button className="w-full">Salvar Alterações</Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
