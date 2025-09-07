import { Request, Response } from 'express';
import { UserService, CreateUserData } from '../services/user.service';
import { z } from 'zod';

// Validation schemas
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  role: z.enum(['admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Role deve ser: admin, member ou viewer' })
  }),
  permissions: z.array(z.string()).optional()
});

const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer'], {
    errorMap: () => ({ message: 'Role deve ser: admin, member ou viewer' })
  }),
  permissions: z.array(z.string()).optional()
});

/**
 * Get current user's tenant ID from request
 * This assumes the middleware has already attached the user and tenant info
 */
function getTenantId(req: Request): string {
  const tenantId = (req as any).tenantId || (req as any).user?.tenantId;
  if (!tenantId) {
    throw new Error('Tenant ID não encontrado');
  }
  return tenantId;
}

/**
 * Get current user ID from request
 */
function getUserId(req: Request): string {
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }
  return userId;
}

/**
 * Create new user in tenant
 * POST /api/users
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req);
    const tenantId = getTenantId(req);

    // Validate request body
    const validationResult = createUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: validationResult.error.errors
      });
    }

    const userData: CreateUserData = validationResult.data;

    // Check if current user can manage users
    const canManage = await UserService.canManageUsers(tenantId, currentUserId);
    if (!canManage) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para criar usuários'
      });
    }

    // Create user
    const result = await UserService.createUser(tenantId, userData, currentUserId);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        temporaryPassword: result.temporaryPassword
      },
      message: 'Usuário criado com sucesso'
    });

  } catch (error) {
    console.error('❌ Error creating user:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('already registered')) {
        return res.status(409).json({
          success: false,
          error: 'Este email já está em uso'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * List users in current tenant
 * GET /api/users
 */
export const listUsers = async (req: Request, res: Response) => {
  try {
    const tenantId = getTenantId(req);

    const users = await UserService.listTenantUsers(tenantId);

    res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('❌ Error listing users:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao listar usuários'
    });
  }
};

/**
 * Update user role and permissions
 * PUT /api/users/:userId
 */
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req);
    const tenantId = getTenantId(req);
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
    }

    // Validate request body
    const validationResult = updateUserRoleSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: validationResult.error.errors
      });
    }

    const { role, permissions } = validationResult.data;

    // Check if current user can manage users
    const canManage = await UserService.canManageUsers(tenantId, currentUserId);
    if (!canManage) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para editar usuários'
      });
    }

    // Prevent users from changing their own role
    if (currentUserId === userId) {
      return res.status(403).json({
        success: false,
        error: 'Você não pode alterar seu próprio role'
      });
    }

    await UserService.updateUserRole(tenantId, userId, role, permissions);

    res.json({
      success: true,
      message: 'Role do usuário atualizado com sucesso'
    });

  } catch (error) {
    console.error('❌ Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao atualizar role do usuário'
    });
  }
};

/**
 * Remove user from tenant
 * DELETE /api/users/:userId
 */
export const removeUser = async (req: Request, res: Response) => {
  try {
    const currentUserId = getUserId(req);
    const tenantId = getTenantId(req);
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
    }

    // Check if current user can manage users
    const canManage = await UserService.canManageUsers(tenantId, currentUserId);
    if (!canManage) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para remover usuários'
      });
    }

    // Prevent users from removing themselves
    if (currentUserId === userId) {
      return res.status(403).json({
        success: false,
        error: 'Você não pode remover a si mesmo'
      });
    }

    await UserService.removeUser(tenantId, userId);

    res.json({
      success: true,
      message: 'Usuário removido com sucesso'
    });

  } catch (error) {
    console.error('❌ Error removing user:', error);
    res.status(500).json({
      success: false,
      error: 'Falha ao remover usuário'
    });
  }
};