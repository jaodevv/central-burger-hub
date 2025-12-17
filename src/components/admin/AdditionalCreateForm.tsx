import { useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Esquema de validação com Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  price: z.coerce.number().min(0.01, { message: "O preço deve ser maior que zero." }),
  available: z.boolean().default(true),
});

type AdditionalFormValues = z.infer<typeof formSchema>;

interface AdditionalCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdditionalCreateForm({ isOpen, onClose }: AdditionalCreateFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<AdditionalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0.01,
      available: true,
    },
  });

  const createAdditionalMutation = useMutation({
    mutationFn: async (values: AdditionalFormValues) => {
      const { error } = await supabase
        .from("additionals")
        .insert({
          name: values.name,
          price: values.price,
          available: values.available,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["additionals"] });
      toast.success("Adicional criado com sucesso!");
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast.error("Erro ao criar adicional.");
      console.error(error);
    },
  });

  function onSubmit(values: AdditionalFormValues) {
    createAdditionalMutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Adicional</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para adicionar um novo adicional ao menu.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do adicional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Disponível</FormLabel>
                    <DialogDescription>
                      Marque para exibir o adicional no menu.
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
            <Button type="submit" className="w-full" disabled={createAdditionalMutation.isPending}>
              {createAdditionalMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Criar Adicional"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
