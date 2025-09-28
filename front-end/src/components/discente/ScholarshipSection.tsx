import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Building } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStudentAgencies,
  getUserScholarship,
  updateUserScholarship,
  ScholarshipAgency,
  UserScholarship
} from "@/lib/api";

export const ScholarshipSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get available agencies
  const { data: agencies = [], isLoading: isLoadingAgencies } = useQuery<ScholarshipAgency[]>({
    queryKey: ['student-agencies'],
    queryFn: getStudentAgencies,
  });

  // Get current scholarship info
  const { data: scholarshipData, isLoading: isLoadingScholarship } = useQuery<UserScholarship>({
    queryKey: ['student-scholarship'],
    queryFn: getUserScholarship,
  });

  const isBolsista = scholarshipData?.is_scholarship_holder || false;
  const selectedAgency = scholarshipData?.agency;

  // Mutation for updating scholarship
  const updateScholarshipMutation = useMutation({
    mutationFn: updateUserScholarship,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student-scholarship'] });
      toast({
        title: "Sucesso",
        description: data.message,
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
          description: "Falha ao atualizar informações de bolsa",
          variant: "destructive"
        });
      }
    }
  });

  const handleBolsistaToggle = async (value: boolean) => {
    if (!value) {
      // Remove scholarship - set agency_id to null
      updateScholarshipMutation.mutate({ agency_id: null });
    } else {
      // Show modal to select agency
      setIsModalOpen(true);
    }
  };

  const handleAgencySelect = async (agencyId: number) => {
    updateScholarshipMutation.mutate({ agency_id: agencyId });
    setIsModalOpen(false);
  };

  if (isLoadingScholarship || isLoadingAgencies) {
    return (
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="w-5 h-5 text-primary" />
            Informações de Bolsa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <span className="text-muted-foreground">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Wallet className="w-5 h-5 text-primary" />
          Informações de Bolsa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">É bolsista?</span>
            <div className="flex items-center gap-2">
              <Button
                variant={!isBolsista ? "danger" : "outline"}
                size="sm"
                onClick={() => handleBolsistaToggle(false)}
                disabled={updateScholarshipMutation.isPending}
                className="transition-smooth"
              >
                Não
              </Button>
              <Button
                variant={isBolsista ? "success" : "outline"}
                size="sm"
                onClick={() => handleBolsistaToggle(true)}
                disabled={updateScholarshipMutation.isPending}
                className="transition-smooth"
              >
                Sim
              </Button>
            </div>
          </div>

          {/* Modal para seleção de agência */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Selecione a Agência de Fomento
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-3 py-4">
                {agencies.map((agency) => (
                  <Button
                    key={agency.id}
                    variant="outline"
                    className="h-12 transition-smooth"
                    onClick={() => handleAgencySelect(agency.id)}
                    disabled={updateScholarshipMutation.isPending}
                  >
                    {agency.alias}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Exibição das agências após seleção */}
          {isBolsista && selectedAgency && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-t border-border pt-4">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Agência de Fomento Selecionada
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {agencies.map((agency) => (
                    <div
                      key={agency.id}
                      className={`h-12 rounded-md border flex items-center justify-center font-medium transition-smooth ${
                        selectedAgency.id === agency.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-muted opacity-50"
                      }`}
                    >
                      {agency.alias}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};