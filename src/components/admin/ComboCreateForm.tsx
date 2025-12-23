import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, MinusCircle, PlusCircle } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "@/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Esquema de validação para os itens do combo
const comboItemSchema = z.object({
  product_id: z.string().min(1, { message: "Selecione um produto." }),
  quantity: z.number().min(1, { message: "Mínimo 1." }),
});

// Esquema de validação com Zod para o Combo
const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  price: z.number().min(0.01, { message: "O preço deve ser maior que zero." }),
  image_url: z.string().url({ message: "URL de imagem inválida." }).optional().or(z.literal("")),
  available: z.boolean(),
  combo_items: z.array(comboItemSchema).min(1, { message: "Um combo deve ter pelo menos um item." }),
});

type ComboFormValues = z.infer<typeof formSchema>;

interface ComboCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ComboCreateForm({ isOpen, onClose }: ComboCreateFormProps) {
  const queryClient = useQueryClient();

  // Fetch all products to be used as combo items
  const { data: allProducts = [], isLoading: productsLoading, isError: productsError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, category");
      if (error) {
        console.error("Erro ao buscar produtos para combo:", error);
        toast.error("Erro ao carregar lista de produtos para combo.");
        throw error;
      }
      return data as Pick<Product, "id" | "name" | "category">[];
    },
  });

  const form = useForm<ComboFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0.01,
      image_url: "",
      available: true,
      combo_items: [{ product_id: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "combo_items",
  });

  const createComboMutation = useMutation({
    mutationFn: async (values: ComboFormValues) => {
      const { combo_items, description, ...productData } = values;

      // Converte os itens do combo para uma string JSON para salvar na descrição
      const comboItemsJson = JSON.stringify(combo_items);
      const newDescription = description ? `${description}\n\n--- COMBO ITEMS ---\n${comboItemsJson}` : `--- COMBO ITEMS ---\n${comboItemsJson}`;

      const { error } = await supabase
        .from("products")
        .insert({
          ...productData,
          description: newDescription,
          category: "Combos", // Define a categoria como "Combos"
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Combo criado com sucesso!");
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast.error(`Erro ao criar combo: ${error.message}`);
      console.error("Erro detalhado ao criar combo:", error);
    },
  });

  function onSubmit(values: ComboFormValues) {
    createComboMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Combo</DialogTitle>
          <DialogDescription>
            Crie um novo combo, que é um produto composto por outros produtos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Combo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Combo Família" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do combo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço do Combo (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2 border p-4 rounded-lg">
              <h3 className="font-semibold">Itens do Combo</h3>
              {productsLoading && <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
              {productsError && <p className="text-destructive">Não foi possível carregar a lista de produtos.</p>}
              {!productsLoading && !productsError && fields.map((item, index) => (
                <div key={item.id} className="flex items-end gap-2">
                  <FormField
                    control={form.control}
                    name={`combo_items.${index}.product_id`}
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormLabel className={index > 0 ? "sr-only" : ""}>Produto</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um produto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} ({product.category})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`combo_items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem className="w-20">
                        <FormLabel className={index > 0 ? "sr-only" : ""}>Qtd</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ product_id: "", quantity: 1 })}
                className="w-full mt-2 gap-2"
              >
                <PlusCircle className="h-4 w-4" /> Adicionar Item
              </Button>
              <p className="text-sm font-medium text-destructive">{form.formState.errors.combo_items?.message}</p>
            </div>

            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Disponível</FormLabel>
                    <DialogDescription>
                      Marque para exibir o combo no menu.
                    </DialogDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
                <Button type="submit" className="w-full" disabled={createComboMutation.isPending || productsLoading || productsError}>
              {createComboMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Criar Combo"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
