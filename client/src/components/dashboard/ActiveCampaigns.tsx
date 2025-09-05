import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCampaigns } from "@/hooks/useCampaigns";
import { Skeleton } from "@/components/ui/skeleton";

export function ActiveCampaigns() {
  const { campaigns, isLoading, error } = useCampaigns();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Ativas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Erro ao carregar campanhas</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap = {
      ativa: { variant: "default" as const, color: "bg-green-500/10 text-green-500", label: "Ativa" },
      em_teste: { variant: "secondary" as const, color: "bg-accent/10 text-accent", label: "Em Teste" },
      pausada: { variant: "outline" as const, color: "bg-muted", label: "Pausada" },
    };
    return statusMap[status] || statusMap.ativa;
  };

  // Mock data if no campaigns available
  const campaignsData = campaigns && campaigns.length > 0 ? campaigns : [
    {
      id: "1",
      name: "Check-up Preventivo",
      type: "veterinaria",
      status: "ativa" as const,
      description: "Veterinária • Jornada LP → Email → WhatsApp",
      metrics: { leads: 147, conversion: 12.5 }
    },
    {
      id: "2", 
      name: "Programa VIP Pet",
      type: "pet_shop",
      status: "em_teste" as const,
      description: "Pet Shop • Programa de Fidelidade",
      metrics: { leads: 89, conversion: 23.6 }
    }
  ];

  return (
    <Card data-testid="active-campaigns">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campanhas Ativas</CardTitle>
        <Button variant="ghost" size="sm" data-testid="button-view-all-campaigns">
          Ver Todas
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {campaignsData.map((campaign, index) => {
          const status = getStatusBadge(campaign.status);
          return (
            <div 
              key={campaign.id} 
              className="p-4 border border-border rounded-lg"
              data-testid={`campaign-${index}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground" data-testid={`text-campaign-name-${index}`}>
                  {campaign.name}
                </h4>
                <Badge 
                  variant={status.variant}
                  className={status.color}
                  data-testid={`badge-campaign-status-${index}`}
                >
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3" data-testid={`text-campaign-description-${index}`}>
                {campaign.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-muted-foreground">Leads:</span>
                  <span className="font-medium text-foreground ml-1" data-testid={`text-campaign-leads-${index}`}>
                    {campaign.metrics.leads}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Conversão:</span>
                  <span 
                    className={`font-medium ml-1 ${campaign.status === 'ativa' ? 'text-green-500' : 'text-accent'}`}
                    data-testid={`text-campaign-conversion-${index}`}
                  >
                    {campaign.metrics.conversion}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
