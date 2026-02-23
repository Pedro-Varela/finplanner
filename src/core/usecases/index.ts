export type { TransactionRepository } from "./transaction-usecases";
export {
  ListTransactions,
  CreateTransaction,
  UpdateTransaction,
  DeleteTransaction,
} from "./transaction-usecases";

export type { CategoryRepository } from "./category-usecases";
export {
  ListCategories,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
} from "./category-usecases";

export type {
  DashboardSummary,
  MonthlyDataPoint,
  DashboardData,
  CategoryBreakdown,
} from "./dashboard-usecases";
export { GetDashboardSummary, computeSummary, computeMonthlyData } from "./dashboard-usecases";

export type {
  AuthRepository,
  SignInCredentials,
  SignUpCredentials,
  AuthResult,
} from "./auth-usecases";
export { SignIn, SignUp, SignOut, GetCurrentUser } from "./auth-usecases";

export type { BudgetRepository } from "./budget-usecases";
export { SetBudget, DeleteBudget, GetBudgetProgress } from "./budget-usecases";

export type { AccountRepository } from "./account-usecases";
export { ListAccounts, CreateAccount, UpdateAccount, DeleteAccount } from "./account-usecases";

export type { RecurringTransactionRepository } from "./recurring-usecases";
export {
  ListRecurring,
  CreateRecurring,
  ToggleRecurring,
  DeleteRecurring,
} from "./recurring-usecases";

export type {
  ImportTransactionRepository,
  ImportMerchantRuleRepository,
  CreateRuleRepository,
} from "./import-usecases";
export { ImportNubankCsvTransactions, CreateMerchantRuleFromTransaction } from "./import-usecases";

export type { ProjectionsData, CategoryTrend } from "./projections-usecases";
export { GetProjections } from "./projections-usecases";

export type { InsightRepository, GenerateInsightsDependencies } from "./insight-usecases";
export { GenerateInsights } from "./insight-usecases";

export type { GetFinancialForecastDependencies } from "./forecast-usecases";
export { GetFinancialForecast } from "./forecast-usecases";

export { ValidationError } from "../errors";
