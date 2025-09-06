import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Alert, AlertDescription } from '../../ui/alert';
import { Separator } from '../../ui/separator';
import { ScrollArea } from '../../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Copy, 
  CheckCircle2, 
  AlertTriangle,
  MessageSquare,
  FileText,
  Zap,
  Globe,
  Download,
  Star,
  ExternalLink,
  Hash,
  Type,
  Quote
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// Temporary types for Language Section
interface GlossaryTerm {
  term: string;
  alternative?: string;
  usage: 'preferred' | 'prohibited' | 'conditional';
  context: string;
  examples: string[];
  category: 'medical' | 'marketing' | 'technical' | 'general';
  severity?: 'info' | 'warning' | 'critical';
}

interface CTATemplate {
  id: string;
  text: string;
  context: 'formal' | 'casual' | 'urgent' | 'educational';
  channel: 'social' | 'email' | 'website' | 'whatsapp' | 'sms';
  variations: string[];
  performance_data?: {
    click_rate: number;
    conversion_rate: number;
    a_b_test_winner: boolean;
  };
}

interface FormattingRule {
  rule: string;
  description: string;
  examples: {
    correct: string;
    incorrect: string;
  };
  applies_to: string[];
}

interface LanguageSectionData {
  glossary: {
    preferred_terms: GlossaryTerm[];
    prohibited_terms: GlossaryTerm[];
  };
  ctas: {
    templates: CTATemplate[];
  };
  style: {
    formatting_rules: FormattingRule[];
    punctuation_guidelines: string[];
    emoji_policy: {
      usage_level: 'none' | 'minimal' | 'moderate' | 'extensive';
      allowed_categories: string[];
      forbidden_emojis: string[];
      context_guidelines: Record<string, string>;
    };
  };
}

interface LanguageSectionProps {
  data: LanguageSectionData;
}

// Glossary Component
const GlossaryTermCard: React.FC<{ term: GlossaryTerm; onCopy: (text: string) => void; copiedTerm?: string | null }> = ({ 
  term, 
  onCopy, 
  copiedTerm 
}) => {
  const getUsageBadgeVariant = (usage: string) => {
    switch (usage) {
      case 'preferred': return 'default';
      case 'prohibited': return 'destructive';
      case 'conditional': return 'secondary';
      default: return 'outline';
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medical': return '🏥';
      case 'marketing': return '📢';
      case 'technical': return '⚙️';
      case 'general': return '📝';
      default: return '📄';
    }
  };
  
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      term.usage === 'prohibited' && "border-red-200 bg-red-50/50",
      term.usage === 'preferred' && "border-green-200 bg-green-50/50"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>{getCategoryIcon(term.category)}</span>
              {term.term}
              {term.alternative && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({term.alternative})
                </span>
              )}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge variant={getUsageBadgeVariant(term.usage)}>
                {term.usage === 'preferred' && '✓ Usar'}
                {term.usage === 'prohibited' && '✗ Evitar'}
                {term.usage === 'conditional' && '⚠ Condicional'}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {term.category}
              </Badge>
              {term.severity && (
                <Badge variant={term.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                  {term.severity}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopy(term.term)}
            className="h-8 w-8 p-0"
          >
            {copiedTerm === term.term ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3">{term.context}</p>
        {term.examples.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Exemplos:</h4>
            <ul className="space-y-1">
              {term.examples.map((example, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <Quote className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// CTA Templates Component
const CTALibrary: React.FC<{ 
  templates: CTATemplate[]; 
  onCopy: (text: string) => void; 
  copiedCTA?: string | null 
}> = ({ templates, onCopy, copiedCTA }) => {
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedContext, setSelectedContext] = useState<string>('all');
  
  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const channelMatch = selectedChannel === 'all' || template.channel === selectedChannel;
      const contextMatch = selectedContext === 'all' || template.context === selectedContext;
      return channelMatch && contextMatch;
    });
  }, [templates, selectedChannel, selectedContext]);
  
  const getContextColor = (context: string) => {
    switch (context) {
      case 'formal': return 'bg-blue-100 text-blue-800';
      case 'casual': return 'bg-green-100 text-green-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'educational': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'social': return '📱';
      case 'email': return '📧';
      case 'website': return '🌐';
      case 'whatsapp': return '💬';
      case 'sms': return '📱';
      default: return '📄';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Select value={selectedContext} onValueChange={setSelectedContext}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Contexto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="formal">Formal</SelectItem>
            <SelectItem value="casual">Casual</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
            <SelectItem value="educational">Educativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* CTA Templates */}
      <div className="grid gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getChannelIcon(template.channel)}</span>
                    <Badge className={getContextColor(template.context)}>
                      {template.context}
                    </Badge>
                    {template.performance_data?.a_b_test_winner && (
                      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Vencedor A/B
                      </Badge>
                    )}
                  </div>
                  
                  <p className="font-medium text-lg mb-2">"{template.text}"</p>
                  
                  {template.performance_data && (
                    <div className="text-sm text-muted-foreground mb-3">
                      CTR: {(template.performance_data.click_rate * 100).toFixed(1)}% | 
                      Conversão: {(template.performance_data.conversion_rate * 100).toFixed(1)}%
                    </div>
                  )}
                  
                  {template.variations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Variações:</h4>
                      <div className="space-y-1">
                        {template.variations.map((variation, index) => (
                          <div key={index} className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                            "{variation}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCopy(template.text)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  {copiedCTA === template.text ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum CTA encontrado com os filtros selecionados</p>
        </div>
      )}
    </div>
  );
};

// Style Guidelines Component
const StyleGuidelines: React.FC<{ 
  styleData: LanguageSectionData['style']; 
  onCopy: (text: string) => void; 
  copiedRule?: string | null 
}> = ({ styleData, onCopy, copiedRule }) => {
  return (
    <div className="space-y-6">
      {/* Formatting Rules */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Type className="h-5 w-5 text-primary" />
          Regras de Formatação
        </h3>
        <div className="space-y-4">
          {styleData.formatting_rules.map((rule, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{rule.rule}</CardTitle>
                <CardDescription>{rule.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Correto
                    </h4>
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <code className="text-sm text-green-800">
                        {rule.examples.correct}
                      </code>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Incorreto
                    </h4>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <code className="text-sm text-red-800">
                        {rule.examples.incorrect}
                      </code>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground">
                    Aplica-se a: {rule.applies_to.join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Punctuation Guidelines */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          Diretrizes de Pontuação
        </h3>
        <Card>
          <CardContent className="p-4">
            <ul className="space-y-2">
              {styleData.punctuation_guidelines.map((guideline, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{guideline}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Emoji Policy */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-lg">😊</span>
          Política de Emojis
        </h3>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Nível de Uso</h4>
              <Badge variant="outline" className="text-sm">
                {styleData.emoji_policy.usage_level === 'none' && 'Não usar emojis'}
                {styleData.emoji_policy.usage_level === 'minimal' && 'Uso mínimo'}
                {styleData.emoji_policy.usage_level === 'moderate' && 'Uso moderado'}
                {styleData.emoji_policy.usage_level === 'extensive' && 'Uso extensivo'}
              </Badge>
            </div>
            
            {styleData.emoji_policy.allowed_categories.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Categorias Permitidas</h4>
                <div className="flex flex-wrap gap-2">
                  {styleData.emoji_policy.allowed_categories.map((category, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {styleData.emoji_policy.forbidden_emojis.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Emojis Proibidos</h4>
                <div className="text-2xl space-x-2">
                  {styleData.emoji_policy.forbidden_emojis.map((emoji, index) => (
                    <span key={index} className="opacity-50">{emoji}</span>
                  ))}
                </div>
              </div>
            )}
            
            {Object.keys(styleData.emoji_policy.context_guidelines).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Diretrizes por Contexto</h4>
                <div className="space-y-2">
                  {Object.entries(styleData.emoji_policy.context_guidelines).map(([context, guideline]) => (
                    <div key={context} className="text-sm">
                      <span className="font-medium capitalize">{context}:</span> {guideline}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const LanguageSection: React.FC<LanguageSectionProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('glossary');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(text);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  // Filter glossary terms
  const filteredTerms = useMemo(() => {
    const allTerms = [...(data.glossary.preferred_terms || []), ...(data.glossary.prohibited_terms || [])];
    return allTerms.filter(term => {
      const matchesSearch = term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           term.context.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data.glossary, searchTerm, selectedCategory]);
  
  // Validate required data
  const hasGlossary = data.glossary && (data.glossary.preferred_terms?.length > 0 || data.glossary.prohibited_terms?.length > 0);
  const hasCTAs = data.ctas && data.ctas.templates?.length > 0;
  const hasStyle = data.style && (data.style.formatting_rules?.length > 0 || data.style.punctuation_guidelines?.length > 0);
  
  if (!hasGlossary && !hasCTAs && !hasStyle) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Dados de linguagem não encontrados. Verifique se os dados estão configurados corretamente.
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
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Linguagem da Marca</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Glossário, CTAs e diretrizes de estilo para comunicação consistente.
        </p>
      </div>
      
      <Separator />
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="glossary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Glossário</span>
          </TabsTrigger>
          <TabsTrigger value="ctas" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">CTAs</span>
          </TabsTrigger>
          <TabsTrigger value="style" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Estilo</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Glossary Tab */}
        <TabsContent value="glossary" className="space-y-6">
          {hasGlossary ? (
            <>
              {/* Search and Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar termos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="medical">Médico</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="technical">Técnico</SelectItem>
                    <SelectItem value="general">Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Terms List */}
              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {filteredTerms.map((term, index) => (
                    <GlossaryTermCard
                      key={`${term.term}-${index}`}
                      term={term}
                      onCopy={copyToClipboard}
                      copiedTerm={copiedItem}
                    />
                  ))}
                  
                  {filteredTerms.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum termo encontrado</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Glossário não disponível</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* CTAs Tab */}
        <TabsContent value="ctas" className="space-y-6">
          {hasCTAs ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Biblioteca de CTAs
                </CardTitle>
                <CardDescription>
                  Templates de chamadas para ação testados e aprovados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <CTALibrary
                    templates={data.ctas.templates}
                    onCopy={copyToClipboard}
                    copiedCTA={copiedItem}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Biblioteca de CTAs não disponível</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Style Tab */}
        <TabsContent value="style" className="space-y-6">
          {hasStyle ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Diretrizes de Estilo
                </CardTitle>
                <CardDescription>
                  Regras de formatação e estilo para comunicação consistente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <StyleGuidelines
                    styleData={data.style}
                    onCopy={copyToClipboard}
                    copiedRule={copiedItem}
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Type className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Diretrizes de estilo não disponíveis</p>
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
          Baixar Glossário
        </Button>
        <Button variant="outline" className="gap-2">
          <Copy className="h-4 w-4" />
          Copiar CTAs
        </Button>
        <Button className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Guia Completo
        </Button>
      </div>
    </div>
  );
};

export default LanguageSection;