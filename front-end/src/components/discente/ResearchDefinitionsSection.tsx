import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Search, Check, X, Edit } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserResearchDefinitions,
  updateUserResearchDefinitions,
  UserResearchDefinitions,
  UpdateUserResearchDefinitionsRequest
} from "@/lib/api";

interface Definition {
  id: keyof UserResearchDefinitions;
  title: string;
  placeholder: string;
  active: boolean;
  text: string | null;
}

export const ResearchDefinitionsSection = () => {
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [tempText, setTempText] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load research definitions from API
  const { data: researchDefinitions, isLoading, error } = useQuery({
    queryKey: ['userResearchDefinitions'],
    queryFn: getUserResearchDefinitions,
  });

  // Update research definitions mutation
  const updateDefinitionsMutation = useMutation({
    mutationFn: (data: UpdateUserResearchDefinitionsRequest) => updateUserResearchDefinitions(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['userResearchDefinitions'] });
      toast({
        title: "Sucesso",
        description: response.message
      });
    },
    onError: (error: any) => {
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        const firstError = Object.values(validationErrors)[0] as string[];
        toast({
          title: "Erro de validação",
          description: firstError[0],
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao salvar definição de pesquisa",
          variant: "destructive"
        });
      }
    }
  });

  // Update definitions array when API data loads
  useEffect(() => {
    if (researchDefinitions) {
      const definitionsTemplate = [
        {
          id: "problem_defined" as keyof UserResearchDefinitions,
          title: "Problema de Pesquisa",
          placeholder: "Descreva o problema que sua pesquisa pretende resolver...",
          active: researchDefinitions.problem_defined,
          text: researchDefinitions.problem_text
        },
        {
          id: "question_defined" as keyof UserResearchDefinitions,
          title: "Pergunta de Pesquisa",
          placeholder: "Qual é a pergunta principal que guia sua pesquisa?",
          active: researchDefinitions.question_defined,
          text: researchDefinitions.question_text
        },
        {
          id: "objectives_defined" as keyof UserResearchDefinitions,
          title: "Objetivos",
          placeholder: "Descreva os objetivos gerais e específicos da pesquisa...",
          active: researchDefinitions.objectives_defined,
          text: researchDefinitions.objectives_text
        },
        {
          id: "methodology_defined" as keyof UserResearchDefinitions,
          title: "Metodologia",
          placeholder: "Descreva a metodologia que será utilizada na pesquisa...",
          active: researchDefinitions.methodology_defined,
          text: researchDefinitions.methodology_text
        }
      ];
      setDefinitions(definitionsTemplate);
    }
  }, [researchDefinitions]);

  const handleToggle = async (id: string, value: boolean) => {
    if (value) {
      // Se está ativando, abre o modal
      const definition = definitions.find(d => d.id === id);
      setTempText(definition?.text || "");
      setOpenModal(id);
    } else {
      // Se está desativando, chama a API para desativar
      const fieldMap = getFieldMapping(id);
      if (fieldMap) {
        const updateData: UpdateUserResearchDefinitionsRequest = {
          [fieldMap.defined]: false,
          [fieldMap.text]: null
        };
        updateDefinitionsMutation.mutate(updateData);
      }
    }
  };

  const handleSaveModal = async () => {
    if (!openModal) return;

    const hasContent = tempText.trim().length > 0;
    const fieldMap = getFieldMapping(openModal);

    if (fieldMap) {
      const updateData: UpdateUserResearchDefinitionsRequest = {
        [fieldMap.defined]: hasContent,
        [fieldMap.text]: hasContent ? tempText.trim() : null
      };
      updateDefinitionsMutation.mutate(updateData);
    }

    setOpenModal(null);
    setTempText("");
  };

  // Helper function to map definition IDs to API field names
  const getFieldMapping = (id: string) => {
    const mappings = {
      'problem_defined': { defined: 'problem_defined' as keyof UpdateUserResearchDefinitionsRequest, text: 'problem_text' as keyof UpdateUserResearchDefinitionsRequest },
      'question_defined': { defined: 'question_defined' as keyof UpdateUserResearchDefinitionsRequest, text: 'question_text' as keyof UpdateUserResearchDefinitionsRequest },
      'objectives_defined': { defined: 'objectives_defined' as keyof UpdateUserResearchDefinitionsRequest, text: 'objectives_text' as keyof UpdateUserResearchDefinitionsRequest },
      'methodology_defined': { defined: 'methodology_defined' as keyof UpdateUserResearchDefinitionsRequest, text: 'methodology_text' as keyof UpdateUserResearchDefinitionsRequest }
    };
    return mappings[id as keyof typeof mappings];
  };

  const handleCloseModal = () => {
    setOpenModal(null);
    setTempText("");
  };


  if (isLoading) {
    return (
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Search className="w-5 h-5 text-primary" />
            Definições de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Carregando definições de pesquisa...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Search className="w-5 h-5 text-primary" />
            Definições de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-destructive">Erro ao carregar definições de pesquisa</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Search className="w-5 h-5 text-primary" />
          Definições de Pesquisa
        </CardTitle>
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