import express from 'express';
import { createUser, listUsers, updateUserRole, removeUser } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth';
import { injectTenantContext, requireTenantRole } from '../middleware/tenant';

const router = express.Router();

/**
 * User management routes
 * All routes require authentication and tenant context
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Apply tenant context injection
router.use(injectTenantContext);

// GET /api/users - List users in current tenant
router.get('/', listUsers);

// POST /api/users - Create new user in tenant (admin/owner only)
router.post('/', requireTenantRole(['owner', 'admin']), createUser);

// PUT /api/users/:userId - Update user role and permissions (admin/owner only)
router.put('/:userId', requireTenantRole(['owner', 'admin']), updateUserRole);

// DELETE /api/users/:userId - Remove user from tenant (admin/owner only)
router.delete('/:userId', requireTenantRole(['owner', 'admin']), removeUser);

export default router;