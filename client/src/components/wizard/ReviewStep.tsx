import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Edit, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Target, 
  Calendar,
  Globe,
  Users,
  TrendingUp,
  FileText,
  Download,
  Share,
  Play,
  Pause,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface ReviewStepProps {
  templateId: string;
  personalization: any;
  configuration: any;
  onEdit: (step: number) => void;
  onSaveDraft: () => void;
  onCreateCampaign: () => void;
  onBack: () => void;
  loading?: boolean;
}

interface CampaignSummary {
  template: {
    id: string;
    name: string;
    category: string;
  };
  personalization: {
    tone: string;
    targetAudience: string;
    objectives: string[];
    customizations: number;
  };
  configuration: {
    name: string;
    duration: string;
    channels: string[];
    goals: string[];
    estimatedReach: number;
    estimatedCost: number;
  };
}

interface ComplianceCheck {
  category: string;
  status: 'approved' | 'warning' | 'error';
  message: string;
  recommendations?: string[];
}

const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  {
    category: 'Regulamentação CFMV',
    status: 'approved',
    message: 'Conteúdo está em conformidade com as diretrizes do CFMV'
  },
  {
    category: 'LGPD',
    status: 'approved',
    message: 'Tratamento de dados pessoais adequado'
  },
  {
    category: 'Publicidade Veterinária',
    status: 'warning',
    message: 'Verifique se não há promessas de cura ou tratamento',
    recommendations: [
      'Evitar termos como "cura garantida"',
      'Focar em prevenção e bem-estar'
    ]
  },
  {
    category: 'Medicamentos',
    status: 'approved',
    message: 'Não há menção inadequada de medicamentos'
  }
];

export function ReviewStep({
  templateId,
  personalization,
  configuration,
  onEdit,
  onSaveDraft,
  onCreateCampaign,
  onBack,
  loading = false
}: ReviewStepProps) {
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [readyToLaunch, setReadyToLaunch] = useState(false);

  useEffect(() => {
    // Generate campaign summary from props
    const campaignSummary: CampaignSummary = {
      template: {
        id: templateId,
        name: 'Template Selecionado', // This would come from template data
        category: 'Campanha Preventiva'
      },
      personalization: {
        tone: personalization?.tone || 'Não definido',
        targetAudience: personalization?.targetAudience || 'Não definido',
        objectives: personalization?.objectives || [],
        customizations: Object.keys(personalization || {}).length
      },
      configuration: {
        name: configuration?.name || 'Campanha sem nome',
        duration: configuration?.duration?.startDate && configuration?.duration?.endDate 
          ? `${configuration.duration.startDate} até ${configuration.duration.endDate}`
          : 'Duração não definida',
        channels: Object.entries(configuration?.channels || {})
          .filter(([_, config]) => (config as any)?.enabled)
          .map(([channel]) => channel),
        goals: configuration?.tracking?.goals || [],
        estimatedReach: Math.floor(Math.random() * 1000) + 500, // Mock calculation
        estimatedCost: Math.floor(Math.random() * 500) + 200 // Mock calculation
      }
    };

    setSummary(campaignSummary);
    
    // Check if ready to launch
    const hasValidConfig = campaignSummary.configuration.name !== 'Campanha sem nome' &&
                          campaignSummary.configuration.channels.length > 0 &&
                          campaignSummary.configuration.goals.length > 0;
    
    const hasValidPersonalization = campaignSummary.personalization.tone !== 'Não definido' &&
                                  campaignSummary.personalization.targetAudience !== 'Não definido';

    setReadyToLaunch(hasValidConfig && hasValidPersonalization);
  }, [templateId, personalization, configuration]);

  const getComplianceStatus = () => {
    const errors = COMPLIANCE_CHECKS.filter(check => check.status === 'error').length;
    const warnings = COMPLIANCE_CHECKS.filter(check => check.status === 'warning').length;
    const approved = COMPLIANCE_CHECKS.filter(check => check.status === 'approved').length;

    if (errors > 0) return { status: 'error', label: 'Precisa de correções', color: 'red' };
    if (warnings > 0) return { status: 'warning', label: 'Revisão recomendada', color: 'yellow' };
    return { status: 'approved', label: 'Aprovado', color: 'green' };
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return '📧';
      case 'whatsapp': return '💬';
      case 'instagram': return '📷';
      case 'facebook': return '👍';
      case 'website': return '🌐';
      default: return '📢';
    }
  };

  const complianceStatus = getComplianceStatus();

  if (!summary) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p className="text-sm text-gray-500">Preparando revisão...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Revisão Final da Campanha</h2>
        <p className="text-gray-600 mb-4">
          Revise todos os detalhes antes de criar sua campanha
        </p>
        
        {/* Progress Indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Progresso</span>
            <span>100%</span>
          </div>
          <Progress value={100} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Review Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="schedule">Cronograma</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      {summary.configuration.name}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => onEdit(1)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                  <CardDescription>
                    Baseada no template: {summary.template.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Duração</h4>
                      <p className="text-sm text-gray-600">{summary.configuration.duration}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Tom</h4>
                      <p className="text-sm text-gray-600 capitalize">{summary.personalization.tone}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Público-Alvo</h4>
                    <p className="text-sm text-gray-600">{summary.personalization.targetAudience}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-2">Objetivos</h4>
                    <div className="flex flex-wrap gap-1">
                      {summary.personalization.objectives.map((objective, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {objective}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Canais de Distribuição
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => onEdit(3)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {summary.configuration.channels.map((channel, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className="text-lg">{getChannelIcon(channel)}</span>
                        <span className="text-sm font-medium capitalize">{channel}</span>
                      </div>
                    ))}
                  </div>
                  {summary.configuration.channels.length === 0 && (
                    <p className="text-sm text-gray-500 italic">Nenhum canal configurado</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Metas e Objetivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {summary.configuration.goals.map((goal, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))}
                  </div>
                  {summary.configuration.goals.length === 0 && (
                    <p className="text-sm text-gray-500 italic">Nenhuma meta definida</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Content Preview Tab */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Preview do Conteúdo
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => onEdit(2)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Personalizar
                    </Button>
                  </div>
                  <CardDescription>
                    Visualização do conteúdo personalizado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summary.configuration.channels.map((channel, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{getChannelIcon(channel)}</span>
                          <h4 className="font-medium capitalize">{channel}</h4>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <div className="text-sm text-gray-600">
                            <p><strong>Título:</strong> Cuide da saúde do seu pet com carinho 🐾</p>
                            <p className="mt-2">
                              <strong>Conteúdo:</strong> A prevenção é o melhor cuidado que você pode oferecer ao seu companheiro. 
                              Agende uma consulta preventiva e garanta muitos anos de alegria juntos!
                            </p>
                            <p className="mt-2">
                              <strong>Call to Action:</strong> Agende já!
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Cronograma de Execução
                  </CardTitle>
                  <CardDescription>
                    Quando e como sua campanha será executada
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Início</h4>
                        <p className="text-sm text-gray-600">
                          {configuration?.duration?.startDate || 'Não definido'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Término</h4>
                        <p className="text-sm text-gray-600">
                          {configuration?.duration?.endDate || 'Não definido'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {summary.configuration.channels.map((channel, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getChannelIcon(channel)}</span>
                            <span className="font-medium capitalize">{channel}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Configuração específica do canal
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Verificação de Compliance
                  </CardTitle>
                  <CardDescription>
                    Conformidade com regulamentações veterinárias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {COMPLIANCE_CHECKS.map((check, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 mt-0.5">
                          {check.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                          {check.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{check.category}</h4>
                          <p className="text-sm text-gray-600 mt-1">{check.message}</p>
                          {check.recommendations && (
                            <ul className="mt-2 text-xs text-gray-500 list-disc list-inside">
                              {check.recommendations.map((rec, recIdx) => (
                                <li key={recIdx}>{rec}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Action Panel */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Resumo Executivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge 
                    variant={readyToLaunch ? "default" : "secondary"}
                    className={readyToLaunch ? "bg-green-500" : ""}
                  >
                    {readyToLaunch ? "Pronto" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Compliance:</span>
                  <Badge 
                    variant="secondary"
                    className={`${
                      complianceStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                      complianceStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}
                  >
                    {complianceStatus.label}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Metrics */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Estimativas</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Alcance:</span>
                    <span className="font-medium">{summary.configuration.estimatedReach.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo:</span>
                    <span className="font-medium">R$ {summary.configuration.estimatedCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Canais:</span>
                    <span className="font-medium">{summary.configuration.channels.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personalizações:</span>
                    <span className="font-medium">{summary.personalization.customizations}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={onSaveDraft}
                  variant="outline" 
                  className="w-full"
                  disabled={loading}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Salvar Rascunho
                </Button>

                <Button 
                  onClick={onCreateCampaign}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={!readyToLaunch || loading}
                >
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Criar Campanha
                    </>
                  )}
                </Button>

                {!readyToLaunch && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Complete todas as configurações para criar a campanha.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Configuração
        </Button>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onSaveDraft} disabled={loading}>
            Salvar Rascunho
          </Button>
          <Button 
            onClick={onCreateCampaign}
            disabled={!readyToLaunch || loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Criando...' : 'Criar Campanha'}
          </Button>
        </div>
      </div>
    </div>
  );
}