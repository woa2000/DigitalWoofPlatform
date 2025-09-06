/**
 * @fileoverview Overview Section Component
 * Executive summary and brand overview
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { FileText, Building, Users, Target, Lightbulb } from 'lucide-react';
import type { RenderedManual, ValidationResult } from '../../../../../shared/types/manual';

interface OverviewSectionProps {
  manual?: RenderedManual;
  currentSubsection?: string;
  onSubsectionChange?: (subsectionId: string) => void;
  onNavigateToSection?: (sectionId: string, subsectionId?: string) => void;
  validation?: ValidationResult;
  isLoading?: boolean;
}

function OverviewSection({
  manual,
  currentSubsection,
  onSubsectionChange,
  onNavigateToSection,
  validation,
  isLoading = false
}: OverviewSectionProps) {
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!manual) {
    return (
      <div className="p-6">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Manual não encontrado. Verifique se o Brand Voice foi gerado corretamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const brandVoice = manual.brandVoice;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold flex items-center space-x-2">
          <FileText className="h-6 w-6 text-blue-600" />
          <span>Visão Geral</span>
        </h2>
        <p className="text-muted-foreground">
          Resumo executivo da identidade e posicionamento da marca
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Informações da Marca</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-lg">{brandVoice.brand.name}</h4>
              <div className="flex space-x-2 mt-2">
                <Badge variant="outline">{brandVoice.brand.segment}</Badge>
                <Badge variant="outline">{brandVoice.brand.businessType}</Badge>
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Valores da Marca</h5>
              <div className="space-y-1">
                {brandVoice.brand.values.map((value, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{value.name}</span>
                    <Badge variant="secondary">{value.weight}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Público-Alvo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h5 className="font-medium">Audiência Primária</h5>
              <p className="text-sm text-gray-600">{brandVoice.brand.targetAudience.primary}</p>
            </div>
            
            {brandVoice.brand.targetAudience.personas && brandVoice.brand.targetAudience.personas.length > 0 && (
              <div>
                <h5 className="font-medium">Personas</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {brandVoice.brand.targetAudience.personas.map((persona: string, index: number) => (
                    <li key={index}>• {persona}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h5 className="font-medium mb-2">Objetivos</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {brandVoice.brand.targetAudience.goals.map((goal: string, index: number) => (
                  <li key={index}>• {goal}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium mb-2">Pain Points</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {brandVoice.brand.targetAudience.painPoints.map((pain: string, index: number) => (
                  <li key={index}>• {pain}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Navegação Rápida</span>
          </CardTitle>
          <CardDescription>
            Acesse rapidamente as diferentes seções do manual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'visual-identity', name: 'Identidade Visual', description: 'Cores, logo e tipografia' },
              { id: 'voice-tone', name: 'Tom de Voz', description: 'Personalidade e comunicação' },
              { id: 'language', name: 'Linguagem', description: 'Glossário e diretrizes' },
              { id: 'compliance', name: 'Conformidade', description: 'Políticas e regulamentações' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => onNavigateToSection?.(section.id)}
                className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-sm">{section.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{section.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manual Status */}
      {validation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5" />
              <span>Status do Manual</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status Geral</span>
                <Badge variant={validation.valid ? "default" : "destructive"}>
                  {validation.valid ? "Válido" : "Requer Atenção"}
                </Badge>
              </div>
              
              {validation.errors.length > 0 && (
                <div>
                  <h5 className="font-medium text-red-600 mb-2">Erros Encontrados</h5>
                  <ul className="space-y-1 text-sm">
                    {validation.errors.map((error: any, index: number) => (
                      <li key={index} className="text-red-600">• {error.message || error}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validation.warnings.length > 0 && (
                <div>
                  <h5 className="font-medium text-amber-600 mb-2">Avisos</h5>
                  <ul className="space-y-1 text-sm">
                    {validation.warnings.map((warning: any, index: number) => (
                      <li key={index} className="text-amber-600">• {warning.message || warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default OverviewSection;