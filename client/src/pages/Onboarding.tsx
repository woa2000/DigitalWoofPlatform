import React from 'react';
import { RobustOnboardingWizard } from '@/components/onboarding/RobustOnboardingWizard';
import { OnboardingNavigationTest } from '@/components/test/OnboardingNavigationTest';

export default function Onboarding() {
  // TODO: Get userId from authentication context
  const userId = 'test-user-123';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Componente de teste temporário */}
      <div className="p-4 bg-yellow-100 border-b border-yellow-300">
        <OnboardingNavigationTest />
      </div>
      
      <RobustOnboardingWizard userId={userId} />
    </div>
  );
}