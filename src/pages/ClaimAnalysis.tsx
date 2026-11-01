import React, { useState } from 'react';
import { InsuranceType, CarInsuranceClaim, HealthInsuranceClaim, PredictionResult, ClaimData } from '../types';
import { ClaimForm } from '../components/ClaimForm';
import { LoadingState } from '../components/LoadingState';
import { ResultCard } from '../components/ResultCard';
import { GeminiSettingsModal } from '../components/GeminiSettingsModal';
import { analyzeClaim } from '../services/prediction';

interface ClaimAnalysisProps {
  initialType?: InsuranceType;
  onBackToDashboard: () => void;
}

export const ClaimAnalysis: React.FC<ClaimAnalysisProps> = ({
  initialType = 'car',
  onBackToDashboard,
}) => {
  const [insuranceType, setInsuranceType] = useState<InsuranceType>(initialType);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [currentClaimData, setCurrentClaimData] = useState<ClaimData | null>(null);
  const [geminiModalOpen, setGeminiModalOpen] = useState(false);

  const handleSubmitCarClaim = async (data: CarInsuranceClaim) => {
    if (isLoading) return; // Prevent duplicate submissions
    setIsLoading(true);
    setPredictionResult(null);
    const claimPayload: ClaimData = { type: 'car', data };
    setCurrentClaimData(claimPayload);

    try {
      const result = await analyzeClaim(claimPayload);
      setPredictionResult(result);
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitHealthClaim = async (data: HealthInsuranceClaim) => {
    if (isLoading) return;
    setIsLoading(true);
    setPredictionResult(null);
    const claimPayload: ClaimData = { type: 'health', data };
    setCurrentClaimData(claimPayload);

    try {
      const result = await analyzeClaim(claimPayload);
      setPredictionResult(result);
    } catch (err) {
      console.error('Prediction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setPredictionResult(null);
    setCurrentClaimData(null);
    setIsLoading(false);
    // Smoothly scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="claim-analysis-page" className="max-w-5xl mx-auto py-2">
      {/* 1. Loading State */}
      {isLoading && (
        <div className="py-12">
          <LoadingState insuranceType={insuranceType} />
        </div>
      )}

      {/* 2. Result State */}
      {!isLoading && predictionResult && (
        <div className="py-4">
          <ResultCard
            result={predictionResult}
            claimData={currentClaimData}
            onAnalyzeAnother={handleAnalyzeAnother}
            onBackToDashboard={onBackToDashboard}
            onOpenGeminiSettings={() => setGeminiModalOpen(true)}
          />
        </div>
      )}

      {/* 3. Form Input State */}
      {!isLoading && !predictionResult && (
        <ClaimForm
          insuranceType={insuranceType}
          onSelectType={(type) => setInsuranceType(type)}
          onSubmitCarClaim={handleSubmitCarClaim}
          onSubmitHealthClaim={handleSubmitHealthClaim}
          isSubmitting={isLoading}
        />
      )}

      {/* Gemini Settings Modal */}
      <GeminiSettingsModal
        isOpen={geminiModalOpen}
        onClose={() => setGeminiModalOpen(false)}
      />
    </div>
  );
};
