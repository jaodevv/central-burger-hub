import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(3, "O nome é obrigatório e deve ter pelo menos 3 caracteres."),
  address: z.string().min(10, "O endereço é obrigatório e deve ter pelo menos 10 caracteres."),
  notes: z.string().max(255, "As observações não podem exceder 255 caracteres.").optional(),
  paymentMethod: z.string().min(1, "O método de pagamento é obrigatório."),
  change: z.number().min(0, "O troco não pode ser negativo.").optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
