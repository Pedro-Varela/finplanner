import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  type: z.enum(["income", "expense"], { error: "Selecione o tipo." }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
