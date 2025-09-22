import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminTopNav from "@/components/AdminTopNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  TrendingUp,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Search,
  Calendar as CalendarLucide,
  Award,
  Building,
  Newspaper,
  MessageSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Relatorios = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReportFilters, setSelectedReportFilters] = useState<{[key: string]: any}>({});

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const reportCategories = [
    {
      id: "discentes",
      title: "Relatórios de Discentes",
      icon: Users,
      color: "bg-blue-500/10 border-blue-500/20",
      iconColor: "text-blue-600",
      reports: [
        {
          name: "Discentes Ativos por Linha de Pesquisa",
          description: "Listagem dos discentes ativos organizados por linha de pesquisa",
          filters: ["linha_pesquisa", "status", "periodo"],
          type: "listagem"
        },
        {
          name: "Relatório de Bolsistas",
          description: "Comparativo entre bolsistas e não bolsistas",
          filters: ["tipo_bolsa", "agencia", "periodo"],
          type: "comparativo"
        },
        {
          name: "Ingressos por Período",
          description: "Análise temporal dos ingressos de discentes",
          filters: ["ano", "semestre", "nivel"],
          type: "grafico"
        },
        {
          name: "Situação Acadêmica",
          description: "Status atual dos discentes (cursando, qualificado, defendido)",
          filters: ["status", "nivel", "orientador"],
          type: "dashboard"
        }
      ]
    },
    {
      id: "docentes",
      title: "Relatórios de Docentes",
      icon: GraduationCap,
      color: "bg-green-500/10 border-green-500/20",
      iconColor: "text-green-600",
      reports: [
        {
          name: "Docentes por Linha de Pesquisa",
          description: "Distribuição dos docentes nas linhas de pesquisa",
          filters: ["linha_pesquisa", "titulacao", "status"],
          type: "listagem"
        },
        {
          name: "Produtividade por Docente",
          description: "Ranking de produção acadêmica por docente",
          filters: ["periodo", "tipo_producao", "linha_pesquisa"],
          type: "ranking"
        },
        {
          name: "Orientações Ativas",
          description: "Docentes e suas orientações em andamento",
          filters: ["nivel", "linha_pesquisa", "status_orientacao"],
          type: "listagem"
        }
      ]
    },
    {
      id: "producoes",
      title: "Relatórios de Produções",
      icon: FileText,
      color: "bg-purple-500/10 border-purple-500/20",
      iconColor: "text-purple-600",
      reports: [
        {
          name: "Produções por Tipo",
          description: "Distribuição das produções acadêmicas por categoria",
          filters: ["tipo", "periodo", "autor"],
          type: "grafico"
        },
        {
          name: "Ranking de Publicações",
          description: "Análise quantitativa de publicações por período",
          filters: ["periodo", "tipo_veiculo", "qualis"],
          type: "ranking"
        },
        {
          name: "Produções Colaborativas",
          description: "Trabalhos em colaboração entre linhas de pesquisa",
          filters: ["linha_pesquisa", "tipo_colaboracao", "periodo"],
          type: "network"
        },
        {
          name: "Impacto das Publicações",
          description: "Métricas de impacto e citações",
          filters: ["revista", "periodo", "area_conhecimento"],
          type: "metricas"
        }
      ]
    },
    {
      id: "eventos",
      title: "Relatórios de Eventos",
      icon: CalendarLucide,
      color: "bg-orange-500/10 border-orange-500/20",
      iconColor: "text-orange-600",
      reports: [
        {
          name: "Participação em Eventos",
          description: "Eventos com participação do programa",
          filters: ["tipo_evento", "periodo", "nivel"],
          type: "listagem"
        },
        {
          name: "Eventos por Categoria",
          description: "Distribuição dos eventos por tipo e relevância",
          filters: ["categoria", "abrangencia", "periodo"],
          type: "grafico"
        },
        {
          name: "Apresentações de Trabalhos",
          description: "Trabalhos apresentados em eventos científicos",
          filters: ["tipo_apresentacao", "evento", "autor"],
          type: "listagem"
        }
      ]
    },
    {
      id: "academico",
      title: "Relatórios Acadêmicos",
      icon: BookOpen,
      color: "bg-indigo-500/10 border-indigo-500/20",
      iconColor: "text-indigo-600",
      reports: [
        {
          name: "Disciplinas por Período",
          description: "Ofertas de disciplinas por semestre letivo",
          filters: ["semestre", "nivel", "docente"],
          type: "calendario"
        },
        {
          name: "Performance Acadêmica",
          description: "Aprovações, reprovações e desistências",
          filters: ["disciplina", "periodo", "nivel"],
          type: "dashboard"
        },
        {
          name: "Cronograma de Defesas",
          description: "Agendamento de qualificações e defesas",
          filters: ["tipo_defesa", "mes", "linha_pesquisa"],
          type: "cronograma"
        },
        {
          name: "Avaliação Curricular",
          description: "Análise do cumprimento de créditos",
          filters: ["discente", "tipo_credito", "status"],
          type: "individual"
        }
      ]
    },
    {
      id: "institucional",
      title: "Relatórios Institucionais",
      icon: Building,
      color: "bg-teal-500/10 border-teal-500/20",
      iconColor: "text-teal-600",
      reports: [
        {
          name: "Dashboard Executivo",
          description: "Visão geral do programa com KPIs principais",
          filters: ["ano", "trimestre"],
          type: "dashboard"
        },
        {
          name: "Relatório CAPES",
          description: "Dados formatados para envio à CAPES",
          filters: ["ano_base", "modalidade"],
          type: "oficial"
        },
        {
          name: "Comparativo Anual",
          description: "Evolução dos indicadores ao longo dos anos",
          filters: ["indicador", "periodo_comparacao"],
          type: "temporal"
        },
        {
          name: "Parcerias e Colaborações",
          description: "Mapeamento de colaborações interinstitucionais",
          filters: ["tipo_parceria", "instituicao", "area"],
          type: "network"
        }
      ]
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "listagem": return <FileText className="w-4 h-4" />;
      case "grafico": return <BarChart3 className="w-4 h-4" />;
      case "ranking": return <TrendingUp className="w-4 h-4" />;
      case "dashboard": return <PieChart className="w-4 h-4" />;
      case "comparativo": return <BarChart3 className="w-4 h-4" />;
      case "network": return <MessageSquare className="w-4 h-4" />;
      case "metricas": return <Award className="w-4 h-4" />;
      case "calendario": return <CalendarIcon className="w-4 h-4" />;
      case "cronograma": return <CalendarIcon className="w-4 h-4" />;
      case "individual": return <Users className="w-4 h-4" />;
      case "oficial": return <Newspaper className="w-4 h-4" />;
      case "temporal": return <TrendingUp className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      "listagem": "default",
      "grafico": "secondary",
      "ranking": "destructive",
      "dashboard": "outline",
      "comparativo": "default",
      "network": "secondary",
      "metricas": "destructive",
      "calendario": "outline",
      "cronograma": "outline",
      "individual": "default",
      "oficial": "secondary",
      "temporal": "destructive"
    };
    
    return (
      <Badge variant={variants[type] as any} className="text-xs">
        {getTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  const filteredCategories = reportCategories.filter(category => {
    // Filtro por categoria
    if (selectedCategory && selectedCategory !== "all" && category.id !== selectedCategory) {
      return false;
    }
    return true;
  }).map(category => ({
    ...category,
    reports: category.reports.filter(report => {
      // Filtro por texto de busca
      const matchesSearch = !searchTerm || 
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por tipo de relatório
      const matchesType = !selectedType || selectedType === "all" || report.type === selectedType;
      
      return matchesSearch && matchesType;
    })
  })).filter(category => category.reports.length > 0);

  // Contar total de relatórios após filtros
  const totalFilteredReports = filteredCategories.reduce((acc, cat) => acc + cat.reports.length, 0);
  const totalReports = reportCategories.reduce((acc, cat) => acc + cat.reports.length, 0);
  
  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm || (selectedCategory && selectedCategory !== "all") || (selectedType && selectedType !== "all") || dateFrom || dateTo;

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedType("");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const handleGenerateReport = (categoryId: string, reportName: string) => {
    // Aqui seria implementada a lógica real de geração de relatórios
    const reportKey = `${categoryId}-${reportName}`;
    const specificFilters = selectedReportFilters[reportKey] || {};
    
    console.log(`Gerando relatório: ${reportName} da categoria ${categoryId}`);
    console.log('Filtros globais:', { dateFrom, dateTo, selectedCategory, selectedType, searchTerm });
    console.log('Filtros específicos:', specificFilters);
    
    // Por enquanto, apenas uma simulação
    alert(`Relatório "${reportName}" será gerado com os filtros selecionados:\n\nFiltros Globais: ${JSON.stringify({ dateFrom: dateFrom?.toLocaleDateString(), dateTo: dateTo?.toLocaleDateString() }, null, 2)}\n\nFiltros Específicos: ${JSON.stringify(specificFilters, null, 2)}`);
  };

  const handleSpecificFilter = (categoryId: string, reportName: string, filterKey: string, filterValue: string) => {
    const reportKey = `${categoryId}-${reportName}`;
    setSelectedReportFilters(prev => ({
      ...prev,
      [reportKey]: {
        ...prev[reportKey],
        [filterKey]: filterValue
      }
    }));
  };

  const getFilterOptions = (filterName: string) => {
    // Simular opções de filtro baseadas no nome
    const filterOptions: {[key: string]: string[]} = {
      'linha_pesquisa': ['Inteligência Artificial', 'Redes de Computadores', 'Engenharia de Software', 'Banco de Dados'],
      'status': ['Cursando', 'Qualificado', 'Defendido', 'Desligado'],
      'periodo': ['2024.1', '2024.2', '2023.1', '2023.2', '2022.1'],
      'tipo_bolsa': ['CAPES', 'CNPq', 'FAPESC', 'Sem Bolsa'],
      'agencia': ['CAPES', 'CNPq', 'FAPESC', 'FUNCAP'],
      'ano': ['2024', '2023', '2022', '2021'],
      'semestre': ['1', '2'],
      'nivel': ['Mestrado', 'Doutorado'],
      'orientador': ['Prof. Ana Silva', 'Prof. João Santos', 'Prof. Maria Oliveira'],
      'titulacao': ['Doutor', 'Mestre', 'Especialista'],
      'tipo_producao': ['Artigo', 'Livro', 'Capítulo', 'Resumo'],
      'tipo_evento': ['Congresso', 'Simpósio', 'Workshop', 'Seminário'],
      'categoria': ['Nacional', 'Internacional', 'Regional'],
      'abrangencia': ['Local', 'Regional', 'Nacional', 'Internacional'],
      'disciplina': ['Algoritmos', 'Estruturas de Dados', 'Redes', 'IA'],
      'docente': ['Prof. Ana Silva', 'Prof. João Santos', 'Prof. Maria Oliveira']
    };
    
    return filterOptions[filterName] || ['Opção 1', 'Opção 2', 'Opção 3'];
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Relatórios</h1>
                  <p className="text-muted-foreground mt-2">
                    Centro de relatórios e análises do sistema GESTAD
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/administrativo")}
                >
                  Voltar
                </Button>
              </div>

              {/* Filtros Globais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtros Globais
                  </CardTitle>
                  <CardDescription>
                    Configure filtros que serão aplicados a todos os relatórios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Pesquisa */}
                    <div className="space-y-2">
                      <Label htmlFor="search">Buscar Relatório</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search"
                          placeholder="Nome ou descrição..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todas as categorias" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          {reportCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Data Início */}
                    <div className="space-y-2">
                      <Label>Data Início</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateFrom && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Data Fim */}
                    <div className="space-y-2">
                      <Label>Data Fim</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dateTo && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecione"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Tipo de Relatório */}
                    <div className="space-y-2">
                      <Label>Tipo de Relatório</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os tipos</SelectItem>
                          <SelectItem value="listagem">Listagem</SelectItem>
                          <SelectItem value="grafico">Gráfico</SelectItem>
                          <SelectItem value="ranking">Ranking</SelectItem>
                          <SelectItem value="dashboard">Dashboard</SelectItem>
                          <SelectItem value="comparativo">Comparativo</SelectItem>
                          <SelectItem value="network">Network</SelectItem>
                          <SelectItem value="metricas">Métricas</SelectItem>
                          <SelectItem value="calendario">Calendário</SelectItem>
                          <SelectItem value="cronograma">Cronograma</SelectItem>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="oficial">Oficial</SelectItem>
                          <SelectItem value="temporal">Temporal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Status dos Filtros e Ações */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Mostrando <span className="font-medium text-foreground">{totalFilteredReports}</span> de <span className="font-medium">{totalReports}</span> relatórios
                      </div>
                      
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="text-xs">
                          <Filter className="w-3 h-3 mr-1" />
                          Filtros ativos
                        </Badge>
                      )}
                    </div>

                    {hasActiveFilters && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearAllFilters}
                        className="text-xs"
                      >
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas de Filtros */}
            {hasActiveFilters && (
              <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 dark:text-blue-200">
                      Filtros aplicados: 
                      {searchTerm && <Badge variant="outline" className="ml-2">Busca: "{searchTerm}"</Badge>}
                      {selectedCategory && selectedCategory !== "all" && (
                        <Badge variant="outline" className="ml-2">
                          Categoria: {reportCategories.find(c => c.id === selectedCategory)?.title}
                        </Badge>
                      )}
                      {selectedType && selectedType !== "all" && (
                        <Badge variant="outline" className="ml-2">Tipo: {selectedType}</Badge>
                      )}
                      {dateFrom && <Badge variant="outline" className="ml-2">Desde: {format(dateFrom, "dd/MM/yyyy")}</Badge>}
                      {dateTo && <Badge variant="outline" className="ml-2">Até: {format(dateTo, "dd/MM/yyyy")}</Badge>}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mensagem quando não há resultados */}
            {totalFilteredReports === 0 && hasActiveFilters && (
              <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-orange-600 dark:text-orange-400 mb-2">
                    <Search className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-medium">Nenhum relatório encontrado</h3>
                    <p className="text-sm mt-1">Tente ajustar os filtros para ver mais resultados</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="mt-3"
                  >
                    Limpar todos os filtros
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Categorias de Relatórios */}
            <div className="space-y-8">
              {filteredCategories.map((category) => (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", category.color)}>
                      <category.icon className={cn("w-6 h-6", category.iconColor)} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground">
                        {category.title}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {category.reports.length} relatório{category.reports.length !== 1 ? 's' : ''} disponível{category.reports.length !== 1 ? 'is' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.reports.map((report, index) => (
                      <Card key={index} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg font-medium">
                              {report.name}
                            </CardTitle>
                            {getTypeBadge(report.type)}
                          </div>
                          <CardDescription className="text-sm">
                            {report.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Filtros Disponíveis
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {report.filters.map((filter) => (
                                <Badge key={filter} variant="outline" className="text-xs">
                                  {filter.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleGenerateReport(category.id, report.name)}
                              className="flex-1"
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Gerar
                            </Button>
                            
                            {/* Botão de Filtros Específicos */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Filter className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Filtros Específicos - {report.name}</DialogTitle>
                                  <DialogDescription>
                                    Configure filtros específicos para este relatório. Estes filtros serão combinados com os filtros globais.
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                  {report.filters.map((filter) => {
                                    const reportKey = `${category.id}-${report.name}`;
                                    const currentValue = selectedReportFilters[reportKey]?.[filter] || "";
                                    
                                    return (
                                      <div key={filter} className="space-y-2">
                                        <Label className="text-sm font-medium capitalize">
                                          {filter.replace(/_/g, ' ')}
                                        </Label>
                                        <Select 
                                          value={currentValue}
                                          onValueChange={(value) => handleSpecificFilter(category.id, report.name, filter, value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder={`Selecione ${filter.replace(/_/g, ' ')}`} />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="all">Todos</SelectItem>
                                            {getFilterOptions(filter).map((option) => (
                                              <SelectItem key={option} value={option}>
                                                {option}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    );
                                  })}
                                </div>
                                
                                {/* Prévia dos Filtros Selecionados */}
                                <div className="border-t pt-4">
                                  <h4 className="text-sm font-medium mb-2">Filtros Selecionados:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {Object.entries(selectedReportFilters[`${category.id}-${report.name}`] || {}).map(([key, value]) => (
                                      value && value !== "all" && (
                                        <Badge key={key} variant="secondary" className="text-xs">
                                          {key.replace(/_/g, ' ')}: {String(value)}
                                        </Badge>
                                      )
                                    ))}
                                    {Object.keys(selectedReportFilters[`${category.id}-${report.name}`] || {}).length === 0 && (
                                      <span className="text-sm text-muted-foreground">Nenhum filtro específico selecionado</span>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      const reportKey = `${category.id}-${report.name}`;
                                      setSelectedReportFilters(prev => ({
                                        ...prev,
                                        [reportKey]: {}
                                      }));
                                    }}
                                  >
                                    Limpar Filtros
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleGenerateReport(category.id, report.name)}
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Gerar Relatório
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Rodapé com Estatísticas */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {reportCategories.reduce((acc, cat) => acc + cat.reports.length, 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Relatórios Disponíveis</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {reportCategories.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Categorias</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Relatórios Hoje</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-sm text-muted-foreground">Exportações</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Relatorios;