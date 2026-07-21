/**
 * Wallet scoring (Part 6). Pure function — no DB, no I/O.
 * Weights are v1 defaults; the auto-rule-updater (build step 11) adjusts them.
 */
export interface WalletScoreInput {
  roi30d: number;
  consistencyScore: number;
  copyabilityScore: number;
  oneHitWonderPenalty: number; // 0..1
}

export interface WalletScoreResult {
  roiComponent: number;
  consistencyComponent: number;
  copyabilityComponent: number;
  penaltyApplied: number;
  globalScore: number;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export function walletScoring(input: WalletScoreInput): WalletScoreResult {
  const roiComponent = clamp01(input.roi30d); // ROI normalized 0..1 (0=breakeven)
  const consistencyComponent = clamp01(input.consistencyScore);
  const copyabilityComponent = clamp01(input.copyabilityScore);
  const penaltyApplied = clamp01(input.oneHitWonderPenalty);

  const base =
    0.35 * roiComponent +
    0.3 * consistencyComponent +
    0.35 * copyabilityComponent;

  const globalScore = clamp01(base * (1 - penaltyApplied * 0.8));
  return {
    roiComponent,
    consistencyComponent,
    copyabilityComponent,
    penaltyApplied,
    globalScore,
  };
}
