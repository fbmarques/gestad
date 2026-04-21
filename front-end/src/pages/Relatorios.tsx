import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
import { useActiveRole } from "@/hooks/useActiveRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  SearchCheck,
  Sparkles,
  Users,
} from "lucide-react";

const docenteHighlights = [
  {
    title: "Acompanhamento de Orientandos",
    description:
      "Relatórios voltados ao progresso acadêmico dos seus orientandos, com foco em vínculo, produção e marcos do curso.",
    icon: Users,
    accent: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  {
    title: "Produção Acadêmica",
    description:
      "Painéis de apoio para leitura rápida de publicações, participações em eventos e itens em análise pelo colegiado.",
    icon: FileText,
    accent: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
  {
    title: "Prazos e Defesas",
    description:
      "Visão preparada para consolidar qualificações, defesas e pendências temporais do grupo de orientação.",
    icon: CalendarClock,
    accent: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
];

const reportCards = [
  {
    title: "Relatório Sintético de Orientandos",
    description:
      "Resumo executivo com vínculo ativo, modalidade, bolsa, marcos acadêmicos e status geral dos discentes orientados.",
    type: "Visão Geral",
    icon: LayoutDashboard,
  },
  {
    title: "Relatório de Produções e Eventos",
    description:
      "Consolidação das publicações e participações em eventos para acompanhamento acadêmico e prestação de contas.",
    type: "Acadêmico",
    icon: FileSpreadsheet,
  },
  {
    title: "Relatório de Marcos Acadêmicos",
    description:
      "Organização de qualificação, defesa, trabalho concluído e demais pontos de acompanhamento do percurso discente.",
    type: "Prazos",
    icon: GraduationCap,
  },
  {
    title: "Relatório Analítico por Período",
    description:
      "Base para filtros por intervalo de datas, permitindo leitura comparativa da evolução das orientações.",
    type: "Analítico",
    icon: LineChart,
  },
];

const quickFilters = [
  "Período letivo",
  "Modalidade",
  "Situação do vínculo",
  "Status da qualificação",
  "Status da defesa",
  "Bolsa",
];

const upcomingModules = [
  {
    label: "Exportação em PDF",
    note: "Versão formatada para compartilhamento institucional.",
    icon: Download,
  },
  {
    label: "Filtros avançados",
    note: "Recortes por linha de pesquisa, prazo e perfil discente.",
    icon: Filter,
  },
  {
    label: "Busca inteligente",
    note: "Localização rápida por nome do discente ou indicador acadêmico.",
    icon: SearchCheck,
  },
  {
    label: "Notas de acompanhamento",
    note: "Espaço futuro para observações e registro de orientação.",
    icon: MessageSquare,
  },
];

const Relatorios = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { activeRole } = useActiveRole();

  const isDocente = activeRole === "docente";

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl space-y-4">
                  <Badge variant="outline" className="w-fit gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Central de Relatórios
                  </Badge>
                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                      Relatórios para acompanhamento docente
                    </h1>
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                      {isDocente
                        ? "Ambiente preparado para reunir relatórios do seu conjunto de orientandos, com foco em progresso acadêmico, produção e prazos relevantes."
                        : "Ambiente preparado para relatórios acadêmicos com visual consistente ao restante do sistema."}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                  <Card className="border-border/60 bg-background/70">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-foreground">4</div>
                      <div className="text-sm text-muted-foreground">Modelos iniciais</div>
                    </CardContent>
                  </Card>
                  <Card className="border-border/60 bg-background/70">
                    <CardContent className="p-4">
                      <div className="text-2xl font-bold text-foreground">6</div>
                      <div className="text-sm text-muted-foreground">Filtros previstos</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {docenteHighlights.map((item) => (
                <Card key={item.title} className="border-border/70">
                  <CardHeader className="space-y-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${item.accent}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
              <Card className="border-border/70">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Estrutura Inicial da Página
                      </CardTitle>
                      <CardDescription>
                        Modelos visuais de relatórios para o módulo docente.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Em preparação</Badge>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportCards.map((report) => (
                    <div
                      key={report.title}
                      className="rounded-2xl border border-border bg-background/60 p-5 space-y-4 transition-colors hover:bg-accent/40"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <report.icon className="w-5 h-5" />
                        </div>
                        <Badge variant="outline">{report.type}</Badge>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-foreground leading-tight">
                          {report.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {report.description}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="w-full justify-start" disabled>
                        <FileText className="w-4 h-4 mr-2" />
                        Modelo visual preparado
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-border/70">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      Filtros previstos
                    </CardTitle>
                    <CardDescription>
                      Recortes que combinam com os dados já existentes no sistema.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {quickFilters.map((filter) => (
                      <div
                        key={filter}
                        className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground"
                      >
                        {filter}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border/70">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="w-5 h-5 text-primary" />
                      Próximos incrementos
                    </CardTitle>
                    <CardDescription>
                      Blocos já desenhados para a próxima etapa de implementação.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {upcomingModules.map((module, index) => (
                      <div key={module.label}>
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                            <module.icon className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">{module.label}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{module.note}</p>
                          </div>
                        </div>
                        {index < upcomingModules.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Relatorios;
