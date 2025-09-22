import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Building } from "lucide-react";

export const ScholarshipSection = () => {
  const [isBolsista, setIsBolsista] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const agencies = [
    { id: "cnpq", name: "CNPq" },
    { id: "capes", name: "CAPES" },
    { id: "fapemig", name: "FAPEMIG" }
  ];

  const handleBolsistaToggle = async (value: boolean) => {
    setIsBolsista(value);
    
    if (!value) {
      setSelectedAgency("");
    } else {
      setIsModalOpen(true);
    }

    // Simulação de salvamento
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      toast({
        title: "Sucesso",
        description: `Status de bolsista atualizado: ${value ? "Sim" : "Não"}`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive"
      });
    }
  };

  const handleAgencySelect = async (agencyId: string) => {
    setSelectedAgency(agencyId);
    setIsModalOpen(false);
    
    // Simulação de salvamento
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const agencyName = agencies.find(a => a.id === agencyId)?.name;
      toast({
        title: "Sucesso",
        description: `Agência selecionada: ${agencyName}`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao selecionar agência",
        variant: "destructive"
      });
    }
  };

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
                className="transition-smooth"
              >
                Não
              </Button>
              <Button
                variant={isBolsista ? "success" : "outline"}
                size="sm"
                onClick={() => handleBolsistaToggle(true)}
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
                  >
                    {agency.name}
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
                        selectedAgency === agency.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-muted opacity-50"
                      }`}
                    >
                      {agency.name}
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