import { GoogleGenAI, Type } from '@google/genai';
import { ClaimData, PredictionResult, GeminiForensicAnalysis } from '../types';
import { getGeminiApiKey } from './geminiKey';
import type { ModelPrediction } from './mlApi';

const GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * Executes deep AI forensic reasoning on an insurance claim using Gemini 2.5 Flash.
 * Returns null if no API key is provided or if network error occurs (ensuring zero crash).
 */
export async function generateGeminiForensics(
  claim: ClaimData,
  heuristicResult: PredictionResult
): Promise<GeminiForensicAnalysis | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const claimDetails = claim.type === 'car'
      ? {
          type: 'Auto/Car Insurance',
          customer: {
            age: claim.data.age,
            gender: claim.data.gender,
            occupation: claim.data.occupation,
            education: claim.data.education,
            relationship: claim.data.relationship,
            monthsAsCustomer: claim.data.monthsAsCustomer,
          },
          policy: {
            policyNumber: claim.data.policyNumber,
            state: claim.data.policyState,
            deductible: claim.data.policyDeductible,
            annualPremium: claim.data.annualPremium,
            umbrellaLimit: claim.data.umbrellaLimit,
            csl: claim.data.policyCsl,
          },
          incident: {
            type: claim.data.incidentType,
            collisionType: claim.data.collisionType,
            severity: claim.data.incidentSeverity,
            incidentHour: claim.data.incidentHour,
            city: claim.data.incidentCity,
            state: claim.data.incidentState,
            policeReportAvailable: claim.data.policeReportAvailable,
            authoritiesContacted: claim.data.authoritiesContacted,
            witnesses: claim.data.witnesses,
            propertyDamage: claim.data.propertyDamage,
            bodilyInjuries: claim.data.bodilyInjuries,
          },
          vehicle: {
            make: claim.data.vehicleMake,
            model: claim.data.vehicleModel,
            year: claim.data.vehicleYear,
          },
          claimFinancials: {
            totalClaimAmount: claim.data.totalClaimAmount,
            injuryClaim: claim.data.injuryClaim,
            propertyClaim: claim.data.propertyClaim,
            vehicleClaim: claim.data.vehicleClaim,
          },
        }
      : {
          type: 'Health Insurance',
          customer: {
            customerId: claim.data.customerId,
            age: claim.data.age,
            gender: claim.data.gender,
            employment: claim.data.employmentStatus,
            education: claim.data.educationLevel,
            maritalStatus: claim.data.maritalStatus,
            dependents: claim.data.numberOfDependents,
          },
          policy: {
            planType: claim.data.insuranceType,
            effectiveDate: claim.data.policyEffectiveDate,
            expiryDate: claim.data.policyExpiryDate,
            premiumAmount: claim.data.premiumAmount,
            policyDurationMonths: claim.data.policyDuration,
          },
          claimFinancials: {
            claimAmount: claim.data.claimAmount,
            claimDate: claim.data.claimDate,
            lossDate: claim.data.lossDate,
            incidentType: claim.data.incidentType,
            severity: claim.data.incidentSeverity,
            riskSegmentation: claim.data.riskSegmentation,
            auditStatus: claim.data.claimStatus,
          },
        };

    const prompt = `
You are a Lead Special Investigations Unit (SIU) Insurance Fraud Examiner and Forensic Data Analyst.
Analyze the following ${claim.type.toUpperCase()} claim along with our initial heuristic baseline.

CLAIM DATA:
${JSON.stringify(claimDetails, null, 2)}

HEURISTIC ENGINE BASELINE:
- Risk Tier: ${heuristicResult.riskLevel}
- Probability: ${heuristicResult.fraudProbability}%
- Rule Flags Triggered: ${heuristicResult.riskFactors.map((rf) => `${rf.title}: ${rf.description}`).join(' | ')}

Evaluate this claim thoroughly for:
1. Plausibility and consistency between severity, timeline, and claimed damage/costs.
2. Timing anomalies (e.g. proximity of loss to inception, late night hours without authorities).
3. Disproportionate financial payout ratios vs policy tenure and premium contributions.
4. Specific red flags that claims adjusters and SIU detectives must look into.

Provide your output strictly matching the required JSON schema.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: {
              type: Type.STRING,
              description: 'Clear 2-3 sentence forensic narrative summarizing the fraud risk context.',
            },
            fraudPattern: {
              type: Type.STRING,
              description: "Identified fraud scheme name (e.g. 'Staged Late-Night Collision', 'Phantom Outpatient Billing', 'Inception-to-Loss Arbitrage', 'Inflated Soft-Tissue Injury', or 'Low-Risk Verified Profile').",
            },
            inconsistencies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 2-4 critical factual anomalies, timeline disparities, or suspicious attributes.',
            },
            siuChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3-5 tactical questions or evidentiary demands the claims adjuster should execute during claimant review.',
            },
            recommendedAction: {
              type: Type.STRING,
              description: 'Direct operational recommendation for the claim adjudication workflow.',
            },
          },
          required: [
            'executiveSummary',
            'fraudPattern',
            'inconsistencies',
            'siuChecklist',
            'recommendedAction',
          ],
        },
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}') as Partial<GeminiForensicAnalysis>;

    if (!parsed.executiveSummary || !parsed.fraudPattern) {
      return null;
    }

    return {
      executiveSummary: parsed.executiveSummary,
      fraudPattern: parsed.fraudPattern,
      inconsistencies: parsed.inconsistencies || [],
      siuChecklist: parsed.siuChecklist || [],
      recommendedAction: parsed.recommendedAction || heuristicResult.recommendation,
      modelUsed: GEMINI_MODEL,
    };
  } catch (err) {
    console.warn('Gemini forensic generation encountered an issue:', err);
    return null;
  }
}

/**
 * Interactive Copilot: Allows claims adjusters to ask live forensic questions about a claim.
 */
export async function askGeminiCopilot(
  claim: ClaimData,
  heuristicResult: PredictionResult,
  question: string,
  chatHistory: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Please configure your Gemini API Key to use the interactive Copilot.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemContext = `
You are the AI SIU Copilot embedded in an Insurance Fraud Risk Assessment platform.
You are assisting a licensed claims examiner reviewing this specific claim:
Insurance Type: ${claim.type.toUpperCase()}
Risk Score: ${heuristicResult.fraudProbability}% (${heuristicResult.riskLevel})
Summary: ${heuristicResult.claimSummary.insuranceTypeDisplay} | Amount: ${heuristicResult.claimSummary.claimAmountDisplay} | Incident: ${heuristicResult.claimSummary.incidentType}
Heuristic Flags: ${heuristicResult.riskFactors.map(f => f.title).join(', ')}

Raw Claim Parameters:
${JSON.stringify(claim.data, null, 2)}

Provide professional, concise, and tactical answers to assist the investigator. If asked about investigative strategy, medical codes, collision forensics, or legality, provide clear, practical guidance.
`;

  const contents = [
    { role: 'user', parts: [{ text: systemContext }] },
    { role: 'model', parts: [{ text: 'Understood. I am ready to assist with the forensic evaluation of this claim.' }] },
    ...chatHistory.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    { role: 'user', parts: [{ text: question }] }
  ];

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: {
      temperature: 0.4,
    }
  });

  return response.text || 'No response generated.';
}

/** Explains an immutable backend ML result; Gemini does not return or alter a score. */
export async function explainModelPrediction(
  result: ModelPrediction,
  features: Record<string, string | number>,
): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const probability = result.fraud_probability === null
      ? 'not provided by the classifier'
      : `${(result.fraud_probability * 100).toFixed(2)}%`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        'Explain this existing machine-learning result for an academic claims-review demonstration in plain language.',
        'Treat the model output as fixed. Do not change the class, invent a different probability, or claim fraud as a fact.',
        'State that it is a model signal requiring human review and that this trained model has low fraud recall.',
        `Model: ${result.model_name}`,
        `Predicted class: ${result.prediction} (${result.prediction_label})`,
        `Fraud probability: ${probability}`,
        `Classification threshold: ${result.classification_threshold}`,
        `Input features: ${JSON.stringify(features)}`,
      ].join('\n'),
      config: { temperature: 0.2 },
    });
    return response.text?.trim() || null;
  } catch (error) {
    console.warn('Gemini model explanation unavailable:', error);
    return null;
  }
}
