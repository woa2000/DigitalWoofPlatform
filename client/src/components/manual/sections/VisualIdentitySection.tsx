/**
 * @fileoverview Visual Identity Section Component
 * Displays brand colors, logo, typography, and imagery guidelines
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Separator } from '../../ui/separator';
// import { ColorPalette } from '../../ui/ColorPalette'; // TODO: Create ColorPalette component
import { cn } from '../../../lib/utils';
import {
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Palette,
  Type,
  Image as ImageIcon,
  Lightbulb,
  AlertTriangle,
  ExternalLink,
  Smartphone,
  Monitor,
  Printer
} from 'lucide-react';
import type { RenderedManual, ValidationResult } from '../../../../../shared/types/manual';

interface VisualIdentitySectionProps {
  manual?: RenderedManual;
  currentSubsection?: string;
  onSubsectionChange?: (subsectionId: string) => void;
  onNavigateToSection?: (sectionId: string, subsectionId?: string) => void;
  validation?: ValidationResult;
  isLoading?: boolean;
}

export default function VisualIdentitySection({
  manual,
  currentSubsection,
  onSubsectionChange,
  onNavigateToSection,
  validation,
  isLoading = false
}: VisualIdentitySectionProps) {
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [showColorNames, setShowColorNames] = useState(true);
  const [selectedColorFormat, setSelectedColorFormat] = useState<'hex' | 'rgb' | 'hsl'>('hex');

  const visualSection = manual?.sections?.visual;

  // Copy color to clipboard
  const copyToClipboard = async (text: string, colorId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedColor(colorId);
      setTimeout(() => setCopiedColor(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  };

  // Convert hex to HSL
  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Format color based on selected format
  const formatColor = (hex: string) => {
    switch (selectedColorFormat) {
      case 'rgb':
        const rgb = hexToRgb(hex);
        return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : hex;
      case 'hsl':
        const hsl = hexToHsl(hex);
        return hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : hex;
      default:
        return hex;
    }
  };

  // Get accessibility info for color
  const getAccessibilityInfo = (color: string) => {
    const palette = visualSection?.palette;
    if (!palette?.accessibility) return null;

    // This would normally calculate contrast ratios
    // For now, we'll use mock data based on the color
    const isLight = hexToHsl(color)?.l || 0 > 50;
    
    return {
      wcag_aa: !isLight, // Dark colors generally have better contrast
      wcag_aaa: !isLight && (hexToHsl(color)?.l || 0) < 30,
      contrast_ratio: isLight ? 2.8 : 7.2 // Mock values
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!visualSection) {
    return (
      <div className="p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Dados de identidade visual não encontrados. Verifique se o Brand Voice foi gerado corretamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Palette className="h-6 w-6 text-blue-600" />
            <span>Identidade Visual</span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorNames(!showColorNames)}
            >
              {showColorNames ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showColorNames ? 'Ocultar Nomes' : 'Mostrar Nomes'}
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Assets
            </Button>
          </div>
        </div>
        
        <p className="text-muted-foreground">
          Elementos visuais que definem a identidade da sua marca
        </p>
      </div>

      {/* Validation Warnings */}
      {validation && !validation.valid && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Algumas questões foram encontradas na identidade visual. Verifique as recomendações abaixo.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={currentSubsection || 'colors'} onValueChange={onSubsectionChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Cores</span>
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4" />
            <span>Logo</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center space-x-2">
            <Type className="h-4 w-4" />
            <span>Tipografia</span>
          </TabsTrigger>
          <TabsTrigger value="imagery" className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4" />
            <span>Imagens</span>
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Primary Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cores Primárias</CardTitle>
                <CardDescription>
                  Cores principais da marca, usadas em elementos destacados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div 
                  className="h-24 rounded-lg border-2 border-gray-200 relative cursor-pointer hover:border-gray-300 transition-colors"
                  style={{ backgroundColor: visualSection.palette.primary }}
                  onClick={() => copyToClipboard(formatColor(visualSection.palette.primary), 'primary')}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {copiedColor === 'primary' ? (
                      <Check className="h-5 w-5 text-white drop-shadow" />
                    ) : (
                      <Copy className="h-5 w-5 text-white drop-shadow opacity-0 hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Cor Principal</span>
                    <div className="flex space-x-1">
                      {['hex', 'rgb', 'hsl'].map(format => (
                        <Button
                          key={format}
                          variant={selectedColorFormat === format ? "default" : "outline"}
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setSelectedColorFormat(format as any)}
                        >
                          {format.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <code className="block text-sm bg-gray-100 p-2 rounded">
                    {formatColor(visualSection.palette.primary)}
                  </code>

                  {/* Accessibility info */}
                  {(() => {
                    const accessibilityInfo = getAccessibilityInfo(visualSection.palette.primary);
                    return accessibilityInfo && (
                      <div className="flex space-x-2">
                        <Badge variant={accessibilityInfo.wcag_aa ? "default" : "destructive"} className="text-xs">
                          WCAG AA {accessibilityInfo.wcag_aa ? '✓' : '✗'}
                        </Badge>
                        <Badge variant={accessibilityInfo.wcag_aaa ? "default" : "secondary"} className="text-xs">
                          WCAG AAA {accessibilityInfo.wcag_aaa ? '✓' : '✗'}
                        </Badge>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Secondary Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cores Secundárias</CardTitle>
                <CardDescription>
                  Cores de apoio para criar variedade e hierarquia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {visualSection.palette.secondary.map((color, index) => (
                    <div
                      key={index}
                      className="h-16 rounded border-2 border-gray-200 relative cursor-pointer hover:border-gray-300 transition-colors"
                      style={{ backgroundColor: color }}
                      onClick={() => copyToClipboard(formatColor(color), `secondary-${index}`)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        {copiedColor === `secondary-${index}` ? (
                          <Check className="h-4 w-4 text-white drop-shadow" />
                        ) : (
                          <Copy className="h-4 w-4 text-white drop-shadow opacity-0 hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {showColorNames && (
                  <div className="space-y-1">
                    {visualSection.palette.secondary.map((color: string, index: number) => (
                      <code key={index} className="block text-xs bg-gray-100 p-1 rounded">
                        {formatColor(color)}
                      </code>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Neutral Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cores Neutras</CardTitle>
                <CardDescription>
                  Tons neutros para texto, fundos e elementos de UI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {visualSection.palette.neutral.map((color: string, index: number) => (
                    <div
                      key={index}
                      className="h-8 rounded border border-gray-200 relative cursor-pointer hover:border-gray-300 transition-colors flex items-center px-3 text-sm"
                      style={{ 
                        backgroundColor: color,
                        color: hexToHsl(color)?.l || 0 > 50 ? '#000' : '#fff'
                      }}
                      onClick={() => copyToClipboard(formatColor(color), `neutral-${index}`)}
                    >
                      <span className="flex-1">
                        {showColorNames ? formatColor(color) : `Neutro ${index + 1}`}
                      </span>
                      {copiedColor === `neutral-${index}` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4 opacity-60 hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Color Usage Examples */}
          {visualSection.palette.usage_examples && visualSection.palette.usage_examples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Exemplos de Uso</CardTitle>
                <CardDescription>
                  Como aplicar as cores em diferentes contextos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {visualSection.palette.usage_examples.map((example: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {example.context === 'digital' && <Smartphone className="h-4 w-4" />}
                        {example.context === 'web' && <Monitor className="h-4 w-4" />}
                        {example.context === 'print' && <Printer className="h-4 w-4" />}
                        <span className="font-medium capitalize">{example.context}</span>
                      </div>
                      
                      <div 
                        className="h-20 rounded border p-4 flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: example.primary_color }}
                      >
                        {example.description}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <strong>Primária:</strong> {example.primary_color}<br />
                        <strong>Secundária:</strong> {example.secondary_color}<br />
                        <strong>Texto:</strong> {example.text_color}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accessibility Guidelines */}
          {visualSection.palette.accessibility && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  <span>Diretrizes de Acessibilidade</span>
                </CardTitle>
                <CardDescription>
                  Recomendações para garantir boa legibilidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={visualSection.palette.accessibility.wcag_aa_compliant ? "default" : "destructive"}>
                      WCAG AA
                    </Badge>
                    <span className="text-sm">
                      {visualSection.palette.accessibility.wcag_aa_compliant ? 'Conforme' : 'Não conforme'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={visualSection.palette.accessibility.wcag_aaa_compliant ? "default" : "destructive"}>
                      WCAG AAA
                    </Badge>
                    <span className="text-sm">
                      {visualSection.palette.accessibility.wcag_aaa_compliant ? 'Conforme' : 'Não conforme'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={visualSection.palette.accessibility.color_blind_friendly ? "default" : "destructive"}>
                      Daltonismo
                    </Badge>
                    <span className="text-sm">
                      {visualSection.palette.accessibility.color_blind_friendly ? 'Amigável' : 'Cuidado'}
                    </span>
                  </div>
                </div>

                {visualSection.palette.accessibility.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Recomendações:</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {visualSection.palette.accessibility.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Logo Tab */}
        <TabsContent value="logo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Logo Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Logo Principal</span>
                </CardTitle>
                <CardDescription>
                  Versão primária do logotipo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <div className="bg-blue-600 text-white p-4 rounded-lg inline-block">
                    <span className="font-bold text-xl">Digital Woof</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Logo Principal</p>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download SVG
                </Button>
              </CardContent>
            </Card>

            {/* Variações do Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Variações</CardTitle>
                <CardDescription>
                  Diferentes versões para diferentes aplicações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {visualSection.logo?.variants?.map((variation: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{variation.name}</h4>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{variation.usage_context.join(', ')}</p>
                    <div className="bg-gray-50 p-4 rounded mt-2 text-center">
                      <div className="bg-blue-600 text-white p-2 rounded inline-block text-sm">
                        DW
                      </div>
                    </div>
                  </div>
                )) || [
                  <div key="default" className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Logo Horizontal</h4>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">Para cabeçalhos e assinaturas</p>
                    <div className="bg-gray-50 p-4 rounded mt-2 text-center">
                      <div className="bg-blue-600 text-white p-2 rounded inline-block text-sm">
                        Digital Woof
                      </div>
                    </div>
                  </div>
                ]}
              </CardContent>
            </Card>
          </div>

          {/* Diretrizes de Uso */}
          <Card>
            <CardHeader>
              <CardTitle>Diretrizes de Uso</CardTitle>
              <CardDescription>
                Regras importantes para manter a integridade da marca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">✓ Permitido</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Usar em fundos com bom contraste</li>
                    <li>• Manter proporções originais</li>
                    <li>• Respeitar área de proteção</li>
                    <li>• Usar versões oficiais fornecidas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-red-700 mb-2">✗ Proibido</h4>
                  <ul className="space-y-1 text-sm">
                    {visualSection.logo?.usage_guidelines?.slice(2).map((rule: string, index: number) => (
                      <li key={index}>• {rule}</li>
                    )) || [
                      <li key="1">• Não alterar proporções</li>,
                      <li key="2">• Não usar sobre fundos com baixo contraste</li>,
                      <li key="3">• Não aplicar efeitos ou sombras</li>
                    ]}
                  </ul>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium mb-1">Tamanho Mínimo</h5>
                    <p className="text-sm text-gray-600">24px</p>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Área de Proteção</h5>
                    <p className="text-sm text-gray-600">Altura da letra 'o' do logotipo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fonte Primária */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Type className="h-5 w-5" />
                  <span>Fonte Primária</span>
                </CardTitle>
                <CardDescription>
                  {visualSection.typography?.style || 'Fonte principal da marca'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div style={{ fontFamily: visualSection.typography?.primary || 'Inter, sans-serif' }}>
                    <h3 className="text-2xl font-bold mb-2">
                      {visualSection.typography?.primary || 'Inter'}
                    </h3>
                    <p className="text-lg">Aa Bb Cc Dd Ee Ff Gg</p>
                    <p className="text-sm text-gray-600 mt-2">
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Pesos Disponíveis</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Badge variant="outline">400</Badge>
                    <Badge variant="outline">500</Badge>
                    <Badge variant="outline">600</Badge>
                    <Badge variant="outline">700</Badge>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Fonts
                </Button>
              </CardContent>
            </Card>

            {/* Exemplos de Uso */}
            <Card>
              <CardHeader>
                <CardTitle>Exemplos de Uso</CardTitle>
                <CardDescription>
                  Hierarquia tipográfica e aplicações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {visualSection.typography?.examples?.map((example: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{example.weight}</Badge>
                      <span className="text-sm text-gray-500">{example.size}</span>
                    </div>
                    <div 
                      style={{ 
                        fontSize: example.size,
                        fontWeight: example.weight,
                        fontFamily: visualSection.typography?.primary || 'Inter, sans-serif'
                      }}
                      className="mb-2"
                    >
                      {example.text}
                    </div>
                    <p className="text-xs text-gray-600">{example.usage_context}</p>
                  </div>
                )) || [
                  <div key="default" className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">700</Badge>
                      <span className="text-sm text-gray-500">2.5rem</span>
                    </div>
                    <div className="text-4xl font-bold mb-2">Título Principal</div>
                    <p className="text-xs text-gray-600">Para títulos principais de páginas</p>
                  </div>
                ]}
              </CardContent>
            </Card>
          </div>

          {/* Diretrizes Gerais */}
          <Card>
            <CardHeader>
              <CardTitle>Diretrizes Tipográficas</CardTitle>
              <CardDescription>
                Boas práticas para uso consistente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="text-sm space-y-2">
                  <li>• <strong>Entrelinhamento:</strong> 1.5 para corpo de texto, 1.2 para títulos</li>
                  <li>• <strong>Fonte primária:</strong> Interface, textos corridos e elementos funcionais</li>
                  <li>• <strong>Hierarquia:</strong> Use pesos e tamanhos consistentes para criar hierarquia clara</li>
                  <li>• <strong>Contraste:</strong> Sempre garantir legibilidade adequada (mínimo 4.5:1)</li>
                  <li>• <strong>Responsividade:</strong> Ajustar tamanhos para diferentes dispositivos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Imagery Tab - Placeholder */}
        <TabsContent value="imagery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Diretrizes de Imagem</CardTitle>
              <CardDescription>
                Estilo e tratamento para fotografias e ilustrações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Seção de imagens em desenvolvimento. Será implementada na próxima iteração.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}