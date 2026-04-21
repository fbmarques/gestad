import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
import { useActiveRole } from "@/hooks/useActiveRole";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  CalendarClock,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import {
  getDocenteReport,
  type DocenteReportResponse,
  type DocenteReportType,
} from "@/lib/api";

type ReportCard = {
  id: DocenteReportType;
  title: string;
  description: string;
  icon: typeof Users;
};

const reportCards: ReportCard[] = [
  {
    id: "orientandos",
    title: "Acompanhamento de Orientandos",
    description:
      "Nome, email, modalidade e período de vínculo dos orientandos ativos.",
    icon: Users,
  },
  {
    id: "producoes",
    title: "Produção Acadêmica",
    description:
      "Lista as produções registradas de cada orientando, organizadas por discente.",
    icon: FileText,
  },
  {
    id: "prazos",
    title: "Prazos e Defesas",
    description:
      "Consolida saída prevista e cumprimento de créditos, eventos e artigos.",
    icon: CalendarClock,
  },
  {
    id: "definicoes",
    title: "Definições de Pesquisa",
    description:
      "Mostra o preenchimento de problema, questão, objetivos e metodologia.",
    icon: BookOpen,
  },
];

const reportLabels: Record<DocenteReportType, string> = {
  orientandos: "Acompanhamento de Orientandos",
  producoes: "Produção Acadêmica",
  prazos: "Prazos e Defesas",
  definicoes: "Definições de Pesquisa",
};

const formatGeneratedAt = (value?: string) => {
  if (!value) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
};

const buildPrintTitle = (reportType: DocenteReportType) => {
  return `GESTAD - ${reportLabels[reportType]}`;
};

const ReportDocument = ({
  report,
  reportType,
}: {
  report: DocenteReportResponse;
  reportType: DocenteReportType;
}) => {
  const generatedAt = formatGeneratedAt(report.generated_at);

  const renderTable = () => {
    switch (reportType) {
      case "orientandos":
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>Orientando</th>
                <th>Email</th>
                <th>Modalidade</th>
                <th>Entrada</th>
                <th>Saída</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => (
                <tr key={index}>
                  <td>{row.student_name as string}</td>
                  <td>{row.email as string}</td>
                  <td>{row.modality as string}</td>
                  <td>{row.start_date as string}</td>
                  <td>{row.end_date as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "producoes":
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>Orientando</th>
                <th>Modalidade</th>
                <th>Produções</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => {
                const productions = (row.productions as Array<{ title: string; status: string }>) || [];

                return (
                  <tr key={index}>
                    <td>{row.student_name as string}</td>
                    <td>{row.modality as string}</td>
                    <td>
                      {productions.length > 0 ? (
                        <ul className="report-list">
                          {productions.map((production, productionIndex) => (
                            <li key={`${index}-${productionIndex}`}>
                              <strong>{production.title}</strong>
                              <span>{production.status}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "[-]"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      case "prazos":
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>Orientando</th>
                <th>Entrada</th>
                <th>Saída Prevista</th>
                <th>Créditos</th>
                <th>Eventos</th>
                <th>Artigos</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => (
                <tr key={index}>
                  <td>{row.student_name as string}</td>
                  <td>{row.start_date as string}</td>
                  <td>{row.end_date as string}</td>
                  <td>{row.credits as string}</td>
                  <td>{row.events as string}</td>
                  <td>{row.articles as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "definicoes":
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>Orientando</th>
                <th>Problema</th>
                <th>Questão</th>
                <th>Objetivos</th>
                <th>Metodologia</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => (
                <tr key={index}>
                  <td>{row.student_name as string}</td>
                  <td>{row.problem as string}</td>
                  <td>{row.question as string}</td>
                  <td>{row.objectives as string}</td>
                  <td>{row.methodology as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
    }
  };

  return (
    <div className="report-document">
      <style>{`
        .report-document {
          min-height: 100vh;
          background: #f5f7fb;
          color: #111827;
          padding: 32px;
          font-family: Inter, Arial, sans-serif;
        }
        .report-shell {
          max-width: 1120px;
          margin: 0 auto;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 32px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        }
        .report-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
          margin-bottom: 24px;
        }
        .report-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .report-brand img {
          width: 52px;
          height: 52px;
          border-radius: 12px;
        }
        .report-brand h1 {
          margin: 0;
          font-size: 24px;
          line-height: 1.2;
        }
        .report-brand p,
        .report-meta p,
        .report-footer p {
          margin: 0;
          color: #4b5563;
          font-size: 13px;
        }
        .report-meta {
          text-align: right;
        }
        .report-intro {
          margin-bottom: 20px;
        }
        .report-intro h2 {
          margin: 0 0 6px;
          font-size: 28px;
        }
        .report-intro p {
          margin: 0;
          color: #4b5563;
          line-height: 1.6;
        }
        .report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        .report-table th,
        .report-table td {
          border: 1px solid #d1d5db;
          padding: 12px 10px;
          text-align: left;
          vertical-align: top;
        }
        .report-table th {
          background: #eef2ff;
          color: #1f2937;
          font-weight: 700;
        }
        .report-table tbody tr:nth-child(even) {
          background: #f9fafb;
        }
        .report-list {
          margin: 0;
          padding-left: 18px;
        }
        .report-list li {
          margin-bottom: 6px;
        }
        .report-list span {
          display: block;
          color: #6b7280;
          font-size: 12px;
          margin-top: 2px;
        }
        .report-footer {
          border-top: 2px solid #e5e7eb;
          margin-top: 24px;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          gap: 24px;
        }
        .print-actions {
          max-width: 1120px;
          margin: 0 auto 16px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .print-actions button {
          border: 0;
          background: #111827;
          color: #fff;
          padding: 10px 16px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
        }
        .print-actions button.secondary {
          background: #e5e7eb;
          color: #111827;
        }
        @media print {
          .report-document {
            background: #ffffff;
            padding: 0;
          }
          .report-shell {
            max-width: none;
            border: 0;
            border-radius: 0;
            box-shadow: none;
            padding: 0;
          }
          .print-actions {
            display: none;
          }
          @page {
            margin: 18mm 14mm 18mm 14mm;
          }
        }
      `}</style>

      <div className="print-actions">
        <button className="secondary" onClick={() => window.close()}>
          Fechar
        </button>
        <button onClick={() => window.print()}>Salvar em PDF</button>
      </div>

      <div className="report-shell">
        <header className="report-header">
          <div className="report-brand">
            <img src="/favicon.ico" alt="Logo GESTAD" />
            <div>
              <h1>GESTAD</h1>
              <p>Sistema de Gestão Acadêmica</p>
            </div>
          </div>
          <div className="report-meta">
            <p>Relatório emitido em</p>
            <p><strong>{generatedAt}</strong></p>
          </div>
        </header>

        <section className="report-intro">
          <h2>{report.title}</h2>
          <p>{report.subtitle}</p>
        </section>

        {renderTable()}

        <footer className="report-footer">
          <p>GESTAD • Relatório acadêmico para acompanhamento docente.</p>
          <p>Data e hora de emissão: {generatedAt}</p>
        </footer>
      </div>
    </div>
  );
};

const Relatorios = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { activeRole } = useActiveRole();
  const [searchParams] = useSearchParams();
  const printTriggeredRef = useRef(false);

  const reportType = searchParams.get("report") as DocenteReportType | null;
  const shouldOpenPrintDialog = searchParams.get("autoprint") === "1";
  const isValidReportType = reportType ? reportCards.some((item) => item.id === reportType) : false;

  const { data, isLoading, error } = useQuery({
    queryKey: ["docente-report", reportType, activeRole],
    queryFn: () => getDocenteReport(reportType as DocenteReportType),
    enabled: Boolean(reportType && isValidReportType),
  });

  useEffect(() => {
    if (!reportType) {
      document.title = "Relatórios | GESTAD";
      return;
    }

    document.title = buildPrintTitle(reportType);
  }, [reportType]);

  useEffect(() => {
    if (!data || !shouldOpenPrintDialog || printTriggeredRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      printTriggeredRef.current = true;
      window.print();
    }, 500);

    return () => window.clearTimeout(timer);
  }, [data, shouldOpenPrintDialog]);

  const openReportWindow = (type: DocenteReportType) => {
    const url = new URL(`${window.location.origin}/relatorios/impressao`);
    url.searchParams.set("report", type);
    url.searchParams.set("autoprint", "1");
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const heroDescription = useMemo(() => {
    if (activeRole === "docente") {
      return "Relatórios enxutos para acompanhar orientandos, produções, prazos acadêmicos e definições de pesquisa.";
    }

    return "Relatórios acadêmicos com foco no acompanhamento docente.";
  }, [activeRole]);

  if (reportType && isValidReportType) {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Carregando relatório...
          </div>
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="max-w-xl w-full">
            <CardHeader>
              <CardTitle>Falha ao carregar relatório</CardTitle>
              <CardDescription>
                Não foi possível gerar os dados do relatório solicitado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.close()}>Fechar</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <ReportDocument report={data} reportType={reportType} />;
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        <main className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="max-w-3xl space-y-4">
                <Badge variant="outline" className="w-fit gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Central de Relatórios
                </Badge>
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                    Relatórios do módulo docente
                  </h1>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                    {heroDescription}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reportCards.map((card) => (
                <Card key={card.id} className="border-border/70">
                  <CardHeader className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{card.title}</CardTitle>
                      <CardDescription className="leading-relaxed">
                        {card.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" onClick={() => openReportWindow(card.id)}>
                      <Download className="w-4 h-4 mr-2" />
                      Abrir PDF em nova página
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Relatorios;
