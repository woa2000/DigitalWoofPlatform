import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function EditorialCalendar() {
  const [currentView, setCurrentView] = useState<'week' | 'month' | 'quarter'>('month');

  return (
    <DashboardLayout
      title="Calendário Editorial"
      subtitle="Planeje e organize seu conteúdo editorial com inteligência artificial"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={currentView === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('week')}
              >
                Semana
              </Button>
              <Button
                variant={currentView === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('month')}
              >
                Mês
              </Button>
              <Button
                variant={currentView === 'quarter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView('quarter')}
              >
                Trimestre
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar conteúdo..."
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conteúdo
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Calendário Editorial - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Calendário Editorial</h3>
              <p className="mb-4">
                Interface completa do calendário editorial baseada no plano de execução.
                Inclui drag-and-drop, sugestões inteligentes e integração com campanhas.
              </p>
              <div className="flex justify-center space-x-2">
                <Badge variant="secondary">Sazonalidade Inteligente</Badge>
                <Badge variant="secondary">Drag & Drop</Badge>
                <Badge variant="secondary">Sugestões IA</Badge>
                <Badge variant="secondary">Templates de Campanha</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">12</div>
              <p className="text-sm text-muted-foreground">Posts Planejados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">85%</div>
              <p className="text-sm text-muted-foreground">Taxa de Aprovação</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">3</div>
              <p className="text-sm text-muted-foreground">Campanhas Ativas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">92%</div>
              <p className="text-sm text-muted-foreground">Performance Prevista</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}