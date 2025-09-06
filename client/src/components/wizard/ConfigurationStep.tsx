import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Globe, 
  Mail, 
  MessageCircle, 
  Instagram,
  Facebook,
  Users,
  Target,
  TrendingUp,
  Settings,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConfigurationStepProps {
  templateId: string;
  personalization: any;
  currentConfiguration: any;
  onConfigurationChange: (configuration: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ChannelConfig {
  enabled: boolean;
  platform: string;
  format: string;
  schedule: {
    frequency: string;
    time: string;
    timezone: string;
    days: string[];
  };
  targeting: {
    audience: string[];
    demographics: any;
    interests: string[];
  };
  budget?: {
    total: number;
    daily: number;
    costPerAction: number;
  };
}

interface CampaignConfiguration {
  name: string;
  description: string;
  duration: {
    startDate: string;
    endDate: string;
    timezone: string;
  };
  channels: {
    email: ChannelConfig;
    whatsapp: ChannelConfig;
    instagram: ChannelConfig;
    facebook: ChannelConfig;
    website: ChannelConfig;
  };
  automation: {
    enabled: boolean;
    triggers: string[];
    rules: any[];
  };
  tracking: {
    goals: string[];
    metrics: string[];
    conversionActions: string[];
  };
  compliance: {
    requireApproval: boolean;
    reviewers: string[];
    autoCompliance: boolean;
  };
}

const CHANNEL_OPTIONS = [
  {
    id: 'email',
    name: 'Email Marketing',
    icon: Mail,
    description: 'Campanhas por email segmentadas',
    formats: ['newsletter', 'promocional', 'educativo', 'follow-up'],
    requirements: ['lista_emails']
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: MessageCircle,
    description: 'Mensagens diretas e automatizadas',
    formats: ['texto', 'imagem', 'documento', 'template'],
    requirements: ['whatsapp_business']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    description: 'Posts, stories e reels',
    formats: ['post', 'story', 'reel', 'carousel'],
    requirements: ['instagram_business']
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    description: 'Posts e anúncios pagos',
    formats: ['post', 'ad', 'event', 'story'],
    requirements: ['facebook_page']
  },
  {
    id: 'website',
    name: 'Website/Blog',
    icon: Globe,
    description: 'Conteúdo para site e blog',
    formats: ['artigo', 'landing_page', 'popup', 'banner'],
    requirements: ['website_acesso']
  }
];

const FREQUENCY_OPTIONS = [
  { value: 'once', label: 'Uma vez' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quinzenal' },
  { value: 'monthly', label: 'Mensal' }
];

const GOAL_OPTIONS = [
  'Aumentar agendamentos',
  'Gerar leads qualificados',
  'Educar clientes',
  'Promover serviços premium',
  'Reduzir no-shows',
  'Fidelizar clientes',
  'Aumentar ticket médio',
  'Conscientizar sobre prevenção'
];

const METRIC_OPTIONS = [
  'Taxa de abertura',
  'Taxa de clique',
  'Conversões',
  'Agendamentos',
  'Leads gerados',
  'Engajamento',
  'Alcance',
  'Impressões'
];

export function ConfigurationStep({
  templateId,
  personalization,
  currentConfiguration,
  onConfigurationChange,
  onNext,
  onBack
}: ConfigurationStepProps) {
  const [configuration, setConfiguration] = useState<CampaignConfiguration>({
    name: currentConfiguration?.name || '',
    description: currentConfiguration?.description || '',
    duration: {
      startDate: currentConfiguration?.duration?.startDate || '',
      endDate: currentConfiguration?.duration?.endDate || '',
      timezone: currentConfiguration?.duration?.timezone || 'America/Sao_Paulo'
    },
    channels: {
      email: {
        enabled: currentConfiguration?.channels?.email?.enabled ?? false,
        platform: 'mailchimp',
        format: 'newsletter',
        schedule: {
          frequency: 'weekly',
          time: '09:00',
          timezone: 'America/Sao_Paulo',
          days: ['tuesday', 'thursday']
        },
        targeting: {
          audience: [],
          demographics: {},
          interests: []
        }
      },
      whatsapp: {
        enabled: currentConfiguration?.channels?.whatsapp?.enabled ?? false,
        platform: 'whatsapp_business',
        format: 'template',
        schedule: {
          frequency: 'once',
          time: '10:00',
          timezone: 'America/Sao_Paulo',
          days: []
        },
        targeting: {
          audience: [],
          demographics: {},
          interests: []
        }
      },
      instagram: {
        enabled: currentConfiguration?.channels?.instagram?.enabled ?? false,
        platform: 'instagram_business',
        format: 'post',
        schedule: {
          frequency: 'weekly',
          time: '18:00',
          timezone: 'America/Sao_Paulo',
          days: ['monday', 'wednesday', 'friday']
        },
        targeting: {
          audience: [],
          demographics: {},
          interests: []
        }
      },
      facebook: {
        enabled: currentConfiguration?.channels?.facebook?.enabled ?? false,
        platform: 'facebook_page',
        format: 'post',
        schedule: {
          frequency: 'weekly',
          time: '19:00',
          timezone: 'America/Sao_Paulo',
          days: ['tuesday', 'friday']
        },
        targeting: {
          audience: [],
          demographics: {},
          interests: []
        }
      },
      website: {
        enabled: currentConfiguration?.channels?.website?.enabled ?? false,
        platform: 'wordpress',
        format: 'artigo',
        schedule: {
          frequency: 'monthly',
          time: '08:00',
          timezone: 'America/Sao_Paulo',
          days: ['monday']
        },
        targeting: {
          audience: [],
          demographics: {},
          interests: []
        }
      }
    },
    automation: {
      enabled: currentConfiguration?.automation?.enabled ?? false,
      triggers: currentConfiguration?.automation?.triggers || [],
      rules: currentConfiguration?.automation?.rules || []
    },
    tracking: {
      goals: currentConfiguration?.tracking?.goals || [],
      metrics: currentConfiguration?.tracking?.metrics || [],
      conversionActions: currentConfiguration?.tracking?.conversionActions || []
    },
    compliance: {
      requireApproval: currentConfiguration?.compliance?.requireApproval ?? true,
      reviewers: currentConfiguration?.compliance?.reviewers || [],
      autoCompliance: currentConfiguration?.compliance?.autoCompliance ?? false
    }
  });

  // Update parent when configuration changes
  useEffect(() => {
    onConfigurationChange(configuration);
  }, [configuration, onConfigurationChange]);

  const handleChannelToggle = (channelId: string, enabled: boolean) => {
    setConfiguration(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelId]: {
          ...prev.channels[channelId as keyof typeof prev.channels],
          enabled
        }
      }
    }));
  };

  const handleChannelConfigChange = (channelId: string, field: string, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channelId]: {
          ...prev.channels[channelId as keyof typeof prev.channels],
          [field]: value
        }
      }
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setConfiguration(prev => ({
      ...prev,
      tracking: {
        ...prev.tracking,
        goals: prev.tracking.goals.includes(goal)
          ? prev.tracking.goals.filter(g => g !== goal)
          : [...prev.tracking.goals, goal]
      }
    }));
  };

  const handleMetricToggle = (metric: string) => {
    setConfiguration(prev => ({
      ...prev,
      tracking: {
        ...prev.tracking,
        metrics: prev.tracking.metrics.includes(metric)
          ? prev.tracking.metrics.filter(m => m !== metric)
          : [...prev.tracking.metrics, metric]
      }
    }));
  };

  const getEnabledChannels = () => {
    return Object.entries(configuration.channels).filter(([_, config]) => config.enabled);
  };

  const getEstimatedReach = () => {
    const enabledChannels = getEnabledChannels();
    // Mock calculation based on enabled channels
    return enabledChannels.length * 150 + Math.floor(Math.random() * 300);
  };

  const getEstimatedCost = () => {
    const enabledChannels = getEnabledChannels();
    const baseCost = enabledChannels.length * 50;
    const premiumChannels = enabledChannels.filter(([id]) => ['facebook', 'instagram'].includes(id));
    return baseCost + (premiumChannels.length * 100);
  };

  const isValid = () => {
    return configuration.name.trim().length > 0 &&
           configuration.duration.startDate &&
           configuration.duration.endDate &&
           getEnabledChannels().length > 0 &&
           configuration.tracking.goals.length > 0;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Form */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="channels">Canais</TabsTrigger>
              <TabsTrigger value="tracking">Métricas</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            {/* Basic Configuration */}
            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configuração Básica
                  </CardTitle>
                  <CardDescription>
                    Defina as informações fundamentais da campanha
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="campaign-name">Nome da Campanha</Label>
                    <Input
                      id="campaign-name"
                      value={configuration.name}
                      onChange={(e) => setConfiguration(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Campanha Preventiva Outono 2024"
                    />
                  </div>

                  <div>
                    <Label htmlFor="campaign-description">Descrição</Label>
                    <Textarea
                      id="campaign-description"
                      value={configuration.description}
                      onChange={(e) => setConfiguration(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição detalhada dos objetivos e público da campanha..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Data de Início</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={configuration.duration.startDate}
                        onChange={(e) => setConfiguration(prev => ({
                          ...prev,
                          duration: { ...prev.duration, startDate: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">Data de Término</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={configuration.duration.endDate}
                        onChange={(e) => setConfiguration(prev => ({
                          ...prev,
                          duration: { ...prev.duration, endDate: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Channels Configuration */}
            <TabsContent value="channels" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Canais de Comunicação
                  </CardTitle>
                  <CardDescription>
                    Escolha e configure os canais para sua campanha
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {CHANNEL_OPTIONS.map((channel) => {
                      const Icon = channel.icon;
                      const channelConfig = configuration.channels[channel.id as keyof typeof configuration.channels];
                      
                      return (
                        <div key={channel.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-blue-600" />
                              <div>
                                <h4 className="font-medium">{channel.name}</h4>
                                <p className="text-sm text-gray-500">{channel.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={channelConfig.enabled}
                              onCheckedChange={(enabled) => handleChannelToggle(channel.id, enabled)}
                            />
                          </div>

                          {channelConfig.enabled && (
                            <div className="space-y-3 pt-3 border-t">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-sm">Formato</Label>
                                  <Select
                                    value={channelConfig.format}
                                    onValueChange={(value) => handleChannelConfigChange(channel.id, 'format', value)}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {channel.formats.map((format) => (
                                        <SelectItem key={format} value={format}>
                                          {format}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label className="text-sm">Frequência</Label>
                                  <Select
                                    value={channelConfig.schedule.frequency}
                                    onValueChange={(value) => handleChannelConfigChange(channel.id, 'schedule', {
                                      ...channelConfig.schedule,
                                      frequency: value
                                    })}
                                  >
                                    <SelectTrigger className="text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {FREQUENCY_OPTIONS.map((freq) => (
                                        <SelectItem key={freq.value} value={freq.value}>
                                          {freq.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-sm">Horário</Label>
                                  <Input
                                    type="time"
                                    value={channelConfig.schedule.time}
                                    onChange={(e) => handleChannelConfigChange(channel.id, 'schedule', {
                                      ...channelConfig.schedule,
                                      time: e.target.value
                                    })}
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tracking Configuration */}
            <TabsContent value="tracking" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Objetivos e Metas
                  </CardTitle>
                  <CardDescription>
                    Defina os objetivos principais da campanha
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {GOAL_OPTIONS.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => handleGoalToggle(goal)}
                        className={`p-3 text-sm text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                          configuration.tracking.goals.includes(goal)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Métricas de Acompanhamento
                  </CardTitle>
                  <CardDescription>
                    Escolha as métricas que serão monitoradas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {METRIC_OPTIONS.map((metric) => (
                      <div key={metric} className="flex items-center space-x-2">
                        <Checkbox
                          id={metric}
                          checked={configuration.tracking.metrics.includes(metric)}
                          onCheckedChange={() => handleMetricToggle(metric)}
                        />
                        <Label htmlFor={metric} className="text-sm">
                          {metric}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Configuration */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Automação
                  </CardTitle>
                  <CardDescription>
                    Configure regras de automação
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Ativar Automação</Label>
                      <p className="text-sm text-gray-500">
                        Permite execução automática baseada em triggers
                      </p>
                    </div>
                    <Switch
                      checked={configuration.automation.enabled}
                      onCheckedChange={(enabled) => setConfiguration(prev => ({
                        ...prev,
                        automation: { ...prev.automation, enabled }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Compliance e Aprovação
                  </CardTitle>
                  <CardDescription>
                    Configure processo de aprovação e compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Exigir Aprovação</Label>
                      <p className="text-sm text-gray-500">
                        Todo conteúdo será revisado antes da publicação
                      </p>
                    </div>
                    <Switch
                      checked={configuration.compliance.requireApproval}
                      onCheckedChange={(requireApproval) => setConfiguration(prev => ({
                        ...prev,
                        compliance: { ...prev.compliance, requireApproval }
                      }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="font-medium">Auto Compliance</Label>
                      <p className="text-sm text-gray-500">
                        Verificação automática de compliance veterinário
                      </p>
                    </div>
                    <Switch
                      checked={configuration.compliance.autoCompliance}
                      onCheckedChange={(autoCompliance) => setConfiguration(prev => ({
                        ...prev,
                        compliance: { ...prev.compliance, autoCompliance }
                      }))}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Summary Panel */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Resumo da Configuração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Campaign Info */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Campanha</h4>
                <div className="text-sm text-gray-600">
                  <div>Nome: {configuration.name || 'Não definido'}</div>
                  <div>Duração: {configuration.duration.startDate && configuration.duration.endDate 
                    ? `${configuration.duration.startDate} até ${configuration.duration.endDate}`
                    : 'Não definido'
                  }</div>
                </div>
              </div>

              {/* Enabled Channels */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Canais Ativos</h4>
                <div className="flex flex-wrap gap-1">
                  {getEnabledChannels().map(([channelId, config]) => {
                    const channel = CHANNEL_OPTIONS.find(c => c.id === channelId);
                    return (
                      <Badge key={channelId} variant="secondary" className="text-xs">
                        {channel?.name}
                      </Badge>
                    );
                  })}
                  {getEnabledChannels().length === 0 && (
                    <span className="text-sm text-gray-500">Nenhum canal selecionado</span>
                  )}
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Objetivos</h4>
                <div className="text-xs text-gray-600">
                  {configuration.tracking.goals.length > 0 
                    ? configuration.tracking.goals.join(', ')
                    : 'Nenhum objetivo definido'
                  }
                </div>
              </div>

              {/* Estimates */}
              <div className="space-y-2 pt-2 border-t">
                <h4 className="font-medium text-sm">Estimativas</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Alcance estimado:</span>
                    <span className="font-medium">{getEstimatedReach()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo estimado:</span>
                    <span className="font-medium">R$ {getEstimatedCost()}</span>
                  </div>
                </div>
              </div>

              {/* Validation Alerts */}
              <div className="space-y-2">
                {!isValid() && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Complete as configurações obrigatórias:
                      <ul className="mt-1 list-disc list-inside">
                        {!configuration.name && <li>Nome da campanha</li>}
                        {!configuration.duration.startDate && <li>Data de início</li>}
                        {!configuration.duration.endDate && <li>Data de término</li>}
                        {getEnabledChannels().length === 0 && <li>Pelo menos um canal</li>}
                        {configuration.tracking.goals.length === 0 && <li>Pelo menos um objetivo</li>}
                      </ul>
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
          Voltar
        </Button>
        
        <Button 
          onClick={onNext}
          disabled={!isValid()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Continuar para Revisão
        </Button>
      </div>
    </div>
  );
}