import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import {
  BookOpen,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Award,
  Bell,
  Settings,
  PieChart as PieChartIcon,
  BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/lib/api";

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
}

const chartConfig = {
  qualis: {
    label: "Publicações por Qualis",
    color: "hsl(var(--primary))"
  }
};

export function AcademicDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-muted-foreground">Carregando estatísticas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-destructive">Erro ao carregar estatísticas do dashboard</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Mapear dados da API para formato do componente
  const stats: StatCard[] = [
    {
      title: "Discentes Ativos",
      value: String(data.stats.activeStudents),
      description: "",
      icon: Users,
      trend: "",
      trendUp: true
    },
    {
      title: "Disciplinas Ofertadas",
      value: String(data.stats.coursesOffered),
      description: "",
      icon: BookOpen,
      trend: "",
      trendUp: true
    },
    {
      title: "Defesas Programadas",
      value: String(data.stats.scheduledDefenses),
      description: "Próximos 30 dias",
      icon: Calendar,
      trend: String(data.stats.defensesNext30Days),
      trendUp: false
    },
    {
      title: "Publicações",
      value: String(data.stats.publicationsLast12Months),
      description: "Últimos 12 meses",
      icon: FileText,
      trend: "",
      trendUp: true
    }
  ];

  // Adicionar cores aos dados do backend
  const academicDistribution = data.academicDistribution.map((item, index) => ({
    ...item,
    fill: index === 0 ? "hsl(var(--primary))" : "hsl(var(--warning))"
  }));

  const publicationsQualis = data.publicationsByQualis.map((item) => {
    const colors: Record<string, string> = {
      'A1': "hsl(var(--success))",
      'A2': "hsl(var(--primary))",
      'A3': "hsl(var(--warning))",
      'A4': "hsl(var(--muted))",
      'B1': "hsl(var(--destructive))",
      'B2': "hsl(var(--secondary))",
    };
    return {
      ...item,
      fill: colors[item.qualis] || "hsl(var(--muted))"
    };
  });

  const scholarshipData = data.scholarshipData.map((item, index) => ({
    ...item,
    fill: index === 0 ? "hsl(var(--success))" : "hsl(var(--muted))"
  }));

  const topProfessors = data.topProfessors.map((item, index) => {
    const fills = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--success))"];
    return {
      ...item,
      fill: fills[index] || "hsl(var(--muted))"
    };
  });

  const alertsDataWithStyle = data.alertsData.map((alert) => {
    const typeColors: Record<string, string> = {
      'urgent': 'text-destructive bg-destructive/10 border-destructive/20',
      'warning': 'text-warning bg-warning/10 border-warning/20',
      'info': 'text-primary bg-primary/10 border-primary/20',
      'success': 'text-success bg-success/10 border-success/20',
    };
    const typeIcons: Record<string, any> = {
      'urgent': Calendar,
      'warning': FileText,
      'info': Award,
      'success': Users,
    };
    return {
      ...alert,
      color: typeColors[alert.type] || typeColors['info'],
      icon: typeIcons[alert.type] || Bell,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do sistema de gestão acadêmica
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-shadow hover:card-elevated transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                {stat.trend && (
                  <Badge 
                    variant={stat.trendUp ? "default" : "secondary"}
                    className={
                      stat.trendUp 
                        ? "bg-success/10 text-success border-success/20" 
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {stat.trendUp ? "+" : ""}{stat.trend}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Academic Distribution - Smaller */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-primary" />
              Distribuição Acadêmica
            </CardTitle>
            <CardDescription>
              Discentes por nível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={academicDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {academicDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Publications by Qualis */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Publicações por Qualis
            </CardTitle>
            <CardDescription>
              Distribuição das publicações por classificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={publicationsQualis}>
                  <XAxis dataKey="qualis" />
                  <YAxis />
                  <Bar dataKey="count" radius={4}>
                    {publicationsQualis.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Alerts and Notifications */}
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Alertas e Pendências
            </CardTitle>
            <CardDescription>
              Itens que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertsDataWithStyle.map((alert, index) => (
              <div
                key={index}
                className={`rounded-lg border p-3 ${alert.color}`}
              >
                <div className="flex items-start gap-3">
                  <alert.icon className="w-4 h-4 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">
                      {alert.title}
                    </p>
                    <p className="text-xs opacity-80 mt-1">
                      {alert.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Mini Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scholarship Status */}
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-success" />
              Situação de Bolsas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{data.scholarshipPercentage}%</p>
                <p className="text-xs text-muted-foreground">com bolsa</p>
              </div>
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scholarshipData}
                      cx="50%"
                      cy="50%"
                      innerRadius={18}
                      outerRadius={30}
                      dataKey="value"
                    >
                      {scholarshipData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Events */}
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Eventos por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{data.totalEventsLast12Months}</p>
                <p className="text-xs text-muted-foreground">últimos 12 meses</p>
              </div>
              <div className="w-20 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.eventsMonthly}>
                    <Line 
                      type="monotone" 
                      dataKey="events" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Professors */}
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-secondary" />
              Top Docentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topProfessors.map((prof, index) => (
                <div key={prof.name} className="flex items-center gap-2">
                  <div className="w-1 h-6 rounded-full" style={{ backgroundColor: prof.fill }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{prof.name}</p>
                    <p className="text-xs text-muted-foreground">{prof.students} orientandos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Journals */}
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-warning" />
              Top Revistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.topJournals.map((journal, index) => (
                <div key={journal.alias} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{journal.alias}</p>
                    <p className="text-xs text-muted-foreground">{journal.publications} publicações</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}