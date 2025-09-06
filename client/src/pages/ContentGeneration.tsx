import React, { useState } from 'react';
import { ContentBriefForm } from '@/components/content/ContentBriefForm';
import { ContentPreview } from '@/components/content/ContentPreview';
import { GeneratedContent } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, History, BarChart3 } from 'lucide-react';

export const ContentGenerationPage: React.FC = () => {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [selectedContentIndex, setSelectedContentIndex] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(0);

  const handleContentGenerated = (content: GeneratedContent[]) => {
    setGeneratedContent(content);
    setSelectedContentIndex(0);
    setSelectedVariation(0);
  };

  const handleRegenerate = () => {
    // TODO: Implement regeneration logic
    console.log('Regenerating content...');
  };

  const handleFeedback = (feedback: any) => {
    // TODO: Implement feedback submission
    console.log('Submitting feedback:', feedback);
  };

  const currentContent = generatedContent[selectedContentIndex];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Geração de Conteúdo IA</h1>
          <p className="text-muted-foreground">
            Crie conteúdo personalizado com inteligência artificial
          </p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Gerar Conteúdo
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Brief Form */}
            <div className="space-y-6">
              <ContentBriefForm 
                onContentGenerated={handleContentGenerated}
                className="sticky top-6"
              />
            </div>

            {/* Content Preview */}
            <div className="space-y-6">
              {generatedContent.length > 0 ? (
                <>
                  {/* Multiple content selector */}
                  {generatedContent.length > 1 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Conteúdos Gerados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs 
                          value={selectedContentIndex.toString()} 
                          onValueChange={(value) => setSelectedContentIndex(parseInt(value))}
                        >
                          <TabsList className="grid w-full grid-cols-3">
                            {generatedContent.map((_, index) => (
                              <TabsTrigger key={index} value={index.toString()}>
                                Conteúdo {index + 1}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </Tabs>
                      </CardContent>
                    </Card>
                  )}

                  <ContentPreview
                    content={currentContent}
                    channel={currentContent.content_brief.channel}
                    selectedVariation={selectedVariation}
                    onVariationSelect={setSelectedVariation}
                    onRegenerate={handleRegenerate}
                    onFeedback={handleFeedback}
                  />
                </>
              ) : (
                <Card className="h-96 flex items-center justify-center">
                  <CardContent className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Aguardando geração</h3>
                    <p className="text-muted-foreground">
                      Preencha o formulário ao lado e clique em "Gerar Conteúdo" para começar
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Conteúdo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Em desenvolvimento</h3>
                <p className="text-muted-foreground">
                  O histórico de conteúdo será implementado em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Em desenvolvimento</h3>
                <p className="text-muted-foreground">
                  Analytics de performance do conteúdo será implementado em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};