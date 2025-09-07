import { useState, useCallback } from 'react';

export interface TenantUser {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  joinedAt: string;
  avatarUrl?: string;
  permissions: string[];
}

interface CreateUserData {
  email: string;
  fullName: string;
  role: 'admin' | 'member' | 'viewer';
}

interface CreateUserResult {
  success: boolean;
  temporaryPassword?: string;
  error?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function useUsers(tenantId: string) {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: ApiResponse<TenantUser[]> = await response.json();

      if (result.success && result.data) {
        setUsers(result.data);
      } else {
        setError(result.error || 'Falha ao carregar usuários');
      }
    } catch (err) {
      setError('Erro de conexão ao carregar usuários');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserData): Promise<CreateUserResult> => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result: ApiResponse<{
        user: TenantUser;
        temporaryPassword: string;
      }> = await response.json();

      if (result.success && result.data) {
        return {
          success: true,
          temporaryPassword: result.data.temporaryPassword
        };
      } else {
        return {
          success: false,
          error: result.error || 'Falha ao criar usuário'
        };
      }
    } catch (err) {
      console.error('Error creating user:', err);
      return {
        success: false,
        error: 'Erro de conexão ao criar usuário'
      };
    }
  }, []);

  const updateUserRole = useCallback(async (userId: string, role: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Falha ao atualizar role'
        };
      }
    } catch (err) {
      console.error('Error updating user role:', err);
      return {
        success: false,
        error: 'Erro de conexão ao atualizar role'
      };
    }
  }, []);

  const removeUser = useCallback(async (userId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Falha ao remover usuário'
        };
      }
    } catch (err) {
      console.error('Error removing user:', err);
      return {
        success: false,
        error: 'Erro de conexão ao remover usuário'
      };
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUserRole,
    removeUser
  };
}