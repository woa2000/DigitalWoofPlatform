import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Stethoscope, Plus, Globe, Instagram, Facebook, Loader2, CheckCircle, AlertCircle, Users, Smartphone, Target, MapPin, Calendar, Home, HelpCircle, TrendingUp } from "lucide-react";
import { anamnesisApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AnamneseDigital() {
  const [primaryUrl, setPrimaryUrl] = useState("");
  const [socialUrls, setSocialUrls] = useState<string[]>([""]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const addSocialUrl = () => {
    if (socialUrls.length < 10) {
      setSocialUrls([...socialUrls, ""]);
    }
  };

  const updateSocialUrl = (index: number, value: string) => {
    const updated = [...socialUrls];
    updated[index] = value;
    setSocialUrls(updated);
  };

  const removeSocialUrl = (index: number) => {
    setSocialUrls(socialUrls.filter((_, i) => i !== index));
  };

  const handleStartAnalysis = async () => {
    if (!primaryUrl.trim()) {
      setError("URL principal é obrigatória");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // Filter out empty social URLs
      const validSocialUrls = socialUrls.filter(url => url.trim() !== "");

      const response = await anamnesisApi.create({
        primaryUrl: primaryUrl.trim(),
        socialUrls: validSocialUrls
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Análise iniciada",
          description: "A análise digital foi iniciada com sucesso. Você será notificado quando estiver pronta.",
        });

        // For demo purposes, simulate getting the result after a delay
        setTimeout(async () => {
          try {
            const resultResponse = await anamnesisApi.getById(data.data.id);
            const resultData = await resultResponse.json();
            if (resultData.success) {
              setAnalysisResult(resultData.data);
            }
          } catch (err) {
            console.error("Error fetching analysis result:", err);
          }
        }, 5000); // 5 seconds delay for demo

      } else {
        setError(data.error || "Erro ao iniciar análise");
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Erro ao conectar com o servidor. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <DashboardLayout
      title="Anamnese Digital"
      subtitle="Análise automatizada da presença digital da sua marca"
    >
      <div className="space-y-6">
        {/* Analysis Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Stethoscope className="h-5 w-5 mr-2" />
              Nova Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Primary URL */}
            <div className="space-y-2">
              <Label htmlFor="primary-url" className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Site Principal *
              </Label>
              <Input
                id="primary-url"
                placeholder="https://www.suaempresa.com"
                value={primaryUrl}
                onChange={(e) => setPrimaryUrl(e.target.value)}
              />
            </div>

            {/* Social URLs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center">
                  <Instagram className="h-4 w-4 mr-2" />
                  Redes Sociais (até 10)
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSocialUrl}
                  disabled={socialUrls.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {socialUrls.map((url, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    placeholder={`https://instagram.com/suaempresa`}
                    value={url}
                    onChange={(e) => updateSocialUrl(index, e.target.value)}
                  />
                  {socialUrls.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSocialUrl(index)}
                    >
                      Remover
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleStartAnalysis}
              disabled={isAnalyzing || !primaryUrl.trim()}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                "Iniciar Análise"
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Analysis Results */}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Resultados Detalhados da Anamnese Digital
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Overview */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="text-lg font-medium">Análise Concluída</h3>
                    <p className="text-sm text-muted-foreground">
                      Score de completude: {analysisResult.scoreCompleteness}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Análise realizada em {new Date(analysisResult.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="default" className="bg-green-500 mb-2">
                      {analysisResult.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {analysisResult.metadata?.dataPoints || 0} pontos de dados
                    </div>
                  </div>
                </div>

                {/* Detailed Results Tabs */}
                <Tabs defaultValue="identity" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                    <TabsTrigger value="identity" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      Identidade
                    </TabsTrigger>
                    <TabsTrigger value="personas" className="text-xs">
                      <Users className="h-3 w-3 mr-1" />
                      Personas
                    </TabsTrigger>
                    <TabsTrigger value="ux" className="text-xs">
                      <Smartphone className="h-3 w-3 mr-1" />
                      UX
                    </TabsTrigger>
                    <TabsTrigger value="ecosystem" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      Ecossistema
                    </TabsTrigger>
                    <TabsTrigger value="actionPlan" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      Plano
                    </TabsTrigger>
                    <TabsTrigger value="roadmap" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      Roadmap
                    </TabsTrigger>
                    <TabsTrigger value="homeAnatomy" className="text-xs">
                      <Home className="h-3 w-3 mr-1" />
                      Home
                    </TabsTrigger>
                    <TabsTrigger value="questions" className="text-xs">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Questões
                    </TabsTrigger>
                  </TabsList>

                  {/* Identity Tab */}
                  <TabsContent value="identity" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Identidade da Marca</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">Score Geral</span>
                              <span className="text-sm text-muted-foreground">
                                {analysisResult.findings?.identity?.score || 0}/100
                              </span>
                            </div>
                            <Progress value={analysisResult.findings?.identity?.score || 0} className="h-2" />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Descobertas</h4>
                          <ul className="space-y-1">
                            {analysisResult.findings?.identity?.findings?.map((finding: string, index: number) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {finding}
                              </li>
                            )) || <li className="text-sm text-muted-foreground">Nenhuma descoberta específica</li>}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Recomendações</h4>
                          <ul className="space-y-1">
                            {analysisResult.findings?.identity?.recommendations?.map((rec: string, index: number) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start">
                                <span className="text-blue-500 mr-2">→</span>
                                {rec}
                              </li>
                            )) || <li className="text-sm text-muted-foreground">Nenhuma recomendação específica</li>}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Personas Tab */}
                  <TabsContent value="personas" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Personas e Público-Alvo</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Persona Primária</h4>
                          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <p className="text-sm">
                              <strong>Nome:</strong> {analysisResult.findings?.personas?.primaryPersona?.name || 'Não identificado'}
                            </p>
                            <p className="text-sm">
                              <strong>Idade:</strong> {analysisResult.findings?.personas?.primaryPersona?.age || 'Não identificado'}
                            </p>
                            <p className="text-sm">
                              <strong>Perfil:</strong> {analysisResult.findings?.personas?.primaryPersona?.profile || 'Não identificado'}
                            </p>
                            <div className="text-sm">
                              <strong>Necessidades:</strong>
                              <ul className="ml-4 mt-1">
                                {analysisResult.findings?.personas?.primaryPersona?.needs?.map((need: string, index: number) => (
                                  <li key={index} className="text-muted-foreground">• {need}</li>
                                )) || <li className="text-muted-foreground">Nenhuma necessidade identificada</li>}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Pontos de Dor Identificados</h4>
                          <ul className="space-y-1">
                            {analysisResult.findings?.personas?.primaryPersona?.painPoints?.map((point: string, index: number) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start">
                                <span className="text-red-500 mr-2">⚠</span>
                                {point}
                              </li>
                            )) || <li className="text-sm text-muted-foreground">Nenhum ponto de dor identificado</li>}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* UX Tab */}
                  <TabsContent value="ux" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Navigation */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Navegação</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Score</span>
                              <span className="text-sm font-medium">
                                {analysisResult.findings?.ux?.navigation?.score || 0}/100
                              </span>
                            </div>
                            <Progress value={analysisResult.findings?.ux?.navigation?.score || 0} className="h-2" />

                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-1">Problemas</h5>
                              <ul className="text-xs space-y-1">
                                {analysisResult.findings?.ux?.navigation?.issues?.map((issue: string, index: number) => (
                                  <li key={index} className="text-red-600">• {issue}</li>
                                )) || <li className="text-muted-foreground">Nenhum problema identificado</li>}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Content */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Conteúdo</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Score</span>
                              <span className="text-sm font-medium">
                                {analysisResult.findings?.ux?.content?.score || 0}/100
                              </span>
                            </div>
                            <Progress value={analysisResult.findings?.ux?.content?.score || 0} className="h-2" />

                            <div className="mt-3 text-xs">
                              <p><strong>Legibilidade:</strong> {analysisResult.findings?.ux?.content?.readability || 0}/100</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Conversion */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Conversão</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Score</span>
                              <span className="text-sm font-medium">
                                {analysisResult.findings?.ux?.conversion?.score || 0}/100
                              </span>
                            </div>
                            <Progress value={analysisResult.findings?.ux?.conversion?.score || 0} className="h-2" />

                            <div className="mt-3 text-xs">
                              <p><strong>CTA Presente:</strong> {analysisResult.findings?.ux?.conversion?.ctaPresence ? 'Sim' : 'Não'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Mobile */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Mobile</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Score</span>
                              <span className="text-sm font-medium">
                                {analysisResult.findings?.ux?.mobile?.score || 0}/100
                              </span>
                            </div>
                            <Progress value={analysisResult.findings?.ux?.mobile?.score || 0} className="h-2" />

                            <div className="mt-3 text-xs">
                              <p><strong>Responsivo:</strong> {analysisResult.findings?.ux?.mobile?.responsive ? 'Sim' : 'Não'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Ecosystem Tab */}
                  <TabsContent value="ecosystem" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Ecossistema Digital</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Presença em Redes Sociais</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {analysisResult.findings?.ecosystem?.socialPresence?.map((social: any, index: number) => (
                              <div key={index} className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                                <Instagram className="h-4 w-4" />
                                <span className="text-sm">{social.platform}: {social.followers} seguidores</span>
                              </div>
                            )) || <p className="text-sm text-muted-foreground">Nenhuma presença social identificada</p>}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Concorrentes Identificados</h4>
                          <div className="space-y-3">
                            {analysisResult.findings?.ecosystem?.competitors?.map((competitor: any, index: number) => (
                              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center mb-2">
                                  <span className="text-orange-500 mr-2">🏢</span>
                                  <span className="font-medium text-sm">{competitor.name}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{competitor.url}</p>
                                <div className="space-y-1">
                                  <div className="text-xs">
                                    <strong className="text-green-600">Pontos Fortes:</strong>
                                    <ul className="ml-3 mt-1">
                                      {competitor.strengths?.map((strength: string, idx: number) => (
                                        <li key={idx} className="text-muted-foreground">• {strength}</li>
                                      )) || <li className="text-muted-foreground">Nenhum ponto forte identificado</li>}
                                    </ul>
                                  </div>
                                  <div className="text-xs">
                                    <strong className="text-blue-600">Oportunidades:</strong>
                                    <ul className="ml-3 mt-1">
                                      {competitor.opportunities?.map((opportunity: string, idx: number) => (
                                        <li key={idx} className="text-muted-foreground">• {opportunity}</li>
                                      )) || <li className="text-muted-foreground">Nenhuma oportunidade identificada</li>}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )) || <p className="text-sm text-muted-foreground">Nenhum concorrente identificado</p>}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Posicionamento de Mercado</h4>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-sm mb-2">
                              <strong>Categoria:</strong> {analysisResult.findings?.ecosystem?.marketPosition?.category || 'Não identificada'}
                            </p>
                            <div className="text-sm">
                              <strong>Diferencial:</strong>
                              <ul className="ml-4 mt-1">
                                {analysisResult.findings?.ecosystem?.marketPosition?.differentiation?.map((diff: string, index: number) => (
                                  <li key={index} className="text-green-600">• {diff}</li>
                                )) || <li className="text-muted-foreground">Nenhum diferencial identificado</li>}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Action Plan Tab */}
                  <TabsContent value="actionPlan" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Plano de Ação</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 text-green-600">Ações Imediatas</h4>
                          <div className="space-y-2">
                            {analysisResult.findings?.actionPlan?.immediate?.map((actionItem: any, index: number) => (
                              <div key={index} className="text-sm p-3 bg-green-50 border-l-4 border-green-500 rounded">
                                <div className="font-medium mb-1">{actionItem.action}</div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div><strong>Prioridade:</strong> {actionItem.priority}</div>
                                  <div><strong>Esforço:</strong> {actionItem.effort}</div>
                                  <div><strong>Impacto:</strong> {actionItem.impact}</div>
                                  <div><strong>Prazo:</strong> {actionItem.timeline}</div>
                                </div>
                              </div>
                            )) || <p className="text-sm text-muted-foreground">Nenhuma ação imediata recomendada</p>}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-blue-600">Ações de Curto Prazo</h4>
                          <div className="space-y-2">
                            {analysisResult.findings?.actionPlan?.shortTerm?.map((actionItem: any, index: number) => (
                              <div key={index} className="text-sm p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                <div className="font-medium mb-1">{actionItem.action}</div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div><strong>Prioridade:</strong> {actionItem.priority}</div>
                                  <div><strong>Esforço:</strong> {actionItem.effort}</div>
                                  <div><strong>Impacto:</strong> {actionItem.impact}</div>
                                  <div><strong>Prazo:</strong> {actionItem.timeline}</div>
                                </div>
                              </div>
                            )) || <p className="text-sm text-muted-foreground">Nenhuma ação de curto prazo recomendada</p>}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-purple-600">Ações de Longo Prazo</h4>
                          <div className="space-y-2">
                            {analysisResult.findings?.actionPlan?.longTerm?.map((actionItem: any, index: number) => (
                              <div key={index} className="text-sm p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                                <div className="font-medium mb-1">{actionItem.action}</div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div><strong>Prioridade:</strong> {actionItem.priority}</div>
                                  <div><strong>Esforço:</strong> {actionItem.effort}</div>
                                  <div><strong>Impacto:</strong> {actionItem.impact}</div>
                                  <div><strong>Prazo:</strong> {actionItem.timeline}</div>
                                </div>
                              </div>
                            )) || <p className="text-sm text-muted-foreground">Nenhuma ação de longo prazo recomendada</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Roadmap Tab */}
                  <TabsContent value="roadmap" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Roadmap de Desenvolvimento</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Fases do Projeto</h4>
                          <div className="space-y-3">
                            {analysisResult.findings?.roadmap?.phases?.map((phaseItem: any, index: number) => (
                              <div key={index} className="p-4 bg-muted/50 rounded-lg border-l-4 border-blue-500">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-sm">{phaseItem.name}</h5>
                                    <p className="text-xs text-muted-foreground">Duração: {phaseItem.duration}</p>
                                  </div>
                                </div>
                                <div className="space-y-2 text-xs">
                                  <div>
                                    <strong className="text-green-600">Objetivos:</strong>
                                    <ul className="ml-3 mt-1">
                                      {phaseItem.objectives?.map((objective: string, idx: number) => (
                                        <li key={idx} className="text-muted-foreground">• {objective}</li>
                                      )) || <li className="text-muted-foreground">Nenhum objetivo definido</li>}
                                    </ul>
                                  </div>
                                  <div>
                                    <strong className="text-blue-600">Entregáveis:</strong>
                                    <ul className="ml-3 mt-1">
                                      {phaseItem.deliverables?.map((deliverable: string, idx: number) => (
                                        <li key={idx} className="text-muted-foreground">• {deliverable}</li>
                                      )) || <li className="text-muted-foreground">Nenhum entregável definido</li>}
                                    </ul>
                                  </div>
                                  <div>
                                    <strong className="text-orange-600">Riscos:</strong>
                                    <ul className="ml-3 mt-1">
                                      {phaseItem.risks?.map((risk: string, idx: number) => (
                                        <li key={idx} className="text-muted-foreground">• {risk}</li>
                                      )) || <li className="text-muted-foreground">Nenhum risco identificado</li>}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )) || <p className="text-sm text-muted-foreground">Nenhuma fase definida</p>}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Marcos Importantes</h4>
                          <div className="space-y-3">
                            {analysisResult.findings?.roadmap?.milestones?.map((milestoneItem: any, index: number) => (
                              <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-yellow-500">🏆</span>
                                  <div>
                                    <h5 className="font-medium text-sm">{milestoneItem.name}</h5>
                                    <p className="text-xs text-muted-foreground">Data: {milestoneItem.date}</p>
                                  </div>
                                </div>
                                <div className="space-y-1 text-xs">
                                  <div>
                                    <strong className="text-green-600">Critérios:</strong>
                                    <ul className="ml-3 mt-1">
                                      {milestoneItem.criteria?.map((criterion: string, idx: number) => (
                                        <li key={idx} className="text-muted-foreground">• {criterion}</li>
                                      )) || <li className="text-muted-foreground">Nenhum critério definido</li>}
                                    </ul>
                                  </div>
                                  <div>
                                    <strong className="text-blue-600">Responsável:</strong>
                                    <span className="text-muted-foreground ml-1">{milestoneItem.responsible}</span>
                                  </div>
                                </div>
                              </div>
                            )) || <p className="text-sm text-muted-foreground">Nenhum marco definido</p>}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Orçamento Estimado</h4>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-lg font-bold text-green-600">
                              R$ {analysisResult.findings?.roadmap?.budget?.total?.toLocaleString('pt-BR') || '0'}
                            </p>
                            <div className="mt-2 space-y-1">
                              {analysisResult.findings?.roadmap?.budget?.breakdown?.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{item.category}</span>
                                  <span>R$ {item.amount?.toLocaleString('pt-BR')}</span>
                                </div>
                              )) || <p className="text-sm text-muted-foreground">Nenhum breakdown disponível</p>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Home Anatomy Tab */}
                  <TabsContent value="homeAnatomy" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Anatomia da Página Inicial</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Estrutura do Header</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Logo:</strong> {analysisResult.findings?.homeAnatomy?.structure?.header?.logo ? 'Presente' : 'Ausente'}</p>
                              <p><strong>Navegação:</strong> {analysisResult.findings?.homeAnatomy?.structure?.header?.navigation?.length || 0} itens</p>
                              <p><strong>Contato:</strong> {analysisResult.findings?.homeAnatomy?.structure?.header?.contact ? 'Presente' : 'Ausente'}</p>
                              <p><strong>CTA:</strong> {analysisResult.findings?.homeAnatomy?.structure?.header?.cta ? 'Presente' : 'Ausente'}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Seção Hero</h4>
                            <div className="space-y-1 text-sm">
                              <p><strong>Headline:</strong> {analysisResult.findings?.homeAnatomy?.structure?.hero?.headline || 'Não identificado'}</p>
                              <p><strong>Subheadline:</strong> {analysisResult.findings?.homeAnatomy?.structure?.hero?.subheadline || 'Não identificado'}</p>
                              <p><strong>CTA:</strong> {analysisResult.findings?.homeAnatomy?.structure?.hero?.cta || 'Não identificado'}</p>
                              <p><strong>Mídia:</strong> {analysisResult.findings?.homeAnatomy?.structure?.hero?.media || 'Nenhuma'}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Performance</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded">
                              <div className="text-lg font-bold">{analysisResult.findings?.homeAnatomy?.performance?.loadTime || 0}s</div>
                              <div className="text-xs text-muted-foreground">Tempo de Carregamento</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded">
                              <div className="text-lg font-bold">{analysisResult.findings?.homeAnatomy?.performance?.mobileOptimized ? 'Sim' : 'Não'}</div>
                              <div className="text-xs text-muted-foreground">Mobile Otimizado</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded">
                              <div className="text-lg font-bold">{analysisResult.findings?.homeAnatomy?.performance?.seoScore || 0}</div>
                              <div className="text-xs text-muted-foreground">Score SEO</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded">
                              <div className="text-lg font-bold">{analysisResult.findings?.homeAnatomy?.performance?.accessibilityScore || 0}</div>
                              <div className="text-xs text-muted-foreground">Acessibilidade</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Questions Tab */}
                  <TabsContent value="questions" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Estratégia de Marca</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {analysisResult.findings?.questions?.brandStrategy?.map((questionItem: any, index: number) => (
                              <li key={index} className="text-sm p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                <div className="flex items-start space-x-2">
                                  <HelpCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="font-medium mb-1">{questionItem.question}</div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div><strong>Importância:</strong> {questionItem.importance}</div>
                                      <div><strong>Racional:</strong> {questionItem.rationale}</div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            )) || <li className="text-sm text-muted-foreground">Nenhuma questão identificada</li>}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Estratégia de Conteúdo</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {analysisResult.findings?.questions?.contentStrategy?.map((questionItem: any, index: number) => (
                              <li key={index} className="text-sm p-3 bg-green-50 border-l-4 border-green-500 rounded">
                                <div className="flex items-start space-x-2">
                                  <HelpCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="font-medium mb-1">{questionItem.question}</div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div><strong>Importância:</strong> {questionItem.importance}</div>
                                      <div><strong>Racional:</strong> {questionItem.rationale}</div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            )) || <li className="text-sm text-muted-foreground">Nenhuma questão identificada</li>}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Questões Técnicas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {analysisResult.findings?.questions?.technical?.map((questionItem: any, index: number) => (
                              <li key={index} className="text-sm p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                                <div className="flex items-start space-x-2">
                                  <HelpCircle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="font-medium mb-1">{questionItem.question}</div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div><strong>Importância:</strong> {questionItem.importance}</div>
                                      <div><strong>Racional:</strong> {questionItem.rationale}</div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            )) || <li className="text-sm text-muted-foreground">Nenhuma questão identificada</li>}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Questões de Negócio</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {analysisResult.findings?.questions?.business?.map((questionItem: any, index: number) => (
                              <li key={index} className="text-sm p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                                <div className="flex items-start space-x-2">
                                  <HelpCircle className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="font-medium mb-1">{questionItem.question}</div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div><strong>Importância:</strong> {questionItem.importance}</div>
                                      <div><strong>Racional:</strong> {questionItem.rationale}</div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            )) || <li className="text-sm text-muted-foreground">Nenhuma questão identificada</li>}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder when no results */}
        {!analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2" />
                Resultados da Análise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Análise Digital Completa</h3>
                <p className="mb-4">
                  Sistema de análise automatizada baseado no plano de execução.
                  Processa URLs e retorna diagnóstico estruturado em até 2 minutos.
                </p>
                <div className="flex justify-center space-x-2 flex-wrap">
                  <Badge variant="secondary">Análise Automatizada</Badge>
                  <Badge variant="secondary">8 Seções Estruturadas</Badge>
                  <Badge variant="secondary">Deduplicação Inteligente</Badge>
                  <Badge variant="secondary">Performance ≤ 2min</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">5</div>
              <p className="text-sm text-muted-foreground">Análises Realizadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">98%</div>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">1.8min</div>
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}