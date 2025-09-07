import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant-basic.service';

/**
 * Middleware to inject tenant context for authenticated users
 * Must be used after authentication middleware
 */
export const injectTenantContext = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    // Get user's current tenant
    const currentTenant = await TenantService.getUserCurrentTenant(userId);
    
    if (!currentTenant) {
      return res.status(404).json({ 
        error: 'Nenhum tenant encontrado para o usuário' 
      });
    }
    
    // Attach tenant info to request
    (req as any).tenant = currentTenant;
    (req as any).tenantId = currentTenant.id;
    
    next();
    
  } catch (error) {
    console.error('❌ Error injecting tenant context:', error);
    res.status(500).json({ 
      error: 'Erro interno ao verificar contexto do tenant' 
    });
  }
};

/**
 * Middleware to check if user has specific role in tenant
 */
export const requireTenantRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const tenant = (req as any).tenant;
    
    if (!tenant) {
      return res.status(500).json({ 
        error: 'Contexto do tenant não encontrado' 
      });
    }
    
    if (!allowedRoles.includes(tenant.userRole)) {
      return res.status(403).json({ 
        error: 'Você não tem permissão para realizar esta ação' 
      });
    }
    
    next();
  };
};