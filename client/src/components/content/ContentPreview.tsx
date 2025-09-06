import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Copy,
  Download
} from 'lucide-react';
import { ContentPreviewProps } from '@/types';

// Channel-specific preview components
const InstagramPostPreview: React.FC<{ content: any }> = ({ content }) => (
  <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border">
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        <div>
          <p className="font-medium text-sm">sua_marca_pet</p>
          <p className="text-xs text-gray-500">Há 2 min</p>
        </div>
      </div>
      <div className="h-64 bg-gray-200 rounded mb-3 flex items-center justify-center">
        <Eye className="h-8 w-8 text-gray-400" />
      </div>
      <div className="flex space-x-4 mb-3">
        <Heart className="h-6 w-6" />
        <MessageCircle className="h-6 w-6" />
        <Share2 className="h-6 w-6" />
      </div>
      <div className="space-y-2">
        <p className="font-medium text-sm">{content.title}</p>
        <p className="text-sm">{content.body}</p>
        {content.hashtags && (
          <p className="text-sm text-blue-600">
            {content.hashtags.join(' ')}
          </p>
        )}
      </div>
    </div>
  </div>
);

const FacebookPostPreview: React.FC<{ content: any }> = ({ content }) => (
  <div className="max-w-lg mx-auto bg-white rounded-lg shadow-sm border">
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
        <div>
          <p className="font-medium">Sua Marca Pet</p>
          <p className="text-xs text-gray-500">2 min · 🌍</p>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-medium">{content.title}</h3>
        <p className="text-sm">{content.body}</p>
        {content.hashtags && (
          <p className="text-sm text-blue-600">
            {content.hashtags.join(' ')}
          </p>
        )}
        <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
          <Eye className="h-8 w-8 text-gray-400" />
        </div>
      </div>
      <Separator className="my-3" />
      <div className="flex justify-between text-sm text-gray-600">
        <span>👍 ❤️ 10</span>
        <span>2 comentários · 1 compartilhamento</span>
      </div>
    </div>
  </div>
);

const EmailPreview: React.FC<{ content: any }> = ({ content }) => (
  <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border">
    <div className="border-b p-4 bg-gray-50">
      <div className="text-sm space-y-1">
        <div><strong>De:</strong> sua-marca@petshop.com</div>
        <div><strong>Para:</strong> cliente@email.com</div>
        <div><strong>Assunto:</strong> {content.title}</div>
      </div>
    </div>
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">{content.title}</h1>
      <div className="prose prose-sm max-w-none">
        {content.body.split('\n').map((paragraph: string, index: number) => (
          <p key={index} className="mb-3">{paragraph}</p>
        ))}
      </div>
      {content.call_to_action && (
        <div className="mt-6">
          <Button className="w-full sm:w-auto">
            {content.call_to_action}
          </Button>
        </div>
      )}
    </div>
  </div>
);

const GenericPreview: React.FC<{ content: any }> = ({ content }) => (
  <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border p-6">
    <h2 className="text-lg font-semibold mb-4">{content.title}</h2>
    <div className="prose prose-sm max-w-none">
      {content.body.split('\n').map((paragraph: string, index: number) => (
        <p key={index} className="mb-3">{paragraph}</p>
      ))}
    </div>
    {content.hashtags && (
      <div className="mt-4 flex flex-wrap gap-1">
        {content.hashtags.map((tag: string) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    )}
    {content.call_to_action && (
      <div className="mt-4 pt-4 border-t">
        <p className="font-medium text-sm">Call to Action:</p>
        <p className="text-sm text-gray-600">{content.call_to_action}</p>
      </div>
    )}
  </div>
);

export const ContentPreview: React.FC<ContentPreviewProps> = ({
  content,
  channel,
  selectedVariation = 0,
  onVariationSelect,
  onRegenerate,
  onFeedback,
}) => {
  const [copiedVariation, setCopiedVariation] = useState<number | null>(null);

  const PreviewComponent = useMemo(() => {
    switch (channel) {
      case 'instagram_post':
        return InstagramPostPreview;
      case 'facebook_post':
        return FacebookPostPreview;
      case 'email':
        return EmailPreview;
      default:
        return GenericPreview;
    }
  }, [channel]);

  const currentVariation = content.variations[selectedVariation];

  const copyToClipboard = async (variation: any, index: number) => {
    const textToCopy = `${variation.title}\n\n${variation.body}${
      variation.hashtags ? '\n\n' + variation.hashtags.join(' ') : ''
    }`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedVariation(index);
      setTimeout(() => setCopiedVariation(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 0.8) return 'default';
    if (score >= 0.6) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview do Conteúdo
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Canal: <strong>{channel.replace('_', ' ')}</strong></span>
            <span>Formato: <strong>{content.content_brief.format}</strong></span>
            <span>Objetivo: <strong>{content.content_brief.objective}</strong></span>
          </div>
        </CardHeader>
      </Card>

      {/* Variations Tabs */}
      <Tabs value={selectedVariation.toString()} onValueChange={(value) => onVariationSelect?.(parseInt(value))}>
        <TabsList className="grid w-full grid-cols-3">
          {content.variations.map((_, index) => (
            <TabsTrigger key={index} value={index.toString()}>
              Variação {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {content.variations.map((variation, index) => (
          <TabsContent key={index} value={index.toString()} className="space-y-6">
            {/* Content Preview */}
            <Card>
              <CardContent className="p-6">
                <PreviewComponent content={variation} />
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(variation, index)}
                    >
                      {copiedVariation === index ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copiedVariation === index ? 'Copiado!' : 'Copiar'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                  <Button size="sm" onClick={() => onFeedback?.({
                    content_id: content.id,
                    variation_id: variation.id,
                    rating: 5,
                    feedback_type: 'general',
                  })}>
                    <Heart className="h-4 w-4 mr-2" />
                    Gostei
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quality Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Métricas de Qualidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Legibilidade</span>
                <Badge variant={getScoreVariant(content.quality_metrics.readability_score)}>
                  {Math.round(content.quality_metrics.readability_score * 100)}%
                </Badge>
              </div>
              <Progress value={content.quality_metrics.readability_score * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Relevância</span>
                <Badge variant={getScoreVariant(content.quality_metrics.relevance_score)}>
                  {Math.round(content.quality_metrics.relevance_score * 100)}%
                </Badge>
              </div>
              <Progress value={content.quality_metrics.relevance_score * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Brand Voice</span>
                <Badge variant={getScoreVariant(content.quality_metrics.brand_consistency)}>
                  {Math.round(content.quality_metrics.brand_consistency * 100)}%
                </Badge>
              </div>
              <Progress value={content.quality_metrics.brand_consistency * 100} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compliance</span>
                <Badge variant={getScoreVariant(content.quality_metrics.compliance_score)}>
                  {Math.round(content.quality_metrics.compliance_score * 100)}%
                </Badge>
              </div>
              <Progress value={content.quality_metrics.compliance_score * 100} />
            </div>
          </div>

          {/* Engagement Prediction */}
          {content.engagement_prediction && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3">Predição de Engajamento</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Score de Engajamento</span>
                  <div className="flex items-center gap-2">
                    <Progress value={content.engagement_prediction.score * 100} className="w-24" />
                    <Badge variant="outline">
                      {Math.round(content.engagement_prediction.score * 100)}%
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {content.engagement_prediction.factors.map((factor) => (
                    <Badge key={factor} variant="secondary" className="text-xs">
                      {factor.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
                {content.engagement_prediction.recommendations.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Recomendações:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {content.engagement_prediction.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compliance Notes */}
          {content.compliance_notes.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Notas de Compliance
              </h4>
              <ul className="space-y-2">
                {content.compliance_notes.map((note, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};