import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Calendar, FileText, Trash2, Check, X } from "lucide-react";

export const AcademicRequirementsSection = () => {
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
    // Simulação de geração de PDF
    toast({
      title: "PDF Gerado",
      description: "O termo de entrega foi gerado e será aberto em nova aba"
    });
    // Aqui seria aberto o PDF em nova aba
    window.open("/termo-entrega.pdf", "_blank");
  };

  const canShowDefesa = qualificacao.concluida;
  const canShowTrabalho = defesa.concluida;

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <GraduationCap className="w-5 h-5 text-primary" />
          Requisitos Acadêmicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Card Qualificação */}
        <div className="border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Qualificação Marcada?</h4>
            <div className="flex items-center gap-2">
              <Button
                variant={!qualificacao.marcada ? "danger" : "outline"}
                size="sm"
                onClick={() => handleQualificacaoToggle(false)}
                disabled={!!qualificacao.data || defesa.marcada}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Não
              </Button>
              <Button
                variant={qualificacao.marcada ? "success" : "outline"}
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

          {qualificacao.marcada && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <Label>Data da Qualificação</Label>
              </div>
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
                    variant="danger-filled"
                    size="sm"
                    onClick={handleRemoveQualificacaoDate}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {qualificacao.data && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">A qualificação foi concluída?</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={!qualificacao.concluida ? "danger" : "outline"}
                      size="sm"
                      onClick={() => handleQualificacaoConcluida(false)}
                      disabled={defesa.marcada}
                      className="gap-1 h-8 px-2 text-xs"
                    >
                      <X className="w-3 h-3" />
                      Não
                    </Button>
                    <Button
                      variant={qualificacao.concluida ? "success" : "outline"}
                      size="sm"
                      onClick={() => handleQualificacaoConcluida(true)}
                      disabled={defesa.marcada}
                      className="gap-1 h-8 px-2 text-xs"
                    >
                      <Check className="w-3 h-3" />
                      Sim
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card Defesa */}
        {canShowDefesa && (
          <div className="border border-border rounded-lg p-4 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Defesa Marcada?</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={!defesa.marcada ? "danger" : "outline"}
                  size="sm"
                  onClick={() => handleDefesaToggle(false)}
                  disabled={!!defesa.data}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Não
                </Button>
                <Button
                  variant={defesa.marcada ? "success" : "outline"}
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

            {defesa.marcada && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <Label>Data da Defesa</Label>
                </div>
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
                      variant="danger-filled"
                      size="sm"
                      onClick={handleRemoveDefesaDate}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {defesa.data && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">A defesa foi concluída?</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={!defesa.concluida ? "danger" : "outline"}
                        size="sm"
                        onClick={() => handleDefesaConcluida(false)}
                        disabled={trabalho.entregue}
                        className="gap-1 h-8 px-2 text-xs"
                      >
                        <X className="w-3 h-3" />
                        Não
                      </Button>
                      <Button
                        variant={defesa.concluida ? "success" : "outline"}
                        size="sm"
                        onClick={() => handleDefesaConcluida(true)}
                        disabled={trabalho.entregue}
                        className="gap-1 h-8 px-2 text-xs"
                      >
                        <Check className="w-3 h-3" />
                        Sim
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Card Trabalho */}
        {canShowTrabalho && (
          <div className="border border-border rounded-lg p-4 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Entregar trabalho</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={!trabalho.entregue ? "danger" : "outline"}
                  size="sm"
                  onClick={() => handleTrabalhoEntregueToggle(false)}
                  disabled={trabalho.entregue}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Não
                </Button>
                <Button
                  variant={trabalho.entregue ? "success" : "outline"}
                  size="sm"
                  onClick={() => handleTrabalhoEntregueToggle(true)}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Sim
                </Button>
              </div>
            </div>

            {trabalho.entregue && (
              <div className="animate-fade-in">
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
        )}

        {!canShowDefesa && (
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              Complete a qualificação para liberar a seção de defesa.
            </p>
          </div>
        )}

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