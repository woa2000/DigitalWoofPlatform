import React from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export function OnboardingNavigationTest() {
  const [, setLocation] = useLocation();

  const testNavigation = () => {
    console.log('Navegando para dashboard...');
    setLocation('/');
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Teste de Navegação do Onboarding</h2>
      <p className="mb-4">
        Este botão simula a finalização do onboarding e deve redirecionar para o dashboard.
      </p>
      <Button onClick={testNavigation}>
        Simular Finalização do Onboarding
      </Button>
    </div>
  );
}