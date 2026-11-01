import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-700">Insurance Fraud Detection System</span>
        </div>
        <div>
          <span>AI-Powered Insurance Claim Risk Assessment Platform</span>
        </div>
      </div>
    </footer>
  );
};
