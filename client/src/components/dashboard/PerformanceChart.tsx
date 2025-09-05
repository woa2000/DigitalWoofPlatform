import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3 } from "lucide-react";
import { usePerformanceData } from "@/hooks/useDashboard";
import { Skeleton } from "@/components/ui/skeleton";

export function PerformanceChart() {
  const { data: performance, isLoading, error } = usePerformanceData();

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Performance por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <p className="text-destructive">Erro ao carregar performance</p>
        </CardContent>
      </Card>
    );
  }

  // Mock data if not available
  const performanceData = performance || {
    instagram: 8.7,
    email: 15.2,
    whatsapp: 23.5
  };

  const channels = [
    { name: "Instagram", value: performanceData.instagram, color: "text-primary" },
    { name: "Email", value: performanceData.email, color: "text-accent" },
    { name: "WhatsApp", value: performanceData.whatsapp, color: "text-green-500" }
  ];

  return (
    <Card className="lg:col-span-2" data-testid="performance-chart">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Performance por Canal</CardTitle>
        <Select defaultValue="30days">
          <SelectTrigger className="w-40" data-testid="select-time-period">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Últimos 7 dias</SelectItem>
            <SelectItem value="30days">Últimos 30 dias</SelectItem>
            <SelectItem value="thismonth">Este mês</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {channels.map((channel, index) => (
            <div key={channel.name} className="text-center" data-testid={`channel-${index}`}>
              <p className={`text-2xl font-semibold ${channel.color}`} data-testid={`text-channel-value-${index}`}>
                {channel.value}%
              </p>
              <p className="text-sm text-muted-foreground" data-testid={`text-channel-name-${index}`}>
                {channel.name}
              </p>
            </div>
          ))}
        </div>
        
        {/* Chart placeholder */}
        <div className="h-40 bg-muted rounded-lg flex items-center justify-center" data-testid="chart-placeholder">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Gráfico de Performance Interativo</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
