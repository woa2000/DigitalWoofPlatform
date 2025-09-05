import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { BrandVoiceProfile } from "@/components/dashboard/BrandVoiceProfile";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActiveCampaigns } from "@/components/dashboard/ActiveCampaigns";
import { AIContentPipeline } from "@/components/dashboard/AIContentPipeline";
import { ComplianceMonitor } from "@/components/dashboard/ComplianceMonitor";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { BrandManualSection } from "@/components/dashboard/BrandManualSection";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleNewCampaign = () => {
    toast({
      title: "Nova Campanha",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  return (
    <DashboardLayout
      title="Dashboard Executivo"
      subtitle="Visão geral das suas campanhas e performance"
      onNewCampaign={handleNewCampaign}
    >
      {/* Stats Cards */}
      <StatsCards />

      {/* Brand Voice & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <BrandVoiceProfile />
        <QuickActions />
      </div>

      {/* Campaigns & AI Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ActiveCampaigns />
        <AIContentPipeline />
      </div>

      {/* Compliance & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ComplianceMonitor />
        <PerformanceChart />
      </div>

      {/* Brand Manual */}
      <BrandManualSection />
    </DashboardLayout>
  );
}
