import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Moon, 
  Sun, 
  Users, 
  Home, 
  GraduationCap, 
  FileText, 
  ChevronDown,
  BarChart3,
  LogOut
} from "lucide-react";

interface AdminTopNavProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AdminTopNav = ({ isDarkMode, toggleTheme }: AdminTopNavProps) => {
  const navigate = useNavigate();

  const dropdownMenuItems = [
    {
      title: "Cadastro",
      icon: Users,
      items: [
        { label: "Discentes", path: "/discentes", badge: "247" },
        { label: "Docentes", path: "/docentes", badge: null },
        { label: "Linhas de Pesquisa", path: "/linhaspesquisa", badge: null },
        { label: "Disciplinas", path: "/disciplinas", badge: "18" },
        { label: "Agências", path: "/agencias", badge: null },
        { label: "Revistas", path: "/revistas", badge: null },
        { label: "Eventos", path: "/eventos", badge: null }
      ]
    }
  ];

  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">GESTAD</h1>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-1">
          {/* Dashboard */}
          <Button
            variant="ghost"
            onClick={() => navigate("/administrativo")}
            className="flex items-center gap-2 text-sm font-medium hover:bg-accent"
            title="Botão Dashboard"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Button>

          {/* Dropdown for Cadastros */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 text-sm font-medium hover:bg-accent"
                title="Botão Cadastros"
              >
                <Users className="w-4 h-4" />
                Cadastros
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-48 bg-popover border border-border shadow-lg z-50"
            >
              {dropdownMenuItems[0].items.map((item) => (
                <DropdownMenuItem 
                  key={item.label}
                  className="cursor-pointer hover:bg-accent flex items-center justify-between"
                  onClick={() => navigate(item.path)}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-2 px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                      {item.badge}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Produções */}
          <Button
            variant="ghost"
            onClick={() => navigate("/producoes")}
            className="flex items-center gap-2 text-sm font-medium hover:bg-accent"
            title="Botão Produções"
          >
            <FileText className="w-4 h-4" />
            Produções
            <span className="ml-2 px-2 py-1 text-xs bg-orange-500/20 text-orange-600 rounded-full">
              5
            </span>
          </Button>

          {/* Relatórios */}
          <Button
            variant="ghost"
            onClick={() => navigate("/relatorios")}
            className="flex items-center gap-2 text-sm font-medium hover:bg-accent"
            title="Botão Relatórios"
          >
            <BarChart3 className="w-4 h-4" />
            Relatórios
          </Button>
        </nav>

        {/* Right side buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/selecao")}
            className="gap-2"
            title="Botão Seleção"
          >
            <Users className="w-4 h-4" />
            Seleção
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
            title="Botão Tema"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="p-2"
            title="Botão Sair"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminTopNav;