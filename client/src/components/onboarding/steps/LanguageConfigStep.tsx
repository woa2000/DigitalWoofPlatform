import React, { useState } from 'react';
import { OnboardingState, LanguageConfiguration } from '@shared/types/onboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

interface LanguageConfigStepProps {
  state: OnboardingState;
  onNext: () => void;
  onPrevious: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
  updateLanguageConfig?: (config: LanguageConfiguration) => void;
}

export function LanguageConfigStep({ 
  state, 
  onNext, 
  onPrevious, 
  errors, 
  isLoading,
  updateLanguageConfig
}: LanguageConfigStepProps) {
  const [preferredInput, setPreferredInput] = useState('');
  const [avoidedInput, setAvoidedInput] = useState('');
  const [ctaInput, setCTAInput] = useState('');

  const preferredTerms = state.languageConfig?.preferredTerms || [];
  const avoidedTerms = state.languageConfig?.avoidTerms || [];
  const preferredCTAs = state.languageConfig?.defaultCTAs || [];

  const addTerm = (type: 'preferred' | 'avoided' | 'cta') => {
    const input = type === 'preferred' ? preferredInput : 
                  type === 'avoided' ? avoidedInput : ctaInput;
    
    if (!input.trim()) return;

    const newConfig = {
      ...state.languageConfig,
      [type === 'preferred' ? 'preferredTerms' : 
       type === 'avoided' ? 'avoidTerms' : 'defaultCTAs']: [
        ...(type === 'preferred' ? preferredTerms : 
            type === 'avoided' ? avoidedTerms : preferredCTAs),
        input.trim()
      ]
    };

    // Update state through parent component
    updateLanguageConfig?.(newConfig);
    
    if (type === 'preferred') setPreferredInput('');
    else if (type === 'avoided') setAvoidedInput('');
    else setCTAInput('');
  };

  const removeTerm = (type: 'preferred' | 'avoided' | 'cta', index: number) => {
    const currentTerms = type === 'preferred' ? preferredTerms :
                        type === 'avoided' ? avoidedTerms : preferredCTAs;
    
    const newTerms = currentTerms.filter((_: string, i: number) => i !== index);
    const newConfig = {
      ...state.languageConfig,
      [type === 'preferred' ? 'preferredTerms' : 
       type === 'avoided' ? 'avoidTerms' : 'defaultCTAs']: newTerms
    };
    
    // Update state through parent component
    updateLanguageConfig?.(newConfig);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    type: 'preferred' | 'avoided' | 'cta'
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTerm(type);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Configuração de Linguagem
        </h2>
        <p className="text-muted-foreground text-lg">
          Defina termos e expressões que sua marca deve usar ou evitar
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Termos Preferidos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Termos Preferidos
            </CardTitle>
            <CardDescription>
              Palavras e expressões que sua marca deve usar frequentemente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ex: inovador, sustentável, qualidade..."
                value={preferredInput}
                onChange={(e) => setPreferredInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'preferred')}
                className="flex-1"
              />
              <Button 
                onClick={() => addTerm('preferred')}
                size="sm"
                disabled={!preferredInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[2rem]">
              {preferredTerms.map((term: string, index: number) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  {term}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeTerm('preferred', index)}
                  />
                </Badge>
              ))}
              {preferredTerms.length === 0 && (
                <span className="text-sm text-muted-foreground italic">
                  Nenhum termo adicionado ainda
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Termos a Evitar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              Termos a Evitar
            </CardTitle>
            <CardDescription>
              Palavras que sua marca deve evitar usar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ex: barato, problemático, limitado..."
                value={avoidedInput}
                onChange={(e) => setAvoidedInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, 'avoided')}
                className="flex-1"
              />
              <Button 
                onClick={() => addTerm('avoided')}
                size="sm"
                disabled={!avoidedInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[2rem]">
              {avoidedTerms.map((term: string, index: number) => (
                <Badge 
                  key={index}
                  variant="secondary"
                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                >
                  {term}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => removeTerm('avoided', index)}
                  />
                </Badge>
              ))}
              {avoidedTerms.length === 0 && (
                <span className="text-sm text-muted-foreground italic">
                  Nenhum termo adicionado ainda
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTAs Preferidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Calls to Action (CTAs) Preferidas
          </CardTitle>
          <CardDescription>
            Expressões de chamada para ação que funcionam bem com sua marca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Descubra mais, Comece agora, Transforme sua vida..."
              value={ctaInput}
              onChange={(e) => setCTAInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, 'cta')}
              className="flex-1"
            />
            <Button 
              onClick={() => addTerm('cta')}
              size="sm"
              disabled={!ctaInput.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {preferredCTAs.map((cta: string, index: number) => (
              <Badge 
                key={index}
                variant="secondary"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              >
                {cta}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => removeTerm('cta', index)}
                />
              </Badge>
            ))}
            {preferredCTAs.length === 0 && (
              <span className="text-sm text-muted-foreground italic">
                Nenhuma CTA adicionada ainda
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Exemplo de Aplicação */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Exemplo de Aplicação</CardTitle>
          <CardDescription>
            Veja como essas configurações influenciam o conteúdo gerado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">Post de exemplo:</h4>
            <p className="text-sm text-gray-700 mb-3">
              {preferredTerms.length > 0 ? (
                <>
                  "Nossa <span className="bg-green-100 text-green-800 px-1 rounded">
                    {preferredTerms[0]}
                  </span> solução oferece{' '}
                  {preferredTerms.length > 1 && (
                    <span className="bg-green-100 text-green-800 px-1 rounded">
                      {preferredTerms[1]}
                    </span>
                  )}{' '}
                  para transformar seu negócio.{' '}
                  {preferredCTAs.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 px-1 rounded font-medium">
                      {preferredCTAs[0]}
                    </span>
                  )}!"
                </>
              ) : (
                <span className="text-gray-500 italic">
                  Adicione termos preferidos para ver o exemplo
                </span>
              )}
            </p>
            {avoidedTerms.length > 0 && (
              <p className="text-xs text-red-600">
                ❌ Evitando termos como: {avoidedTerms.join(', ')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Corrija os seguintes problemas:
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}