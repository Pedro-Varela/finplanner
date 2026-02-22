import { z } from "zod";

export const transactionSchema = z.object({
  title: z.string().min(1, "O título é obrigatório."),
  amount: z
    .number({ error: "Informe um valor numérico." })
    .positive("O valor deve ser maior que zero."),
  type: z.enum(["income", "expense"], { error: "Selecione o tipo." }),
  categoryId: z.string().min(1, "Selecione uma categoria."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)."),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
