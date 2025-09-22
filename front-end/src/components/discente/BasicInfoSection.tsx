import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IdCard, Link, Award } from "lucide-react";

export const BasicInfoSection = () => {
  const [formData, setFormData] = useState({
    matricula: "",
    lattes: "",
    orcid: ""
  });
  const { toast } = useToast();

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = async (field: string) => {
    // Validações específicas
    if (field === "lattes" && formData.lattes && !isValidURL(formData.lattes)) {
      toast({
        title: "Erro",
        description: "URL do Lattes inválida",
        variant: "destructive"
      });
      return;
    }

    if (field === "orcid" && formData.orcid && !isValidORCID(formData.orcid)) {
      toast({
        title: "Erro", 
        description: "Formato ORCID inválido",
        variant: "destructive"
      });
      return;
    }

    // Simulação de salvamento
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Sucesso",
        description: "Informação salva automaticamente"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar informação",
        variant: "destructive"
      });
    }
  };

  const isValidURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidORCID = (orcid: string) => {
    const orcidPattern = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
    return orcidPattern.test(orcid);
  };

  const formatORCID = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8)}`;
    return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}-${numbers.slice(12, 16)}`;
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <IdCard className="w-5 h-5 text-primary" />
          Informações Básicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="matricula" className="flex items-center gap-2">
              <IdCard className="w-4 h-4" />
              Matrícula
            </Label>
            <Input
              id="matricula"
              type="number"
              placeholder="Digite sua matrícula"
              value={formData.matricula}
              onChange={(e) => handleFieldChange("matricula", e.target.value)}
              onBlur={() => handleFieldBlur("matricula")}
              className="transition-smooth"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lattes" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Link Lattes
            </Label>
            <Input
              id="lattes"
              type="url"
              placeholder="http://lattes.cnpq.br/..."
              value={formData.lattes}
              onChange={(e) => handleFieldChange("lattes", e.target.value)}
              onBlur={() => handleFieldBlur("lattes")}
              className="transition-smooth"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="orcid" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              ORCID
            </Label>
            <Input
              id="orcid"
              placeholder="0000-0000-0000-0000"
              value={formData.orcid}
              onChange={(e) => handleFieldChange("orcid", formatORCID(e.target.value))}
              onBlur={() => handleFieldBlur("orcid")}
              maxLength={19}
              className="transition-smooth"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};