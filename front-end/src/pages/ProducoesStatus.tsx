import { useEffect, useState } from "react";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getApprovedPublications, getRejectedPublications, PublicationForApproval } from "@/lib/api";


const ProducoesStatus = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [tab, setTab] = useState<"deferida" | "indeferida">("deferida");

  useEffect(() => {
    document.title = "Publicações Deferidas e Indeferidas | GESTAD";
  }, []);

  // Fetch approved publications
  const { data: approvedPublications = [], isLoading: isLoadingApproved } = useQuery({
    queryKey: ['approved-publications'],
    queryFn: getApprovedPublications,
  });

  // Fetch rejected publications
  const { data: rejectedPublications = [], isLoading: isLoadingRejected } = useQuery({
    queryKey: ['rejected-publications'],
    queryFn: getRejectedPublications,
  });

  const producoes = tab === "deferida" ? approvedPublications : rejectedPublications;
  const isLoading = tab === "deferida" ? isLoadingApproved : isLoadingRejected;

  const filtered = producoes
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
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                Carregando...
                              </TableCell>
                            </TableRow>
                          ) : currentItems.length > 0 ? (
                            currentItems.map((p) => (
                              <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.titulo}</TableCell>
                                <TableCell>{p.discente}</TableCell>
                                <TableCell>{p.docente}</TableCell>
                                <TableCell>{p.periodico}</TableCell>
                                <TableCell>{p.qualis}</TableCell>
                                <TableCell>{p.dataPublicacao}</TableCell>
                              </TableRow>
                            ))
                          ) : (
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
                          {isLoading ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                Carregando...
                              </TableCell>
                            </TableRow>
                          ) : currentItems.length > 0 ? (
                            currentItems.map((p) => (
                              <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.titulo}</TableCell>
                                <TableCell>{p.discente}</TableCell>
                                <TableCell>{p.docente}</TableCell>
                                <TableCell>{p.periodico}</TableCell>
                                <TableCell>{p.qualis}</TableCell>
                                <TableCell>{p.dataPublicacao}</TableCell>
                              </TableRow>
                            ))
                          ) : (
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
