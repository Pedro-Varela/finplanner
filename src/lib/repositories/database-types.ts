export interface TransactionRow {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category_id: string;
  date: string;
  created_at: string;
  source?: "manual" | "import_csv";
  imported_hash?: string | null;
  normalized_merchant?: string | null;
}

export interface MerchantRuleRow {
  id: string;
  user_id: string;
  pattern: string;
  match_type: "equals" | "contains" | "regex";
  category_id: string | null;
  priority: number;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  type: "income" | "expense";
  created_at: string;
}

export interface AccountRow {
  id: string;
  user_id: string;
  name: string;
  type: "checking" | "savings" | "credit_card";
  created_at: string;
}

export interface RecurringTransactionRow {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category_id: string;
  account_id: string | null;
  frequency: "weekly" | "monthly" | "yearly";
  next_date: string;
  active: boolean;
  created_at: string;
}

export interface BudgetRow {
  id: string;
  category_id: string;
  user_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
}

export interface InsightRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: "warning" | "suggestion" | "info";
  status: "active" | "resolved";
  created_at: string;
  resolved_at: string | null;
}
