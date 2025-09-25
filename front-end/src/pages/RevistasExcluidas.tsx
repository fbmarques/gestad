import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, RotateCcw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTrashedJournals, restoreJournal, type Journal } from "@/lib/api";

const RevistasExcluidas = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch trashed journals from API
  const { data: revistas = [], isLoading, error } = useQuery({
    queryKey: ['journals-trashed'],
    queryFn: getTrashedJournals,
  });

  // Restore journal mutation
  const restoreMutation = useMutation({
    mutationFn: restoreJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals-trashed'] });
      queryClient.invalidateQueries({ queryKey: ['journals'] });
    },
  });

  const filteredRevistas = revistas.filter(revista =>
    revista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (revista.instituicao && revista.instituicao.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (revista.quali && revista.quali.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (revista.issn && revista.issn.toLowerCase().includes(searchTerm.toLowerCase())) ||
    revista.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRevistas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRevistas = filteredRevistas.slice(startIndex, endIndex);

  const handleRecover = (id: number) => {
    restoreMutation.mutate(id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <div className="min-h-screen bg-background">
          <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          <div className="p-6 bg-background">
            <div className="max-w-7xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Carregando revistas excluídas...</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <div className="min-h-screen bg-background">
          <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          <div className="p-6 bg-background">
            <div className="max-w-7xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-red-500">
                    Erro ao carregar revistas excluídas: {error instanceof Error ? error.message : 'Erro desconhecido'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        
        <div className="p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/revistas")}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </Button>
                    <CardTitle>Revistas Excluídas</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* DataTable Controls - Top */}
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
                  
                  {/* Table */}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="font-bold text-foreground">Nome</TableHead>
                          <TableHead className="font-bold text-foreground">Instituição</TableHead>
                          <TableHead className="font-bold text-foreground">Quali</TableHead>
                          <TableHead className="font-bold text-foreground">ISSN</TableHead>
                          <TableHead className="font-bold text-foreground">Tipo</TableHead>
                          <TableHead className="font-bold text-foreground">Data Exclusão</TableHead>
                          <TableHead className="w-12 font-bold text-foreground">Rec</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRevistas.map((revista) => (
                          <TableRow key={revista.id}>
                            <TableCell className="font-medium">{revista.nome}</TableCell>
                            <TableCell>{revista.instituicao}</TableCell>
                            <TableCell>{revista.quali}</TableCell>
                            <TableCell>{revista.issn}</TableCell>
                            <TableCell>{revista.tipo}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {revista.dataExclusao}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600">
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar recuperação</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja recuperar a revista &quot;{revista.nome}&quot;? 
                                      Este registro será restaurado e voltará a aparecer na lista principal.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRecover(revista.id)}>
                                      Recuperar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                        {currentRevistas.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {searchTerm ? "Nenhuma revista encontrada" : "Nenhum registro excluído"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {currentRevistas.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredRevistas.length)} de {filteredRevistas.length} registros
                      {searchTerm && ` (filtrados de ${revistas.length} registros totais)`}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(page => {
                            return page === 1 || 
                                   page === totalPages || 
                                   Math.abs(page - currentPage) <= 2;
                          })
                          .map((page, index, arr) => {
                            const prevPage = arr[index - 1];
                            const showEllipsis = prevPage && page - prevPage > 1;
                            
                            return (
                              <div key={page} className="flex items-center gap-1">
                                {showEllipsis && (
                                  <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                                )}
                                <Button
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(page)}
                                  className="w-8 h-8 p-0"
                                >
                                  {page}
                                </Button>
                              </div>
                            );
                          })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                      >
                        Próximo
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevistasExcluidas;