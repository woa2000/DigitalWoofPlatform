import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { RobustOnboardingWizard } from '@/components/onboarding/RobustOnboardingWizard';

export default function Onboarding() {
  // TODO: Get userId from authentication context
  const userId = 'test-user-123';

  return (
    <DashboardLayout
      title="Onboarding de Marca"
      subtitle="Configure a identidade digital da sua marca"
    >
      <RobustOnboardingWizard userId={userId} />
    </DashboardLayout>
  );
}