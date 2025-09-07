import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Shield, Eye } from 'lucide-react';

interface UserRoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  disabled?: boolean;
}

export function UserRoleSelector({ currentRole, onRoleChange, disabled = false }: UserRoleSelectorProps) {
  const roles = [
    {
      value: 'viewer',
      label: 'Viewer',
      description: 'Apenas visualização',
      icon: Eye
    },
    {
      value: 'member',
      label: 'Member',
      description: 'Usuário padrão',
      icon: User
    },
    {
      value: 'admin',
      label: 'Admin',
      description: 'Pode gerenciar usuários',
      icon: Shield
    }
  ];

  return (
    <Select
      value={currentRole}
      onValueChange={onRoleChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <SelectItem key={role.value} value={role.value}>
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <div>
                  <div className="font-medium">{role.label}</div>
                  <div className="text-xs text-muted-foreground">{role.description}</div>
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}