import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Alert, AlertDescription } from '../../ui/alert';
import { Progress } from '../../ui/progress';
import { Separator } from '../../ui/separator';
import { ScrollArea } from '../../ui/scroll-area';
import { Checkbox } from '../../ui/checkbox';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileText,
  Scale,
  AlertCircle,
  Bell,
  Download,
  ExternalLink,
  Zap,
  Clock,
  TrendingUp,
  Info,
  Gavel
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// Temporary types for Compliance Section
interface ContentPolicy {
  title: string;
  description: string;
  rules: string[];
  examples: {
    allowed: string[];
    forbidden: string[];
  };
  severity: 'info' | 'warning' | 'critical';
}

interface ComplianceCheckItem {
  id: string;
  rule: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  automated: boolean;
  category: 'medical' | 'legal' | 'privacy' | 'advertising';
  examples: {
    compliant: string[];
    non_compliant: string[];
  };
  action_required?: string;
}

interface DisclaimerTemplate {
  id: string;
  title: string;
  text: string;
  usage_context: string[];
  required_fields: string[];
}

interface AlertTrigger {
  keyword: string;
  context: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  escalation_required: boolean;
}

interface ComplianceSectionData {
  policies: {
    content_policies: ContentPolicy[];
    disclaimers: DisclaimerTemplate[];
  };
  checklist: {
    validation_items: ComplianceCheckItem[];
    compliance_score: number;
  };
  alerts: {
    warning_triggers: AlertTrigger[];
  };
}

interface ComplianceSectionProps {
  data: ComplianceSectionData;
}

// Policy Card Component
const PolicyCard: React.FC<{ policy: ContentPolicy }> = ({ policy }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Info className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <Card className={cn("transition-all duration-200", getSeverityColor(policy.severity))}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getSeverityIcon(policy.severity)}
              {policy.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {policy.description}
            </CardDescription>
          </div>
          <Badge variant={policy.severity === 'critical' ? 'destructive' : 'secondary'}>
            {policy.severity === 'critical' && 'Crítico'}
            {policy.severity === 'warning' && 'Atenção'}
            {policy.severity === 'info' && 'Informativo'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Rules */}
          <div>
            <h4 className="font-medium mb-2">Regras:</h4>
            <ul className="space-y-1">
              {policy.rules.map((rule, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Examples Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs"
          >
            {isExpanded ? 'Ocultar exemplos' : 'Ver exemplos'}
          </Button>
          
          {/* Examples */}
          {isExpanded && (
            <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Permitido
                </h4>
                <div className="space-y-1">
                  {policy.examples.allowed.map((example, index) => (
                    <div key={index} className="text-xs bg-green-100 border border-green-200 rounded p-2">
                      {example}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Proibido
                </h4>
                <div className="space-y-1">
                  {policy.examples.forbidden.map((example, index) => (
                    <div key={index} className="text-xs bg-red-100 border border-red-200 rounded p-2">
                      {example}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Compliance Checklist Component
const ComplianceChecklist: React.FC<{ items: ComplianceCheckItem[]; onScoreUpdate?: (score: number) => void }> = ({ 
  items, 
  onScoreUpdate 
}) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  
  const handleItemCheck = (itemId: string, checked: boolean) => {
    const newChecked = new Set(checkedItems);
    if (checked) {
      newChecked.add(itemId);
    } else {
      newChecked.delete(itemId);
    }
    setCheckedItems(newChecked);
    
    // Calculate score
    const score = (newChecked.size / items.length) * 100;
    onScoreUpdate?.(score);
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return '🏥';
      case 'legal': return '⚖️';
      case 'privacy': return '🔒';
      case 'advertising': return '📢';
      default: return '📄';
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };
  
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isChecked = checkedItems.has(item.id);
        
        return (
          <Card key={item.id} className={cn(
            "transition-all duration-200",
            isChecked && "border-green-200 bg-green-50/50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={item.id}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleItemCheck(item.id, Boolean(checked))}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <label 
                        htmlFor={item.id} 
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        <span>{getCategoryIcon(item.category)}</span>
                        {item.rule}
                        {item.automated && (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Auto
                          </Badge>
                        )}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                    <Badge variant={item.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                      <span className={getSeverityColor(item.severity)}>
                        {item.severity === 'critical' && 'Crítico'}
                        {item.severity === 'warning' && 'Atenção'}
                        {item.severity === 'info' && 'Info'}
                      </span>
                    </Badge>
                  </div>
                  
                  {item.action_required && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Ação necessária:</strong> {item.action_required}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {/* Examples */}
                  {(item.examples.compliant.length > 0 || item.examples.non_compliant.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-200">
                      {item.examples.compliant.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-green-700 mb-1">✓ Correto:</h5>
                          <div className="space-y-1">
                            {item.examples.compliant.map((example, index) => (
                              <div key={index} className="text-xs bg-green-100 rounded p-2">
                                {example}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {item.examples.non_compliant.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-red-700 mb-1">✗ Incorreto:</h5>
                          <div className="space-y-1">
                            {item.examples.non_compliant.map((example, index) => (
                              <div key={index} className="text-xs bg-red-100 rounded p-2">
                                {example}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// Disclaimers Component
const DisclaimersLibrary: React.FC<{ disclaimers: DisclaimerTemplate[] }> = ({ disclaimers }) => {
  const [copiedDisclaimer, setCopiedDisclaimer] = useState<string | null>(null);
  
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedDisclaimer(id);
      setTimeout(() => setCopiedDisclaimer(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  return (
    <div className="space-y-4">
      {disclaimers.map((disclaimer) => (
        <Card key={disclaimer.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{disclaimer.title}</CardTitle>
                <div className="flex flex-wrap gap-1 mt-2">
                  {disclaimer.usage_context.map((context, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {context}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(disclaimer.text, disclaimer.id)}
                className="h-8 w-8 p-0"
              >
                {copiedDisclaimer === disclaimer.id ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-muted/50 rounded p-3">
                <p className="text-sm leading-relaxed">{disclaimer.text}</p>
              </div>
              
              {disclaimer.required_fields.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Campos obrigatórios:</h4>
                  <div className="flex flex-wrap gap-1">
                    {disclaimer.required_fields.map((field, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// Alert Triggers Component
const AlertTriggersPanel: React.FC<{ triggers: AlertTrigger[] }> = ({ triggers }) => {
  const groupedTriggers = useMemo(() => {
    const groups: Record<string, AlertTrigger[]> = {
      critical: [],
      warning: [],
      info: []
    };
    
    triggers.forEach(trigger => {
      groups[trigger.severity].push(trigger);
    });
    
    return groups;
  }, [triggers]);
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedTriggers).map(([severity, severityTriggers]) => {
        if (severityTriggers.length === 0) return null;
        
        return (
          <div key={severity}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 capitalize">
              {getSeverityIcon(severity)}
              {severity === 'critical' && 'Alertas Críticos'}
              {severity === 'warning' && 'Alertas de Atenção'}
              {severity === 'info' && 'Alertas Informativos'}
            </h3>
            <div className="space-y-3">
              {severityTriggers.map((trigger, index) => (
                <Card key={index} className={cn(
                  severity === 'critical' && "border-red-200 bg-red-50/50",
                  severity === 'warning' && "border-yellow-200 bg-yellow-50/50",
                  severity === 'info' && "border-blue-200 bg-blue-50/50"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {trigger.keyword}
                          </Badge>
                          {trigger.escalation_required && (
                            <Badge variant="destructive" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Escalar
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium mb-1">{trigger.message}</p>
                        <p className="text-xs text-muted-foreground">
                          Contexto: {trigger.context}
                        </p>
                      </div>
                      {getSeverityIcon(trigger.severity)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ComplianceSection: React.FC<ComplianceSectionProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('policies');
  const [complianceScore, setComplianceScore] = useState(data.checklist?.compliance_score || 0);
  
  // Validate required data
  const hasPolicies = data.policies && data.policies.content_policies?.length > 0;
  const hasChecklist = data.checklist && data.checklist.validation_items?.length > 0;
  const hasDisclaimers = data.policies && data.policies.disclaimers?.length > 0;
  const hasAlerts = data.alerts && data.alerts.warning_triggers?.length > 0;
  
  if (!hasPolicies && !hasChecklist && !hasDisclaimers && !hasAlerts) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Dados de compliance não encontrados. Verifique se os dados estão configurados corretamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Compliance e Conformidade</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Políticas, diretrizes e validações para conformidade regulatória.
        </p>
      </div>
      
      <Separator />
      
      {/* Compliance Score */}
      {hasChecklist && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Score de Conformidade
            </CardTitle>
            <CardDescription>
              Porcentagem de itens de conformidade atendidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{Math.round(complianceScore)}%</span>
                <Badge variant={complianceScore >= 80 ? 'default' : complianceScore >= 60 ? 'secondary' : 'destructive'}>
                  {complianceScore >= 80 ? 'Excelente' : complianceScore >= 60 ? 'Boa' : 'Precisa melhorar'}
                </Badge>
              </div>
              <Progress value={complianceScore} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {complianceScore >= 80 ? 
                  'Parabéns! Sua marca está em conformidade com as diretrizes.' :
                  'Continue verificando os itens do checklist para melhorar a conformidade.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Políticas</span>
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="hidden sm:inline">Checklist</span>
          </TabsTrigger>
          <TabsTrigger value="disclaimers" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Disclaimers</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          {hasPolicies ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Políticas de Conteúdo
                </CardTitle>
                <CardDescription>
                  Diretrizes de compliance para criação de conteúdo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {data.policies.content_policies.map((policy, index) => (
                      <PolicyCard key={index} policy={policy} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Políticas de conteúdo não disponíveis</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-6">
          {hasChecklist ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Checklist de Conformidade
                </CardTitle>
                <CardDescription>
                  Verificações obrigatórias para garantir compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <ComplianceChecklist 
                    items={data.checklist.validation_items}
                    onScoreUpdate={setComplianceScore}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Checklist de conformidade não disponível</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Disclaimers Tab */}
        <TabsContent value="disclaimers" className="space-y-6">
          {hasDisclaimers ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Biblioteca de Disclaimers
                </CardTitle>
                <CardDescription>
                  Templates de disclaimers legais e regulatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <DisclaimersLibrary disclaimers={data.policies.disclaimers} />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Biblioteca de disclaimers não disponível</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          {hasAlerts ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Gatilhos de Alerta
                </CardTitle>
                <CardDescription>
                  Palavras-chave e contextos que geram alertas automáticos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <AlertTriggersPanel triggers={data.alerts.warning_triggers} />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Gatilhos de alerta não disponíveis</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center pt-6">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Baixar Relatório
        </Button>
        <Button variant="outline" className="gap-2">
          <Gavel className="h-4 w-4" />
          Guia CFMV
        </Button>
        <Button className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Central de Compliance
        </Button>
      </div>
    </div>
  );
};

export default ComplianceSection;