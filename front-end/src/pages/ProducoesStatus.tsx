import { useEffect, useMemo, useState } from "react";
import AdminTopNav from "@/components/AdminTopNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Producao {
  id: string;
  titulo: string;
  discente: string;
  docente: string;
  periodico: string;
  qualis: string;
  dataPublicacao: string;
  status: "deferida" | "indeferida";
}

const baseProducoes: Omit<Producao, "status">[] = [
  { id: "1", titulo: "Machine Learning Applications in Software Engineering", discente: "João Silva", docente: "Dr. Maria Santos", periodico: "IEEE Software", qualis: "A1", dataPublicacao: "2024-03-15" },
  { id: "2", titulo: "Análise de Redes Sociais usando Mineração de Dados", discente: "Ana Costa", docente: "Dr. Pedro Lima", periodico: "Revista Brasileira de Informática", qualis: "B1", dataPublicacao: "2024-02-20" },
  { id: "3", titulo: "Deep Learning for Image Recognition Systems", discente: "Carlos Oliveira", docente: "Dra. Julia Fernandes", periodico: "Computer Vision Journal", qualis: "A2", dataPublicacao: "2024-01-10" },
  { id: "4", titulo: "Segurança em Sistemas Distribuídos", discente: "Marina Rodrigues", docente: "Dr. Roberto Alves", periodico: "Security & Privacy", qualis: "A1", dataPublicacao: "2024-04-05" },
  { id: "5", titulo: "Blockchain Technology in Healthcare", discente: "Felipe Santos", docente: "Dra. Ana Carolina", periodico: "Health Informatics", qualis: "B2", dataPublicacao: "2024-03-28" },
  { id: "6", titulo: "Algoritmos Genéticos para Otimização", discente: "Lucia Fernandes", docente: "Dr. Carlos Eduardo", periodico: "Evolutionary Computation", qualis: "A2", dataPublicacao: "2024-02-14" },
  { id: "7", titulo: "Internet das Coisas em Smart Cities", discente: "Rafael Pereira", docente: "Dra. Mariana Costa", periodico: "IoT Journal", qualis: "B1", dataPublicacao: "2024-01-22" },
  { id: "8", titulo: "Natural Language Processing Techniques", discente: "Camila Souza", docente: "Dr. Paulo Ricardo", periodico: "Computational Linguistics", qualis: "A1", dataPublicacao: "2024-04-12" },
  { id: "9", titulo: "Realidade Virtual em Educação", discente: "Bruno Lima", docente: "Dra. Sandra Melo", periodico: "Educational Technology", qualis: "B2", dataPublicacao: "2024-03-03" },
  { id: "10", titulo: "Cloud Computing Security Models", discente: "Isabela Martins", docente: "Dr. Fernando Silva", periodico: "Cloud Computing Review", qualis: "A2", dataPublicacao: "2024-02-08" },
];

const ProducoesStatus = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState<"deferida" | "indeferida">("deferida");

  const toggleTheme = () => {
    setIsDarkMode((v) => !v);
    document.documentElement.classList.toggle("dark");
  };

  useEffect(() => {
    document.title = "Publicações Deferidas e Indeferidas | GESTAD";
  }, []);

  const producoes: Producao[] = useMemo(
    () =>
      baseProducoes.map((p, idx) => ({
        ...p,
        status: idx % 2 === 0 ? "deferida" : "indeferida",
      })),
    []
  );

  const filtered = producoes
    .filter((p) => p.status === tab)
    .filter((p) =>
      [p.titulo, p.discente, p.docente, p.periodico, p.qualis]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        <main className="p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <header>
              <h1 className="sr-only">Publicações Deferidas e Indeferidas</h1>
            </header>

            <Card>
              <CardHeader>
                <CardTitle>Publicações por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={tab} onValueChange={(v) => { setTab(v as any); setCurrentPage(1); }}>
                  <TabsList>
                    <TabsTrigger value="deferida">Deferidas</TabsTrigger>
                    <TabsTrigger value="indeferida">Indeferidas</TabsTrigger>
                  </TabsList>

                  <TabsContent value="deferida" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Mostrar</span>
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">registros</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Buscar:</span>
                        <Input
                          placeholder="Digite para buscar..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="w-64"
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-bold text-foreground">Título</TableHead>
                            <TableHead className="font-bold text-foreground">Discente</TableHead>
                            <TableHead className="font-bold text-foreground">Docente</TableHead>
                            <TableHead className="font-bold text-foreground">Periódico</TableHead>
                            <TableHead className="font-bold text-foreground">Qualis</TableHead>
                            <TableHead className="font-bold text-foreground">Data Publicação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="font-medium">{p.titulo}</TableCell>
                              <TableCell>{p.discente}</TableCell>
                              <TableCell>{p.docente}</TableCell>
                              <TableCell>{p.periodico}</TableCell>
                              <TableCell>{p.qualis}</TableCell>
                              <TableCell>{new Date(p.dataPublicacao).toLocaleDateString('pt-BR')}</TableCell>
                            </TableRow>
                          ))}
                          {currentItems.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                {searchTerm ? "Nenhuma produção encontrada" : "Nenhum registro para exibir"}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm text-muted-foreground">
                        Mostrando {currentItems.length > 0 ? startIndex + 1 : 0} a {Math.min(startIndex + itemsPerPage, filtered.length)} de {filtered.length} registros
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                          Anterior
                        </Button>
                        <span className="text-sm">{currentPage} / {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                          Próximo
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="indeferida" className="space-y-4">
                    {/* Reutiliza o mesmo conteúdo porque a fonte de dados já é filtrada por aba */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Mostrar</span>
                        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">registros</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Buscar:</span>
                        <Input
                          placeholder="Digite para buscar..."
                          value={searchTerm}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="w-64"
                        />
                      </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-bold text-foreground">Título</TableHead>
                            <TableHead className="font-bold text-foreground">Discente</TableHead>
                            <TableHead className="font-bold text-foreground">Docente</TableHead>
                            <TableHead className="font-bold text-foreground">Periódico</TableHead>
                            <TableHead className="font-bold text-foreground">Qualis</TableHead>
                            <TableHead className="font-bold text-foreground">Data Publicação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell className="font-medium">{p.titulo}</TableCell>
                              <TableCell>{p.discente}</TableCell>
                              <TableCell>{p.docente}</TableCell>
                              <TableCell>{p.periodico}</TableCell>
                              <TableCell>{p.qualis}</TableCell>
                              <TableCell>{new Date(p.dataPublicacao).toLocaleDateString('pt-BR')}</TableCell>
                            </TableRow>
                          ))}
                          {currentItems.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                {searchTerm ? "Nenhuma produção encontrada" : "Nenhum registro para exibir"}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm text-muted-foreground">
                        Mostrando {currentItems.length > 0 ? startIndex + 1 : 0} a {Math.min(startIndex + itemsPerPage, filtered.length)} de {filtered.length} registros
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                          Anterior
                        </Button>
                        <span className="text-sm">{currentPage} / {totalPages}</span>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                          Próximo
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProducoesStatus;
