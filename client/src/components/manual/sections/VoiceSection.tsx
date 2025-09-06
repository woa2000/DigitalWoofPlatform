import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { Alert, AlertDescription } from '../../ui/alert';
import { Separator } from '../../ui/separator';
import { ScrollArea } from '../../ui/scroll-area';
import { 
  Volume2, 
  Heart, 
  Target, 
  MessageCircle, 
  Lightbulb,
  User,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// Temporary types for Voice Section - will be replaced with proper types
interface BrandPersonality {
  [trait: string]: number;
}

interface VoiceGuidelines {
  tone?: string[];
  keywords?: string[];
  avoid?: string[];
}

interface MessageExamples {
  posts?: string[];
  emails?: string[];
  ads?: string[];
  website?: string[];
}

interface VoiceSectionData {
  brandPersonality: BrandPersonality;
  voiceGuidelines: VoiceGuidelines;
  messageExamples: MessageExamples;
}

interface VoiceSectionProps {
  data: VoiceSectionData;
}

// Radar Chart Component for Brand Personality
const PersonalityRadarChart: React.FC<{ personality: Record<string, number> }> = ({ personality }) => {
  const traits = Object.entries(personality);
  const maxValue = 100;
  const center = 100;
  const radius = 80;
  
  // Calculate points for radar chart
  const points = traits.map((_, index) => {
    const angle = (index * 2 * Math.PI) / traits.length - Math.PI / 2;
    const value = traits[index][1];
    const distance = (value / maxValue) * radius;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y, angle, value, trait: traits[index][0] };
  });
  
  // Create path for the personality shape
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ') + ' Z';
  
  // Grid circles
  const gridCircles = [20, 40, 60, 80].map(r => (
    <circle
      key={r}
      cx={center}
      cy={center}
      r={r}
      fill="none"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.3"
    />
  ));
  
  // Axis lines
  const axisLines = points.map((point, index) => {
    const endX = center + radius * Math.cos(point.angle);
    const endY = center + radius * Math.sin(point.angle);
    return (
      <line
        key={index}
        x1={center}
        y1={center}
        x2={endX}
        y2={endY}
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.3"
      />
    );
  });
  
  return (
    <div className="relative">
      <svg width="200" height="200" className="text-muted-foreground">
        {gridCircles}
        {axisLines}
        <path
          d={pathData}
          fill="hsl(var(--primary))"
          fillOpacity="0.2"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="hsl(var(--primary))"
            />
            <text
              x={center + (radius + 15) * Math.cos(point.angle)}
              y={center + (radius + 15) * Math.sin(point.angle)}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs font-medium fill-current"
            >
              {point.trait}
            </text>
            <text
              x={center + (radius + 25) * Math.cos(point.angle)}
              y={center + (radius + 25) * Math.sin(point.angle) + 10}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {point.value}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// Voice Guidelines Component
const VoiceGuidelines: React.FC<{ guidelines: any }> = ({ guidelines }) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  
  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Tom de Voz */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          Tom de Voz
        </h3>
        <div className="grid gap-3">
          {guidelines.tone?.map((tone: string, index: number) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{tone}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(tone, `tone-${index}`)}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Palavras-chave */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Palavras-chave
        </h3>
        <div className="flex flex-wrap gap-2">
          {guidelines.keywords?.map((keyword: string, index: number) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => copyToClipboard(keyword, `keyword-${index}`)}
            >
              {keyword}
              {copiedItem === `keyword-${index}` && (
                <CheckCircle2 className="h-3 w-3 ml-1 text-green-500" />
              )}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Evitar */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Evitar
        </h3>
        <div className="space-y-2">
          {guidelines.avoid?.map((item: string, index: number) => (
            <Alert key={index} variant="destructive" className="py-2">
              <AlertDescription className="text-sm">
                {item}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>
    </div>
  );
};

// Message Examples Component
const MessageExamples: React.FC<{ examples: any }> = ({ examples }) => {
  const [copiedExample, setCopiedExample] = useState<string | null>(null);
  
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedExample(id);
      setTimeout(() => setCopiedExample(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  
  const exampleCategories = [
    { key: 'posts', title: 'Posts em Redes Sociais', icon: MessageCircle },
    { key: 'emails', title: 'E-mails', icon: ExternalLink },
    { key: 'ads', title: 'Anúncios', icon: TrendingUp },
    { key: 'website', title: 'Website', icon: Lightbulb }
  ];
  
  return (
    <div className="space-y-6">
      {exampleCategories.map(category => {
        const categoryExamples = examples[category.key] || [];
        const Icon = category.icon;
        
        return (
          <div key={category.key}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {category.title}
            </h3>
            <div className="space-y-3">
              {categoryExamples.map((example: string, index: number) => {
                const exampleId = `${category.key}-${index}`;
                return (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-sm leading-relaxed flex-1">{example}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(example, exampleId)}
                        className="h-8 w-8 p-0 flex-shrink-0"
                      >
                        {copiedExample === exampleId ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const VoiceSection: React.FC<VoiceSectionProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('personality');
  
  // Validate required data
  const hasPersonality = data.brandPersonality && Object.keys(data.brandPersonality).length > 0;
  const hasGuidelines = data.voiceGuidelines;
  const hasExamples = data.messageExamples;
  
  if (!hasPersonality && !hasGuidelines && !hasExamples) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Dados de voz da marca não encontrados. Verifique se o brandVoiceData está configurado corretamente.
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
          <Volume2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Voz da Marca</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Como sua marca se comunica e se expressa em todos os pontos de contato com o público.
        </p>
      </div>
      
      <Separator />
      
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personality" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Personalidade</span>
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Diretrizes</span>
          </TabsTrigger>
          <TabsTrigger value="examples" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Exemplos</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Personality Tab */}
        <TabsContent value="personality" className="space-y-6">
          {hasPersonality ? (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Radar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Radar de Personalidade
                  </CardTitle>
                  <CardDescription>
                    Visualização dos traços de personalidade da marca
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <PersonalityRadarChart personality={data.brandPersonality} />
                </CardContent>
              </Card>
              
              {/* Personality Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes da Personalidade</CardTitle>
                  <CardDescription>
                    Intensidade de cada traço da personalidade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(data.brandPersonality).map(([trait, value]) => (
                    <div key={trait} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium capitalize">{trait}</span>
                        <span className="text-muted-foreground">{typeof value === 'number' ? value : 0}%</span>
                      </div>
                      <Progress value={typeof value === 'number' ? value : 0} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Dados de personalidade da marca não disponíveis</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Guidelines Tab */}
        <TabsContent value="guidelines" className="space-y-6">
          {hasGuidelines ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Diretrizes de Comunicação
                </CardTitle>
                <CardDescription>
                  Como aplicar a voz da marca na comunicação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <VoiceGuidelines guidelines={data.voiceGuidelines} />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Diretrizes de voz não disponíveis</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          {hasExamples ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Exemplos de Mensagens
                </CardTitle>
                <CardDescription>
                  Referências práticas de como aplicar a voz da marca
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <MessageExamples examples={data.messageExamples} />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Exemplos de mensagens não disponíveis</p>
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
          Baixar Guia de Voz
        </Button>
        <Button variant="outline" className="gap-2">
          <Copy className="h-4 w-4" />
          Copiar Diretrizes
        </Button>
        <Button className="gap-2">
          <ExternalLink className="h-4 w-4" />
          Ver Exemplos Completos
        </Button>
      </div>
    </div>
  );
};

export default VoiceSection;