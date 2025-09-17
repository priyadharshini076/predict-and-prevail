/**
 * A simple example ML model function to predict risk score.
 * This is a placeholder for a real ML model integration.
 * It takes call data features and returns a risk score between 0 and 1.
 */

interface CallFeatures {
  wait_time: number; // in seconds
  issue_type: string;
  charge: number; // billing charge amount
  status: string; // claim status
}

const issueTypeWeights: Record<string, number> = {
  "Insurance Claim Denial": 0.4,
  "Bill Payment Query": 0.1,
  "Coverage Verification": 0.2,
  "Prior Authorization": 0.3,
  "Copay Questions": 0.1,
  "Billing Statement Error": 0.35,
  "Insurance Network Query": 0.25,
  "Prescription Coverage": 0.2,
  "EOB Explanation": 0.15,
  "Payment Plan Setup": 0.1,
};

export function predictRiskScore(features: CallFeatures): number {
  let score = 0;

  // Base score from wait time (normalized to max 600 seconds)
  score += Math.min(features.wait_time / 600, 1) * 0.3;

  // Add weight based on issue type
  score += issueTypeWeights[features.issue_type] || 0.1;

  // Add charge impact (normalized to max 1000)
  score += Math.min(features.charge / 1000, 1) * 0.3;

  // Add status impact
  if (features.status === "Denied") {
    score += 0.3;
  } else if (features.status === "Pending") {
    score += 0.1;
  }

  // Clamp score between 0 and 1
  return Math.min(score, 1);
}
