import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WelcomeSection } from "@/components/discente/WelcomeSection";
import { BasicInfoSection } from "@/components/discente/BasicInfoSection";
import { LinkPeriodSection } from "@/components/discente/LinkPeriodSection";
import { ScholarshipSection } from "@/components/discente/ScholarshipSection";
import { ResearchDefinitionsSection } from "@/components/discente/ResearchDefinitionsSection";
import { AcademicRequirementsVerticalSteps } from "@/components/discente/AcademicRequirementsVerticalSteps";
import { DisciplinesSection } from "@/components/discente/DisciplinesSection";
import { ProductionsSection } from "@/components/discente/ProductionsSection";
import { EventsSection } from "@/components/discente/EventsSection";

const Discente = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen flex flex-col w-full bg-background">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold text-foreground">
              GESTAD - Módulo Discente
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/chat")}
              className="gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="gap-2"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              {isDarkMode ? "Claro" : "Escuro"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/selecao")}
            >
              Voltar
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-background overflow-y-auto">
          <div className="w-[85%] mx-auto space-y-6">
            <WelcomeSection />
            <BasicInfoSection />
            <LinkPeriodSection />
            <ScholarshipSection />
            <ResearchDefinitionsSection />
?            <AcademicRequirementsVerticalSteps />
            <DisciplinesSection />
            <ProductionsSection />
            <EventsSection />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Discente;