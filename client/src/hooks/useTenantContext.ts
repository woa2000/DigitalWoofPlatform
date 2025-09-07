import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../lib/queryClient';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  businessType?: string;
  domain?: string;
  settings?: any;
  createdAt: string;
  updatedAt: string;
}

interface TenantContextHook {
  currentTenant: Tenant | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTenantContext = (): TenantContextHook => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentTenant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest('GET', '/api/tenants/current');
      const data = await response.json();
      
      if (data.success && data.data) {
        setCurrentTenant(data.data);
      } else {
        setError(data.error || 'Nenhum tenant encontrado');
        setCurrentTenant(null);
      }
    } catch (err) {
      console.error('Error fetching tenant context:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar contexto do tenant');
      setCurrentTenant(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchCurrentTenant();
  }, [fetchCurrentTenant]);

  useEffect(() => {
    fetchCurrentTenant();
  }, [fetchCurrentTenant]);

  return {
    currentTenant,
    loading,
    error,
    refetch
  };
};