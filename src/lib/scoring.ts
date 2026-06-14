/**
 * ARC OMNI SCORING ENGINE
 * 
 * Calculates engagement score based on real on-chain metrics.
 * Formula:
 * - 10 points per transaction (txCount)
 * - 1 point per $1 of net worth (totalValueUsd)
 * - 50 points per active day (activeDays)
 * - 100 points per unique protocol interaction (positionsCount)
 * - Bonus multipliers for consistency (activeWeeks/Months)
 */

export interface ScoreMetrics {
  txCount: number;
  totalValueUsd: number;
  activeDays: number;
  positionsCount: number;
}

export function calculateScore(metrics: ScoreMetrics): number {
  const { txCount, totalValueUsd, activeDays, positionsCount } = metrics;
  
  const txScore = txCount * 10;
  const valueScore = Math.floor(totalValueUsd);
  const dayScore = activeDays * 50;
  const protocolScore = positionsCount * 100;
  
  // Consistency Bonus: +20% if active more than 7 days
  const multiplier = activeDays > 7 ? 1.2 : 1.0;
  
  return Math.floor((txScore + valueScore + dayScore + protocolScore) * multiplier);
}

export function getRankLabel(score: number): string {
  if (score > 100000) return 'Protocol Sentinel';
  if (score > 50000) return 'Arc Titan';
  if (score > 10000) return 'Institutional Node';
  if (score > 1000) return 'Active Operator';
  return 'Node Explorer';
}
