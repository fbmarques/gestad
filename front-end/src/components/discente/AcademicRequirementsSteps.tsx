import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Calendar, FileText, Trash2, Check, X, ChevronRight } from "lucide-react";

export const AcademicRequirementsSteps = () => {
  const [qualificacao, setQualificacao] = useState({
    marcada: false,
    data: "",
    concluida: false
  });
  
  const [defesa, setDefesa] = useState({
    marcada: false,
    data: "",
    concluida: false
  });
  
  const [trabalho, setTrabalho] = useState({
    entregue: false
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { toast } = useToast();

  const handleQualificacaoToggle = (marcada: boolean) => {
    setQualificacao(prev => ({ ...prev, marcada }));
    toast({
      title: "Sucesso",
      description: marcada ? "Qualificação ativada" : "Qualificação desativada"
    });
  };

  const handleQualificacaoDate = (data: string) => {
    setQualificacao(prev => ({ ...prev, data }));
    if (data) {
      toast({
        title: "Sucesso",
        description: "Data da qualificação definida"
      });
    }
  };

  const handleRemoveQualificacaoDate = () => {
    setQualificacao(prev => ({ ...prev, data: "", concluida: false, marcada: false }));
    toast({
      title: "Sucesso",
      description: "Data da qualificação removida"
    });
  };

  const handleQualificacaoConcluida = (concluida: boolean) => {
    setQualificacao(prev => ({ ...prev, concluida }));
    toast({
      title: "Sucesso",
      description: concluida ? "Qualificação marcada como concluída" : "Status da qualificação atualizado"
    });
  };

  const handleDefesaToggle = (marcada: boolean) => {
    setDefesa(prev => ({ ...prev, marcada }));
    toast({
      title: "Sucesso",
      description: marcada ? "Defesa ativada" : "Defesa desativada"
    });
  };

  const handleDefesaDate = (data: string) => {
    setDefesa(prev => ({ ...prev, data }));
    if (data) {
      toast({
        title: "Sucesso",
        description: "Data da defesa definida"
      });
    }
  };

  const handleRemoveDefesaDate = () => {
    setDefesa(prev => ({ ...prev, data: "", concluida: false, marcada: false }));
    toast({
      title: "Sucesso",
      description: "Data da defesa removida"
    });
  };

  const handleDefesaConcluida = (concluida: boolean) => {
    setDefesa(prev => ({ ...prev, concluida }));
    toast({
      title: "Sucesso",
      description: concluida ? "Defesa marcada como concluída" : "Status da defesa atualizado"
    });
  };

  const handleTrabalhoEntregueToggle = (entregue: boolean) => {
    if (entregue) {
      setShowConfirmModal(true);
    } else {
      setTrabalho(prev => ({ ...prev, entregue: false }));
      toast({
        title: "Sucesso",
        description: "Status do trabalho alterado"
      });
    }
  };

  const handleConfirmTrabalhoEntregue = () => {
    setTrabalho(prev => ({ ...prev, entregue: true }));
    setShowConfirmModal(false);
    toast({
      title: "Sucesso",
      description: "Trabalho marcado como entregue - Esta ação não pode ser desfeita"
    });
  };

  const handleGerarPDF = () => {
    toast({
      title: "PDF Gerado",
      description: "O termo de entrega foi gerado e será aberto em nova aba"
    });
    window.open("/termo-entrega.pdf", "_blank");
  };

  const steps = [
    {
      id: 1,
      title: "Marcar Qualificação",
      description: "Defina se a qualificação será marcada",
      completed: qualificacao.marcada,
      active: true,
      icon: GraduationCap
    },
    {
      id: 2,
      title: "Data da Qualificação",
      description: "Defina a data da qualificação",
      completed: !!qualificacao.data,
      active: qualificacao.marcada,
      icon: Calendar
    },
    {
      id: 3,
      title: "Concluir Qualificação",
      description: "Marque a qualificação como concluída",
      completed: qualificacao.concluida,
      active: !!qualificacao.data,
      icon: Check
    },
    {
      id: 4,
      title: "Marcar Defesa",
      description: "Defina se a defesa será marcada",
      completed: defesa.marcada,
      active: qualificacao.concluida,
      icon: GraduationCap
    },
    {
      id: 5,
      title: "Data da Defesa",
      description: "Defina a data da defesa",
      completed: !!defesa.data,
      active: defesa.marcada,
      icon: Calendar
    },
    {
      id: 6,
      title: "Concluir Defesa",
      description: "Marque a defesa como concluída",
      completed: defesa.concluida,
      active: !!defesa.data,
      icon: Check
    },
    {
      id: 7,
      title: "Entregar Trabalho",
      description: "Faça a entrega final do trabalho",
      completed: trabalho.entregue,
      active: defesa.concluida,
      icon: FileText
    }
  ];

  const getStepStatus = (step: typeof steps[0]) => {
    if (step.completed) return "completed";
    if (step.active) return "active";
    return "disabled";
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary text-primary-foreground border-primary";
      case "active":
        return "bg-background text-foreground border-primary ring-2 ring-primary/20";
      case "disabled":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-background text-foreground border-border";
    }
  };

  const getConnectorClasses = (currentCompleted: boolean, nextActive: boolean) => {
    if (currentCompleted && nextActive) {
      return "bg-primary";
    }
    return "bg-muted";
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <GraduationCap className="w-5 h-5 text-primary" />
          Requisitos Acadêmicos 2
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Steps Visual */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(step);
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${getStepClasses(status)}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-foreground">{step.title}</p>
                      <p className="text-xs text-muted-foreground max-w-20">{step.description}</p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className="flex-1 px-2">
                      <div
                        className={`h-0.5 transition-all ${getConnectorClasses(
                          step.completed,
                          steps[index + 1].active
                        )}`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Marcar Qualificação */}
          <div className={`border rounded-lg p-4 transition-all ${
            getStepStatus(steps[0]) === "active" ? "border-primary bg-primary/5" : "border-border"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[0]))}`}>
                  1
                </span>
                Qualificação Marcada?
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={!qualificacao.marcada ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleQualificacaoToggle(false)}
                  disabled={!!qualificacao.data || defesa.marcada}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Não
                </Button>
                <Button
                  variant={qualificacao.marcada ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQualificacaoToggle(true)}
                  disabled={!!qualificacao.data || defesa.marcada}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Sim
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2: Data da Qualificação */}
          {qualificacao.marcada && (
            <div className={`border rounded-lg p-4 transition-all animate-fade-in ${
              getStepStatus(steps[1]) === "active" ? "border-primary bg-primary/5" : "border-border"
            }`}>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[1]))}`}>
                    2
                  </span>
                  Data da Qualificação
                </h4>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={qualificacao.data}
                    onChange={(e) => handleQualificacaoDate(e.target.value)}
                    disabled={qualificacao.concluida}
                    className="flex-1"
                  />
                  {qualificacao.data && !qualificacao.concluida && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveQualificacaoDate}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Concluir Qualificação */}
          {qualificacao.data && (
            <div className={`border rounded-lg p-4 transition-all animate-fade-in ${
              getStepStatus(steps[2]) === "active" ? "border-primary bg-primary/5" : "border-border"
            }`}>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[2]))}`}>
                    3
                  </span>
                  A qualificação foi concluída?
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant={!qualificacao.concluida ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleQualificacaoConcluida(false)}
                    disabled={defesa.marcada}
                    className="gap-1"
                  >
                    <X className="w-3 h-3" />
                    Não
                  </Button>
                  <Button
                    variant={qualificacao.concluida ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleQualificacaoConcluida(true)}
                    disabled={defesa.marcada}
                    className="gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Sim
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Marcar Defesa */}
          {qualificacao.concluida && (
            <div className={`border rounded-lg p-4 transition-all animate-fade-in ${
              getStepStatus(steps[3]) === "active" ? "border-primary bg-primary/5" : "border-border"
            }`}>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[3]))}`}>
                    4
                  </span>
                  Defesa Marcada?
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant={!defesa.marcada ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleDefesaToggle(false)}
                    disabled={!!defesa.data}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Não
                  </Button>
                  <Button
                    variant={defesa.marcada ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDefesaToggle(true)}
                    disabled={!!defesa.data}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Sim
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Data da Defesa */}
          {defesa.marcada && (
            <div className={`border rounded-lg p-4 transition-all animate-fade-in ${
              getStepStatus(steps[4]) === "active" ? "border-primary bg-primary/5" : "border-border"
            }`}>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[4]))}`}>
                    5
                  </span>
                  Data da Defesa
                </h4>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={defesa.data}
                    onChange={(e) => handleDefesaDate(e.target.value)}
                    disabled={defesa.concluida}
                    className="flex-1"
                  />
                  {defesa.data && !defesa.concluida && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveDefesaDate}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Concluir Defesa */}
          {defesa.data && (
            <div className={`border rounded-lg p-4 transition-all animate-fade-in ${
              getStepStatus(steps[5]) === "active" ? "border-primary bg-primary/5" : "border-border"
            }`}>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[5]))}`}>
                    6
                  </span>
                  A defesa foi concluída?
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant={!defesa.concluida ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleDefesaConcluida(false)}
                    disabled={trabalho.entregue}
                    className="gap-1"
                  >
                    <X className="w-3 h-3" />
                    Não
                  </Button>
                  <Button
                    variant={defesa.concluida ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDefesaConcluida(true)}
                    disabled={trabalho.entregue}
                    className="gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Sim
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Entregar Trabalho */}
          {defesa.concluida && (
            <div className={`border rounded-lg p-4 transition-all animate-fade-in ${
              getStepStatus(steps[6]) === "active" ? "border-primary bg-primary/5" : "border-border"
            }`}>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[6]))}`}>
                    7
                  </span>
                  Entregar Trabalho
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant={!trabalho.entregue ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleTrabalhoEntregueToggle(false)}
                    disabled={trabalho.entregue}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Não
                  </Button>
                  <Button
                    variant={trabalho.entregue ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTrabalhoEntregueToggle(true)}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Sim
                  </Button>
                </div>
                
                {trabalho.entregue && (
                  <div className="animate-fade-in pt-2">
                    <Button
                      onClick={handleGerarPDF}
                      className="gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Gerar PDF do Termo de Entrega
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal de Confirmação */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Entrega do Trabalho</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja marcar o trabalho como entregue? 
                Esta ação não poderá ser desfeita e removerá permanentemente as opções anteriores.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmTrabalhoEntregue}
                variant="destructive"
              >
                Confirmar Entrega
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};