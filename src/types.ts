export type InsuranceType = 'car' | 'health';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CarInsuranceClaim {
  // Customer Information
  age: number | '';
  gender: string;
  education: string;
  occupation: string;
  hobbies: string;
  relationship: string;
  monthsAsCustomer: number | '';

  // Policy Information
  policyNumber: string;
  policyState: string;
  policyCsl: string;
  policyDeductible: number | '';
  annualPremium: number | '';
  umbrellaLimit: number | '';

  // Incident Information
  incidentType: string;
  collisionType: string;
  incidentSeverity: string;
  incidentState: string;
  incidentCity: string;
  incidentHour: number | '';
  numberOfVehicles: number | '';
  propertyDamage: string;
  bodilyInjuries: number | '';
  witnesses: number | '';
  policeReportAvailable: string;
  authoritiesContacted: string;

  // Vehicle Information
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number | '';

  // Claim Information
  totalClaimAmount: number | '';
  injuryClaim: number | '';
  propertyClaim: number | '';
  vehicleClaim: number | '';
}

export interface HealthInsuranceClaim {
  // Customer Information
  customerId: string;
  age: number | '';
  gender: string;
  educationLevel: string;
  employmentStatus: string;
  maritalStatus: string;
  numberOfDependents: number | '';

  // Policy Information
  insuranceType: string;
  policyEffectiveDate: string;
  policyExpiryDate: string;
  premiumAmount: number | '';
  policyDuration: number | '';

  // Claim Information
  claimAmount: number | '';
  claimDate: string;
  lossDate: string;
  incidentType: string;
  incidentSeverity: string;
  riskSegmentation: string;
  claimStatus: string;
}

export type ClaimData = 
  | { type: 'car'; data: CarInsuranceClaim }
  | { type: 'health'; data: HealthInsuranceClaim };

export interface RiskFactor {
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface GeminiForensicAnalysis {
  executiveSummary: string;
  fraudPattern: string;
  inconsistencies: string[];
  siuChecklist: string[];
  recommendedAction: string;
  modelUsed: string;
}

export interface PredictionResult {
  riskLevel: RiskLevel;
  fraudProbability: number; // 0 to 100
  prediction: string;
  recommendation: string;
  riskScore: number;
  confidenceScore: number;
  riskFactors: RiskFactor[];
  geminiAnalysis?: GeminiForensicAnalysis | null;
  timestamp: string;
  claimReference: string;
  insuranceType: InsuranceType;
  claimSummary: {
    insuranceTypeDisplay: string;
    claimAmountDisplay: string;
    incidentType: string;
    customerAge: string | number;
    additionalDetails: Record<string, string | number>;
  };
}

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;
