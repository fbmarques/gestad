import { useState } from "react";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, RotateCcw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTrashedDiscentes, restoreDiscente, DiscenteExcluido } from "@/lib/api";

const DiscentesExcluidos = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch trashed discentes
  const { data: discentes = [], isLoading, error } = useQuery({
    queryKey: ['trashedDiscentes'],
    queryFn: getTrashedDiscentes,
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: restoreDiscente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trashedDiscentes'] });
      queryClient.invalidateQueries({ queryKey: ['discentes'] });
    },
  });

  const filteredDiscentes = discentes.filter(discente =>
    discente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discente.orientador.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (discente.co_orientador && discente.co_orientador.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredDiscentes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDiscentes = filteredDiscentes.slice(startIndex, endIndex);

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Em curso":
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Concluído":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Não iniciado":
      case "not_started":
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <div className="min-h-screen bg-background">
          <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          <div className="p-6 bg-background">
            <div className="max-w-7xl mx-auto">
              <div className="text-center py-8">Carregando...</div>
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
              <div className="text-center py-8 text-red-600">
                Erro ao carregar discentes excluídos: {error instanceof Error ? error.message : 'Erro desconhecido'}
              </div>
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
                      onClick={() => navigate("/discentes")}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </Button>
                    <CardTitle>Discentes Excluídos</CardTitle>
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
                          <TableHead className="font-bold text-foreground">Email</TableHead>
                          <TableHead className="font-bold text-foreground">Orientador</TableHead>
                          <TableHead className="font-bold text-foreground">Mestrado</TableHead>
                          <TableHead className="font-bold text-foreground">Doutorado</TableHead>
                          <TableHead className="font-bold text-foreground">Data Exclusão</TableHead>
                          <TableHead className="w-12 font-bold text-foreground">Rec</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentDiscentes.map((discente) => (
                          <TableRow key={discente.id}>
                            <TableCell className="font-medium">{discente.nome}</TableCell>
                            <TableCell>{discente.email}</TableCell>
                            <TableCell>{discente.orientador}</TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadgeVariant(discente.status_mestrado)} px-2 py-1 text-xs font-medium border`}>
                                {discente.status_mestrado}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getStatusBadgeVariant(discente.status_doutorado)} px-2 py-1 text-xs font-medium border`}>
                                {discente.status_doutorado}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {discente.data_exclusao}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600"
                                    disabled={restoreMutation.isPending}
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar recuperação</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja recuperar o discente &quot;{discente.nome}&quot;?
                                      Este registro será restaurado e voltará a aparecer na lista principal.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRecover(discente.id)}
                                      disabled={restoreMutation.isPending}
                                    >
                                      {restoreMutation.isPending ? 'Recuperando...' : 'Recuperar'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                        {currentDiscentes.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {searchTerm ? "Nenhum discente encontrado" : "Nenhum registro excluído"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {currentDiscentes.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredDiscentes.length)} de {filteredDiscentes.length} registros
                      {searchTerm && ` (filtrados de ${discentes.length} registros totais)`}
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

export default DiscentesExcluidos;