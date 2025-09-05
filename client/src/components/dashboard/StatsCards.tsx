import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

const statIcons = {
  campaigns: "📢",
  content: "🤖",
  compliance: "🛡️",
  engagement: "❤️"
};

export function StatsCards() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Erro ao carregar estatísticas</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsData = [
    {
      title: "Campanhas Ativas",
      value: stats?.activeCampaigns || 0,
      trend: stats?.trends?.campaigns || 0,
      icon: statIcons.campaigns,
      description: "vs mês anterior"
    },
    {
      title: "Conteúdo Gerado IA",
      value: stats?.aiContentGenerated || 0,
      trend: stats?.trends?.content || 0,
      icon: statIcons.content,
      description: "automação"
    },
    {
      title: "Taxa Compliance",
      value: `${stats?.complianceRate || 0}%`,
      trend: stats?.trends?.compliance || 0,
      icon: statIcons.compliance,
      description: "CFMV aprovado"
    },
    {
      title: "Engajamento",
      value: `${stats?.engagementRate || 0}%`,
      trend: stats?.trends?.engagement || 0,
      icon: statIcons.engagement,
      description: "média setor"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="stats-cards">
      {statsData.map((stat, index) => (
        <Card key={index} data-testid={`card-stat-${index}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm" data-testid={`text-stat-title-${index}`}>
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-foreground" data-testid={`text-stat-value-${index}`}>
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-xl" data-testid={`icon-stat-${index}`}>
                  {stat.icon}
                </span>
              </div>
            </div>
            <div className="flex items-center mt-2">
              {stat.trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${stat.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend > 0 ? '+' : ''}{stat.trend}%
              </span>
              <span className="text-muted-foreground text-sm ml-1" data-testid={`text-stat-description-${index}`}>
                {stat.description}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
