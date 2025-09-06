import React from 'react';
import { 
  Search, 
  Palette, 
  Settings, 
  Eye, 
  Check, 
  ChevronRight,
  AlertCircle 
} from 'lucide-react';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  isCompleted: boolean;
  isActive: boolean;
  isAccessible: boolean;
}

interface WizardProgressProps {
  currentStep: number;
  validation: {
    step1: boolean;
    step2: boolean;
    step3: boolean;
    step4: boolean;
  };
  onStepClick: (step: number) => void;
  progress: number;
  className?: string;
}

const stepConfig = [
  {
    id: 1,
    title: 'Selecionar Template',
    description: 'Escolha o template ideal para sua campanha',
    icon: Search,
  },
  {
    id: 2,
    title: 'Personalizar',
    description: 'Aplique a voz da sua marca ao template',
    icon: Palette,
  },
  {
    id: 3,
    title: 'Configurar',
    description: 'Defina os detalhes da sua campanha',
    icon: Settings,
  },
  {
    id: 4,
    title: 'Revisar',
    description: 'Revise e confirme sua campanha',
    icon: Eye,
  },
];

const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  validation,
  onStepClick,
  progress,
  className = '',
}) => {
  const steps: WizardStep[] = stepConfig.map((config) => {
    const isCompleted = validation[`step${config.id}` as keyof typeof validation];
    const isActive = currentStep === config.id;
    
    // Step is accessible if:
    // 1. It's the current step
    // 2. All previous steps are completed
    let isAccessible = config.id === 1; // Step 1 is always accessible
    if (config.id > 1) {
      for (let i = 1; i < config.id; i++) {
        if (!validation[`step${i}` as keyof typeof validation]) {
          isAccessible = false;
          break;
        }
      }
      if (isAccessible) isAccessible = true;
    }
    
    return {
      ...config,
      isCompleted,
      isActive,
      isAccessible,
    };
  });

  const getStepStatus = (step: WizardStep) => {
    if (step.isCompleted) return 'completed';
    if (step.isActive) return 'active';
    if (step.isAccessible) return 'accessible';
    return 'disabled';
  };

  const getStepClasses = (step: WizardStep) => {
    const status = getStepStatus(step);
    const baseClasses = 'relative flex items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer';
    
    switch (status) {
      case 'completed':
        return `${baseClasses} border-green-500 bg-green-50 hover:bg-green-100`;
      case 'active':
        return `${baseClasses} border-blue-500 bg-blue-50 shadow-md`;
      case 'accessible':
        return `${baseClasses} border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50`;
      case 'disabled':
        return `${baseClasses} border-gray-200 bg-gray-50 cursor-not-allowed opacity-60`;
      default:
        return baseClasses;
    }
  };

  const getIconClasses = (step: WizardStep) => {
    const status = getStepStatus(step);
    
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'active':
        return 'text-blue-600';
      case 'accessible':
        return 'text-gray-600';
      case 'disabled':
        return 'text-gray-400';
      default:
        return 'text-gray-600';
    }
  };

  const handleStepClick = (step: WizardStep) => {
    if (step.isAccessible || step.isCompleted) {
      onStepClick(step.id);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progresso da Campanha
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}% completo
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const IconComponent = step.icon;
          const status = getStepStatus(step);
          
          return (
            <div key={step.id}>
              <div
                onClick={() => handleStepClick(step)}
                className={getStepClasses(step)}
              >
                {/* Step Icon/Number */}
                <div className="flex items-center mr-4">
                  {step.isCompleted ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      status === 'active' 
                        ? 'border-blue-500 bg-blue-500 text-white' 
                        : status === 'accessible'
                        ? 'border-gray-400 text-gray-600'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      {status === 'active' || status === 'accessible' ? (
                        <IconComponent className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-medium">{step.id}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-medium ${
                        status === 'active' ? 'text-blue-900' :
                        status === 'completed' ? 'text-green-900' :
                        status === 'accessible' ? 'text-gray-900' :
                        'text-gray-500'
                      }`}>
                        Step {step.id}: {step.title}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        status === 'active' ? 'text-blue-700' :
                        status === 'completed' ? 'text-green-700' :
                        status === 'accessible' ? 'text-gray-600' :
                        'text-gray-400'
                      }`}>
                        {step.description}
                      </p>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center space-x-2">
                      {!step.isAccessible && !step.isCompleted && (
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      )}
                      
                      {step.isActive && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                      
                      {(step.isAccessible || step.isCompleted) && !step.isActive && (
                        <ChevronRight className={`w-4 h-4 ${getIconClasses(step)}`} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-2">
                  <div className={`w-0.5 h-6 ${
                    step.isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  }`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="w-4 h-4 text-blue-600 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Dicas de Navegação:</p>
            <ul className="space-y-1 text-xs">
              <li>• Complete cada step antes de avançar</li>
              <li>• Seus dados são salvos automaticamente</li>
              <li>• Clique em um step concluído para revisitar</li>
              <li>• Use os botões de navegação para mover-se entre steps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardProgress;