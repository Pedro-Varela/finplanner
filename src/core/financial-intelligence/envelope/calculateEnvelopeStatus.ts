import type {
  EnvelopeBucketStatus,
  EnvelopeConfig,
  EnvelopeStatus,
  EnvelopeStatusFlag,
  FinancialSnapshot,
} from "../types";

const DEFAULT_ENVELOPE_CONFIG: EnvelopeConfig = {
  essentialsPct: 50,
  leisurePct: 30,
  investmentsPct: 20,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeEnvelopeConfig(input?: Partial<EnvelopeConfig>): EnvelopeConfig {
  const raw = {
    essentialsPct: input?.essentialsPct ?? DEFAULT_ENVELOPE_CONFIG.essentialsPct,
    leisurePct: input?.leisurePct ?? DEFAULT_ENVELOPE_CONFIG.leisurePct,
    investmentsPct: input?.investmentsPct ?? DEFAULT_ENVELOPE_CONFIG.investmentsPct,
  };

  const safe = {
    essentialsPct: clamp(raw.essentialsPct, 0, 100),
    leisurePct: clamp(raw.leisurePct, 0, 100),
    investmentsPct: clamp(raw.investmentsPct, 0, 100),
  };

  const total = safe.essentialsPct + safe.leisurePct + safe.investmentsPct;
  if (total <= 0) return DEFAULT_ENVELOPE_CONFIG;

  return {
    essentialsPct: (safe.essentialsPct / total) * 100,
    leisurePct: (safe.leisurePct / total) * 100,
    investmentsPct: (safe.investmentsPct / total) * 100,
  };
}

function bucketStatus(actualPct: number, targetPct: number): "ok" | "warning" | "over" {
  const diff = actualPct - targetPct;
  if (diff > 8) return "over";
  if (Math.abs(diff) > 4) return "warning";
  return "ok";
}

function buildBucket(amount: number, totalIncome: number, targetPct: number): EnvelopeBucketStatus {
  const actualPct = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
  const differencePct = actualPct - targetPct;

  return {
    targetPct: Math.round(targetPct * 10) / 10,
    actualPct: Math.round(actualPct * 10) / 10,
    amount,
    differencePct: Math.round(differencePct * 10) / 10,
    status: bucketStatus(actualPct, targetPct),
  };
}

function resolveActualBase(snapshot: FinancialSnapshot): number {
  if (snapshot.totalIncome > 0) return snapshot.totalIncome;

  const trackedEnvelopeAmount =
    snapshot.essentialExpense + snapshot.leisureExpense + snapshot.investmentAmount;

  if (trackedEnvelopeAmount > 0) return trackedEnvelopeAmount;
  if (snapshot.totalExpense > 0) return snapshot.totalExpense;
  return 0;
}

function aggregateStatus(buckets: EnvelopeBucketStatus[]): EnvelopeStatusFlag {
  const overBuckets = buckets.filter((bucket) => bucket.status === "over");
  const warningBuckets = buckets.filter((bucket) => bucket.status === "warning");
  const maxPositiveDiff = Math.max(...buckets.map((bucket) => bucket.differencePct), 0);

  if (overBuckets.length >= 2) return "over";
  if (overBuckets.length === 1 && maxPositiveDiff >= 15) return "over";
  if (overBuckets.length === 1 || warningBuckets.length > 0) return "warning";
  return "ok";
}

export function calculateEnvelopeStatus(
  snapshot: FinancialSnapshot,
  userEnvelopeConfig?: Partial<EnvelopeConfig>
): EnvelopeStatus {
  const config = normalizeEnvelopeConfig(userEnvelopeConfig);
  const actualBase = resolveActualBase(snapshot);

  const essentials = buildBucket(snapshot.essentialExpense, actualBase, config.essentialsPct);
  const leisure = buildBucket(snapshot.leisureExpense, actualBase, config.leisurePct);
  const investments = buildBucket(snapshot.investmentAmount, actualBase, config.investmentsPct);

  return {
    status: aggregateStatus([essentials, leisure, investments]),
    essentials,
    leisure,
    investments,
  };
}
