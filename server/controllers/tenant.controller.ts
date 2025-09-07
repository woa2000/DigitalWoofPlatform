import { Request, Response, NextFunction } from 'express';
import TenantService from '../services/tenant-basic.service';

// Middleware para verificar acesso ao tenant
export const requireTenantAccess = (requiredRole?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.params.tenantId || req.headers['x-tenant-id'] as string;
      const userId = (req as any).user?.id;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID é obrigatório' });
      }
      
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      const hasAccess = await TenantService.checkUserAccess(tenantId, userId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Acesso negado ao tenant' });
      }
      
      // Attach tenant info to request
      const tenant = await TenantService.getTenantById(tenantId, userId);
      (req as any).tenant = tenant;
      (req as any).tenantId = tenantId;
      
      next();
    } catch (error) {
      console.error('❌ Error in tenant access middleware:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
};

// Get current user's tenants
export const getCurrentUserTenants = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const tenants = await TenantService.getTenantsByUser(userId);
    
    res.json({
      success: true,
      data: tenants,
      count: tenants.length
    });
    
  } catch (error) {
    console.error('❌ Error getting user tenants:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar tenants do usuário' 
    });
  }
};

// Create new tenant
export const createTenant = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const { name, businessType, domain, settings } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nome do tenant é obrigatório' });
    }
    
    const newTenant = await TenantService.createTenant(userId, {
      name: name.trim(),
      businessType,
      domain,
      settings
    });
    
    res.status(201).json({
      success: true,
      data: newTenant,
      message: 'Tenant criado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Error creating tenant:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Falha ao criar tenant' 
    });
  }
};

// Get tenant details
export const getTenantDetails = async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.tenantId;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const tenant = await TenantService.getTenantById(tenantId, userId);
    
    if (!tenant) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tenant não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: tenant
    });
    
  } catch (error) {
    console.error('❌ Error getting tenant details:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar detalhes do tenant' 
    });
  }
};

// Update tenant
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const tenantId = req.params.tenantId;
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const updates = req.body;
    
    // Validate that at least one field is being updated
    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'Pelo menos um campo deve ser fornecido para atualização' });
    }
    
    const updatedTenant = await TenantService.updateTenant(tenantId, userId, updates);
    
    if (!updatedTenant) {
      return res.status(404).json({ 
        success: false, 
        error: 'Tenant não encontrado' 
      });
    }
    
    res.json({
      success: true,
      data: updatedTenant,
      message: 'Tenant atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Error updating tenant:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Falha ao atualizar tenant' 
    });
  }
};

// Get user's current/default tenant
export const getCurrentTenant = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    const currentTenant = await TenantService.getUserCurrentTenant(userId);
    
    if (!currentTenant) {
      return res.status(404).json({ 
        success: false, 
        error: 'Nenhum tenant encontrado para o usuário' 
      });
    }
    
    res.json({
      success: true,
      data: currentTenant
    });
    
  } catch (error) {
    console.error('❌ Error getting current tenant:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Falha ao buscar tenant atual' 
    });
  }
};