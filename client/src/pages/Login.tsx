import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    name: "",
    businessType: "",
    businessName: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting login with:', { email: loginData.email });
    
    const result = await login(loginData.email, loginData.password);
    console.log('Login result:', result);
    
    if (result.success) {
      setLocation("/");
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo à Woof Marketing Platform",
      });
    } else {
      console.error('Login error:', result.error);
      toast({
        title: "Erro no login",
        description: result.error || "Credenciais inválidas",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting register with:', { 
      email: registerData.email,
      name: registerData.name,
      businessType: registerData.businessType,
      businessName: registerData.businessName
    });
    
    const result = await register(registerData);
    console.log('Register result:', result);
    
    if (result.success) {
      setLocation("/");
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo à Woof Marketing Platform",
      });
    } else {
      console.error('Register error:', result.error);
      toast({
        title: "Erro no cadastro",
        description: result.error || "Erro ao criar conta",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md" data-testid="login-card">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground text-xl">🐾</span>
          </div>
          <CardTitle className="text-2xl">Woof Marketing Platform</CardTitle>
          <p className="text-muted-foreground">Primeira plataforma de marketing pet com IA do Brasil</p>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
              <TabsTrigger value="register" data-testid="tab-register">Cadastro</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4" data-testid="form-login">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    data-testid="input-login-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    data-testid="input-login-password"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4" data-testid="form-register">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nome Completo</Label>
                  <Input
                    id="register-name"
                    placeholder="Seu nome"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                    data-testid="input-register-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    data-testid="input-register-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    data-testid="input-register-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-type">Tipo de Negócio</Label>
                  <Select 
                    value={registerData.businessType} 
                    onValueChange={(value) => setRegisterData({ ...registerData, businessType: value })}
                  >
                    <SelectTrigger data-testid="select-business-type">
                      <SelectValue placeholder="Selecione o tipo de negócio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veterinaria">Clínica Veterinária</SelectItem>
                      <SelectItem value="petshop">Pet Shop</SelectItem>
                      <SelectItem value="banho_tosa">Banho & Tosa</SelectItem>
                      <SelectItem value="hotel_pet">Hotel Pet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-name">Nome do Negócio</Label>
                  <Input
                    id="business-name"
                    placeholder="Nome da sua empresa"
                    value={registerData.businessName}
                    onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                    required
                    data-testid="input-business-name"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-register"
                >
                  {isLoading ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
