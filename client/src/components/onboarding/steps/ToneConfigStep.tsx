import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Volume2, Heart, Smile, GraduationCap } from 'lucide-react';
import { OnboardingState, ToneConfiguration } from '@shared/types/onboarding';

interface ToneConfigStepProps {
  state: OnboardingState;
  onNext: () => void;
  onPrevious: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
  updateToneConfig?: (config: ToneConfiguration) => void;
}

const TONE_DIMENSIONS = [
  {
    key: 'confianca' as keyof ToneConfiguration,
    label: 'Confiança',
    icon: Volume2,
    description: 'Quão assertiva e autoritativa é sua comunicação',
    lowLabel: 'Humilde',
    highLabel: 'Assertiva',
    color: 'blue',
    examples: {
      low: 'Sugerimos que considere...',
      medium: 'Recomendamos fortemente...',
      high: 'É essencial que você...'
    }
  },
  {
    key: 'acolhimento' as keyof ToneConfiguration,
    label: 'Acolhimento',
    icon: Heart,
    description: 'Quão calorosa e empática é sua abordagem',
    lowLabel: 'Profissional',
    highLabel: 'Calorosa',
    color: 'pink',
    examples: {
      low: 'Nossos serviços veterinários...',
      medium: 'Cuidamos do seu pet com carinho...',
      high: 'Amamos seu peludo tanto quanto você...'
    }
  },
  {
    key: 'humor' as keyof ToneConfiguration,
    label: 'Humor',
    icon: Smile,
    description: 'Quanto humor e leveza usar na comunicação',
    lowLabel: 'Séria',
    highLabel: 'Divertida',
    color: 'yellow',
    examples: {
      low: 'A prevenção é fundamental para a saúde.',
      medium: 'Manter seu pet saudável é mais fácil do que parece!',
      high: 'Vamos fazer seu peludo dar muitas cambalhota de alegria! 🐕'
    }
  },
  {
    key: 'especializacao' as keyof ToneConfiguration,
    label: 'Especialização',
    icon: GraduationCap,
    description: 'Quanto conhecimento técnico demonstrar',
    lowLabel: 'Simples',
    highLabel: 'Técnica',
    color: 'purple',
    examples: {
      low: 'Vamos cuidar da saúde do seu pet.',
      medium: 'Nossos veterinários especialistas...',
      high: 'Protocolo profilático com imunobiológicos específicos...'
    }
  }
];

export function ToneConfigStep({ state, errors, updateToneConfig }: ToneConfigStepProps) {

  const handleSliderChange = (key: keyof ToneConfiguration, value: number[]) => {
    const newConfig = {
      ...state.toneConfig,
      [key]: value[0]
    };
    updateToneConfig?.(newConfig);
  };

  const getExampleText = (dimension: typeof TONE_DIMENSIONS[0], value: number): string => {
    if (value <= 0.33) return dimension.examples.low;
    if (value <= 0.66) return dimension.examples.medium;
    return dimension.examples.high;
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Check for potentially problematic combinations
  const getWarnings = () => {
    const { confianca, acolhimento, humor, especializacao } = state.toneConfig;
    const warnings = [];

    if (humor > 0.7 && especializacao > 0.7) {
      warnings.push('Muito humor + alta especialização pode confundir a audiência');
    }
    
    if (confianca < 0.3 && especializacao > 0.8) {
      warnings.push('Baixa confiança + alta especialização pode soar insegura');
    }

    if (acolhimento < 0.3 && confianca > 0.8) {
      warnings.push('Muito assertiva + pouco acolhedora pode soar agressiva');
    }

    return warnings;
  };

  const warnings = getWarnings();

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">
          Configure o Tom de Voz da Sua Marca
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Ajuste os sliders abaixo para definir a personalidade da sua comunicação. 
          Os exemplos são atualizados em tempo real para você visualizar o resultado.
        </p>
      </div>

      {/* Tone Sliders */}
      <div className="grid gap-6">
        {TONE_DIMENSIONS.map((dimension) => {
          const value = state.toneConfig[dimension.key];
          const Icon = dimension.icon;

          return (
            <Card key={dimension.key} className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getColorClasses(dimension.color)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{dimension.label}</h4>
                      <p className="text-sm text-gray-600">{dimension.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={getColorClasses(dimension.color)}>
                    {Math.round(value * 100)}%
                  </Badge>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{dimension.lowLabel}</span>
                    <span>{dimension.highLabel}</span>
                  </div>
                  <Slider
                    value={[value]}
                    onValueChange={(newValue) => handleSliderChange(dimension.key, newValue)}
                    max={1}
                    min={0}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                {/* Example */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Exemplo com {Math.round(value * 100)}% de {dimension.label.toLowerCase()}:
                      </p>
                      <p className="text-sm italic text-gray-900">
                        "{getExampleText(dimension, value)}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="space-y-1">
              <p className="font-medium">Atenção às combinações:</p>
              {warnings.map((warning, index) => (
                <p key={index} className="text-sm">• {warning}</p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Preview Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <span>Preview do Tom de Voz</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Perfil:</span>
                <div className="mt-1 space-y-1">
                  {TONE_DIMENSIONS.map(dim => (
                    <div key={dim.key} className="flex justify-between">
                      <span className="text-gray-600">{dim.label}:</span>
                      <span className="font-medium">{Math.round(state.toneConfig[dim.key] * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Características:</span>
                <div className="mt-1 space-y-1 text-gray-600">
                  <p>• {state.toneConfig.confianca > 0.6 ? 'Comunicação assertiva' : 'Abordagem humilde'}</p>
                  <p>• {state.toneConfig.acolhimento > 0.6 ? 'Tom caloroso' : 'Estilo profissional'}</p>
                  <p>• {state.toneConfig.humor > 0.6 ? 'Com leveza e humor' : 'Comunicação séria'}</p>
                  <p>• {state.toneConfig.especializacao > 0.6 ? 'Linguagem técnica' : 'Linguagem simples'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {errors.tone && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.tone}
          </AlertDescription>
        </Alert>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        <p>
          💡 Dica: Para marcas pet, recomendamos acolhimento alto (70-90%) e 
          confiança moderada a alta (60-80%) para transmitir cuidado e segurança.
        </p>
      </div>
    </div>
  );
}