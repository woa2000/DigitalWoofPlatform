/**
 * Utility functions for managing Supabase auth.users metadata
 * These functions help with reading and writing user data stored in raw_user_meta_data
 */

import { UserMetadata } from './schema.js';

/**
 * Type-safe helper to extract user metadata from auth.users.raw_user_meta_data
 */
export function getUserMetadata(rawUserMetaData: any): UserMetadata {
  if (!rawUserMetaData || typeof rawUserMetaData !== 'object') {
    return {};
  }

  return {
    name: rawUserMetaData.name || undefined,
    business_type: rawUserMetaData.business_type || undefined,
    business_name: rawUserMetaData.business_name || undefined,
  };
}

/**
 * Creates metadata object for updating auth.users.raw_user_meta_data
 */
export function createUserMetadata(metadata: Partial<UserMetadata>): Record<string, any> {
  const result: Record<string, any> = {};
  
  if (metadata.name !== undefined) {
    result.name = metadata.name;
  }
  
  if (metadata.business_type !== undefined) {
    result.business_type = metadata.business_type;
  }
  
  if (metadata.business_name !== undefined) {
    result.business_name = metadata.business_name;
  }

  return result;
}

/**
 * Merges existing metadata with new metadata values
 */
export function mergeUserMetadata(
  existingMetadata: any,
  newMetadata: Partial<UserMetadata>
): Record<string, any> {
  const existing = getUserMetadata(existingMetadata);
  const merged = { ...existing, ...newMetadata };
  return createUserMetadata(merged);
}

/**
 * Validates user metadata according to business rules
 */
export function validateUserMetadata(metadata: UserMetadata): string[] {
  const errors: string[] = [];

  if (metadata.name && metadata.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (metadata.business_type && !['veterinaria', 'petshop', 'banho_tosa', 'hotel_pet'].includes(metadata.business_type)) {
    errors.push('Invalid business type');
  }

  if (metadata.business_name && metadata.business_name.trim().length < 2) {
    errors.push('Business name must be at least 2 characters long');
  }

  return errors;
}

/**
 * Gets a display name from user metadata, with fallback to email
 */
export function getUserDisplayName(metadata: UserMetadata, email?: string): string {
  if (metadata.name && metadata.name.trim()) {
    return metadata.name.trim();
  }
  
  if (metadata.business_name && metadata.business_name.trim()) {
    return metadata.business_name.trim();
  }
  
  if (email) {
    return email.split('@')[0];
  }
  
  return 'User';
}

/**
 * Type guard to check if user has completed business information
 */
export function hasCompleteBusinessInfo(metadata: UserMetadata): boolean {
  return !!(
    metadata.name &&
    metadata.business_type &&
    metadata.business_name
  );
}