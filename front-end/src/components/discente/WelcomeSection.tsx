import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, User } from "lucide-react";

export const WelcomeSection = () => {
  // Mock data - em produção viria do backend
  const studentData = {
    name: "Maria Silva Santos",
    courseType: "Doutorando", // ou "Mestrando"
    advisor: "Prof. Dr. João Carlos Oliveira"
  };

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
              {studentData.name}
            </span>
          </div>
          
          <div className="text-muted-foreground">
            <p><span className="font-medium">Modalidade:</span> {studentData.courseType}</p>
            <p><span className="font-medium">Orientador:</span> {studentData.advisor}</p>
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