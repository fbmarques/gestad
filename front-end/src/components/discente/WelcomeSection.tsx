import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getStudentData } from "@/lib/api";

export const WelcomeSection = () => {
  const { data: studentData, isLoading, error } = useQuery({
    queryKey: ['student-data'],
    queryFn: getStudentData,
    retry: 3,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="gradient-card border-card-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <GraduationCap className="w-6 h-6 text-primary" />
            Bem-vindo(a) ao GESTAD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="gradient-card border-card-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <GraduationCap className="w-6 h-6 text-primary" />
            Bem-vindo(a) ao GESTAD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive text-sm">
            Erro ao carregar dados do discente. Por favor, tente novamente.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-card-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <GraduationCap className="w-6 h-6 text-primary" />
          Bem-vindo(a) ao GESTAD
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-lg font-medium text-foreground">
              {studentData?.name}
            </span>
          </div>

          <div className="text-muted-foreground">
            <p><span className="font-medium">Modalidade:</span> {studentData?.modality}</p>
            <p><span className="font-medium">Orientador:</span> {studentData?.advisor}</p>
            {studentData?.co_advisor && (
              <p><span className="font-medium">Co-orientador:</span> {studentData.co_advisor}</p>
            )}
            {studentData?.research_line && (
              <p><span className="font-medium">Linha de Pesquisa:</span> {studentData.research_line}</p>
            )}
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p className="text-sm text-accent-foreground">
            <span className="font-medium">Informação importante:</span> Os dados inseridos neste sistema
            serão compartilhados com seu orientador para acompanhamento do progresso acadêmico.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};