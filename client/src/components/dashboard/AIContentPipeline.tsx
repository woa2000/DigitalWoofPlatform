import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Pause } from "lucide-react";
import { useState } from "react";

export function AIContentPipeline() {
  const [contentPipeline] = useState([
    {
      type: "instagram",
      title: "Posts Instagram",
      description: "12 posts gerados, compliance OK",
      status: "completed" as const,
      progress: 100
    },
    {
      type: "email",
      title: "Sequência Email",
      description: "Gerando 5 emails de nurturing",
      status: "processing" as const,
      progress: 75
    },
    {
      type: "whatsapp",
      title: "WhatsApp Templates",
      description: "Aguardando aprovação humana",
      status: "pending" as const,
      progress: 0
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-accent" />;
      case "pending":
        return <Pause className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/5 border-green-500/20";
      case "processing":
        return "bg-accent/5 border-accent/20";
      case "pending":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  return (
    <Card data-testid="ai-content-pipeline">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pipeline de Conteúdo IA</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm text-green-500">80% Automático</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {contentPipeline.map((item, index) => (
          <div 
            key={index}
            className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(item.status)}`}
            data-testid={`ai-content-item-${index}`}
          >
            <div className="flex items-center space-x-3">
              {getStatusIcon(item.status)}
              <div>
                <p className="text-sm font-medium" data-testid={`text-content-title-${index}`}>
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`text-content-description-${index}`}>
                  {item.description}
                </p>
              </div>
            </div>
            
            {item.status === "processing" && (
              <div className="w-16" data-testid={`progress-content-${index}`}>
                <Progress value={item.progress} className="h-2" />
              </div>
            )}
            
            {item.status === "completed" && (
              <Button variant="ghost" size="sm" data-testid={`button-review-${index}`}>
                Revisar
              </Button>
            )}
            
            {item.status === "pending" && (
              <Button size="sm" data-testid={`button-approve-${index}`}>
                Aprovar
              </Button>
            )}
          </div>
        ))}

        <div className="mt-4 p-3 bg-primary/5 rounded-lg" data-testid="time-savings">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Economia de Tempo</span>
            <span className="text-sm font-semibold text-primary">32 horas/semana</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
