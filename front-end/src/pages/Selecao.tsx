import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Users, BookOpen, GraduationCap, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { getUserRoles, getUserAcademicLevels, Role } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";

const Selecao = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [academicLevels, setAcademicLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const roles = await getUserRoles();
        setUserRoles(roles);

        // If user is discente (role type 3), also load academic levels
        const isDiscente = roles.some(role => role.slug === 'discente');
        if (isDiscente) {
          try {
            const levels = await getUserAcademicLevels();
            setAcademicLevels(levels);
          } catch (levelError) {
            console.error('Error loading academic levels:', levelError);
            // If academic levels can't be loaded, set empty array (no cards will show)
            setAcademicLevels([]);
          }
        }
      } catch (error) {
        console.error('Error loading user roles:', error);
        // Redirect to login if unauthorized
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const allProfileOptions = [
    {
      title: "Administrativo",
      description: "Acesso completo ao sistema de gestão acadêmica",
      icon: Settings,
      route: "/administrativo",
      color: "bg-primary/10 text-primary",
      requiredRole: "admin"
    },
    {
      title: "Docente",
      description: "Acompanhamento dos seus orientandos",
      icon: Users,
      route: "/docente",
      color: "bg-secondary/10 text-secondary",
      requiredRole: "docente"
    },
    {
      title: "Mestrado",
      description: "Portal do discente de mestrado",
      icon: BookOpen,
      route: "/discente",
      color: "bg-accent/10 text-accent",
      requiredRole: "discente"
    },
    {
      title: "Doutorado",
      description: "Portal do discente de doutorado",
      icon: GraduationCap,
      route: "/discente",
      color: "bg-muted/30 text-muted-foreground",
      requiredRole: "discente"
    }
  ];

  // Filter profile options based on user roles
  const profileOptions = allProfileOptions.filter(option => {
    // For non-discente roles, use the original logic
    if (option.requiredRole !== 'discente') {
      return userRoles.some(role => role.slug === option.requiredRole);
    }

    // For discente role, check if user has the role AND has the appropriate academic level
    const hasDiscenteRole = userRoles.some(role => role.slug === 'discente');
    if (!hasDiscenteRole) {
      return false;
    }

    // Check academic levels for discente cards
    if (option.title === 'Mestrado') {
      return academicLevels.includes('master');
    }
    if (option.title === 'Doutorado') {
      return academicLevels.includes('doctorate');
    }

    return false;
  });

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">GESTAD</h1>
            </div>
            
            <div className="flex items-center gap-2">
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
                onClick={() => navigate("/")}
              >
                Sair
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Selecione seu Perfil de Acesso
              </h2>
              <p className="text-muted-foreground">
                Escolha o perfil correspondente ao seu nível de acesso
              </p>
            </div>

            {loading ? (
              <div className="text-center">
                <p className="text-muted-foreground">Carregando perfis...</p>
              </div>
            ) : profileOptions.length === 0 ? (
              <div className="text-center">
                <p className="text-muted-foreground">Nenhum perfil disponível para este usuário.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileOptions.map((option) => (
                  <Card
                    key={option.title}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-card-border"
                    onClick={() => navigate(option.route)}
                  >
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 rounded-full ${option.color} flex items-center justify-center mx-auto mb-4`}>
                        <option.icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-xl text-foreground">
                        {option.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-muted-foreground mb-4">
                        {option.description}
                      </p>
                      <Button
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(option.route);
                        }}
                      >
                        Acessar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Selecao;