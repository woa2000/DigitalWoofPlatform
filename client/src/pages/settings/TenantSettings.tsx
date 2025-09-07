import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { UserManagement } from '@/components/users/UserManagement';
import { 
  Building2, 
  Settings, 
  Users, 
  CreditCard, 
  Palette,
  Save,
  Loader2,
  Crown,
  UserPlus,
  Trash2
} from 'lucide-react';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  businessType?: string;
  subscriptionPlan: 'free' | 'basic' | 'premium';
  subscriptionStatus: string;
  settings: any;
  brandGuidelines: any;
  ownerId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TenantUser {
  id: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: string;
  joinedAt: string;
  userFullName?: string;
  userAvatarUrl?: string;
}

export function TenantSettings() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [members, setMembers] = useState<TenantUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Form states
  const [generalForm, setGeneralForm] = useState({
    name: '',
    businessType: '',
    domain: '',
    description: ''
  });

  const [brandingForm, setBrandingForm] = useState({
    primaryColor: '#1E40AF',
    secondaryColor: '#EF4444',
    fontFamily: 'Inter',
    guidelines: ''
  });

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'member' as 'admin' | 'member' | 'viewer'
  });

  // Load tenant data on mount
  useEffect(() => {
    loadTenantData();
  }, []);

  const loadTenantData = async () => {
    try {
      setLoading(true);
      
      // Get current tenant
      const response = await fetch('/api/tenants/current');
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do tenant');
      }
      
      const result = await response.json();
      if (result.success) {
        const tenantData = result.data;
        setTenant(tenantData);
        
        // Update form states
        setGeneralForm({
          name: tenantData.name || '',
          businessType: tenantData.businessType || '',
          domain: tenantData.domain || '',
          description: tenantData.settings?.description || ''
        });
        
        setBrandingForm({
          primaryColor: tenantData.brandGuidelines?.primaryColor || '#1E40AF',
          secondaryColor: tenantData.brandGuidelines?.secondaryColor || '#EF4444',
          fontFamily: tenantData.brandGuidelines?.fontFamily || 'Inter',
          guidelines: tenantData.brandGuidelines?.guidelines || ''
        });
        
        // Load members (placeholder for now)
        setMembers([]);
      }
    } catch (error) {
      console.error('Error loading tenant data:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados do tenant',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async () => {
    if (!tenant) return;
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: generalForm.name,
          businessType: generalForm.businessType,
          domain: generalForm.domain || null,
          settings: {
            ...tenant.settings,
            description: generalForm.description
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar configurações');
      }
      
      const result = await response.json();
      if (result.success) {
        setTenant(result.data);
        toast({
          title: 'Sucesso',
          description: 'Configurações gerais salvas com sucesso'
        });
      }
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar configurações gerais',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    if (!tenant) return;
    
    try {
      setSaving(true);
      
      const response = await fetch(`/api/tenants/${tenant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brandGuidelines: {
            ...tenant.brandGuidelines,
            primaryColor: brandingForm.primaryColor,
            secondaryColor: brandingForm.secondaryColor,
            fontFamily: brandingForm.fontFamily,
            guidelines: brandingForm.guidelines
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Falha ao salvar configurações de marca');
      }
      
      const result = await response.json();
      if (result.success) {
        setTenant(result.data);
        toast({
          title: 'Sucesso',
          description: 'Configurações de marca salvas com sucesso'
        });
      }
    } catch (error) {
      console.error('Error saving branding settings:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar configurações de marca',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Nenhum tenant encontrado. Por favor, entre em contato com o suporte.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Gerencie as configurações da sua organização
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={tenant.subscriptionPlan === 'premium' ? 'default' : 'secondary'}>
            {tenant.subscriptionPlan === 'free' && 'Plano Gratuito'}
            {tenant.subscriptionPlan === 'basic' && 'Plano Básico'}
            {tenant.subscriptionPlan === 'premium' && 'Plano Premium'}
          </Badge>
          <Badge variant={tenant.status === 'active' ? 'default' : 'destructive'}>
            {tenant.status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Geral</span>
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Marca</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Equipe</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Usuários</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Assinatura</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Gerais</CardTitle>
              <CardDescription>
                Configure as informações básicas da sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Organização</Label>
                  <Input
                    id="name"
                    value={generalForm.name}
                    onChange={(e) => setGeneralForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Clínica Veterinária São Francisco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Tipo de Negócio</Label>
                  <Select
                    value={generalForm.businessType}
                    onValueChange={(value) => setGeneralForm(prev => ({ ...prev, businessType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veterinaria">Clínica Veterinária</SelectItem>
                      <SelectItem value="petshop">Pet Shop</SelectItem>
                      <SelectItem value="hotel">Hotel Pet</SelectItem>
                      <SelectItem value="creche">Creche Pet</SelectItem>
                      <SelectItem value="adestramento">Adestramento</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={generalForm.description}
                  onChange={(e) => setGeneralForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva sua organização..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSaveGeneral} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Equipe</CardTitle>
              <CardDescription>
                Funcionalidade em desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Gerenciamento de Equipe</h3>
                <p className="text-sm text-muted-foreground">
                  Em breve você poderá convidar e gerenciar membros da sua organização
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement tenantId={tenant.id} />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plano de Assinatura</CardTitle>
              <CardDescription>
                Informações sobre seu plano atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">Plano Atual</h3>
                    <p className="text-sm text-muted-foreground">
                      {tenant.subscriptionPlan === 'free' && 'Plano Gratuito - Recursos básicos'}
                      {tenant.subscriptionPlan === 'basic' && 'Plano Básico - Recursos avançados'}
                      {tenant.subscriptionPlan === 'premium' && 'Plano Premium - Todos os recursos'}
                    </p>
                  </div>
                  <Badge variant={tenant.subscriptionPlan === 'premium' ? 'default' : 'secondary'} className="text-lg py-1 px-3">
                    {tenant.subscriptionPlan.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}