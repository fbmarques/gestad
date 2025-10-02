import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  User,
  LogOut,
  Bell
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getUserRoles } from "@/lib/api";

const allMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
    badge: null,
    roles: ['admin', 'docente', 'discente'] // Todos podem ver
  },
  {
    title: "Discentes",
    url: "/discentes",
    icon: Users,
    badge: "247",
    roles: ['admin', 'docente'] // Admin e Docente
  },
  {
    title: "Docentes",
    url: "/docentes",
    icon: User,
    badge: null,
    roles: ['admin'] // Apenas Admin
  },
  {
    title: "Disciplinas",
    url: "/disciplinas",
    icon: BookOpen,
    badge: "18",
    roles: ['admin'] // Apenas Admin
  },
  {
    title: "Revistas",
    url: "/revistas",
    icon: FileText,
    badge: null,
    roles: ['admin'] // Apenas Admin
  },
  {
    title: "Eventos",
    url: "/eventos",
    icon: Calendar,
    badge: null,
    roles: ['admin'] // Apenas Admin
  },
  {
    title: "Agências",
    url: "/agencias",
    icon: Settings,
    badge: null,
    roles: ['admin'] // Apenas Admin
  }
];

const approvalItems = [
  {
    title: "Produções",
    url: "/producoes",
    icon: BookOpen,
    badge: "5"
  }
];

const reportItems = [
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: FileText,
    badge: null
  }
];

const systemItems = [
  {
    title: "Notificações",
    url: "/notificacoes",
    icon: Bell,
    badge: "3"
  }
];

export function AcademicSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  // Buscar roles do usuário
  const { data: userRoles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['user-roles'],
    queryFn: getUserRoles,
  });

  // Extrair slugs das roles
  const userRoleSlugs = userRoles?.map(role => role.slug) || [];

  // Filtrar menu items baseado nas roles do usuário
  const menuItems = allMenuItems.filter(item =>
    item.roles.some(role => userRoleSlugs.includes(role))
  );

  const isActive = (path: string) => currentPath === path;
  
  const getNavClasses = (path: string) => {
    const baseClasses = "transition-smooth w-full justify-start";
    if (isActive(path)) {
      return `${baseClasses} bg-primary text-primary-foreground`;
    }
    return `${baseClasses} hover:bg-sidebar-accent hover:text-sidebar-accent-foreground`;
  };

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-64"} border-sidebar-border transition-smooth`}
      collapsible="icon"
    >
      <SidebarContent>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-semibold text-sidebar-foreground">GESTAD</h2>
                <p className="text-xs text-sidebar-foreground/70">Gestão Acadêmica</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!isCollapsed ? "Navegação Principal" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="bg-sidebar-accent text-sidebar-accent-foreground text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Reports Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!isCollapsed ? "Relatórios" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="bg-sidebar-accent text-sidebar-accent-foreground text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Approvals Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!isCollapsed ? "Aprovações" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {approvalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              className="bg-orange-500 text-white text-xs hover:bg-orange-600"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {!isCollapsed ? "Sistema" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant="destructive" 
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section */}
        <div className="mt-auto border-t border-sidebar-border p-4">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    Admin Sistema
                  </p>
                  <p className="text-xs text-sidebar-foreground/70 truncate">
                    admin@gestad.edu.br
                  </p>
                </div>
              </div>
              <button className="flex items-center gap-2 w-full text-sm text-sidebar-foreground/70 hover:text-destructive transition-fast">
                <LogOut className="w-4 h-4" />
                Sair do Sistema
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <button className="text-sidebar-foreground/70 hover:text-destructive transition-fast">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}