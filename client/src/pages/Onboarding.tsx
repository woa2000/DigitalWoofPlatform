import React from 'react';
import { RobustOnboardingWizard } from '@/components/onboarding/RobustOnboardingWizard';

export default function Onboarding() {
  // TODO: Get userId from authentication context
  const userId = 'test-user-123';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <RobustOnboardingWizard userId={userId} />
    </div>
  );
}