import type {
  EnvelopeBucketStatus,
  EnvelopeConfig,
  EnvelopeStatus,
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

function aggregateStatus(statuses: Array<"ok" | "warning" | "over">): "ok" | "warning" | "over" {
  if (statuses.includes("over")) return "over";
  if (statuses.includes("warning")) return "warning";
  return "ok";
}

export function calculateEnvelopeStatus(
  snapshot: FinancialSnapshot,
  userEnvelopeConfig?: Partial<EnvelopeConfig>
): EnvelopeStatus {
  const config = normalizeEnvelopeConfig(userEnvelopeConfig);

  const essentials = buildBucket(
    snapshot.essentialExpense,
    snapshot.totalIncome,
    config.essentialsPct
  );
  const leisure = buildBucket(snapshot.leisureExpense, snapshot.totalIncome, config.leisurePct);
  const investments = buildBucket(
    snapshot.investmentAmount,
    snapshot.totalIncome,
    config.investmentsPct
  );

  return {
    status: aggregateStatus([essentials.status, leisure.status, investments.status]),
    essentials,
    leisure,
    investments,
  };
}
