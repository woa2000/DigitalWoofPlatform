import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield } from "lucide-react";
import { useComplianceMetrics } from "@/hooks/useCompliance";
import { Skeleton } from "@/components/ui/skeleton";

export function ComplianceMonitor() {
  const { data: compliance, isLoading, error } = useComplianceMetrics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Monitor Compliance
            <Shield className="h-5 w-5" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Erro ao carregar compliance</p>
        </CardContent>
      </Card>
    );
  }

  // Mock data if not available
  const complianceData = compliance || {
    overall: 98.5,
    categories: {
      medical: 100,
      promotional: 96,
      legal: 100
    }
  };

  return (
    <Card data-testid="compliance-monitor">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Monitor Compliance</CardTitle>
        <Shield className="h-5 w-5 text-green-500" />
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Validações CFMV</span>
          <span className="text-sm font-semibold text-green-500" data-testid="text-compliance-overall">
            {complianceData.overall}%
          </span>
        </div>
        
        <Progress 
          value={complianceData.overall} 
          className="h-2" 
          data-testid="progress-compliance-overall"
        />
        
        <div className="pt-2 space-y-1">
          {Object.entries(complianceData.categories).map(([category, value], index) => (
            <div key={category} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground capitalize" data-testid={`text-category-${category}`}>
                {category === 'medical' ? 'Médica' : 
                 category === 'promotional' ? 'Promocional' : 
                 category === 'legal' ? 'Legal' : category}
              </span>
              <span className="text-xs text-green-500" data-testid={`text-category-value-${category}`}>
                {value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
