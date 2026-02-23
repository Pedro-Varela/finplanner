import { z } from "zod";
import { CATEGORY_ICON_OPTIONS } from "@/core/entities";

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "O nome é obrigatório.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  type: z.enum(["income", "expense"], { error: "Selecione o tipo." }),
  icon: z.enum(CATEGORY_ICON_OPTIONS, { error: "Selecione um ícone." }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
