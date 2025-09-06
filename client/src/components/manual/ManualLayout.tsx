/**
 * @fileoverview Manual Layout Component
 * Responsive layout for Manual de Marca Digital with navigation and content areas
 */

import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { ManualNavigation } from './ManualNavigation';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Menu, 
  X, 
  ArrowLeft, 
  Settings, 
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';

interface ManualLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (sectionId: string, subsectionId?: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
  
  // Layout configuration
  showNavigation?: boolean;
  fullscreen?: boolean;
  previewMode?: boolean;
  
  // Header customization
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  
  // Mobile specific
  showMobileHeader?: boolean;
  onBack?: () => void;
}

export function ManualLayout({
  children,
  currentSection,
  onSectionChange,
  isLoading = false,
  error = null,
  onRefresh,
  className,
  showNavigation = true,
  fullscreen = false,
  previewMode = false,
  title = "Manual da Marca",
  subtitle,
  headerActions,
  showMobileHeader = true,
  onBack
}: ManualLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on tablet
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when section changes
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [currentSection, isMobile]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const getSectionTitle = (sectionId: string) => {
    const sectionTitles: Record<string, string> = {
      'overview': 'Visão Geral',
      'visual-identity': 'Identidade Visual',
      'voice': 'Tom de Voz',
      'language': 'Linguagem',
      'compliance': 'Conformidade',
      'export': 'Exportar Manual',
      'share': 'Compartilhar'
    };
    return sectionTitles[sectionId] || 'Manual da Marca';
  };

  // Mobile header component
  const MobileHeader = () => (
    <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
      <div className="flex items-center space-x-3">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div>
          <h1 className="text-lg font-semibold">{getSectionTitle(currentSection)}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {headerActions}
        
        {!previewMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-8 w-8 p-0"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </header>
  );

  // Desktop header component
  const DesktopHeader = () => (
    <header className="flex items-center justify-between p-4 border-b bg-background">
      <div className="flex items-center space-x-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {currentSection && (
          <Badge variant="outline" className="ml-4">
            {getSectionTitle(currentSection)}
          </Badge>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {error && onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        )}

        {headerActions}

        {!previewMode && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0"
            >
              {sidebarCollapsed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );

  // Main layout classes
  const layoutClasses = cn(
    "flex h-screen bg-background",
    fullscreen && "fixed inset-0 z-50",
    className
  );

  const contentClasses = cn(
    "flex-1 flex flex-col min-w-0",
    isMobile && "pb-16" // Account for mobile navigation
  );

  const mainClasses = cn(
    "flex-1 overflow-auto",
    previewMode && "bg-gray-50"
  );

  if (fullscreen) {
    return (
      <div className={layoutClasses}>
        <div className="flex-1 flex flex-col">
          {(isMobile ? showMobileHeader : true) && (
            isMobile ? <MobileHeader /> : <DesktopHeader />
          )}
          <main className={mainClasses}>
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={layoutClasses}>
      {/* Desktop Sidebar Navigation */}
      {!isMobile && showNavigation && !previewMode && (
        <ManualNavigation
          currentSection={currentSection}
          onSectionChange={onSectionChange}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && showNavigation && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-80 bg-background shadow-xl">
            <ManualNavigation
              currentSection={currentSection}
              onSectionChange={onSectionChange}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className={contentClasses}>
        {/* Header */}
        {isMobile ? (
          showMobileHeader && <MobileHeader />
        ) : (
          <DesktopHeader />
        )}

        {/* Error State */}
        {error && (
          <div className="border-b border-red-200 bg-red-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-red-800">
                  Erro ao carregar manual
                </span>
              </div>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  className="h-7 text-red-700 border-red-300"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Recarregar
                </Button>
              )}
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="border-b border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Carregando manual...
              </span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={mainClasses}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && showNavigation && !previewMode && (
        <ManualNavigation
          currentSection={currentSection}
          onSectionChange={onSectionChange}
          isMobile={true}
        />
      )}
    </div>
  );
}

// Layout Variants for specific use cases
export function ManualPreviewLayout({ children, ...props }: Omit<ManualLayoutProps, 'previewMode'>) {
  return (
    <ManualLayout
      {...props}
      previewMode={true}
      showNavigation={false}
      showMobileHeader={false}
    >
      {children}
    </ManualLayout>
  );
}

export function ManualFullscreenLayout({ children, ...props }: Omit<ManualLayoutProps, 'fullscreen'>) {
  return (
    <ManualLayout
      {...props}
      fullscreen={true}
    >
      {children}
    </ManualLayout>
  );
}

export function ManualEmbedLayout({ children, ...props }: Omit<ManualLayoutProps, 'showNavigation' | 'showMobileHeader'>) {
  return (
    <ManualLayout
      {...props}
      showNavigation={false}
      showMobileHeader={false}
      className="border rounded-lg overflow-hidden"
    >
      {children}
    </ManualLayout>
  );
}