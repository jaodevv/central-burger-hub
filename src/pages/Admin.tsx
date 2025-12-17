import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Package, Plus, Coffee, Tag, Percent, Settings, LogOut, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ProductCreateForm } from "@/components/admin/ProductCreateForm";
import { AdditionalCreateForm } from "@/components/admin/AdditionalCreateForm";
import { CouponCreateForm } from "@/components/admin/CouponCreateForm";

import { AdditionalEditForm } from "@/components/admin/AdditionalEditForm";
import { ProductEditForm } from "@/components/admin/ProductEditForm";
import { ComboCreateForm } from "@/components/admin/ComboCreateForm";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  available: boolean;
}

interface Additional {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

interface Coupon {
  id: string;
  code: string;
  discount: number;
  discount_type: string;
  active: boolean;
}

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  applicable_categories: string[] | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
}

interface StoreSettings {
  id: string;
  name: string;
  whatsapp: string;
  delivery_fee: number;
  is_open: boolean;
  opening_hours: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Fetch products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingAdditional, setEditingAdditional] = useState<Additional | null>(null);
  const [isProductCreateOpen, setIsProductCreateOpen] = useState(false);
  const [isComboCreateOpen, setIsComboCreateOpen] = useState(false);
  const [isAdditionalCreateOpen, setIsAdditionalCreateOpen] = useState(false);
  const [isCouponCreateOpen, setIsCouponCreateOpen] = useState(false);


  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("category", { ascending: true });
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!user,
  });

  // Fetch additionals
  const { data: additionals = [] } = useQuery({
    queryKey: ["additionals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("additionals").select("*");
      if (error) throw error;
      return data as Additional[];
    },
    enabled: !!user,
  });

  // Fetch coupons (admin only)
  const { data: coupons = [] } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*");
      if (error) throw error;
      return data as Coupon[];
    },
    enabled: !!user && isAdmin,
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
      return data as StoreSettings | null;
    },
    enabled: !!user,
  });

	  // Delete product mutation
	  const deleteProductMutation = useMutation({
	    mutationFn: async (id: string) => {
	      const { error } = await supabase.from("products").delete().eq("id", id);
	      if (error) throw error;
	    },
	    onSuccess: () => {
	      queryClient.invalidateQueries({ queryKey: ["products"] });
	      toast.success("Produto excluído com sucesso!");
	    },
	    onError: (error) => {
	      toast.error("Erro ao excluir produto. Você precisa ser admin.");
	      console.error(error);
	    },
	  });
	
	  // Delete additional mutation
	  const deleteAdditionalMutation = useMutation({
	    mutationFn: async (id: string) => {
	      const { error } = await supabase.from("additionals").delete().eq("id", id);
	      if (error) throw error;
	    },
	    onSuccess: () => {
	      queryClient.invalidateQueries({ queryKey: ["additionals"] });
	      toast.success("Adicional excluído com sucesso!");
	    },
	    onError: (error) => {
	      toast.error("Erro ao excluir adicional. Você precisa ser admin.");
	      console.error(error);
	    },
	  });
	
	  // Update product availability
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, available }: { id: string; available: boolean }) => {
      const { error } = await supabase
        .from("products")
        .update({ available })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar produto. Você precisa ser admin.");
      console.error(error);
    },
  });

  // Update coupon availability
  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("coupons")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Cupom atualizado!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar cupom. Você precisa ser admin.");
      console.error(error);
    },
  });



  // Update store settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<StoreSettings>) => {
      if (!storeSettings?.id) return;
      const { error } = await supabase
        .from("store_settings")
        .update(settings)
        .eq("id", storeSettings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storeSettings"] });
      toast.success("Configurações atualizadas!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar. Você precisa ser admin.");
      console.error(error);
    },
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleToggleStore = (open: boolean) => {
    updateSettingsMutation.mutate({ is_open: open });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
                  {isAdmin ? "Acesso completo" : "Visualização apenas"} • {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="store-toggle" className="text-sm text-muted-foreground hidden sm:block">
                Loja {storeSettings?.is_open ? "Aberta" : "Fechada"}
              </Label>
              <Switch
                id="store-toggle"
                checked={storeSettings?.is_open ?? false}
                onCheckedChange={handleToggleStore}
                disabled={!isAdmin}
              />
              <Button variant="outline" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Notice */}
      {!isAdmin && (
        <div className="bg-primary/10 border-b border-primary/20 py-3 px-4 text-center">
          <p className="text-sm text-primary">
            Você está em modo de visualização. Para editar, peça acesso de administrador.
          </p>
        </div>
      )}

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
            <TabsTrigger value="combos" className="gap-2">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Combos</span>
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
                <div className="flex gap-2">
                  <Button className="gap-2" disabled={!isAdmin} onClick={() => setIsComboCreateOpen(true)} variant="secondary">
                    <Package className="w-4 h-4" />
                    Novo Combo
                  </Button>
                  <Button className="gap-2" disabled={!isAdmin} onClick={() => setIsProductCreateOpen(true)}>
                    <Plus className="w-4 h-4" />
                    Novo Produto
                  </Button>
                </div>
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <img
                          src={product.image_url || "/placeholder.svg"}
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
                          <Switch
                            checked={product.available}
                            onCheckedChange={(checked) =>
                              updateProductMutation.mutate({ id: product.id, available: checked })
                            }
                            disabled={!isAdmin}
                          />
	                          <Button
	                            variant="outline"
	                            size="sm"
	                            disabled={!isAdmin}
	                            onClick={() => setEditingProduct(product)}
	                          >
	                            <Pencil className="w-4 h-4" />
	                          </Button>
	                          <AlertDialog>
	                            <AlertDialogTrigger asChild>
	                              <Button
	                                variant="destructive"
	                                size="sm"
	                                disabled={!isAdmin}
	                              >
	                                <Trash2 className="w-4 h-4" />
	                              </Button>
	                            </AlertDialogTrigger>
	                            <AlertDialogContent>
	                              <AlertDialogHeader>
	                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
	                                <AlertDialogDescription>
	                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto <span className="font-bold">{product.name}</span>.
	                                </AlertDialogDescription>
	                              </AlertDialogHeader>
	                              <AlertDialogFooter>
	                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
	                                <AlertDialogAction
	                                  onClick={() => deleteProductMutation.mutate(product.id)}
	                                  className="bg-destructive hover:bg-destructive/90"
	                                  disabled={deleteProductMutation.isPending}
	                                >
	                                  {deleteProductMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
	                                </AlertDialogAction>
	                              </AlertDialogFooter>
	                            </AlertDialogContent>
	                          </AlertDialog>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
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
                <Button className="gap-2" disabled={!isAdmin} onClick={() => setIsAdditionalCreateOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Novo Adicional
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {additionals.map((additional) => (
                  <Card key={additional.id}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{additional.name}</h3>
                        <span className="text-primary font-bold">
                          +{formatPrice(additional.price)}
                        </span>
                      </div>
	                      <Button
	                        variant="outline"
	                        size="sm"
	                        disabled={!isAdmin}
	                        onClick={() => setEditingAdditional(additional)}
	                      >
	                        <Pencil className="w-4 h-4" />
	                      </Button>
	                      <AlertDialog>
	                        <AlertDialogTrigger asChild>
	                          <Button
	                            variant="destructive"
	                            size="sm"
	                            disabled={!isAdmin}
	                          >
	                            <Trash2 className="w-4 h-4" />
	                          </Button>
	                        </AlertDialogTrigger>
	                        <AlertDialogContent>
	                          <AlertDialogHeader>
	                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
	                            <AlertDialogDescription>
	                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o adicional <span className="font-bold">{additional.name}</span>.
	                            </AlertDialogDescription>
	                          </AlertDialogHeader>
	                          <AlertDialogFooter>
	                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
	                            <AlertDialogAction
	                              onClick={() => deleteAdditionalMutation.mutate(additional.id)}
	                              className="bg-destructive hover:bg-destructive/90"
	                              disabled={deleteAdditionalMutation.isPending}
	                            >
	                              {deleteAdditionalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Excluir"}
	                            </AlertDialogAction>
	                          </AlertDialogFooter>
	                        </AlertDialogContent>
	                      </AlertDialog>
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
                <Button className="gap-2" disabled={!isAdmin} onClick={() => setIsCouponCreateOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Novo Cupom
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <Card key={coupon.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-primary text-lg">
                          {coupon.code}
                        </span>
                        <Switch
                          checked={coupon.active}
                          onCheckedChange={(checked) =>
                            updateCouponMutation.mutate({ id: coupon.id, active: checked })
                          }
                          disabled={!isAdmin}
                        />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount}% de desconto`
                          : `${formatPrice(coupon.discount)} de desconto`}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Combos Tab */}
          <TabsContent value="combos">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl tracking-wide">Combos</h2>
                <Button className="gap-2" disabled={!isAdmin} onClick={() => setIsComboCreateOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Novo Combo
                </Button>
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : products.filter(p => p.category === "Combos").length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum combo criado</p>
                    <p className="text-sm text-muted-foreground/70">
                      Crie combos para oferecer ofertas especiais
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {products.filter(p => p.category === "Combos").map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        <img
                          src={product.image_url || "/placeholder.svg"}
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
                              Combo
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.available}
                            onCheckedChange={(checked) =>
                              updateProductMutation.mutate({ id: product.id, available: checked })
                            }
                            disabled={!isAdmin}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!isAdmin}
                            onClick={() => setEditingProduct(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsForm 
              storeSettings={storeSettings} 
              isAdmin={isAdmin} 
              onSave={(settings) => updateSettingsMutation.mutate(settings)}
              isPending={updateSettingsMutation.isPending}
            />
          </TabsContent>
        </Tabs>

        {/* Product Edit Modal */}
        {editingProduct && (
          <ProductEditForm
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
          />
        )}

        {/* Additional Edit Modal */}
        {editingAdditional && (
          <AdditionalEditForm
            additional={editingAdditional}
            onClose={() => setEditingAdditional(null)}
          />
        )}

        {/* Product Create Modal */}
        <ProductCreateForm
          isOpen={isProductCreateOpen}
          onClose={() => setIsProductCreateOpen(false)}
        />

        {/* Combo Create Modal */}
        <ComboCreateForm
          isOpen={isComboCreateOpen}
          onClose={() => setIsComboCreateOpen(false)}
        />

        {/* Additional Create Modal */}
        <AdditionalCreateForm
          isOpen={isAdditionalCreateOpen}
          onClose={() => setIsAdditionalCreateOpen(false)}
        />

        {/* Coupon Create Modal */}
        <CouponCreateForm
          isOpen={isCouponCreateOpen}
          onClose={() => setIsCouponCreateOpen(false)}
        />


      </main>
    </div>
  );
}
