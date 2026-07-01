export interface ComprehensiveReviewReport {
  productivityScore: number;
  focusScore: number;
  burnoutRisk: 'low' | 'moderate' | 'critical';
  insights: string[];
}

export const WeeklyReviewEngine = {
  compileReport(taskCompletionRate: number, totalDistractions: number, avgSleepHours: number): ComprehensiveReviewReport {
    const productivityScore = Math.min(100, Math.round(taskCompletionRate * 100));
    const focusScore = Math.max(10, Math.min(100, 100 - totalDistractions * 2));
    
    let burnoutRisk: 'low' | 'moderate' | 'critical' = 'low';
    if (avgSleepHours < 6 && productivityScore > 80) burnoutRisk = 'critical';
    else if (avgSleepHours < 6.5 || totalDistractions > 15) burnoutRisk = 'moderate';

    const insights: string[] = [];
    if (burnoutRisk === 'critical') {
      insights.push('CRITICAL BURNOUT WARNING: High velocity with suppressed rest values. Sleep duration falls below threshold.');
    }
    if (focusScore < 60) {
      insights.push('Distraction parameters are exceeding safe baseline metrics. Apply Focus Shield Pro blocks.');
    } else {
      insights.push('Focus discipline metrics are optimal. Cognitive baseline velocity is verified.');
    }

    return { productivityScore, focusScore, burnoutRisk, insights };
  }
};