export interface TransactionRow {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category_id: string;
  date: string;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  created_at: string;
}
