import React, { useState } from 'react';
import { InsuranceType } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Dashboard } from './pages/Dashboard';
import { ClaimAnalysis } from './pages/ClaimAnalysis';
import { About } from './pages/About';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'claim-analysis' | 'about'>('dashboard');
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<InsuranceType>('car');

  const handleStartAnalysis = (type: InsuranceType) => {
    setSelectedInsuranceType(type);
    setCurrentPage('claim-analysis');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (page: 'dashboard' | 'claim-analysis' | 'about') => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-[#2a2a2a] selection:bg-[#eadbd5] selection:text-[#34221c]">
      {/* Top Navigation */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-5 sm:px-8 lg:px-10 py-8 sm:py-10">
        {currentPage === 'dashboard' && (
          <Dashboard
            onStartAnalysis={handleStartAnalysis}
            onNavigateToAbout={() => handleNavigate('about')}
          />
        )}

        {currentPage === 'claim-analysis' && (
          <ClaimAnalysis
            key={selectedInsuranceType}
            initialType={selectedInsuranceType}
            onBackToDashboard={() => handleNavigate('dashboard')}
          />
        )}

        {currentPage === 'about' && <About />}
      </main>

      {/* Minimal Footer */}
      <Footer />
    </div>
  );
}
