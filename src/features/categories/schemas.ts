import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Cor inválida (formato #RRGGBB)."),
  icon: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
