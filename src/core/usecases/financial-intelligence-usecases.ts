import type { CreateInsightInput } from "../entities";
import type { CategoryRepository } from "./category-usecases";
import type { RecurringTransactionRepository } from "./recurring-usecases";
import type { TransactionRepository } from "./transaction-usecases";
import { calculateEnvelopeStatus } from "../financial-intelligence/envelope/calculateEnvelopeStatus";
import { generateStrategicInsights } from "../financial-intelligence/insights/generateStrategicInsights";
import { calculateFinancialScore } from "../financial-intelligence/score/calculateFinancialScore";
import { generateFinancialSnapshot } from "../financial-intelligence/snapshot/generateFinancialSnapshot";
import type { EnvelopeStatus } from "../financial-intelligence/types";
import type { EnvelopeConfig } from "../financial-intelligence/types";
import type { FinancialScore } from "../financial-intelligence/types";
import type { FinancialSnapshot } from "../financial-intelligence/types";
import type { StrategicInsight } from "../financial-intelligence/types";

export interface FinancialIntelligencePersistenceRepository {
  findActiveInsightTitles(): Promise<Set<string>>;
  createInsights(inputs: CreateInsightInput[]): Promise<void>;
  saveAnalysis?(payload: GenerateFinancialIntelligenceResult): Promise<void>;
}

export interface GenerateFinancialIntelligenceDependencies {
  transactionRepo: TransactionRepository;
  categoryRepo: CategoryRepository;
  recurringRepo: RecurringTransactionRepository;
  persistenceRepo: FinancialIntelligencePersistenceRepository;
}

export interface GenerateFinancialIntelligenceInput {
  envelopeConfig?: Partial<EnvelopeConfig>;
}

export interface GenerateFinancialIntelligenceResult {
  snapshot: FinancialSnapshot;
  score: FinancialScore;
  envelope: EnvelopeStatus;
  insights: StrategicInsight[];
  persistedInsights: number;
}

function toPersistedInsight(input: StrategicInsight): CreateInsightInput {
  if (input.severity === "critical" || input.severity === "high") {
    return {
      title: input.title,
      description: input.description,
      type: "warning",
    };
  }

  if (input.severity === "medium") {
    return {
      title: input.title,
      description: input.description,
      type: "suggestion",
    };
  }

  return {
    title: input.title,
    description: input.description,
    type: "info",
  };
}

export class GenerateFinancialIntelligence {
  constructor(private deps: GenerateFinancialIntelligenceDependencies) {}

  async execute(
    input?: GenerateFinancialIntelligenceInput
  ): Promise<GenerateFinancialIntelligenceResult> {
    const [transactions, categories, recurring, activeTitles] = await Promise.all([
      this.deps.transactionRepo.findAll(),
      this.deps.categoryRepo.findAll(),
      this.deps.recurringRepo.findAll(),
      this.deps.persistenceRepo.findActiveInsightTitles(),
    ]);

    const snapshot = generateFinancialSnapshot(transactions, categories, recurring);
    const score = calculateFinancialScore(snapshot);
    const envelope = calculateEnvelopeStatus(snapshot, input?.envelopeConfig);
    const insights = generateStrategicInsights(snapshot, score, envelope);

    const insightsToPersist = insights
      .filter((insight) => !activeTitles.has(insight.title))
      .map(toPersistedInsight);

    if (insightsToPersist.length > 0) {
      await this.deps.persistenceRepo.createInsights(insightsToPersist);
    }

    const result: GenerateFinancialIntelligenceResult = {
      snapshot,
      score,
      envelope,
      insights,
      persistedInsights: insightsToPersist.length,
    };

    if (this.deps.persistenceRepo.saveAnalysis) {
      await this.deps.persistenceRepo.saveAnalysis(result);
    }

    return result;
  }
}
