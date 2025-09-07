import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Loader2 } from 'lucide-react';
import { UserForm } from './UserForm';
import { UserList } from './UserList';
import { useUsers } from '@/hooks/useUsers';

interface UserManagementProps {
  tenantId: string;
}

export function UserManagement({ tenantId }: UserManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { users, loading, error, fetchUsers, createUser, updateUserRole, removeUser } = useUsers(tenantId);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (userData: {
    email: string;
    fullName: string;
    role: 'admin' | 'member' | 'viewer';
  }) => {
    try {
      const result = await createUser(userData);
      
      if (result.success) {
        toast({
          title: 'Usuário criado com sucesso!',
          description: `Senha temporária: ${result.temporaryPassword}`,
        });
        setShowCreateForm(false);
        fetchUsers(); // Refresh list
      } else {
        toast({
          title: 'Erro ao criar usuário',
          description: result.error || 'Erro desconhecido',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao criar usuário',
        description: 'Erro interno do servidor',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      const result = await updateUserRole(userId, role);
      
      if (result.success) {
        toast({
          title: 'Role atualizado com sucesso!'
        });
        fetchUsers(); // Refresh list
      } else {
        toast({
          title: 'Erro ao atualizar role',
          description: result.error || 'Erro desconhecido',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao atualizar role',
        description: 'Erro interno do servidor',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const result = await removeUser(userId);
      
      if (result.success) {
        toast({
          title: 'Usuário removido com sucesso!'
        });
        fetchUsers(); // Refresh list
      } else {
        toast({
          title: 'Erro ao remover usuário',
          description: result.error || 'Erro desconhecido',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao remover usuário',
        description: 'Erro interno do servidor',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Carregando usuários...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchUsers} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Crie e gerencie usuários da sua organização
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateForm(true)} disabled={showCreateForm}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        
        {showCreateForm && (
          <CardContent>
            <UserForm
              onSubmit={handleCreateUser}
              onCancel={() => setShowCreateForm(false)}
            />
          </CardContent>
        )}
      </Card>

      <UserList
        users={users}
        onUpdateRole={handleUpdateRole}
        onRemoveUser={handleRemoveUser}
      />
    </div>
  );
}