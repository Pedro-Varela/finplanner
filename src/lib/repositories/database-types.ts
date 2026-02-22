/**
 * Row types que espelham as colunas do Supabase (snake_case).
 * Ficam em lib/ porque são detalhe de infraestrutura — o core/ não os conhece.
 */

export interface TransactionRow {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category_id: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  created_at: string;
}
