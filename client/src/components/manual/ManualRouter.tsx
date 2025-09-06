import React, { Suspense } from 'react';
import { useLocation } from 'wouter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useManualData } from '@/hooks/useManualData';
import { AlertTriangle, Home, ChevronRight } from 'lucide-react';

// Import existing sections
import OverviewSection from './sections/OverviewSection';
import VisualIdentitySection from './sections/VisualIdentitySection';
import VoiceSection from './sections/VoiceSection';
import LanguageSection from './sections/LanguageSection';
import ComplianceSection from './sections/ComplianceSection';

interface ManualRouterProps {
  brandId: string;
}

export function ManualRouter({ brandId }: ManualRouterProps) {
  const [location, setLocation] = useLocation();
  // For demo purposes, we'll use a mock userId - in production this would come from auth context
  const { manual, isLoading, error } = useManualData('demo-user', brandId);

  // Parse current section from URL
  const getCurrentSection = (): string => {
    const pathSegments = location.split('/');
    const sectionIndex = pathSegments.findIndex(segment => segment === 'manual-marca');
    if (sectionIndex !== -1 && pathSegments[sectionIndex + 2]) {
      return pathSegments[sectionIndex + 2];
    }
    return 'overview'; // Default section
  };

  const currentSection = getCurrentSection();

  // Navigation functions
  const navigateToSection = (sectionId: string, subsectionId?: string) => {
    if (subsectionId) {
      setLocation(`/manual-marca/${brandId}/${sectionId}/${subsectionId}`);
    } else {
      setLocation(`/manual-marca/${brandId}/${sectionId}`);
    }
  };

  const navigateToHome = () => {
    setLocation('/');
  };

  const getSectionTitle = (sectionId: string) => {
    const sectionTitles: Record<string, string> = {
      'overview': 'Visão Geral',
      'visual-identity': 'Identidade Visual',
      'voice': 'Tom de Voz',
      'language': 'Linguagem',
      'compliance': 'Conformidade',
    };
    return sectionTitles[sectionId] || 'Manual da Marca';
  };

  // Breadcrumb component
  const Breadcrumb = () => (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <span>Manual da Marca</span>
      <ChevronRight className="h-4 w-4" />
      <Badge variant="outline">{getSectionTitle(currentSection)}</Badge>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Carregando manual da marca...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumb />
        <div className="max-w-2xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Erro ao carregar o manual da marca. Verifique se o ID da marca está correto.
            </AlertDescription>
          </Alert>
          <div className="mt-6 text-center">
            <Button onClick={navigateToHome} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render appropriate section
  const renderSection = () => {
    switch (currentSection) {
      case 'overview':
        return <OverviewSection manual={manual} />;
      case 'visual-identity':
        return <VisualIdentitySection manual={manual} />;
      case 'voice':
        return <VoiceSection data={{
          brandPersonality: {
            'Confiável': 85,
            'Amigável': 92,
            'Profissional': 78,
            'Inovador': 65,
            'Empático': 88
          },
          voiceGuidelines: {
            tone: ['Amigável', 'Profissional', 'Confiável', 'Empático'],
            keywords: ['pet', 'saúde', 'cuidado', 'amor', 'família'],
            avoid: ['termos técnicos demais', 'linguagem muito formal', 'jargões médicos']
          },
          messageExamples: {
            posts: [
              'Seu pet merece o melhor cuidado! 🐾',
              'A saúde do seu melhor amigo é nossa prioridade'
            ],
            emails: [
              'Olá! Esperamos que você e seu pet estejam bem.'
            ]
          }
        }} />;
      case 'language':
        return <LanguageSection data={{
          glossary: {
            preferred_terms: [
              { 
                term: 'inovação', 
                usage: 'preferred' as const, 
                context: 'Criação de soluções novas', 
                examples: ['Nossa inovação em tecnologia'],
                category: 'marketing' as const
              },
              { 
                term: 'qualidade', 
                usage: 'preferred' as const, 
                context: 'Excelência em produtos/serviços', 
                examples: ['Qualidade garantida'],
                category: 'general' as const
              }
            ],
            prohibited_terms: [
              { 
                term: 'barato', 
                usage: 'prohibited' as const, 
                context: 'Evitar conotação negativa', 
                examples: ['Use "acessível" ao invés de "barato"'],
                category: 'marketing' as const,
                severity: 'warning' as const
              }
            ]
          },
          ctas: {
            templates: [
              { 
                id: 'cta1',
                text: 'Vamos juntos!', 
                context: 'casual' as const, 
                channel: 'social' as const,
                variations: ['Vamos juntos', 'Junte-se a nós']
              },
              { 
                id: 'cta2',
                text: 'Descubra mais', 
                context: 'educational' as const, 
                channel: 'website' as const,
                variations: ['Saiba mais', 'Descubra', 'Conheça']
              }
            ]
          },
          style: {
            formatting_rules: [
              { 
                rule: 'Use títulos em sentence case', 
                description: 'Primeira letra maiúscula apenas', 
                examples: {
                  correct: 'Nossos serviços',
                  incorrect: 'Nossos Serviços'
                },
                applies_to: ['títulos', 'headers']
              }
            ],
            punctuation_guidelines: ['Use ponto final em frases completas', 'Evite excesso de pontos de exclamação'],
            emoji_policy: {
              usage_level: 'minimal' as const,
              allowed_categories: ['gestos', 'objetos'],
              forbidden_emojis: ['🚫', '💸'],
              context_guidelines: {
                'social_media': 'Permitido uso moderado',
                'email': 'Apenas se apropriado ao contexto'
              }
            }
          }
        }} />;
      case 'compliance':
        return <ComplianceSection data={{
          policies: {
            content_policies: [
              {
                title: 'LGPD Compliance',
                description: 'Diretrizes para proteção de dados',
                rules: ['Consentimento explícito necessário', 'Transparência no uso de dados'],
                examples: {
                  allowed: ['Solicitar consentimento claro', 'Informar uso dos dados'],
                  forbidden: ['Usar dados sem autorização', 'Compartilhar dados sem consentimento']
                },
                severity: 'critical' as const
              }
            ],
            disclaimers: [
              {
                id: 'disclaimer1',
                title: 'Aviso Legal',
                text: 'Este conteúdo é apenas informativo e não substitui orientação profissional',
                usage_context: ['conteúdo de saúde', 'informações médicas'],
                required_fields: ['data', 'versão']
              }
            ]
          },
          checklist: {
            validation_items: [
              {
                id: 'check1',
                rule: 'Legal review',
                description: 'Todo conteúdo deve passar por revisão jurídica',
                severity: 'critical' as const,
                automated: false,
                category: 'legal' as const,
                examples: {
                  compliant: ['Conteúdo revisado pelo jurídico'],
                  non_compliant: ['Conteúdo publicado sem revisão']
                }
              },
              {
                id: 'check2',
                rule: 'Brand consistency',
                description: 'Manter consistência da marca',
                severity: 'warning' as const,
                automated: true,
                category: 'advertising' as const,
                examples: {
                  compliant: ['Uso correto das cores da marca'],
                  non_compliant: ['Cores fora do padrão']
                }
              }
            ],
            compliance_score: 85
          },
          alerts: {
            warning_triggers: [
              {
                keyword: 'medicamento',
                context: 'Uso de termos médicos',
                severity: 'warning' as const,
                message: 'Solicitar revisão especializada para conteúdo médico',
                escalation_required: true
              }
            ]
          }
        }} />;
      default:
        return (
          <div className="max-w-2xl mx-auto">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Seção do manual não encontrada: "{currentSection}"
              </AlertDescription>
            </Alert>
            <div className="mt-6 text-center">
              <Button onClick={() => navigateToSection('overview')} variant="outline">
                Ir para Visão Geral
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Carregando seção...</p>
            </div>
          </div>
        }
      >
        {renderSection()}
      </Suspense>
    </div>
  );
}

export default ManualRouter;