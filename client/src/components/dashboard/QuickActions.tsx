import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wand2, Stethoscope, Route, Shield, Palette } from "lucide-react";
import { Link } from "wouter";

const quickActions = [
  {
    icon: Palette,
    title: "Onboarding de Marca",
    description: "Configure sua identidade",
    color: "text-purple-500",
    href: "/onboarding"
  },
  {
    icon: Wand2,
    title: "Gerar Conteúdo IA",
    description: "Posts, emails, WhatsApp",
    color: "text-primary",
    href: "/ai-content/generate"
  },
  {
    icon: Stethoscope,
    title: "Anamnese Digital",
    description: "Diagnóstico de negócio",
    color: "text-accent",
    href: "/anamnesis"
  },
  {
    icon: Route,
    title: "Jornada Automatizada",
    description: "LP → Email → WhatsApp",
    color: "text-green-500",
    href: "/journeys"
  },
  {
    icon: Shield,
    title: "Validar Compliance",
    description: "CFMV regulations",
    color: "text-red-500",
    href: "/compliance/validate"
  }
];

export function QuickActions() {
  return (
    <Card data-testid="quick-actions">
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Button
              variant="ghost"
              className="w-full justify-start p-3 h-auto"
              data-testid={`button-quick-action-${index}`}
            >
              <div className="flex items-center space-x-3">
                <action.icon className={`h-5 w-5 ${action.color}`} />
                <div className="text-left">
                  <p className="text-sm font-medium" data-testid={`text-action-title-${index}`}>
                    {action.title}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`text-action-description-${index}`}>
                    {action.description}
                  </p>
                </div>
              </div>
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
