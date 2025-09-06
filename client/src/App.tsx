import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./lib/auth";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Onboarding from "@/pages/Onboarding";
import ManualMarca from "@/pages/ManualMarca";
import { ContentGenerationPage } from "@/pages/ContentGeneration";
import NotFound from "@/pages/not-found";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/onboarding">
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      </Route>
      <Route path="/manual-marca/:brandId/:section?/:subsection?">
        <ProtectedRoute>
          <DashboardLayout 
            title="Manual da Marca" 
            subtitle="Gerencie a identidade e diretrizes da sua marca"
          >
            <ManualMarca />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/manual-marca/:brandId?">
        <ProtectedRoute>
          <DashboardLayout 
            title="Manual da Marca" 
            subtitle="Gerencie a identidade e diretrizes da sua marca"
          >
            <ManualMarca />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/content-generation">
        <ProtectedRoute>
          <DashboardLayout 
            title="Geração de Conteúdo IA" 
            subtitle="Crie conteúdo personalizado com inteligência artificial"
          >
            <ContentGenerationPage />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
