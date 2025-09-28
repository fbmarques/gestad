import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Calendar, FileText, Trash2, Check, X } from "lucide-react";
import { getUserAcademicRequirements, updateUserAcademicRequirements, UpdateUserAcademicRequirementsRequest } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load initial data from API
  useEffect(() => {
    const loadAcademicRequirements = async () => {
      try {
        const data = await getUserAcademicRequirements();

        // Map API data to component state
        setQualificacao({
          marcada: data.qualification_status !== 'Not Scheduled',
          data: data.qualification_date || "",
          concluida: data.qualification_status === 'Completed'
        });

        setDefesa({
          marcada: data.defense_status !== 'Not Scheduled',
          data: data.defense_date || "",
          concluida: data.defense_status === 'Completed'
        });

        setTrabalho({
          entregue: data.work_completed
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load academic requirements:", error);
        toast({
          title: "Erro",
          description: "Falha ao carregar requisitos acadêmicos",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    loadAcademicRequirements();
  }, [toast]);

  // Mutation for updating academic requirements
  const updateAcademicRequirementsMutation = useMutation({
    mutationFn: (data: UpdateUserAcademicRequirementsRequest) => updateUserAcademicRequirements(data),
    onSuccess: (response) => {
      toast({
        title: "Sucesso",
        description: response.message
      });
    },
    onError: (error: any) => {
      console.error("Failed to update academic requirements:", error);
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const errorMessage = Object.values(validationErrors).flat().join(', ');
        toast({
          title: "Erro de Validação",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao atualizar requisitos acadêmicos",
          variant: "destructive"
        });
      }
    }
  });

  const handleQualificacaoToggle = (marcada: boolean) => {
    setQualificacao(prev => ({ ...prev, marcada }));

    // Map to API data
    const qualificationStatus = marcada ? 'Scheduled' : 'Not Scheduled';
    const updateData: UpdateUserAcademicRequirementsRequest = {
      qualification_status: qualificationStatus
    };

    updateAcademicRequirementsMutation.mutate(updateData);
  };

  const handleQualificacaoDate = (data: string) => {
    setQualificacao(prev => ({ ...prev, data, marcada: !!data }));

    if (data) {
      const updateData: UpdateUserAcademicRequirementsRequest = {
        qualification_status: 'Scheduled',
        qualification_date: data
      };
      updateAcademicRequirementsMutation.mutate(updateData);
    }
  };

  const handleRemoveQualificacaoDate = () => {
    setQualificacao(prev => ({ ...prev, data: "", concluida: false, marcada: false }));

    const updateData: UpdateUserAcademicRequirementsRequest = {
      qualification_status: 'Not Scheduled',
      qualification_date: null,
      qualification_completion_date: null
    };

    updateAcademicRequirementsMutation.mutate(updateData);
  };

  const handleQualificacaoConcluida = (concluida: boolean) => {
    setQualificacao(prev => ({ ...prev, concluida }));

    const qualificationStatus = concluida ? 'Completed' : 'Scheduled';
    const updateData: UpdateUserAcademicRequirementsRequest = {
      qualification_status: qualificationStatus
    };

    if (concluida) {
      updateData.qualification_completion_date = new Date().toISOString().split('T')[0];
    }

    updateAcademicRequirementsMutation.mutate(updateData);
  };

  const handleDefesaToggle = (marcada: boolean) => {
    setDefesa(prev => ({ ...prev, marcada }));

    // Map to API data
    const defenseStatus = marcada ? 'Scheduled' : 'Not Scheduled';
    const updateData: UpdateUserAcademicRequirementsRequest = {
      defense_status: defenseStatus
    };

    updateAcademicRequirementsMutation.mutate(updateData);
  };

  const handleDefesaDate = (data: string) => {
    setDefesa(prev => ({ ...prev, data, marcada: !!data }));

    if (data) {
      const updateData: UpdateUserAcademicRequirementsRequest = {
        defense_status: 'Scheduled',
        defense_date: data
      };
      updateAcademicRequirementsMutation.mutate(updateData);
    }
  };

  const handleRemoveDefesaDate = () => {
    setDefesa(prev => ({ ...prev, data: "", concluida: false, marcada: false }));

    const updateData: UpdateUserAcademicRequirementsRequest = {
      defense_status: 'Not Scheduled',
      defense_date: null,
      defense_completion_date: null
    };

    updateAcademicRequirementsMutation.mutate(updateData);
  };

  const handleDefesaConcluida = (concluida: boolean) => {
    setDefesa(prev => ({ ...prev, concluida }));

    const defenseStatus = concluida ? 'Completed' : 'Scheduled';
    const updateData: UpdateUserAcademicRequirementsRequest = {
      defense_status: defenseStatus
    };

    if (concluida) {
      updateData.defense_completion_date = new Date().toISOString().split('T')[0];
    }

    updateAcademicRequirementsMutation.mutate(updateData);
  };

  const handleTrabalhoEntregueToggle = (entregue: boolean) => {
    if (entregue) {
      setShowConfirmModal(true);
    } else {
      setTrabalho(prev => ({ ...prev, entregue: false }));

      const updateData: UpdateUserAcademicRequirementsRequest = {
        work_completed: false
      };

      updateAcademicRequirementsMutation.mutate(updateData);
    }
  };

  const handleConfirmTrabalhoEntregue = () => {
    setTrabalho(prev => ({ ...prev, entregue: true }));
    setShowConfirmModal(false);

    const updateData: UpdateUserAcademicRequirementsRequest = {
      work_completed: true
    };

    updateAcademicRequirementsMutation.mutate(updateData);
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

  if (isLoading) {
    return (
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <GraduationCap className="w-5 h-5 text-primary" />
            Requisitos Acadêmicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando requisitos acadêmicos...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <GraduationCap className="w-5 h-5 text-primary" />
          Requisitos Acadêmicos
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
