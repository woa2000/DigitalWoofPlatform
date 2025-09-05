import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  onNewCampaign?: () => void;
}

export function Header({ title, subtitle, onNewCampaign }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-6 py-4" data-testid="header">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground" data-testid="text-title">
            {title}
          </h2>
          <p className="text-muted-foreground" data-testid="text-subtitle">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
          </Button>
          {onNewCampaign && (
            <Button onClick={onNewCampaign} data-testid="button-new-campaign">
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
