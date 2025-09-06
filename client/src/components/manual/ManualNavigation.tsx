/**
 * @fileoverview Manual Navigation Component
 * Responsive navigation for Manual de Marca Digital
 * Desktop: Sidebar navigation | Mobile: Bottom navigation
 */

import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  FileText, 
  Palette, 
  MessageSquare, 
  Type, 
  Shield, 
  Download,
  Share,
  ChevronRight,
  Menu,
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

// Navigation section configuration
export interface ManualSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  subsections?: {
    id: string;
    title: string;
    completed?: boolean;
  }[];
  completed?: boolean;
  hasWarning?: boolean;
}

const navigationSections: ManualSection[] = [
  {
    id: 'overview',
    title: 'Visão Geral',
    icon: FileText,
    description: 'Resumo executivo da marca',
    completed: true
  },
  {
    id: 'visual-identity',
    title: 'Identidade Visual',
    icon: Palette,
    description: 'Cores, logos e tipografia',
    subsections: [
      { id: 'colors', title: 'Paleta de Cores', completed: true },
      { id: 'logo', title: 'Logo e Variações', completed: true },
      { id: 'typography', title: 'Tipografia', completed: true },
      { id: 'imagery', title: 'Diretrizes de Imagem', completed: false }
    ]
  },
  {
    id: 'voice',
    title: 'Tom de Voz',
    icon: MessageSquare,
    description: 'Personalidade e comunicação',
    subsections: [
      { id: 'personality', title: 'Personalidade da Marca', completed: true },
      { id: 'tone-radar', title: 'Radar de Tom', completed: true },
      { id: 'examples', title: 'Exemplos Práticos', completed: false }
    ],
    hasWarning: true
  },
  {
    id: 'language',
    title: 'Linguagem',
    icon: Type,
    description: 'Glossário e diretrizes',
    subsections: [
      { id: 'glossary', title: 'Glossário', completed: true },
      { id: 'cta-library', title: 'Biblioteca de CTAs', completed: false },
      { id: 'formatting', title: 'Formatação', completed: true }
    ]
  },
  {
    id: 'compliance',
    title: 'Conformidade',
    icon: Shield,
    description: 'Políticas e regulamentações',
    subsections: [
      { id: 'cfmv', title: 'Diretrizes CFMV', completed: true },
      { id: 'advertising', title: 'Restrições Publicitárias', completed: false },
      { id: 'disclaimers', title: 'Avisos Legais', completed: true }
    ],
    hasWarning: true
  }
];

const actionItems = [
  {
    id: 'export',
    title: 'Exportar Manual',
    icon: Download,
    description: 'PDF, ZIP ou Brand Kit'
  },
  {
    id: 'share',
    title: 'Compartilhar',
    icon: Share,
    description: 'Link público ou embed'
  }
];

interface ManualNavigationProps {
  currentSection: string;
  onSectionChange: (sectionId: string, subsectionId?: string) => void;
  className?: string;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ManualNavigation({
  currentSection,
  onSectionChange,
  className,
  isMobile = false,
  isCollapsed = false,
  onToggleCollapse
}: ManualNavigationProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([currentSection])
  );

  // Auto-expand current section
  useEffect(() => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      newSet.add(currentSection);
      return newSet;
    });
  }, [currentSection]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const getSectionStatus = (section: ManualSection) => {
    if (section.completed) return 'completed';
    if (section.hasWarning) return 'warning';
    if (section.subsections) {
      const completedCount = section.subsections.filter(sub => sub.completed).length;
      const totalCount = section.subsections.length;
      if (completedCount === totalCount) return 'completed';
      if (completedCount > 0) return 'in-progress';
    }
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getProgressPercentage = () => {
    const totalSections = navigationSections.length;
    const completedSections = navigationSections.filter(section => 
      getSectionStatus(section) === 'completed'
    ).length;
    return Math.round((completedSections / totalSections) * 100);
  };

  if (isMobile) {
    return (
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}>
        <div className="flex h-16 items-center justify-around px-2">
          {navigationSections.slice(0, 4).map((section) => {
            const IconComponent = section.icon;
            const status = getSectionStatus(section);
            const isActive = currentSection === section.id;
            
            return (
              <Button
                key={section.id}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex flex-col items-center justify-center h-12 w-16 p-1",
                  isActive && "bg-accent text-accent-foreground"
                )}
                onClick={() => onSectionChange(section.id)}
              >
                <div className="relative">
                  <IconComponent className="h-5 w-5" />
                  {status === 'completed' && (
                    <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500" />
                  )}
                  {status === 'warning' && (
                    <AlertCircle className="absolute -top-1 -right-1 h-3 w-3 text-amber-500" />
                  )}
                </div>
                <span className="text-xs mt-1 truncate">{section.title}</span>
              </Button>
            );
          })}
          
          {/* More menu for additional sections */}
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center justify-center h-12 w-16 p-1"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs mt-1">Mais</span>
          </Button>
        </div>
      </nav>
    );
  }

  // Desktop sidebar navigation
  return (
    <nav className={cn(
      "flex flex-col h-full border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-80",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold">Manual da Marca</h2>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {getProgressPercentage()}%
              </span>
            </div>
          </div>
        )}
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* Navigation Sections */}
        <div className="space-y-1 py-2">
          {navigationSections.map((section) => {
            const IconComponent = section.icon;
            const status = getSectionStatus(section);
            const isActive = currentSection === section.id;
            const isExpanded = expandedSections.has(section.id);
            
            return (
              <div key={section.id} className="space-y-1">
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-auto p-3",
                    isCollapsed && "justify-center p-2"
                  )}
                  onClick={() => {
                    onSectionChange(section.id);
                    if (section.subsections) {
                      toggleSection(section.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="relative flex-shrink-0">
                      <IconComponent className="h-5 w-5" />
                      {!isCollapsed && (
                        <div className="absolute -top-1 -right-1">
                          {getStatusIcon(status)}
                        </div>
                      )}
                    </div>
                    
                    {!isCollapsed && (
                      <>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{section.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {section.description}
                          </div>
                        </div>
                        
                        {section.subsections && (
                          <ChevronRight 
                            className={cn(
                              "h-4 w-4 transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                        )}
                      </>
                    )}
                  </div>
                </Button>

                {/* Subsections */}
                {!isCollapsed && section.subsections && isExpanded && (
                  <div className="ml-8 space-y-1">
                    {section.subsections.map((subsection) => (
                      <Button
                        key={subsection.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start h-8 text-sm"
                        onClick={() => onSectionChange(section.id, subsection.id)}
                      >
                        <div className="flex items-center space-x-2">
                          {subsection.completed ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <div className="h-3 w-3 rounded-full border border-gray-300" />
                          )}
                          <span>{subsection.title}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Items */}
        {!isCollapsed && (
          <div className="border-t pt-4 mt-4 space-y-1">
            {actionItems.map((action) => {
              const IconComponent = action.icon;
              
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => onSectionChange(action.id)}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </nav>
  );
}