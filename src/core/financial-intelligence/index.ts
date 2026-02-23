export type {
  FinancialSnapshot,
  FinancialTopCategory,
  FinancialScore,
  FinancialScoreBreakdown,
  EnvelopeConfig,
  EnvelopeStatus,
  EnvelopeStatusFlag,
  EnvelopeBucketStatus,
  StrategicInsight,
  StrategicInsightSeverity,
  StrategicInsightType,
} from "./types";

export { generateFinancialSnapshot } from "./snapshot/generateFinancialSnapshot";
export {
  ESSENTIAL_CATEGORY_KEYWORDS,
  INVESTMENT_CATEGORY_KEYWORDS,
  resolveCategoryBucket,
  normalizeCategoryName,
  type FinancialBucket,
} from "./snapshot/bucket-rules";
export { calculateFinancialScore } from "./score/calculateFinancialScore";
export { calculateEnvelopeStatus } from "./envelope/calculateEnvelopeStatus";
export { generateStrategicInsights } from "./insights/generateStrategicInsights";
