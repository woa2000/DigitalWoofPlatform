import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, X, Sparkles } from 'lucide-react';
import { ContentBrief, GeneratedContent } from '@/types';
import { useContentGeneration } from '@/hooks/useContentGeneration';
import { useBrandVoice } from '@/hooks/useBrandVoice';

const contentBriefSchema = z.object({
  theme: z.string().min(1, 'Tema é obrigatório'),
  objective: z.enum(['educar', 'vender', 'engajar', 'recall_marca', 'awareness'], {
    required_error: 'Objetivo é obrigatório',
  }),
  channel: z.enum([
    'instagram_post', 'instagram_story', 'facebook_post', 
    'linkedin_post', 'twitter_post', 'email', 'blog', 'newsletter'
  ], {
    required_error: 'Canal é obrigatório',
  }),
  format: z.enum([
    'texto', 'video_script', 'infografico', 
    'carrossel', 'story_sequence', 'email_template'
  ], {
    required_error: 'Formato é obrigatório',
  }),
  target_audience: z.string().optional(),
  custom_instructions: z.string().optional(),
  words_to_avoid: z.array(z.string()).optional(),
  tone_adjustments: z.string().optional(),
  call_to_action: z.string().optional(),
  context: z.string().optional(),
});

type ContentBriefFormData = z.infer<typeof contentBriefSchema>;

interface ContentBriefFormProps {
  onContentGenerated?: (content: GeneratedContent[]) => void;
  className?: string;
}

const objectiveOptions = [
  { value: 'educar', label: 'Educar' },
  { value: 'vender', label: 'Vender' },
  { value: 'engajar', label: 'Engajar' },
  { value: 'recall_marca', label: 'Recall de Marca' },
  { value: 'awareness', label: 'Awareness' },
] as const;

const channelOptions = [
  { value: 'instagram_post', label: 'Instagram Post' },
  { value: 'instagram_story', label: 'Instagram Story' },
  { value: 'facebook_post', label: 'Facebook Post' },
  { value: 'linkedin_post', label: 'LinkedIn Post' },
  { value: 'twitter_post', label: 'Twitter/X Post' },
  { value: 'email', label: 'Email' },
  { value: 'blog', label: 'Blog' },
  { value: 'newsletter', label: 'Newsletter' },
] as const;

const formatOptions = [
  { value: 'texto', label: 'Texto' },
  { value: 'video_script', label: 'Script de Vídeo' },
  { value: 'infografico', label: 'Infográfico' },
  { value: 'carrossel', label: 'Carrossel' },
  { value: 'story_sequence', label: 'Sequência de Stories' },
  { value: 'email_template', label: 'Template de Email' },
] as const;

export const ContentBriefForm: React.FC<ContentBriefFormProps> = ({ 
  onContentGenerated, 
  className 
}) => {
  const [wordsToAvoid, setWordsToAvoid] = useState<string[]>([]);
  const [newWord, setNewWord] = useState('');
  
  const { activeBrandVoice } = useBrandVoice();
  const { generateContent, isGenerating, error } = useContentGeneration();

  const form = useForm<ContentBriefFormData>({
    resolver: zodResolver(contentBriefSchema),
    defaultValues: {
      theme: '',
      target_audience: '',
      custom_instructions: '',
      words_to_avoid: [],
      tone_adjustments: '',
      call_to_action: '',
      context: '',
    },
  });

  // Update words_to_avoid in form when local state changes
  useEffect(() => {
    form.setValue('words_to_avoid', wordsToAvoid);
  }, [wordsToAvoid, form]);

  const addWordToAvoid = () => {
    if (newWord.trim() && !wordsToAvoid.includes(newWord.trim())) {
      setWordsToAvoid([...wordsToAvoid, newWord.trim()]);
      setNewWord('');
    }
  };

  const removeWordToAvoid = (word: string) => {
    setWordsToAvoid(wordsToAvoid.filter(w => w !== word));
  };

  const onSubmit = async (data: ContentBriefFormData) => {
    if (!activeBrandVoice) {
      console.error('No active brand voice selected');
      return;
    }

    try {
      const brief: ContentBrief = {
        ...data,
        words_to_avoid: wordsToAvoid,
      };

      const generatedContent = await generateContent(brief, activeBrandVoice.id, {
        includeEngagementPrediction: true,
        variationCount: 3,
      });

      onContentGenerated?.(generatedContent);
      
      // Reset form after successful generation
      form.reset();
      setWordsToAvoid([]);
    } catch (err) {
      console.error('Error generating content:', err);
    }
  };

  if (!activeBrandVoice) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">
            Selecione um Brand Voice para gerar conteúdo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Novo Conteúdo
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Brand Voice ativo: <strong>{activeBrandVoice.name}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema/Assunto *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Cuidados com pets no inverno"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descreva o tema principal do conteúdo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o objetivo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {objectiveOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Canal *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o canal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {channelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Formato *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o formato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formatOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="target_audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Público-alvo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Donos de cães adultos em centros urbanos"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descreva o público específico (opcional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="custom_instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruções Personalizadas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Instruções específicas para geração do conteúdo..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detalhes específicos, menções obrigatórias, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Palavras a Evitar</FormLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar palavra..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addWordToAvoid();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addWordToAvoid}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {wordsToAvoid.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {wordsToAvoid.map((word) => (
                    <Badge key={word} variant="secondary" className="pr-1">
                      {word}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 ml-1"
                        onClick={() => removeWordToAvoid(word)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="call_to_action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call to Action</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Agende uma consulta hoje"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tone_adjustments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ajustes de Tom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Mais formal, menos técnico"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contexto Adicional</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contexto relevante, campanhas relacionadas, etc..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Conteúdo...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Conteúdo
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};