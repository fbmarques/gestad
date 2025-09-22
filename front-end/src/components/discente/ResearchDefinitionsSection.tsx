import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, X, Edit } from "lucide-react";

interface Definition {
  id: string;
  title: string;
  placeholder: string;
  active: boolean;
  text: string;
}

export const ResearchDefinitionsSection = () => {
  const [definitions, setDefinitions] = useState<Definition[]>([
    {
      id: "problema",
      title: "Problema de Pesquisa",
      placeholder: "Descreva o problema que sua pesquisa pretende resolver...",
      active: false,
      text: ""
    },
    {
      id: "pergunta",
      title: "Pergunta de Pesquisa",
      placeholder: "Qual é a pergunta principal que guia sua pesquisa?",
      active: false,
      text: ""
    },
    {
      id: "objetivos",
      title: "Objetivos",
      placeholder: "Descreva os objetivos gerais e específicos da pesquisa...",
      active: false,
      text: ""
    },
    {
      id: "metodologia",
      title: "Metodologia",
      placeholder: "Descreva a metodologia que será utilizada na pesquisa...",
      active: false,
      text: ""
    }
  ]);
  
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [tempText, setTempText] = useState<string>("");
  const { toast } = useToast();

  const handleToggle = async (id: string, value: boolean) => {
    if (value) {
      // Se está ativando, abre o modal
      const definition = definitions.find(d => d.id === id);
      setTempText(definition?.text || "");
      setOpenModal(id);
    } else {
      // Se está desativando, limpa o texto
      setDefinitions(prev => 
        prev.map(def => 
          def.id === id 
            ? { ...def, active: false, text: "" }
            : def
        )
      );
      
      const definition = definitions.find(d => d.id === id);
      toast({
        title: "Sucesso",
        description: `${definition?.title} desativada`
      });
    }
  };

  const handleSaveModal = async () => {
    if (!openModal) return;
    
    const hasContent = tempText.trim().length > 0;
    
    setDefinitions(prev =>
      prev.map(def =>
        def.id === openModal 
          ? { ...def, active: hasContent, text: hasContent ? tempText.trim() : "" }
          : def
      )
    );

    const definition = definitions.find(d => d.id === openModal);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      toast({
        title: "Sucesso",
        description: `${definition?.title} ${hasContent ? "salva" : "desativada"}`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar definição",
        variant: "destructive"
      });
    }
    
    setOpenModal(null);
    setTempText("");
  };

  const handleCloseModal = () => {
    setOpenModal(null);
    setTempText("");
  };

  const getCompletedCount = () => {
    return definitions.filter(def => def.active && def.text.trim()).length;
  };

  const isProgressBlocked = () => {
    // Lógica de controle progressivo - pelo menos 2 definições devem estar completas
    return getCompletedCount() < 2;
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Search className="w-5 h-5 text-primary" />
          Definições de Pesquisa
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Complete pelo menos 2 definições para prosseguir ({getCompletedCount()}/4)
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {definitions.map((definition) => (
          <div key={definition.id} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">{definition.title}</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant={!definition.active ? "danger" : "outline"}
                  size="sm"
                  onClick={() => handleToggle(definition.id, false)}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Não
                </Button>
                <Button
                  variant={definition.active ? "success" : "outline"}
                  size="sm"
                  onClick={() => handleToggle(definition.id, true)}
                  className="gap-2"
                >
                  <Check className="w-4 h-4" />
                  Sim
                </Button>
              </div>
            </div>

            {definition.active && definition.text && (
              <div className="animate-fade-in">
                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {definition.text}
                  </p>
                  <div className="flex justify-end mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTempText(definition.text);
                        setOpenModal(definition.id);
                      }}
                      className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500 gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isProgressBlocked() && (
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
            <p className="text-sm text-warning-foreground">
              <span className="font-medium">Atenção:</span> Complete pelo menos 2 definições 
              de pesquisa para liberar as próximas seções.
            </p>
          </div>
        )}
      </CardContent>

      <Dialog open={!!openModal} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {definitions.find(d => d.id === openModal)?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={definitions.find(d => d.id === openModal)?.placeholder}
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              className="min-h-[200px]"
              rows={8}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCloseModal}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveModal}
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};