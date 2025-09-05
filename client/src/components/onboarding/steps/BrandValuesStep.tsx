import React, { useState } from 'react';
import { OnboardingState } from '@shared/types/onboarding';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, Plus, X } from 'lucide-react';

interface BrandValuesStepProps {
  state: OnboardingState;
  onNext: () => void;
  onPrevious: () => void;
  errors: Record<string, string>;
  isLoading: boolean;
}

export function BrandValuesStep({ 
  state, 
  onNext, 
  onPrevious, 
  errors, 
  isLoading 
}: BrandValuesStepProps) {
  const [newValueName, setNewValueName] = useState('');
  const [newValueDescription, setNewValueDescription] = useState('');
  const [newValueWeight, setNewValueWeight] = useState([0.5]);

  const brandValues = state.brandValues;
  const values = brandValues?.values || [];
  const mission = brandValues?.mission || '';

  const addValue = () => {
    if (!newValueName.trim()) return;

    const newValue = {
      name: newValueName.trim(),
      description: newValueDescription.trim() || undefined,
      weight: newValueWeight[0]
    };

    // This would be handled by parent component through useOnboarding hook
    // For now, just reset the form
    setNewValueName('');
    setNewValueDescription('');
    setNewValueWeight([0.5]);
  };

  const removeValue = (index: number) => {
    // This would be handled by parent component
    console.log('Remove value at index:', index);
  };

  const canAddValue = values.length < 5 && newValueName.trim();

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Valores da Marca
        </h2>
        <p className="text-muted-foreground text-lg">
          Defina a missão e valores fundamentais que guiam sua marca
        </p>
      </div>

      {/* Mission Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Missão da Marca</CardTitle>
          <CardDescription>
            Descreva o propósito principal e objetivo da sua marca (opcional, máx. 200 caracteres)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Textarea
              placeholder="Ex: Transformar vidas através de soluções sustentáveis e inovadoras..."
              value={mission}
              onChange={(e) => {
                // This would be handled by parent component
                console.log('Mission updated:', e.target.value);
              }}
              maxLength={200}
              className="min-h-[100px]"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Missão da marca (opcional)</span>
              <span>{mission.length}/200</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Values */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Valores Fundamentais</CardTitle>
          <CardDescription>
            Adicione até 5 valores que representam o DNA da sua marca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Value */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">Adicionar Novo Valor</h4>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value-name">Nome do Valor *</Label>
                <Input
                  id="value-name"
                  placeholder="Ex: Inovação, Sustentabilidade..."
                  value={newValueName}
                  onChange={(e) => setNewValueName(e.target.value)}
                  maxLength={50}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value-description">Descrição (opcional)</Label>
                <Input
                  id="value-description"
                  placeholder="Breve explicação do valor..."
                  value={newValueDescription}
                  onChange={(e) => setNewValueDescription(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Importância (0-100%)</Label>
              <div className="px-3">
                <Slider
                  value={newValueWeight}
                  onValueChange={setNewValueWeight}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Menos importante</span>
                  <span className="font-medium">
                    {Math.round(newValueWeight[0] * 100)}%
                  </span>
                  <span>Muito importante</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={addValue}
              disabled={!canAddValue}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Valor ({values.length}/5)
            </Button>
          </div>

          {/* Current Values */}
          <div className="space-y-3">
            <h4 className="font-medium">Valores Adicionados</h4>
            
            {values.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum valor adicionado ainda</p>
                <p className="text-sm">Adicione pelo menos um valor para continuar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {values.map((value, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-medium">{value.name}</h5>
                            <Badge variant="secondary">
                              {Math.round(value.weight * 100)}%
                            </Badge>
                          </div>
                          {value.description && (
                            <p className="text-sm text-muted-foreground">
                              {value.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeValue(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Disclaimer */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-amber-800">
                Aviso de Conformidade
              </h4>
              <p className="text-sm text-amber-700">
                Os valores e missão definidos aqui serão utilizados para gerar conteúdo 
                automatizado. Certifique-se de que estão alinhados com as diretrizes 
                de compliance da sua empresa e regulamentações aplicáveis ao seu setor.
              </p>
              <div className="text-xs text-amber-600 space-y-1">
                <p>• Conteúdo gerado será baseado nos valores configurados</p>
                <p>• Revisar regularmente a aplicação dos valores no conteúdo</p>
                <p>• Garantir conformidade com normas setoriais específicas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {values.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg">Preview dos Valores</CardTitle>
            <CardDescription>
              Como seus valores aparecerão no Brand Voice JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-lg border font-mono text-sm">
              <div className="text-gray-600">brand_voice.json</div>
              <pre className="mt-2 whitespace-pre-wrap">
{`{
  "brand_values": {`}
{mission && `
    "mission": "${mission}",`}
{`
    "values": [`}
{values.map((value, index) => `
      {
        "name": "${value.name}",${value.description ? `
        "description": "${value.description}",` : ''}
        "weight": ${value.weight.toFixed(1)}
      }${index < values.length - 1 ? ',' : ''}`).join('')}
{`
    ]
  }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={isLoading}
        >
          Voltar
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={isLoading || values.length === 0}
          className="min-w-[120px]"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </div>
          ) : (
            'Continuar'
          )}
        </Button>
      </div>
    </div>
  );
}