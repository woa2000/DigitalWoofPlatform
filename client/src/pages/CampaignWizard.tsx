import React, { useState } from 'react';
import { useCampaignWizard } from '@/hooks/useCampaignWizard';
import WizardProgress from '@/components/wizard/WizardProgress';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, ArrowLeft, Wand2, Eye, Settings, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CampaignWizardProps {
  initialStep?: number;
  templateId?: string;
}

export function CampaignWizard({ 
  initialStep = 1, 
  templateId 
}: CampaignWizardProps) {
  const navigate = useNavigate();
  
  const {
    currentStep,
    wizardData,
    validation,
    isLoading,
    error,
    isDraftSaved,
    goToStep,
    nextStep,
    previousStep,
    canGoNext,
    canGoPrevious,
    updateTemplate,
    updatePersonalization,
    updateCampaign,
    saveDraft,
    createCampaign,
    generateReview,
    resetWizard,
    getStepProgress
  } = useCampaignWizard();

  const handleExit = () => {
    if (wizardData.selectedTemplate || wizardData.personalization || wizardData.campaign) {
      if (confirm('Você tem alterações não salvas. Deseja sair mesmo assim?')) {
        navigate('/campanhas');
      }
    } else {
      navigate('/campanhas');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft();
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      await createCampaign();
      navigate('/campanhas');
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center py-12">
            <Wand2 className="w-16 h-16 mx-auto mb-6 text-blue-500" />
            <h2 className="text-2xl font-bold mb-4">Selecionar Template</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Escolha um template da biblioteca que melhor se adequa aos seus objetivos de campanha.
            </p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {/* Mock templates */}
                {[1, 2, 3].map((template) => (
                  <Card key={template} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">Template {template}</span>
                      </div>
                      <h3 className="font-medium mb-2">Campanha Preventiva {template}</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Template para campanhas de cuidados preventivos
                      </p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          updateTemplate({ 
                            id: `template-${template}`, 
                            name: `Template ${template}`,
                            category: 'preventiva'
                          });
                          nextStep();
                        }}
                      >
                        Selecionar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Eye className="w-16 h-16 mx-auto mb-6 text-green-500" />
              <h2 className="text-2xl font-bold mb-4">Personalização</h2>
              <p className="text-gray-600">
                Configure o tom, público-alvo e objetivos da sua campanha
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Configurações de Personalização</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tom de Comunicação</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        onChange={(e) => updatePersonalization({ tone: e.target.value })}
                      >
                        <option value="">Selecione um tom</option>
                        <option value="friendly">Amigável</option>
                        <option value="professional">Profissional</option>
                        <option value="empathetic">Empático</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Público-Alvo</label>
                      <textarea 
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        placeholder="Descreva seu público principal..."
                        onChange={(e) => updatePersonalization({ targetAudience: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Objetivos</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Aumentar agendamentos', 'Educar clientes', 'Promover serviços', 'Fidelizar'].map((obj) => (
                          <label key={obj} className="flex items-center text-sm">
                            <input 
                              type="checkbox" 
                              className="mr-2"
                              onChange={(e) => {
                                const currentObjectives = wizardData.personalization?.objectives || [];
                                const newObjectives = e.target.checked 
                                  ? [...currentObjectives, obj]
                                  : currentObjectives.filter(o => o !== obj);
                                updatePersonalization({ objectives: newObjectives });
                              }}
                            />
                            {obj}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Preview</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      Preview da personalização será exibido aqui conforme você faz as configurações.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Settings className="w-16 h-16 mx-auto mb-6 text-purple-500" />
              <h2 className="text-2xl font-bold mb-4">Configuração da Campanha</h2>
              <p className="text-gray-600">
                Configure canais, cronograma e métricas de acompanhamento
              </p>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome da Campanha</label>
                      <input 
                        type="text"
                        className="w-full p-2 border rounded-md"
                        placeholder="Ex: Campanha Preventiva Outono 2024"
                        onChange={(e) => updateCampaign({ name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Data de Início</label>
                      <input 
                        type="date"
                        className="w-full p-2 border rounded-md"
                        onChange={(e) => updateCampaign({ startDate: e.target.value })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Canais de Distribuição</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['Email', 'WhatsApp', 'Instagram', 'Website'].map((channel) => (
                      <label key={channel} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input 
                          type="checkbox" 
                          className="mr-3"
                          onChange={(e) => {
                            const currentChannels = wizardData.campaign?.channels || [];
                            const newChannels = e.target.checked 
                              ? [...currentChannels, channel]
                              : currentChannels.filter(c => c !== channel);
                            updateCampaign({ channels: newChannels });
                          }}
                        />
                        <span className="font-medium">{channel}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 mx-auto mb-6 text-red-500" />
              <h2 className="text-2xl font-bold mb-4">Revisão Final</h2>
              <p className="text-gray-600">
                Revise todos os detalhes antes de criar sua campanha
              </p>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Resumo da Campanha</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Template Selecionado</h4>
                      <p className="text-sm text-gray-600">
                        {wizardData.selectedTemplate?.name || 'Nenhum template selecionado'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Tom de Comunicação</h4>
                      <p className="text-sm text-gray-600">
                        {wizardData.personalization?.tone || 'Não definido'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Nome da Campanha</h4>
                      <p className="text-sm text-gray-600">
                        {wizardData.campaign?.name || 'Não definido'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Canais</h4>
                      <p className="text-sm text-gray-600">
                        {wizardData.campaign?.channels?.join(', ') || 'Nenhum canal selecionado'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleCreateCampaign}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 px-8 py-3"
                >
                  {isLoading ? 'Criando...' : 'Criar Campanha'}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleExit}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Criar Nova Campanha</h1>
                <p className="text-sm text-gray-600">
                  Assistente para criação de campanhas personalizadas
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {(wizardData.selectedTemplate || wizardData.personalization || wizardData.campaign) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveDraft}
                  disabled={isLoading}
                >
                  {isLoading ? 'Salvando...' : 'Salvar Rascunho'}
                </Button>
              )}
              
              <div className="text-sm text-gray-500">
                Passo {currentStep} de 4
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <WizardProgress
            currentStep={currentStep}
            steps={[
              { number: 1, title: 'Template', completed: validation.step1 },
              { number: 2, title: 'Personalização', completed: validation.step2 },
              { number: 3, title: 'Configuração', completed: validation.step3 },
              { number: 4, title: 'Revisão', completed: validation.step4 }
            ]}
            onStepClick={goToStep}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {isDraftSaved && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Rascunho salvo com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <Card className="shadow-sm">
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep > 1 && currentStep < 4 && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={previousStep} disabled={!canGoPrevious}>
              Voltar
            </Button>
            <Button onClick={nextStep} disabled={!canGoNext} className="bg-blue-600 hover:bg-blue-700">
              Próximo
            </Button>
          </div>
        )}
      </div>

      {/* Auto-save indicator */}
      {isLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processando...
          </div>
        </div>
      )}
    </div>
  );
}