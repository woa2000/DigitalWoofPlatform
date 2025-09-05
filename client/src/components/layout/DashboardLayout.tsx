import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onNewCampaign?: () => void;
}

export function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  onNewCampaign 
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <div 
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
        data-testid="main-content"
      >
        <Header 
          title={title} 
          subtitle={subtitle} 
          onNewCampaign={onNewCampaign}
        />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
