import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Mic, Users, Info } from "lucide-react";
import { useBrandVoice } from "@/hooks/useBrandVoice";
import { Skeleton } from "@/components/ui/skeleton";

export function BrandVoiceProfile() {
  const { data: brandVoice, isLoading, error } = useBrandVoice();

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Brand Voice Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <p className="text-destructive">Erro ao carregar Brand Voice</p>
        </CardContent>
      </Card>
    );
  }

  const sections = [
    {
      icon: Palette,
      title: "Identidade Visual",
      description: "Logo, cores, tipografia",
      status: brandVoice?.visualIdentity?.status || "incomplete",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Mic,
      title: "Tom de Voz",
      description: brandVoice?.voice?.description || "Profissional-amigável, empático",
      status: brandVoice?.voice?.status || "inactive",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: Users,
      title: "Público-Alvo",
      description: brandVoice?.audience?.description || "Tutores 25-45 anos, classe B/C",
      status: brandVoice?.audience?.status || "undefined",
      color: "bg-green-500/10 text-green-500"
    }
  ];

  const getStatusLabel = (status: string) => {
    const statusMap = {
      complete: "Completo",
      active: "Ativo",
      defined: "Definido",
      incomplete: "Incompleto",
      inactive: "Inativo",
      undefined: "Indefinido"
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    if (["complete", "active", "defined"].includes(status)) {
      return "text-green-500";
    }
    return "text-muted-foreground";
  };

  return (
    <Card className="lg:col-span-2" data-testid="brand-voice-profile">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Brand Voice Profile</CardTitle>
        <Button variant="ghost" size="sm" data-testid="button-edit-manual">
          Editar Manual
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {sections.map((section, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
            data-testid={`brand-voice-section-${index}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${section.color}`}>
                <section.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium" data-testid={`text-section-title-${index}`}>
                  {section.title}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`text-section-description-${index}`}>
                  {section.description}
                </p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={getStatusColor(section.status)}
              data-testid={`badge-section-status-${index}`}
            >
              ✓ {getStatusLabel(section.status)}
            </Badge>
          </div>
        ))}

        <div className="mt-6 p-4 bg-primary/5 rounded-lg" data-testid="brand-voice-optimization">
          <div className="flex items-start space-x-2">
            <Info className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-foreground">
                <strong>IA Otimizada:</strong> Seu Brand Voice JSON está alimentando todas as gerações de conteúdo com {brandVoice?.consistency || 98.5}% de consistência de marca.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
