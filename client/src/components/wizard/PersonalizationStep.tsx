import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Type, 
  Target, 
  MessageSquare, 
  Calendar,
  Heart,
  Wand2,
  RefreshCw,
  Eye
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
import { usePersonalizationPreview } from '@/hooks/usePersonalizationPreview';
import { useDebounce } from '@/hooks/useDebounce';

interface PersonalizationStepProps {
  templateId: string;
  currentPersonalization: any;
  onPersonalizationChange: (personalization: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface PersonalizationSettings {
  tone: string;
  targetAudience: string;
  objectives: string[];
  customInstructions: string;
  brandElements: {
    colors: string[];
    fonts: string[];
    style: string;
  };
  contentPreferences: {
    length: number;
    formality: number;
    emoji: boolean;
    callToAction: string;
  };
}

const TONE_OPTIONS = [
  { value: 'friendly', label: 'Amigável', description: 'Tom caloroso e acolhedor' },
  { value: 'professional', label: 'Profissional', description: 'Formal e técnico' },
  { value: 'empathetic', label: 'Empático', description: 'Compreensivo e solidário' },
  { value: 'educational', label: 'Educativo', description: 'Informativo e didático' },
  { value: 'playful', label: 'Descontraído', description: 'Divertido e casual' }
];

const OBJECTIVE_OPTIONS = [
  'Aumentar agendamentos',
  'Educar sobre cuidados',
  'Promover serviços premium',
  'Fidelizar clientes',
  'Captar novos clientes',
  'Promover produtos',
  'Conscientizar sobre prevenção',
  'Divulgar eventos/promoções'
];

const STYLE_OPTIONS = [
  { value: 'modern', label: 'Moderno', description: 'Visual limpo e contemporâneo' },
  { value: 'warm', label: 'Acolhedor', description: 'Cores quentes e amigáveis' },
  { value: 'professional', label: 'Profissional', description: 'Sério e confiável' },
  { value: 'playful', label: 'Divertido', description: 'Colorido e dinâmico' }
];

export function PersonalizationStep({
  templateId,
  currentPersonalization,
  onPersonalizationChange,
  onNext,
  onBack
}: PersonalizationStepProps) {
  // Local state for personalization settings
  const [personalization, setPersonalization] = useState<PersonalizationSettings>({
    tone: currentPersonalization?.tone || 'friendly',
    targetAudience: currentPersonalization?.targetAudience || '',
    objectives: currentPersonalization?.objectives || [],
    customInstructions: currentPersonalization?.customInstructions || '',
    brandElements: {
      colors: currentPersonalization?.brandElements?.colors || [],
      fonts: currentPersonalization?.brandElements?.fonts || [],
      style: currentPersonalization?.brandElements?.style || 'modern'
    },
    contentPreferences: {
      length: currentPersonalization?.contentPreferences?.length || 50,
      formality: currentPersonalization?.contentPreferences?.formality || 50,
      emoji: currentPersonalization?.contentPreferences?.emoji ?? true,
      callToAction: currentPersonalization?.contentPreferences?.callToAction || 'Agende já!'
    }
  });

  // Debounced personalization for preview
  const debouncedPersonalization = useDebounce(personalization, 500);

  // Preview hook
  const {
    preview,
    loading: previewLoading,
    error: previewError,
    generatePreview,
    regenerateWithSettings,
    showOriginal,
    togglePreview
  } = usePersonalizationPreview();

  // Generate preview when personalization changes
  useEffect(() => {
    if (templateId && Object.keys(debouncedPersonalization).length > 0) {
      // For now, using templateId as brandVoiceId until we have proper brand voice selection
      generatePreview(templateId, templateId);
    }
  }, [templateId, debouncedPersonalization, generatePreview]);

  // Update parent when personalization changes
  useEffect(() => {
    onPersonalizationChange(personalization);
  }, [personalization, onPersonalizationChange]);

  const handleToneChange = (tone: string) => {
    setPersonalization(prev => ({ ...prev, tone }));
  };

  const handleObjectiveToggle = (objective: string) => {
    setPersonalization(prev => ({
      ...prev,
      objectives: prev.objectives.includes(objective)
        ? prev.objectives.filter(o => o !== objective)
        : [...prev.objectives, objective]
    }));
  };

  const handleBrandElementChange = (key: string, value: any) => {
    setPersonalization(prev => ({
      ...prev,
      brandElements: {
        ...prev.brandElements,
        [key]: value
      }
    }));
  };

  const handleContentPreferenceChange = (key: string, value: any) => {
    setPersonalization(prev => ({
      ...prev,
      contentPreferences: {
        ...prev.contentPreferences,
        [key]: value
      }
    }));
  };

  const handleColorAdd = (color: string) => {
    if (color && !personalization.brandElements.colors.includes(color)) {
      handleBrandElementChange('colors', [...personalization.brandElements.colors, color]);
    }
  };

  const handleColorRemove = (color: string) => {
    handleBrandElementChange(
      'colors', 
      personalization.brandElements.colors.filter(c => c !== color)
    );
  };

  const isValid = () => {
    return personalization.tone && 
           personalization.targetAudience.trim().length > 0 && 
           personalization.objectives.length > 0;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personalization Settings */}
        <div className="space-y-6">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="brand">Marca</TabsTrigger>
              <TabsTrigger value="advanced">Avançado</TabsTrigger>
            </TabsList>

            {/* Content Personalization */}
            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Tom de Comunicação
                  </CardTitle>
                  <CardDescription>
                    Escolha o tom que melhor representa sua marca
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3">
                    {TONE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleToneChange(option.value)}
                        className={`p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                          personalization.tone === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.description}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Público-Alvo
                  </CardTitle>
                  <CardDescription>
                    Descreva seu público principal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ex: Tutores de cães e gatos que valorizam cuidados preventivos..."
                    value={personalization.targetAudience}
                    onChange={(e) => setPersonalization(prev => ({ 
                      ...prev, 
                      targetAudience: e.target.value 
                    }))}
                    className="min-h-[80px]"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Objetivos da Campanha
                  </CardTitle>
                  <CardDescription>
                    Selecione os objetivos principais (máximo 3)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {OBJECTIVE_OPTIONS.map((objective) => (
                      <button
                        key={objective}
                        onClick={() => handleObjectiveToggle(objective)}
                        disabled={!personalization.objectives.includes(objective) && personalization.objectives.length >= 3}
                        className={`p-2 text-sm text-left border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          personalization.objectives.includes(objective)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {objective}
                      </button>
                    ))}
                  </div>
                  {personalization.objectives.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {personalization.objectives.map((objective) => (
                        <Badge key={objective} variant="secondary">
                          {objective}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Brand Personalization */}
            <TabsContent value="brand" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Elementos Visuais
                  </CardTitle>
                  <CardDescription>
                    Configure a identidade visual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Estilo Visual</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {STYLE_OPTIONS.map((style) => (
                        <button
                          key={style.value}
                          onClick={() => handleBrandElementChange('style', style.value)}
                          className={`p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                            personalization.brandElements.style === style.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="font-medium text-sm">{style.label}</div>
                          <div className="text-xs text-gray-500">{style.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Cores da Marca</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="color"
                        className="w-12 h-10 p-1 border-gray-300"
                        onChange={(e) => handleColorAdd(e.target.value)}
                      />
                      <Input
                        placeholder="ou digite #hex"
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleColorAdd((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    </div>
                    {personalization.brandElements.colors.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {personalization.brandElements.colors.map((color, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-1"
                          >
                            <div
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-xs">{color}</span>
                            <button
                              onClick={() => handleColorRemove(color)}
                              className="text-red-500 hover:text-red-700 ml-1"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Settings */}
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Preferências de Conteúdo
                  </CardTitle>
                  <CardDescription>
                    Ajuste fino do conteúdo gerado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Tamanho do Conteúdo: {personalization.contentPreferences.length}%
                    </Label>
                    <Slider
                      value={[personalization.contentPreferences.length]}
                      onValueChange={([value]) => handleContentPreferenceChange('length', value)}
                      max={100}
                      step={10}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Conciso</span>
                      <span>Detalhado</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Formalidade: {personalization.contentPreferences.formality}%
                    </Label>
                    <Slider
                      value={[personalization.contentPreferences.formality]}
                      onValueChange={([value]) => handleContentPreferenceChange('formality', value)}
                      max={100}
                      step={10}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Casual</span>
                      <span>Formal</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Usar Emojis</Label>
                    <Switch
                      checked={personalization.contentPreferences.emoji}
                      onCheckedChange={(checked) => handleContentPreferenceChange('emoji', checked)}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Call to Action</Label>
                    <Input
                      value={personalization.contentPreferences.callToAction}
                      onChange={(e) => handleContentPreferenceChange('callToAction', e.target.value)}
                      placeholder="Ex: Agende já!, Entre em contato..."
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Instruções Personalizadas
                  </CardTitle>
                  <CardDescription>
                    Adicione instruções específicas para o AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Ex: Sempre mencionar que somos especialistas em dermatologia veterinária..."
                    value={personalization.customInstructions}
                    onChange={(e) => setPersonalization(prev => ({ 
                      ...prev, 
                      customInstructions: e.target.value 
                    }))}
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview Personalizado
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateWithSettings}
                  disabled={previewLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${previewLoading ? 'animate-spin' : ''}`} />
                  Regenerar
                </Button>
              </div>
              <CardDescription>
                Veja como o template fica com suas personalizações
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previewLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                    <p className="text-sm text-gray-500">Gerando preview...</p>
                  </div>
                </div>
              )}

              {previewError && (
                <div className="text-center py-8">
                  <p className="text-sm text-red-500 mb-2">Erro ao gerar preview</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => generatePreview(templateId, templateId)}
                  >
                    Tentar novamente
                  </Button>
                </div>
              )}

              {preview && !previewLoading && !previewError && (
                <div className="space-y-4">
                  {/* Toggle between original and personalized */}
                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant={showOriginal ? "outline" : "default"}
                      size="sm"
                      onClick={togglePreview}
                    >
                      {showOriginal ? "Ver Original" : "Ver Personalizado"}
                    </Button>
                  </div>

                  {/* Content Preview */}
                  {preview.personalized && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-2">Conteúdo:</h4>
                      <div className="prose prose-sm max-w-none">
                        <div className="space-y-2">
                          <div><strong>Título:</strong> {preview.personalized.content.title}</div>
                          <div><strong>Descrição:</strong> {preview.personalized.content.description}</div>
                          <div><strong>Call to Action:</strong> {preview.personalized.content.callToAction}</div>
                          <div className="mt-3">
                            <div dangerouslySetInnerHTML={{ __html: preview.personalized.content.body }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Visual Elements */}
                  {preview.personalized?.content.visualElements && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-2">Elementos Visuais:</h4>
                      <div className="space-y-2">
                        {preview.personalized.content.visualElements.colors.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Cores:</span>
                            {preview.personalized.content.visualElements.colors.map((color, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded border"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        )}
                        {preview.personalized.content.visualElements.fonts.length > 0 && (
                          <div className="text-sm">
                            <span>Fontes:</span> {preview.personalized.content.visualElements.fonts.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Changes Made */}
                  {preview.changes && preview.changes.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-2">Alterações aplicadas:</h4>
                      <div className="space-y-1 text-xs">
                        {preview.changes.slice(0, 3).map((change, idx) => (
                          <div key={idx}>
                            <span className="font-medium">{change.field}:</span> {change.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personalization Summary */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">Personalizações aplicadas:</h4>
                    <div className="space-y-1 text-xs">
                      <div>Tom: <span className="font-medium">{personalization.tone}</span></div>
                      <div>Objetivos: <span className="font-medium">{personalization.objectives.join(', ')}</span></div>
                      <div>Estilo: <span className="font-medium">{personalization.brandElements.style}</span></div>
                      {preview.personalized?.metadata && (
                        <div>Score: <span className="font-medium">{preview.personalized.metadata.personalizationScore}%</span></div>
                      )}
                    </div>
                  </div>
                </div>
              )}
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
          Continuar para Configuração
        </Button>
      </div>
    </div>
  );
}