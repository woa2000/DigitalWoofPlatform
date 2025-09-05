import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Download, Eye, Palette, MessageSquare } from 'lucide-react';

interface PreviewStepProps {
  onNext: (data: any) => void;
  onPrevious: () => void;
  wizardData: any;
  stepNumber: number;
  isCompleted: boolean;
}

interface ContentExample {
  type: 'educativo' | 'promocional' | 'humanizado';
  title: string;
  content: string;
  hashtags: string[];
}

export function PreviewStep({ onNext, onPrevious, wizardData }: PreviewStepProps) {
  const [examples, setExamples] = useState<ContentExample[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [brandVoiceJson, setBrandVoiceJson] = useState<any>(null);

  const generateExamples = async () => {
    setIsGenerating(true);
    
    // Mock examples based on wizard data
    const mockExamples: ContentExample[] = [
      {
        type: 'educativo',
        title: 'Dica de Saúde Pet',
        content: 'A escovação regular dos dentes do seu pet é fundamental para prevenir problemas bucais. Use sempre produtos específicos para animais e escove pelo menos 3x por semana. 🦷✨',
        hashtags: ['#saudepet', '#cuidadosbucais', '#prevencao', '#dicavet']
      },
      {
        type: 'promocional', 
        title: 'Oferta Especial',
        content: '🎉 Aproveite nossa promoção de setembro! Consulta + vacina V10 com 20% de desconto. Cuide da saúde do seu melhor amigo com quem entende de amor pet! 💙',
        hashtags: ['#promocao', '#vacina', '#consulta', '#setembro']
      },
      {
        type: 'humanizado',
        title: 'Momento Especial',
        content: 'Hoje a Luna completou 5 anos e veio fazer seu check-up anual. Ver o sorriso dela (e do tutor!) nos lembra porque amamos o que fazemos. Cada pet tem sua história especial. 🐕💛',
        hashtags: ['#historia', '#aniversario', '#checkup', '#amor']
      }
    ];

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setExamples(mockExamples);
    setIsGenerating(false);
  };

  const generateBrandVoiceJson = () => {
    const brandVoice = {
      identity: {
        name: wizardData.logoData?.metadata?.name || 'Sua Marca Pet',
        mission: wizardData.brandValues?.mission || 'Cuidar do bem-estar dos pets com amor e profissionalismo',
        vision: 'Ser referência em cuidados pet na região',
        values: wizardData.brandValues?.values?.map((v: any) => v.name) || ['Amor pelos animais', 'Profissionalismo', 'Transparência']
      },
      voice: {
        tone: `Confiança: ${Math.round((wizardData.toneConfig?.confiança || 0.7) * 100)}%, Acolhimento: ${Math.round((wizardData.toneConfig?.acolhimento || 0.8) * 100)}%`,
        personality: ['Empático', 'Profissional', 'Acolhedor', 'Confiável'],
        communication_style: 'Conversacional mas profissional',
        language_preferences: wizardData.languageConfig?.preferredTerms || ['Linguagem acessível', 'Tom acolhedor']
      },
      audience: {
        primary_persona: {
          demographics: {
            age: '25-45 anos',
            income: 'Classe B/C', 
            location: 'Urbano',
            family: 'Com pets'
          },
          pain_points: [
            'Falta de tempo para cuidados',
            'Preocupação com custos',
            'Dificuldade em encontrar profissionais confiáveis'
          ],
          motivations: [
            'Saúde e felicidade do pet',
            'Conveniência',
            'Relacionamento de confiança'
          ]
        }
      },
      content_guidelines: {
        do: wizardData.languageConfig?.preferredTerms || ['Use linguagem empática', 'Inclua disclaimers veterinários'],
        dont: wizardData.languageConfig?.avoidTerms || ['Fazer diagnósticos', 'Prometer curas'],
        keywords: ['saúde animal', 'prevenção', 'cuidados', 'bem-estar'],
        hashtags: ['#saudepet', '#cuidados', '#bemestar', '#amor']
      },
      visual_identity: {
        palette: wizardData.logoData?.palette || ['#2563eb', '#7c3aed', '#dc2626'],
        logo_url: wizardData.logoData?.logoUrl,
        style: 'Moderno e acolhedor'
      },
      compliance: {
        disclaimers: [wizardData.brandValues?.disclaimer || 'Este conteúdo tem caráter educativo'],
        legal_requirements: ['Conformidade CFMV', 'LGPD compliance']
      }
    };

    setBrandVoiceJson(brandVoice);
    return brandVoice;
  };

  useEffect(() => {
    generateExamples();
    generateBrandVoiceJson();
  }, []);

  const handleFinish = () => {
    const finalData = {
      brandVoiceJson,
      contentExamples: examples,
      completedAt: new Date().toISOString()
    };
    
    onNext(finalData);
  };

  const downloadBrandVoice = () => {
    if (brandVoiceJson) {
      const dataStr = JSON.stringify(brandVoiceJson, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'brand-voice.json';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Preview da Sua Marca</h2>
        <p className="text-muted-foreground mt-2">
          Veja como sua marca se comunicará e faça os ajustes finais
        </p>
      </div>

      {/* Brand Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Resumo da Marca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {wizardData.logoData?.palette && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Paleta de Cores
              </h4>
              <div className="flex gap-2">
                {wizardData.logoData.palette.map((color: string, index: number) => (
                  <div key={index} className="text-center">
                    <div 
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-xs font-mono mt-1">{color}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Tom de Voz</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Confiança:</span>
                <Badge variant="outline" className="ml-2">
                  {Math.round((wizardData.toneConfig?.confiança || 0.7) * 100)}%
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Acolhimento:</span>
                <Badge variant="outline" className="ml-2">
                  {Math.round((wizardData.toneConfig?.acolhimento || 0.8) * 100)}%
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Humor:</span>
                <Badge variant="outline" className="ml-2">
                  {Math.round((wizardData.toneConfig?.humor || 0.5) * 100)}%
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Especialização:</span>
                <Badge variant="outline" className="ml-2">
                  {Math.round((wizardData.toneConfig?.especialização || 0.9) * 100)}%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Examples */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Exemplos de Conteúdo
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={generateExamples}
              disabled={isGenerating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Gerando exemplos...
            </div>
          ) : (
            <div className="grid gap-4">
              {examples.map((example, index) => (
                <Card key={index} className="border-l-4" style={{ borderLeftColor: wizardData.logoData?.palette?.[index] || '#2563eb' }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="capitalize">
                        {example.type}
                      </Badge>
                      <h5 className="font-medium">{example.title}</h5>
                    </div>
                    <p className="text-sm mb-3">{example.content}</p>
                    <div className="flex flex-wrap gap-1">
                      {example.hashtags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadBrandVoice}>
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          
          <Button onClick={handleFinish}>
            Finalizar Onboarding
          </Button>
        </div>
      </div>
    </div>
  );
}