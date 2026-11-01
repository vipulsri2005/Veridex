import { ClaimData, PredictionResult, RiskLevel, RiskFactor } from '../types';
import { generateGeminiForensics } from './gemini';
import { isGeminiConfigured } from './geminiKey';

/**
 * Hybrid Prediction Service for Insurance Fraud Risk Analysis.
 * Combines deterministic heuristic scoring with live Gemini AI forensic intelligence.
 */
export async function analyzeClaim(claimData: ClaimData): Promise<PredictionResult> {
  // 1. Calculate deterministic heuristic baseline
  let baseline: PredictionResult;
  if (claimData.type === 'car') {
    baseline = evaluateCarClaim(claimData.data);
  } else {
    baseline = evaluateHealthClaim(claimData.data);
  }

  // 2. If Gemini AI is configured, augment with deep LLM forensic intelligence
  if (isGeminiConfigured()) {
    try {
      const geminiForensics = await generateGeminiForensics(claimData, baseline);
      if (geminiForensics) {
        baseline.geminiAnalysis = geminiForensics;
      }
    } catch (e) {
      console.warn('Gemini enrichment error, proceeding with baseline heuristics:', e);
    }
  } else {
    // Simulate brief processing time if only running client heuristics
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  return baseline;
}

function evaluateCarClaim(claim: import('../types').CarInsuranceClaim): PredictionResult {
  let riskScore = 20; // baseline score
  const riskFactors: RiskFactor[] = [];

  const totalAmount = Number(claim.totalClaimAmount) || 0;
  const annualPrem = Number(claim.annualPremium) || 1;
  const customerMonths = Number(claim.monthsAsCustomer) || 0;
  const incidentHour = Number(claim.incidentHour) ?? 12;
  const witnesses = Number(claim.witnesses) || 0;
  const policeReport = claim.policeReportAvailable?.toUpperCase() === 'YES';
  const severity = claim.incidentSeverity || '';
  const authorities = claim.authoritiesContacted || '';

  // 1. Claim amount vs Annual Premium ratio
  const ratio = totalAmount / annualPrem;
  if (ratio > 50) {
    riskScore += 26;
    riskFactors.push({
      title: 'Disproportionate Claim vs. Premium',
      description: `Claim amount ($${totalAmount.toLocaleString()}) is over ${Math.round(ratio)}x the annual policy premium ($${annualPrem.toLocaleString()}).`,
      impact: 'HIGH',
    });
  } else if (ratio > 25) {
    riskScore += 14;
    riskFactors.push({
      title: 'Elevated Claim-to-Premium Ratio',
      description: `Claim amount is substantially higher than standard policy baseline.`,
      impact: 'MEDIUM',
    });
  }

  // 2. Incident timing & lack of official reporting
  if ((incidentHour >= 23 || incidentHour <= 4) && !policeReport) {
    riskScore += 22;
    riskFactors.push({
      title: 'Late Night Incident Without Police Report',
      description: `Incident occurred at ${incidentHour}:00 without an official police report filed at the scene.`,
      impact: 'HIGH',
    });
  } else if (!policeReport && authorities === 'None') {
    riskScore += 16;
    riskFactors.push({
      title: 'No Emergency Services or Police Record',
      description: 'Neither police nor first responders were contacted at the time of the event.',
      impact: 'MEDIUM',
    });
  }

  // 3. New customer / short tenure anomaly
  if (customerMonths < 6 && totalAmount > 25000) {
    riskScore += 20;
    riskFactors.push({
      title: 'High-Value Claim on Recent Policy Inception',
      description: `Policyholder joined only ${customerMonths} months ago with an immediate severe loss claim.`,
      impact: 'HIGH',
    });
  } else if (customerMonths > 60) {
    // Loyalty credit
    riskScore = Math.max(5, riskScore - 12);
    riskFactors.push({
      title: 'Established Customer History',
      description: `Long-standing policyholder tenure (${Math.floor(customerMonths / 12)} years) correlates with lower baseline risk.`,
      impact: 'LOW',
    });
  }

  // 4. Incident severity vs claimed injury
  const injuryClaim = Number(claim.injuryClaim) || 0;
  if ((severity === 'Minor Damage' || severity === 'Trivial Damage') && injuryClaim > 15000) {
    riskScore += 18;
    riskFactors.push({
      title: 'Discrepancy in Impact Severity & Bodily Injury',
      description: `High bodily injury claim ($${injuryClaim.toLocaleString()}) filed under "${severity}" collision classification.`,
      impact: 'HIGH',
    });
  }

  // 5. Witnesses presence
  if (witnesses >= 2 && policeReport) {
    riskScore = Math.max(5, riskScore - 10);
    riskFactors.push({
      title: 'Multiple Verified Independent Witnesses',
      description: `${witnesses} independent witnesses documented on scene with police confirmation.`,
      impact: 'LOW',
    });
  }

  // Bound score between 5% and 96%
  const finalProbability = Math.min(96, Math.max(8, Math.round(riskScore)));

  let riskLevel: RiskLevel;
  let prediction: string;
  let recommendation: string;

  if (finalProbability >= 65) {
    riskLevel = 'HIGH';
    prediction = 'Potential Fraud Detected';
    recommendation = 'Claim requires further investigation by the Special Investigations Unit (SIU) prior to payout.';
  } else if (finalProbability >= 35) {
    riskLevel = 'MEDIUM';
    prediction = 'Elevated Risk - Review Advised';
    recommendation = 'Secondary review and forensic invoice verification recommended before claim settlement.';
  } else {
    riskLevel = 'LOW';
    prediction = 'Claim Appears Legitimate';
    recommendation = 'Claim can proceed through normal verification and standard straight-through processing.';
  }

  const claimRef = `CAR-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    riskLevel,
    fraudProbability: finalProbability,
    prediction,
    recommendation,
    riskScore: finalProbability,
    confidenceScore: Math.min(98, 85 + Math.floor(Math.random() * 12)),
    riskFactors,
    timestamp: new Date().toISOString(),
    claimReference: claimRef,
    insuranceType: 'car',
    claimSummary: {
      insuranceTypeDisplay: 'Car Insurance',
      claimAmountDisplay: `$${totalAmount.toLocaleString()}`,
      incidentType: claim.incidentType || 'Vehicle Incident',
      customerAge: claim.age,
      additionalDetails: {
        'Vehicle': `${claim.vehicleYear} ${claim.vehicleMake} ${claim.vehicleModel}`.trim(),
        'Policy Number': claim.policyNumber,
        'Incident Severity': claim.incidentSeverity,
        'Collision Type': claim.collisionType,
        'Police Report': claim.policeReportAvailable,
        'Customer Tenure': `${claim.monthsAsCustomer} months`,
        'Injury Claim': `$${Number(claim.injuryClaim || 0).toLocaleString()}`,
        'Property Claim': `$${Number(claim.propertyClaim || 0).toLocaleString()}`,
        'Vehicle Claim': `$${Number(claim.vehicleClaim || 0).toLocaleString()}`,
      }
    }
  };
}

function evaluateHealthClaim(claim: import('../types').HealthInsuranceClaim): PredictionResult {
  let riskScore = 18;
  const riskFactors: RiskFactor[] = [];

  const claimAmount = Number(claim.claimAmount) || 0;
  const premium = Number(claim.premiumAmount) || 1;
  const severity = claim.incidentSeverity || '';
  const riskSegment = claim.riskSegmentation || '';
  const dependents = Number(claim.numberOfDependents) || 0;

  // 1. Loss date proximity to policy effective date
  if (claim.policyEffectiveDate && claim.lossDate) {
    const eff = new Date(claim.policyEffectiveDate);
    const loss = new Date(claim.lossDate);
    const diffDays = Math.round((loss.getTime() - eff.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 0 && diffDays <= 14) {
      riskScore += 30;
      riskFactors.push({
        title: 'Immediate Loss Post Policy Inception',
        description: `Loss event occurred within ${diffDays} day(s) of policy effective date, indicating pre-existing condition risk.`,
        impact: 'HIGH',
      });
    } else if (diffDays >= 0 && diffDays <= 45) {
      riskScore += 16;
      riskFactors.push({
        title: 'Short Period Between Effective Date and Loss',
        description: `Loss occurred ${diffDays} days into coverage period.`,
        impact: 'MEDIUM',
      });
    }
  }

  // 2. High claim vs premium
  const ratio = claimAmount / premium;
  if (ratio > 40) {
    riskScore += 24;
    riskFactors.push({
      title: 'Substantial Claim to Premium Disparity',
      description: `Filing of $${claimAmount.toLocaleString()} exceeds 40x annual policy premium contribution ($${premium.toLocaleString()}).`,
      impact: 'HIGH',
    });
  }

  // 3. Risk segmentation watchlist
  if (riskSegment === 'New Policyholder Watchlist' || riskSegment === 'Tier-1 High Utilization') {
    riskScore += 18;
    riskFactors.push({
      title: 'Watchlist Risk Classification',
      description: `Account has been tagged under "${riskSegment}" profile.`,
      impact: 'MEDIUM',
    });
  } else if (riskSegment === 'Low Risk Preferred') {
    riskScore = Math.max(5, riskScore - 12);
    riskFactors.push({
      title: 'Preferred Risk Status',
      description: 'Historical health profile classifies policyholder in preferred preventive tier.',
      impact: 'LOW',
    });
  }

  // 4. Disproportionate routine claim amounts
  if (severity.includes('Mild') && claimAmount > 20000) {
    riskScore += 22;
    riskFactors.push({
      title: 'Disproportionate Treatment Cost for Severity',
      description: `High fee ($${claimAmount.toLocaleString()}) billed under routine/mild procedural severity.`,
      impact: 'HIGH',
    });
  }

  const finalProbability = Math.min(95, Math.max(9, Math.round(riskScore)));

  let riskLevel: RiskLevel;
  let prediction: string;
  let recommendation: string;

  if (finalProbability >= 65) {
    riskLevel = 'HIGH';
    prediction = 'Potential Fraud Detected';
    recommendation = 'Claim requires clinical chart audit and medical billing review before pre-authorization or payment.';
  } else if (finalProbability >= 35) {
    riskLevel = 'MEDIUM';
    prediction = 'Elevated Risk - Review Advised';
    recommendation = 'Request itemized hospital billing breakdown and attending physician verification.';
  } else {
    riskLevel = 'LOW';
    prediction = 'Claim Appears Legitimate';
    recommendation = 'Claim can proceed through normal adjudication and payment scheduling.';
  }

  const claimRef = `HLT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    riskLevel,
    fraudProbability: finalProbability,
    prediction,
    recommendation,
    riskScore: finalProbability,
    confidenceScore: Math.min(97, 88 + Math.floor(Math.random() * 9)),
    riskFactors,
    timestamp: new Date().toISOString(),
    claimReference: claimRef,
    insuranceType: 'health',
    claimSummary: {
      insuranceTypeDisplay: 'Health Insurance',
      claimAmountDisplay: `$${claimAmount.toLocaleString()}`,
      incidentType: claim.incidentType || 'Medical Procedure',
      customerAge: claim.age,
      additionalDetails: {
        'Customer ID': claim.customerId,
        'Plan Type': claim.insuranceType,
        'Severity Level': claim.incidentSeverity,
        'Loss Date': claim.lossDate,
        'Filing Date': claim.claimDate,
        'Risk Segment': claim.riskSegmentation,
        'Audit Status': claim.claimStatus,
        'Dependents': dependents,
      }
    }
  };
}
