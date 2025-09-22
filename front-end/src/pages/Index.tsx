import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, BookOpen, FileText, Calendar, Award, Moon, Sun, CheckCircle, BarChart3, Database, Shield, Clock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const realFeatures = [
    {
      icon: Users,
      title: "Registro de Informações Acadêmicas",
      description: "Inserção direta pelo discente de dados essenciais como currículo Lattes, ORCID, matrícula, período de vínculo e informações de bolsista."
    },
    {
      icon: BookOpen,
      title: "Definições de Pesquisa",
      description: "Registro de elementos fundamentais: problema de pesquisa, pergunta de pesquisa, objetivos e metodologia."
    },
    {
      icon: CheckCircle,
      title: "Requisitos Acadêmicos",
      description: "Controle de datas para qualificação e defesa, com acompanhamento do progresso até a conclusão."
    },
    {
      icon: FileText,
      title: "Controle de Créditos",
      description: "Registro das disciplinas cursadas com cálculo automático dos créditos pendentes para integralização."
    },
    {
      icon: Award,
      title: "Produção Acadêmica",
      description: "Registro de publicações com datas de submissão, aceite e publicação, além da participação em eventos científicos."
    },
    {
      icon: BarChart3,
      title: "Painéis Adaptativos",
      description: "Dashboards interativos adaptados ao perfil: docentes veem seus orientandos, coordenação visualiza o programa completo."
    }
  ];

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-card">
        {/* Header */}
        <header className="border-b border-card-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">GESTAD</h1>
                <p className="text-sm text-muted-foreground">Sistema de Gestão Acadêmica</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
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
                onClick={() => navigate("/login")}
                className="gradient-primary"
              >
                Acessar Sistema
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12 animate-fade-in">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <GraduationCap className="w-12 h-12 text-primary-foreground" />
              </div>
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Solução Tecnológica para Pós-Graduação
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                GESTAD
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Solução tecnológica para apoio da gestão e acompanhamento de atividades acadêmicas em programas de pós-graduação, proporcionando agilidade e centralização de informações
              </p>
            </div>
          </div>
        </section>

        {/* Funcionalidades Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Módulos Integrados
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              Interação integrada e eficiente
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Permitindo que discentes, docentes e coordenação interajam de forma integrada com painéis de controle interativos e relatórios analíticos adaptados ao perfil do usuário.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {realFeatures.map((feature, index) => (
              <Card key={index} className="card-shadow border-card-border hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl text-foreground mb-3">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Additional Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6">
              Recursos Especializados
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-8">
              Funcionalidades acadêmicas completas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <Card className="text-left border-card-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground mb-3">
                    Registro de Informações Acadêmicas
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Inserção direta de dados essenciais pelo discente: currículo Lattes, ORCID, matrícula, período de vínculo e informações de bolsista com seleção da agência de fomento.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-left border-card-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground mb-3">
                    Definições de Pesquisa
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Registro de elementos fundamentais do projeto: problema de pesquisa, pergunta de pesquisa, objetivos e metodologia com acompanhamento contínuo.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-left border-card-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground mb-3">
                    Requisitos Acadêmicos
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Controle de datas para qualificação e defesa, com etapas específicas para registro e acompanhamento do progresso até a conclusão do curso.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-left border-card-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground mb-3">
                    Produção Acadêmica
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Registro de publicações com datas de submissão, aceite e publicação em periódicos, além da participação em eventos científicos.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="bg-accent/5 rounded-xl p-8 mb-16">
              <h3 className="text-xl font-semibold text-foreground mb-4">Comunicação Integrada</h3>
              <p className="text-muted-foreground mb-6">
                Sistema de chat interno para interação entre discente, orientador e coorientador, favorecendo a troca de informações e acompanhamento contínuo do trabalho acadêmico.
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mb-4">Painéis de Controle Adaptativos</h3>
              <p className="text-muted-foreground">
                Dashboards interativos com gráficos e indicadores, além de relatórios analíticos. A visualização é adaptada ao perfil: docentes visualizam apenas seus orientandos, enquanto a coordenação acessa dados completos do programa.
              </p>
            </div>

            <Button 
              size="lg"
              onClick={() => navigate("/login")}
              className="gradient-primary text-lg px-12 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Acessar o Sistema
              <GraduationCap className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-card-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">GESTAD</span>
              </div>
              
              <div className="mb-6">
                <p className="text-lg text-foreground mb-2">Entre em contato conosco</p>
                <a 
                  href="mailto:contato@gestad.com.br" 
                  className="text-primary hover:text-primary/80 transition-colors text-lg font-medium story-link"
                >
                  contato@gestad.com.br
                </a>
              </div>
              
              <div className="border-t border-card-border pt-6">
                <p className="text-sm text-muted-foreground">
                  © 2024 GESTAD - Sistema de Gestão Acadêmica
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Desenvolvido especialmente para programas de pós-graduação
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;