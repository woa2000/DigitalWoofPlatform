import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Target, Users, Mic } from "lucide-react";

const brandManualSections = [
  {
    icon: Palette,
    title: "Identidade Visual",
    description: "Logo, paleta, tipografia",
    status: "complete",
    color: "text-primary"
  },
  {
    icon: Target,
    title: "Posicionamento",
    description: "Mercado e diferenciação",
    status: "active",
    color: "text-accent"
  },
  {
    icon: Users,
    title: "Público-Alvo",
    description: "Personas e comportamentos",
    status: "defined",
    color: "text-green-500"
  },
  {
    icon: Mic,
    title: "Tom de Voz",
    description: "Comunicação e linguagem",
    status: "in_use",
    color: "text-orange-500"
  }
];

export function BrandManualSection() {
  const getStatusBadge = (status: string) => {
    const statusMap = {
      complete: { label: "Completo", color: "text-green-500" },
      active: { label: "Ativo", color: "text-green-500" },
      defined: { label: "Definido", color: "text-green-500" },
      in_use: { label: "Em Uso", color: "text-accent" }
    };
    return statusMap[status] || { label: status, color: "text-muted-foreground" };
  };

  return (
    <Card className="mt-8" data-testid="brand-manual-section">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manual da Marca Digital</CardTitle>
        <Button data-testid="button-manage-manuals">
          Gerenciar Manuais
        </Button>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {brandManualSections.map((section, index) => {
            const status = getStatusBadge(section.status);
            return (
              <div 
                key={index}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                data-testid={`brand-manual-item-${index}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <section.icon className={`h-5 w-5 ${section.color}`} />
                  <Badge 
                    variant="secondary" 
                    className={status.color}
                    data-testid={`badge-manual-status-${index}`}
                  >
                    {status.label}
                  </Badge>
                </div>
                <h4 className="font-medium text-sm mb-1" data-testid={`text-manual-title-${index}`}>
                  {section.title}
                </h4>
                <p className="text-xs text-muted-foreground" data-testid={`text-manual-description-${index}`}>
                  {section.description}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
