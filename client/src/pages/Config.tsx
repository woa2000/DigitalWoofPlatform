import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'error';
  message?: string;
  lastChecked: string;
  responseTime?: number;
}

interface StatusResponse {
  success: boolean;
  services: ServiceStatus[];
  timestamp: string;
  error?: string;
}

export default function Config() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServiceStatus = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await fetch('/api/config/status');
      const data: StatusResponse = await response.json();

      if (data.success) {
        setServices(data.services);
      } else {
        setError(data.error || 'Failed to fetch service status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServiceStatus();
  }, []);

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'postgresql':
        return <Database className="h-5 w-5 text-blue-500" />;
      default:
        return null; // Will use status icon instead
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="default" className="bg-green-500">Online</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      case 'error':
        return <Badge variant="secondary" className="bg-yellow-500">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatLastChecked = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <DashboardLayout
        title="Configurações"
        subtitle="Status dos serviços externos"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Configurações"
      subtitle="Status dos serviços externos"
    >
      <div className="space-y-6">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Status dos Serviços</h2>
            <p className="text-gray-600">
              Monitoramento da conectividade com serviços externos
            </p>
          </div>
          <Button
            onClick={fetchServiceStatus}
            disabled={refreshing}
            variant="outline"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Atualizar
          </Button>
        </div>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Services grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.name} className="relative">
              <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                {getServiceIcon(service.name) || getStatusIcon(service.status)}
                <CardTitle className="ml-2 text-lg">{service.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(service.status)}
                    {service.responseTime && (
                      <span className="text-sm text-gray-500">
                        {service.responseTime}ms
                      </span>
                    )}
                  </div>

                  {service.message && (
                    <p className="text-sm text-gray-600">{service.message}</p>
                  )}

                  <div className="text-xs text-gray-500">
                    Última verificação: {formatLastChecked(service.lastChecked)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Future services placeholder */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Serviços Futuros</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Esta seção será expandida para incluir novos serviços conforme forem integrados.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}