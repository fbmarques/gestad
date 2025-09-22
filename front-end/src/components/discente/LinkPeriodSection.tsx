import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const LinkPeriodSection = () => {
  const [formData, setFormData] = useState({
    dataInicio: "",
    dataTermino: ""
  });
  const { toast } = useToast();

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = async (field: string) => {
    // Validação de datas
    if (field === "dataInicio" && formData.dataTermino) {
      const inicio = new Date(formData.dataInicio);
      const termino = new Date(formData.dataTermino);
      
      if (inicio > termino) {
        toast({
          title: "Erro",
          description: "Data de início não pode ser posterior à data de término",
          variant: "destructive"
        });
        return;
      }
    }

    if (field === "dataTermino" && formData.dataInicio) {
      const inicio = new Date(formData.dataInicio);
      const termino = new Date(formData.dataTermino);
      
      if (termino < inicio) {
        toast({
          title: "Erro",
          description: "Data de término não pode ser anterior à data de início",
          variant: "destructive"
        });
        return;
      }
    }

    // Simulação de salvamento
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Sucesso",
        description: "Data salva automaticamente"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar data",
        variant: "destructive"
      });
    }
  };

  const calculateRemainingDays = () => {
    if (!formData.dataTermino) {
      return { message: "Data de término não definida", status: "neutral" };
    }

    const today = new Date();
    const endDate = new Date(formData.dataTermino);
    const diffDays = differenceInDays(endDate, today);

    if (diffDays > 0) {
      return {
        message: `Faltam ${diffDays} dias para o término`,
        status: "active"
      };
    } else if (diffDays === 0) {
      return {
        message: "Vínculo termina hoje",
        status: "warning"
      };
    } else {
      return {
        message: `Vínculo encerrado há ${Math.abs(diffDays)} dias`,
        status: "expired"
      };
    }
  };

  const remainingInfo = calculateRemainingDays();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-success bg-success/10 border-success/20";
      case "warning":
        return "text-warning bg-warning/10 border-warning/20";
      case "expired":
        return "text-destructive bg-destructive/10 border-destructive/20";
      default:
        return "text-muted-foreground bg-muted/10 border-border";
    }
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="w-5 h-5 text-primary" />
          Período de Vínculo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barra informativa */}
        {(!formData.dataInicio || !formData.dataTermino) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
            <p className="text-sm">
              <span className="font-medium">Informação importante:</span> Buscar essa informação no MinhaUFMG, em Informações Acadêmicas e depois em Dados de Admissão.
            </p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dataInicio" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de Início
            </Label>
            <Input
              id="dataInicio"
              type="date"
              value={formData.dataInicio}
              onChange={(e) => handleFieldChange("dataInicio", e.target.value)}
              onBlur={() => handleFieldBlur("dataInicio")}
              className="transition-smooth"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataTermino" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data de Término
            </Label>
            <Input
              id="dataTermino"
              type="date"
              value={formData.dataTermino}
              onChange={(e) => handleFieldChange("dataTermino", e.target.value)}
              onBlur={() => handleFieldBlur("dataTermino")}
              className="transition-smooth"
            />
          </div>
        </div>

        <div className={`rounded-lg border p-4 ${getStatusColor(remainingInfo.status)}`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{remainingInfo.message}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};