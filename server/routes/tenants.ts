import { Router } from 'express';
import {
  getCurrentUserTenants,
  createTenant,
  getTenantDetails,
  updateTenant,
  getCurrentTenant,
  requireTenantAccess
} from '../controllers/tenant.controller';

const router = Router();

// Routes for tenant management
// Note: These routes expect authentication middleware to be applied at the app level

/**
 * @route GET /api/tenants
 * @desc Get all tenants for the current user
 * @access Private
 */
router.get('/', getCurrentUserTenants);

/**
 * @route POST /api/tenants
 * @desc Create a new tenant
 * @access Private
 */
router.post('/', createTenant);

/**
 * @route GET /api/tenants/current
 * @desc Get the user's current/default tenant
 * @access Private
 */
router.get('/current', getCurrentTenant);

/**
 * @route GET /api/tenants/:tenantId
 * @desc Get tenant details by ID
 * @access Private - requires tenant access
 */
router.get('/:tenantId', requireTenantAccess(), getTenantDetails);

/**
 * @route PUT /api/tenants/:tenantId
 * @desc Update tenant details
 * @access Private - requires tenant access
 */
router.put('/:tenantId', requireTenantAccess(), updateTenant);

// Future routes to be implemented:
// router.get('/:tenantId/members', requireTenantAccess(), getTenantMembers);
// router.post('/:tenantId/invite', requireTenantAccess('admin'), inviteUserToTenant);
// router.delete('/:tenantId/members/:userId', requireTenantAccess('admin'), removeUser);
// router.delete('/:tenantId', requireTenantAccess('owner'), deleteTenant);

export default router;