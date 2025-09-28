import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { IdCard, Link, Award } from "lucide-react";
import { updateUserBasicInfo, getUserProfile, UserBasicInfo } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export const BasicInfoSection = () => {
  const [formData, setFormData] = useState({
    registration: "",
    lattes_url: "",
    orcid: ""
  });
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userProfile = await getUserProfile();
        setFormData({
          registration: userProfile.registration || "",
          lattes_url: userProfile.lattes_url || "",
          orcid: userProfile.orcid || ""
        });
      } catch (error) {
        console.error("Failed to load user profile:", error);
      }
    };

    loadUserData();
  }, []);

  // Mutation for updating basic info
  const updateBasicInfoMutation = useMutation({
    mutationFn: (data: UserBasicInfo) => updateUserBasicInfo(data),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Informação salva automaticamente"
      });
    },
    onError: (error: any) => {
      console.error("Update error:", error);

      // Handle validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;

        if (validationErrors.registration) {
          toast({
            title: "Erro",
            description: validationErrors.registration[0],
            variant: "destructive"
          });
        } else if (validationErrors.lattes_url) {
          toast({
            title: "Erro",
            description: validationErrors.lattes_url[0],
            variant: "destructive"
          });
        } else if (validationErrors.orcid) {
          toast({
            title: "Erro",
            description: validationErrors.orcid[0],
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Erro",
          description: "Falha ao salvar informação",
          variant: "destructive"
        });
      }
    }
  });

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = async (field: string) => {
    const currentValue = formData[field as keyof typeof formData];

    // Skip if field is empty
    if (!currentValue) {
      return;
    }

    // Client-side validations
    if (field === "lattes_url" && !isValidLattesURL(currentValue)) {
      toast({
        title: "Erro",
        description: "URL do Lattes deve seguir o padrão: http://lattes.cnpq.br/NÚMEROS",
        variant: "destructive"
      });
      return;
    }

    if (field === "orcid" && !isValidORCID(currentValue)) {
      toast({
        title: "Erro",
        description: "ORCID deve seguir o padrão: 0000-0000-0000-0000",
        variant: "destructive"
      });
      return;
    }

    if (field === "registration" && !isValidRegistration(currentValue)) {
      toast({
        title: "Erro",
        description: "Matrícula deve conter apenas números e ter no máximo 10 dígitos",
        variant: "destructive"
      });
      return;
    }

    // Save to API
    const updateData: UserBasicInfo = {
      [field]: currentValue
    };

    updateBasicInfoMutation.mutate(updateData);
  };

  const isValidLattesURL = (url: string) => {
    const lattesPattern = /^http:\/\/lattes\.cnpq\.br\/\d+$/;
    return lattesPattern.test(url);
  };

  const isValidORCID = (orcid: string) => {
    const orcidPattern = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
    return orcidPattern.test(orcid);
  };

  const isValidRegistration = (registration: string) => {
    const registrationPattern = /^\d{1,10}$/;
    return registrationPattern.test(registration);
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
            <Label htmlFor="registration" className="flex items-center gap-2">
              <IdCard className="w-4 h-4" />
              Matrícula
            </Label>
            <Input
              id="registration"
              type="text"
              placeholder="Digite sua matrícula"
              value={formData.registration}
              onChange={(e) => handleFieldChange("registration", e.target.value)}
              onBlur={() => handleFieldBlur("registration")}
              className="transition-smooth"
              maxLength={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lattes_url" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Link Lattes
            </Label>
            <Input
              id="lattes_url"
              type="url"
              placeholder="http://lattes.cnpq.br/..."
              value={formData.lattes_url}
              onChange={(e) => handleFieldChange("lattes_url", e.target.value)}
              onBlur={() => handleFieldBlur("lattes_url")}
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