import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Calendar, FileText, Trash2, Check, X } from "lucide-react";

export const AcademicRequirementsVerticalSteps = () => {
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
      completed: qualificacao.marcada,
      active: true,
      icon: GraduationCap
    },
    {
      id: 2,
      title: "Data da Qualificação",
      completed: !!qualificacao.data,
      active: qualificacao.marcada,
      icon: Calendar
    },
    {
      id: 3,
      title: "Concluir Qualificação",
      completed: qualificacao.concluida,
      active: !!qualificacao.data,
      icon: Check
    },
    {
      id: 4,
      title: "Marcar Defesa",
      completed: defesa.marcada,
      active: qualificacao.concluida,
      icon: GraduationCap
    },
    {
      id: 5,
      title: "Data da Defesa",
      completed: !!defesa.data,
      active: defesa.marcada,
      icon: Calendar
    },
    {
      id: 6,
      title: "Concluir Defesa",
      completed: defesa.concluida,
      active: !!defesa.data,
      icon: Check
    },
    {
      id: 7,
      title: "Entregar Trabalho",
      completed: trabalho.entregue,
      active: defesa.concluida,
      icon: FileText
    },
    {
      id: 8,
      title: "Gerar Termo",
      completed: false,
      active: trabalho.entregue,
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

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <GraduationCap className="w-5 h-5 text-primary" />
          Requisitos Acadêmicos 3 (Vertical)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {/* Step 1: Marcar Qualificação */}
          <div className={`border rounded-lg p-3 transition-all ${
            getStepStatus(steps[0]) === "active" ? "border-primary bg-primary/5" : 
            getStepStatus(steps[0]) === "completed" ? "border-primary/50 bg-primary/10" :
            "border-muted bg-muted/20"
          } ${getStepStatus(steps[0]) === "disabled" ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[0]))}`}>
                  <GraduationCap className="w-3 h-3" />
                </span>
                Qualificação Marcada?
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={!qualificacao.marcada ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleQualificacaoToggle(false)}
                  disabled={!!qualificacao.data || defesa.marcada || getStepStatus(steps[0]) === "disabled"}
                  className="gap-1"
                >
                  <X className="w-3 h-3" />
                  Não
                </Button>
                <Button
                  variant={qualificacao.marcada ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQualificacaoToggle(true)}
                  disabled={!!qualificacao.data || defesa.marcada || getStepStatus(steps[0]) === "disabled"}
                  className="gap-1"
                >
                  <Check className="w-3 h-3" />
                  Sim
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2: Data da Qualificação */}
          <div className={`border rounded-lg p-3 transition-all ${
            getStepStatus(steps[1]) === "active" ? "border-primary bg-primary/5" : 
            getStepStatus(steps[1]) === "completed" ? "border-primary/50 bg-primary/10" :
            "border-muted bg-muted/20"
          } ${getStepStatus(steps[1]) === "disabled" ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[1]))}`}>
                  <Calendar className="w-3 h-3" />
                </span>
                Data da Qualificação
              </h4>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={qualificacao.data}
                  onChange={(e) => handleQualificacaoDate(e.target.value)}
                  disabled={qualificacao.concluida || getStepStatus(steps[1]) === "disabled"}
                  className="w-40"
                />
                {qualificacao.data && !qualificacao.concluida && getStepStatus(steps[1]) !== "disabled" && (
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

          {/* Step 3: Concluir Qualificação */}
          <div className={`border rounded-lg p-3 transition-all ${
            getStepStatus(steps[2]) === "active" ? "border-primary bg-primary/5" : 
            getStepStatus(steps[2]) === "completed" ? "border-primary/50 bg-primary/10" :
            "border-muted bg-muted/20"
          } ${getStepStatus(steps[2]) === "disabled" ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[2]))}`}>
                  <Check className="w-3 h-3" />
                </span>
                A qualificação foi concluída?
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={!qualificacao.concluida ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleQualificacaoConcluida(false)}
                  disabled={defesa.marcada || getStepStatus(steps[2]) === "disabled"}
                  className="gap-1"
                >
                  <X className="w-3 h-3" />
                  Não
                </Button>
                <Button
                  variant={qualificacao.concluida ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQualificacaoConcluida(true)}
                  disabled={defesa.marcada || getStepStatus(steps[2]) === "disabled"}
                  className="gap-1"
                >
                  <Check className="w-3 h-3" />
                  Sim
                </Button>
              </div>
            </div>
          </div>

          {/* Step 4: Marcar Defesa */}
          <div className={`border rounded-lg p-3 transition-all ${
            getStepStatus(steps[3]) === "active" ? "border-primary bg-primary/5" : 
            getStepStatus(steps[3]) === "completed" ? "border-primary/50 bg-primary/10" :
            "border-muted bg-muted/20"
          } ${getStepStatus(steps[3]) === "disabled" ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[3]))}`}>
                  <GraduationCap className="w-3 h-3" />
                </span>
                Defesa Marcada?
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={!defesa.marcada ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleDefesaToggle(false)}
                  disabled={!!defesa.data || getStepStatus(steps[3]) === "disabled"}
                  className="gap-1"
                >
                  <X className="w-3 h-3" />
                  Não
                </Button>
                <Button
                  variant={defesa.marcada ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDefesaToggle(true)}
                  disabled={!!defesa.data || getStepStatus(steps[3]) === "disabled"}
                  className="gap-1"
                >
                  <Check className="w-3 h-3" />
                  Sim
                </Button>
              </div>
            </div>
          </div>

          {/* Step 5: Data da Defesa */}
          <div className={`border rounded-lg p-3 transition-all ${
            getStepStatus(steps[4]) === "active" ? "border-primary bg-primary/5" : 
            getStepStatus(steps[4]) === "completed" ? "border-primary/50 bg-primary/10" :
            "border-muted bg-muted/20"
          } ${getStepStatus(steps[4]) === "disabled" ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[4]))}`}>
                  <Calendar className="w-3 h-3" />
                </span>
                Data da Defesa
              </h4>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={defesa.data}
                  onChange={(e) => handleDefesaDate(e.target.value)}
                  disabled={defesa.concluida || getStepStatus(steps[4]) === "disabled"}
                  className="w-40"
                />
                {defesa.data && !defesa.concluida && getStepStatus(steps[4]) !== "disabled" && (
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

          {/* Step 6: Concluir Defesa */}
          <div className={`border rounded-lg p-3 transition-all ${
            getStepStatus(steps[5]) === "active" ? "border-primary bg-primary/5" : 
            getStepStatus(steps[5]) === "completed" ? "border-primary/50 bg-primary/10" :
            "border-muted bg-muted/20"
          } ${getStepStatus(steps[5]) === "disabled" ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[5]))}`}>
                  <Check className="w-3 h-3" />
                </span>
                A defesa foi concluída?
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={!defesa.concluida ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleDefesaConcluida(false)}
                  disabled={trabalho.entregue || getStepStatus(steps[5]) === "disabled"}
                  className="gap-1"
                >
                  <X className="w-3 h-3" />
                  Não
                </Button>
                <Button
                  variant={defesa.concluida ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDefesaConcluida(true)}
                  disabled={trabalho.entregue || getStepStatus(steps[5]) === "disabled"}
                  className="gap-1"
                >
                  <Check className="w-3 h-3" />
                  Sim
                </Button>
              </div>
            </div>
          </div>

          {/* Step 7: Entregar Trabalho */}
          <div className={`border rounded-lg p-3 transition-all ${
            getStepStatus(steps[6]) === "active" ? "border-primary bg-primary/5" : 
            getStepStatus(steps[6]) === "completed" ? "border-primary/50 bg-primary/10" :
            "border-muted bg-muted/20"
          } ${getStepStatus(steps[6]) === "disabled" ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[6]))}`}>
                  <FileText className="w-3 h-3" />
                </span>
                Entregar Trabalho Final
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={trabalho.entregue ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTrabalhoEntregueToggle(true)}
                  disabled={trabalho.entregue || getStepStatus(steps[6]) === "disabled"}
                  className="gap-1"
                >
                  <Check className="w-3 h-3" />
                  {trabalho.entregue ? "Entregue" : "Marcar como Entregue"}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 8: Gerar Termo */}
          <div className={`border rounded-lg p-3 transition-all ${
            getStepStatus(steps[7]) === "active" ? "border-primary bg-primary/5" : 
            getStepStatus(steps[7]) === "completed" ? "border-primary/50 bg-primary/10" :
            "border-muted bg-muted/20"
          } ${getStepStatus(steps[7]) === "disabled" ? "opacity-50" : ""}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${getStepClasses(getStepStatus(steps[7]))}`}>
                  <FileText className="w-3 h-3" />
                </span>
                Gerar Termo
              </h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleGerarPDF}
                  disabled={getStepStatus(steps[7]) === "disabled"}
                  className="gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Gerar Termo de Entrega
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Entrega do Trabalho</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja marcar o trabalho como entregue? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmTrabalhoEntregue}>
                Confirmar Entrega
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
