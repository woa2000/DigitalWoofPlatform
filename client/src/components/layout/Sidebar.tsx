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
  Palette,
  ChevronDown,
  ChevronRight,
  Eye,
  PaintBucket,
  MessageSquare,
  Type,
  CheckCircle,
  Calendar,
  TrendingUp,
  LogOut
} from "lucide-react";
import { useAuth } from "@/lib/auth";

interface SidebarProps {
  className?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  // Visão Geral
  { name: "Dashboard", href: "/", icon: ChartLine },

  // Criação de Marca
  { name: "Onboarding de Marca", href: "/onboarding", icon: Palette },
  {
    name: "Manual da Marca",
    href: "/manual-marca",
    icon: Book,
    children: [
      { name: "Visão Geral", href: "/manual-marca/default/overview", icon: Eye },
      { name: "Identidade Visual", href: "/manual-marca/default/visual-identity", icon: PaintBucket },
      { name: "Tom de Voz", href: "/manual-marca/default/voice", icon: MessageSquare },
      { name: "Linguagem", href: "/manual-marca/default/language", icon: Type },
      { name: "Conformidade", href: "/manual-marca/default/compliance", icon: CheckCircle },
    ]
  },

  // Planejamento e Criação
  { name: "Campanhas", href: "/campaigns", icon: Megaphone },
  { name: "Calendário Editorial", href: "/calendar", icon: Calendar },
  { name: "Geração de Conteúdo IA", href: "/content-generation", icon: Bot },

  // Análise e Monitoramento
  { name: "Anamnese Digital", href: "/anamnesis", icon: Stethoscope },
  { name: "Performance", href: "/performance", icon: TrendingUp },

  // Recursos
  { name: "Assets", href: "/assets", icon: Images },
];

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (href: string) => {
    return location === href || location.startsWith(href + '/');
  };

  const isChildActive = (children: NavigationItem[]) => {
    return children.some(child => isItemActive(child.href));
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isActive = isItemActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const hasActiveChild = hasChildren && isChildActive(item.children!);

    return (
      <div key={item.name}>
        <div
          className={cn(
            "flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer group",
            isActive || hasActiveChild
              ? "bg-gray-600 text-white"
              : "text-gray-300 hover:text-white hover:bg-gray-600",
            collapsed && "justify-center",
            level > 0 && "ml-4"
          )}
          data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {hasChildren && !collapsed ? (
            <div
              className="flex items-center space-x-3 w-full"
              onClick={() => toggleExpanded(item.name)}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          ) : (
            <Link href={item.href} className="flex items-center space-x-3 w-full">
              <item.icon className="h-5 w-5" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )}
        </div>

        {/* Render children if expanded and not collapsed */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-gray-700 transition-all duration-300 z-50",
        collapsed ? "w-16" : "w-64",
        className
      )}
      data-testid="sidebar"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className={cn("flex items-center space-x-3", collapsed && "hidden")}>
            <div className="flex items-center">
              <img
                src="/WOOF_logo.svg"
                alt="WOOF Pet Marketing"
                className="h-8 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            data-testid="button-toggle-sidebar"
            className="text-gray-300 hover:text-white hover:bg-gray-600"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {/* Visão Geral */}
        {navigation.slice(0, 1).map((item) => renderNavigationItem(item))}

        {/* Separator */}
        <div className="border-t border-gray-600 my-4"></div>

        {/* Criação de Marca */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Criação de Marca
          </h3>
        </div>
        {navigation.slice(1, 3).map((item) => renderNavigationItem(item))}

        {/* Separator */}
        <div className="border-t border-gray-600 my-4"></div>

        {/* Planejamento e Criação */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Planejamento
          </h3>
        </div>
        {navigation.slice(3, 6).map((item) => renderNavigationItem(item))}

        {/* Separator */}
        <div className="border-t border-gray-600 my-4"></div>

        {/* Análise e Monitoramento */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Análise
          </h3>
        </div>
        {navigation.slice(6, 8).map((item) => renderNavigationItem(item))}

        {/* Separator */}
        <div className="border-t border-gray-600 my-4"></div>

        {/* Recursos */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recursos
          </h3>
        </div>
        {navigation.slice(8).map((item) => renderNavigationItem(item))}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-600">
        <div className={cn("flex items-center space-x-3", collapsed && "justify-center")}>
          <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.email || 'Usuário'}</p>
              <p className="text-xs text-gray-400">Digital Woof</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            data-testid="button-settings"
            className="text-gray-300 hover:text-white hover:bg-gray-600"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
