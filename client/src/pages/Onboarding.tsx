import React from 'react';
import { RobustOnboardingWizard } from '@/components/onboarding/RobustOnboardingWizard';

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <RobustOnboardingWizard />
    </div>
  );
}