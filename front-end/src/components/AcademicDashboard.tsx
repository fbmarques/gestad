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

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
}

const stats: StatCard[] = [
  {
    title: "Discentes Ativos",
    value: "247",
    description: "Mestrado e Doutorado",
    icon: Users,
    trend: "+12",
    trendUp: true
  },
  {
    title: "Disciplinas Ofertadas",
    value: "18",
    description: "Semestre atual",
    icon: BookOpen,
    trend: "+3",
    trendUp: true
  },
  {
    title: "Defesas Programadas",
    value: "8",
    description: "Próximos 30 dias",
    icon: Calendar,
    trend: "2",
    trendUp: false
  },
  {
    title: "Publicações",
    value: "156",
    description: "Ano letivo atual",
    icon: FileText,
    trend: "+24",
    trendUp: true
  }
];

// Dados para gráficos
const academicDistribution = [
  { name: "Mestrado", value: 148, fill: "hsl(var(--primary))" },
  { name: "Doutorado", value: 99, fill: "hsl(var(--secondary))" }
];

const publicationsQualis = [
  { qualis: "A1", count: 28, fill: "hsl(var(--success))" },
  { qualis: "A2", count: 34, fill: "hsl(var(--primary))" },
  { qualis: "A3", count: 22, fill: "hsl(var(--warning))" },
  { qualis: "A4", count: 18, fill: "hsl(var(--muted))" },
  { qualis: "B1", count: 31, fill: "hsl(var(--destructive))" },
  { qualis: "B2", count: 23, fill: "hsl(var(--secondary))" }
];

const alertsData = [
  {
    type: "urgent",
    title: "Prazos de Qualificação Vencendo",
    description: "8 discentes com prazo em 30 dias",
    icon: Calendar,
    color: "text-destructive bg-destructive/10 border-destructive/20"
  },
  {
    type: "warning", 
    title: "Produções Pendentes de Aprovação",
    description: "15 publicações aguardando análise",
    icon: FileText,
    color: "text-warning bg-warning/10 border-warning/20"
  },
  {
    type: "info",
    title: "Bolsas a Vencer",
    description: "12 bolsas vencem nos próximos 60 dias",
    icon: Award,
    color: "text-primary bg-primary/10 border-primary/20"
  },
  {
    type: "success",
    title: "Novas Matrículas",
    description: "5 novos discentes matriculados esta semana",
    icon: Users,
    color: "text-success bg-success/10 border-success/20"
  }
];

// Dados para mini-dashboards
const scholarshipData = [
  { name: "Com Bolsa", value: 168, fill: "hsl(var(--success))" },
  { name: "Sem Bolsa", value: 79, fill: "hsl(var(--muted))" }
];

const eventsMonthly = [
  { month: "Jan", events: 12 },
  { month: "Fev", events: 8 },
  { month: "Mar", events: 15 },
  { month: "Abr", events: 22 },
  { month: "Mai", events: 18 },
  { month: "Jun", events: 25 },
  { month: "Jul", events: 30 },
  { month: "Ago", events: 28 },
  { month: "Set", events: 35 },
  { month: "Out", events: 32 },
  { month: "Nov", events: 40 },
  { month: "Dez", events: 38 }
];

const topProfessors = [
  { name: "Dr. Silva", students: 18, fill: "hsl(var(--primary))" },
  { name: "Dra. Santos", students: 15, fill: "hsl(var(--secondary))" },
  { name: "Dr. Oliveira", students: 12, fill: "hsl(var(--success))" }
];

const topJournals = [
  { alias: "JCIS", publications: 28, name: "Journal of Computer and Information Science" },
  { alias: "IEEE Trans.", publications: 24, name: "IEEE Transactions on Software Engineering" },
  { alias: "ACM Comp.", publications: 19, name: "ACM Computing Surveys" }
];

const chartConfig = {
  qualis: {
    label: "Publicações por Qualis",
    color: "hsl(var(--primary))"
  }
};

export function AcademicDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Dashboard Acadêmico 2
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
            {alertsData.map((alert, index) => (
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
                <p className="text-2xl font-bold text-foreground">68%</p>
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
                <p className="text-2xl font-bold text-foreground">312</p>
                <p className="text-xs text-muted-foreground">últimos 12 meses</p>
              </div>
              <div className="w-20 h-12">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventsMonthly}>
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
              {topJournals.map((journal, index) => (
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