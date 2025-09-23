import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRoles, Role } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
  redirectTo?: string;
}

const ProtectedRoute = ({ children, requiredRole, redirectTo = "/selecao" }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const roles = await getUserRoles();
        setUserRoles(roles);

        // Check if user has the required role
        const hasRequiredRole = roles.some(role => role.slug === requiredRole);
        setHasAccess(hasRequiredRole);

        if (!hasRequiredRole) {
          console.warn(`Access denied: User does not have required role '${requiredRole}'`);
        }
      } catch (error) {
        console.error('Error checking user roles:', error);
        // If there's an error getting roles, redirect to login
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [requiredRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl text-foreground">
              Acesso Negado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com o administrador do sistema se acredita que isso é um erro.
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate(redirectTo)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                variant="default"
                onClick={() => navigate("/")}
              >
                Ir para Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;