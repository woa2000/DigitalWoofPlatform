import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  ChartLine, 
  Megaphone, 
  Bot, 
  Book, 
  Stethoscope, 
  Shield, 
  Images, 
  Menu,
  Settings,
  User,
  Palette
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartLine },
  { name: "Onboarding de Marca", href: "/onboarding", icon: Palette },
  { name: "Campanhas", href: "/campaigns", icon: Megaphone },
  { name: "IA Content", href: "/ai-content", icon: Bot },
  { name: "Manual da Marca", href: "/brand-manual", icon: Book },
  { name: "Anamnese Digital", href: "/anamnesis", icon: Stethoscope },
  { name: "Compliance", href: "/compliance", icon: Shield },
  { name: "Assets", href: "/assets", icon: Images },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64",
        className
      )}
      data-testid="sidebar"
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", collapsed && "hidden")}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground text-sm">🐾</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Woof</h1>
              <p className="text-xs text-muted-foreground">Marketing Platform</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            data-testid="button-toggle-sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted",
                  collapsed && "justify-center"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span>{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className={cn("flex items-center space-x-3", collapsed && "justify-center")}>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium">{user?.email || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground">Digital Woof</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            data-testid="button-settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
