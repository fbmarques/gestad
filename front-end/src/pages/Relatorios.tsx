import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
import { useActiveRole } from "@/hooks/useActiveRole";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  CalendarClock,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Users,
  Clock3,
  Map,
  Mail,
} from "lucide-react";
import {
  getDiscentes,
  getDocenteReport,
  type DocenteProductionItem,
  getStudentAcademicBondDetails,
  type Discente,
  type DocenteReportResponse,
  type DocenteReportType,
  type StudentAcademicBondData,
} from "@/lib/api";

type ReportCard = {
  id: DocenteReportType;
  title: string;
  description: string;
  icon: typeof Users;
};

type ReportViewType = DocenteReportType | "mapa";

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
  {
    id: "acessos",
    title: "Último Acesso ao Sistema",
    description:
      "Lista o discente, a modalidade e a data/hora do último acesso registrado.",
    icon: Clock3,
  },
];

const translateStatus = (status: string | null | undefined): string => {
  if (!status) return "";

  const statusMap: Record<string, string> = {
    "Not Scheduled": "Não Agendada",
    "not scheduled": "Não Agendada",
    Scheduled: "Agendada",
    scheduled: "Agendada",
    Completed: "Concluída",
    completed: "Concluída",
    Approved: "Aprovada",
    approved: "Aprovada",
    Pending: "Pendente",
    pending: "Pendente",
    active: "Ativo",
    completed_status: "Concluído",
  };

  return statusMap[status] || status;
};

const formatAcademicStatus = (status: string | null | undefined, completionDate: string | null | undefined): string => {
  const translatedStatus = translateStatus(status);

  if (!translatedStatus) {
    return "Não informado";
  }

  if ((status === "Completed" || status === "completed") && completionDate) {
    return `${translatedStatus} - ${completionDate}`;
  }

  return translatedStatus;
};

const reportLabels: Record<DocenteReportType, string> = {
  orientandos: "Acompanhamento de Orientandos",
  producoes: "Produção Acadêmica",
  prazos: "Prazos e Defesas",
  definicoes: "Definições de Pesquisa",
  acessos: "Último Acesso ao Sistema",
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

const resolveProductionStage = (production: DocenteProductionItem): "submission" | "approval" | "publication" => {
  if (production.stage === "submission" || production.stage === "approval" || production.stage === "publication") {
    return production.stage;
  }

  const normalizedStatus = production.status.trim().toLowerCase();

  if (normalizedStatus.includes("public")) {
    return "publication";
  }

  if (normalizedStatus.includes("aprova")) {
    return "approval";
  }

  return "submission";
};

const buildProductionStageSummaries = (productions: DocenteProductionItem[]): DocenteProductionItem[] => {
  const stageLabels = {
    submission: "Submissão",
    approval: "Aprovação",
    publication: "Publicado",
  } as const;

  const counts = {
    submission: 0,
    approval: 0,
    publication: 0,
  };

  productions.forEach((production) => {
    const stage = resolveProductionStage(production);
    const count = typeof production.count === "number" && production.count > 0 ? production.count : 1;
    counts[stage] += count;
  });

  return (Object.keys(stageLabels) as Array<keyof typeof stageLabels>)
    .filter((stage) => counts[stage] > 0)
    .map((stage) => ({
      title:
        stage === "submission"
          ? `${counts[stage]} em submissão`
          : stage === "approval"
            ? `${counts[stage]} em aprovação`
            : counts[stage] === 1
              ? "1 publicado"
              : `${counts[stage]} publicados`,
      status: stageLabels[stage],
      stage,
      count: counts[stage],
    }));
};

const StudentMapDocument = ({ student }: { student: StudentAcademicBondData }) => {
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
        .map-student-summary {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }
        .map-student-card,
        .map-bond-card {
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 18px;
          background: #fff;
        }
        .map-bond-card + .map-bond-card {
          margin-top: 18px;
        }
        .map-bond-header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          margin-bottom: 18px;
        }
        .map-bond-title {
          margin: 0;
          font-size: 20px;
        }
        .map-bond-status {
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: #dbeafe;
          color: #1d4ed8;
        }
        .map-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px 18px;
        }
        .map-grid-single {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 14px;
        }
        .map-field-label {
          margin: 0 0 4px;
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .map-field-value {
          margin: 0;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        .map-section {
          border-top: 1px solid #e5e7eb;
          margin-top: 18px;
          padding-top: 18px;
        }
        .map-section h3 {
          margin: 0 0 14px;
          font-size: 17px;
        }
        .report-footer {
          border-top: 2px solid #e5e7eb;
          margin-top: 24px;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          gap: 24px;
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
            <img src="/gestad-logo.svg" alt="Logo GESTAD" />
            <div>
              <h1>GESTAD</h1>
              <p>Sistema de Gestão Acadêmica</p>
            </div>
          </div>
          <div className="report-meta">
            <p>Relatório emitido em</p>
            <p><strong>{formatGeneratedAt(new Date().toISOString())}</strong></p>
          </div>
        </header>

        <section className="map-student-summary">
          <div className="map-student-card">
            <p className="map-field-label">Discente</p>
            <p className="map-field-value">{student.student_name}</p>
          </div>
          <div className="map-student-card">
            <p className="map-field-label">Email</p>
            <p className="map-field-value">{student.student_email}</p>
          </div>
        </section>

        {student.academic_bonds.map((bond) => (
          <section key={bond.id} className="map-bond-card">
            <div className="map-bond-header">
              <h2 className="map-bond-title">{bond.level}</h2>
              <span className="map-bond-status">{translateStatus(bond.status)}</span>
            </div>

            <div className="map-grid">
              <div>
                <p className="map-field-label">Orientador</p>
                <p className="map-field-value">{bond.advisor}</p>
              </div>
              <div>
                <p className="map-field-label">Co-Orientador</p>
                <p className="map-field-value">{bond.co_advisor || "Sem co-orientador"}</p>
              </div>
              <div>
                <p className="map-field-label">Linha de Pesquisa</p>
                <p className="map-field-value">{bond.research_line}</p>
              </div>
              <div>
                <p className="map-field-label">Agência de Fomento</p>
                <p className="map-field-value">{bond.agency || "Sem agência"}</p>
              </div>
              <div>
                <p className="map-field-label">Data de Início</p>
                <p className="map-field-value">{bond.start_date || "Não informada"}</p>
              </div>
              <div>
                <p className="map-field-label">Data de Término</p>
                <p className="map-field-value">{bond.end_date || "Não informada"}</p>
              </div>
            </div>

            <div className="map-section">
              <h3>Definições de Pesquisa</h3>
              <div className="map-grid-single">
                <div>
                  <p className="map-field-label">Problema</p>
                  <p className="map-field-value">{bond.problem_text || "Ainda não informado"}</p>
                </div>
                <div>
                  <p className="map-field-label">Questão de Pesquisa</p>
                  <p className="map-field-value">{bond.question_text || "Ainda não informada"}</p>
                </div>
                <div>
                  <p className="map-field-label">Objetivos</p>
                  <p className="map-field-value">{bond.objectives_text || "Ainda não informados"}</p>
                </div>
                <div>
                  <p className="map-field-label">Metodologia</p>
                  <p className="map-field-value">{bond.methodology_text || "Ainda não informada"}</p>
                </div>
              </div>
            </div>

            <div className="map-section">
              <h3>Requisitos Acadêmicos</h3>
              <div className="map-grid">
                <div>
                  <p className="map-field-label">Status da Qualificação</p>
                  <p className="map-field-value">
                    {formatAcademicStatus(bond.qualification_status, bond.qualification_completion_date)}
                  </p>
                </div>
                <div>
                  <p className="map-field-label">Status da Defesa</p>
                  <p className="map-field-value">
                    {formatAcademicStatus(bond.defense_status, bond.defense_completion_date)}
                  </p>
                </div>
                <div>
                  <p className="map-field-label">Data da Qualificação</p>
                  <p className="map-field-value">{bond.qualification_date || "Não informada"}</p>
                </div>
                <div>
                  <p className="map-field-label">Data da Defesa</p>
                  <p className="map-field-value">{bond.defense_date || "Não informada"}</p>
                </div>
                <div>
                  <p className="map-field-label">Trabalho Concluído</p>
                  <p className="map-field-value">{bond.work_completed ? "Sim" : "Não entregue"}</p>
                </div>
              </div>
            </div>
          </section>
        ))}

        <footer className="report-footer">
          <p>GESTAD • Mapa acadêmico completo do discente.</p>
          <p>Data e hora de emissão: {formatGeneratedAt(new Date().toISOString())}</p>
        </footer>
      </div>
    </div>
  );
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
                const productions = buildProductionStageSummaries(
                  (row.productions as DocenteProductionItem[]) || []
                );

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
      case "acessos":
        return (
          <table className="report-table">
            <thead>
              <tr>
                <th>Discente</th>
                <th>Modalidade</th>
                <th>Último Acesso</th>
              </tr>
            </thead>
            <tbody>
              {report.rows.map((row, index) => (
                <tr key={index}>
                  <td>{row.student_name as string}</td>
                  <td>{row.modality as string}</td>
                  <td>{row.last_access_at as string}</td>
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
            <img src="/gestad-logo.svg" alt="Logo GESTAD" />
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
  const [selectedMapStudentId, setSelectedMapStudentId] = useState("");

  const reportType = searchParams.get("report") as ReportViewType | null;
  const studentIdParam = searchParams.get("student");
  const shouldOpenPrintDialog = searchParams.get("autoprint") === "1";
  const isValidReportType = reportType ? reportCards.some((item) => item.id === reportType) : false;

  const { data: discentes = [] } = useQuery({
    queryKey: ["discentes", activeRole],
    queryFn: getDiscentes,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["docente-report", reportType, activeRole],
    queryFn: () => getDocenteReport(reportType as DocenteReportType),
    enabled: Boolean(reportType && isValidReportType),
  });

  const { data: studentMapData, isLoading: isLoadingStudentMap, error: studentMapError } = useQuery({
    queryKey: ["student-map-report", studentIdParam, activeRole],
    queryFn: () => getStudentAcademicBondDetails(Number(studentIdParam)),
    enabled: Boolean(reportType === "mapa" && studentIdParam),
  });

  useEffect(() => {
    if (!reportType) {
      document.title = "Relatórios | GESTAD";
      return;
    }

    if (reportType === "mapa") {
      document.title = "GESTAD - Mapa Acadêmico do Discente";
      return;
    }

    document.title = buildPrintTitle(reportType);
  }, [reportType]);

  useEffect(() => {
    const printableDataReady =
      (reportType === "mapa" && studentMapData) ||
      (reportType && reportType !== "mapa" && data);

    if (!printableDataReady || !shouldOpenPrintDialog || printTriggeredRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      printTriggeredRef.current = true;
      window.print();
    }, 500);

    return () => window.clearTimeout(timer);
  }, [data, studentMapData, reportType, shouldOpenPrintDialog]);

  const openReportWindow = (type: DocenteReportType) => {
    const url = new URL(`${window.location.origin}/relatorios/impressao`);
    url.searchParams.set("report", type);
    url.searchParams.set("autoprint", "1");
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  const openStudentMapWindow = () => {
    if (!selectedMapStudentId) {
      return;
    }

    const url = new URL(`${window.location.origin}/relatorios/impressao`);
    url.searchParams.set("report", "mapa");
    url.searchParams.set("student", selectedMapStudentId);
    url.searchParams.set("autoprint", "1");
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  if (reportType === "mapa") {
    if (isLoadingStudentMap) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            Carregando mapa acadêmico...
          </div>
        </div>
      );
    }

    if (studentMapError || !studentMapData) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <Card className="max-w-xl w-full">
            <CardHeader>
              <CardTitle>Falha ao carregar mapa acadêmico</CardTitle>
              <CardDescription>
                Não foi possível obter os dados do discente selecionado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.close()}>Fechar</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <StudentMapDocument student={studentMapData} />;
  }

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
                <div className="flex items-center gap-4">
                  <img
                    src="/gestad-logo.svg"
                    alt="Logo GESTAD"
                    className="h-14 w-14 rounded-2xl border border-border/70 bg-card p-2"
                  />
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                      Relatórios do módulo docente
                    </h1>
                  </div>
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

              <Card className="border-border/70 md:col-span-2">
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Map className="w-5 h-5" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">Mapa Acadêmico do Discente</CardTitle>
                    <CardDescription className="leading-relaxed">
                      Selecione um orientando para abrir a visão completa do mapa acadêmico em uma nova página.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Orientando</p>
                      <Select value={selectedMapStudentId} onValueChange={setSelectedMapStudentId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um orientando" />
                        </SelectTrigger>
                        <SelectContent>
                          {discentes.map((discente: Discente) => (
                            <SelectItem key={discente.id} value={String(discente.id)}>
                              {discente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full" onClick={openStudentMapWindow} disabled={!selectedMapStudentId}>
                      <Download className="w-4 h-4 mr-2" />
                      Abrir MAPA em nova página
                    </Button>
                  </div>

                  {selectedMapStudentId && (
                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      {(() => {
                        const selectedStudent = discentes.find((discente: Discente) => String(discente.id) === selectedMapStudentId);

                        if (!selectedStudent) {
                          return null;
                        }

                        return (
                          <div className="grid gap-3 md:grid-cols-3">
                            <div className="flex items-start gap-3">
                              <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Discente</p>
                                <p className="text-sm font-medium text-foreground">{selectedStudent.nome}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Email</p>
                                <p className="text-sm font-medium text-foreground">{selectedStudent.email}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <Clock3 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">Orientador</p>
                                <p className="text-sm font-medium text-foreground">{selectedStudent.orientador}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Relatorios;
