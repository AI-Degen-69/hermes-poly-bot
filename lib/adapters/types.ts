/**
 * Adapter layer contract (Part 1 / Tech stack requirement).
 * Concrete implementations (Polymarket, Bullpen) land in build step 3.
 */
export interface LeaderboardEntry {
  address: string;
  label?: string;
  rank: number;
  roi30d: number;
}

export interface LeaderboardAdapter {
  readonly source: "polymarket" | "bullpen";
  fetchTop(walletCount: number, lookbackDays: number): Promise<LeaderboardEntry[]>;
}

export class AdapterError extends Error {
  constructor(
    readonly source: string,
    readonly cause: unknown,
  ) {
    super(`[${source}] adapter failure`);
    this.name = "AdapterError";
  }
}
