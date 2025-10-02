import { useState, useEffect } from "react";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
import { useActiveRole } from "@/hooks/useActiveRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingPublications, approvePublication, rejectPublication, PublicationForApproval } from "@/lib/api";

interface ConfirmationModal {
  isOpen: boolean;
  type: 'approve' | 'reject' | null;
  publication: PublicationForApproval | null;
}

const Producoes = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { activeRole } = useActiveRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [modal, setModal] = useState<ConfirmationModal>({ isOpen: false, type: null, publication: null });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is docente (should not see action buttons)
  const isDocente = activeRole === 'docente';

  useEffect(() => {
    document.title = "Aprovação de Produções | GESTAD";
  }, []);

  // Fetch pending publications
  const { data: producoes = [], isLoading } = useQuery({
    queryKey: ['pending-publications'],
    queryFn: getPendingPublications,
  });

  // Mutation for approving publication
  const approveMutation = useMutation({
    mutationFn: approvePublication,
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['pending-publications'] });
      queryClient.invalidateQueries({ queryKey: ['approved-publications'] });
      setModal({ isOpen: false, type: null, publication: null });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.response?.data?.error || "Erro ao deferir publicação.",
        variant: "destructive",
      });
    },
  });

  // Mutation for rejecting publication
  const rejectMutation = useMutation({
    mutationFn: rejectPublication,
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['pending-publications'] });
      queryClient.invalidateQueries({ queryKey: ['rejected-publications'] });
      setModal({ isOpen: false, type: null, publication: null });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error?.response?.data?.error || "Erro ao indeferir publicação.",
        variant: "destructive",
      });
    },
  });

  const filteredProducoes = producoes.filter(producao =>
    producao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producao.discente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producao.docente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producao.periodico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producao.qualis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducoes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducoes = filteredProducoes.slice(startIndex, endIndex);

  const handleApprove = (publication: PublicationForApproval) => {
    setModal({ isOpen: true, type: 'approve', publication });
  };

  const handleReject = (publication: PublicationForApproval) => {
    setModal({ isOpen: true, type: 'reject', publication });
  };

  const confirmAction = () => {
    if (!modal.publication) return;

    if (modal.type === 'approve') {
      approveMutation.mutate(modal.publication.id);
    } else if (modal.type === 'reject') {
      rejectMutation.mutate(modal.publication.id);
    }
  };

  const cancelAction = () => {
    setModal({ isOpen: false, type: null, publication: null });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page
  };

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        <div className="p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Aprovação de Produções</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/producoes-status')}>
                  Arquivo
                </Button>
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
                          <TableHead className="font-bold text-foreground">Título</TableHead>
                          <TableHead className="font-bold text-foreground">Discente</TableHead>
                          <TableHead className="font-bold text-foreground">Docente</TableHead>
                          <TableHead className="font-bold text-foreground">Periódico</TableHead>
                          <TableHead className="font-bold text-foreground">Qualis</TableHead>
                          <TableHead className="font-bold text-foreground">Data Publicação</TableHead>
                          {!isDocente && <TableHead className="w-24 font-bold text-foreground">Ação</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={isDocente ? 6 : 7} className="text-center py-8 text-muted-foreground">
                              Carregando...
                            </TableCell>
                          </TableRow>
                        ) : currentProducoes.length > 0 ? (
                          currentProducoes.map((producao) => (
                            <TableRow key={producao.id}>
                              <TableCell className="font-medium">{producao.titulo}</TableCell>
                              <TableCell>{producao.discente}</TableCell>
                              <TableCell>{producao.docente}</TableCell>
                              <TableCell>{producao.periodico}</TableCell>
                              <TableCell>{producao.qualis}</TableCell>
                              <TableCell>{producao.dataPublicacao}</TableCell>
                              {!isDocente && (
                                <TableCell>
                                  <TooltipProvider>
                                    <div className="flex gap-1">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600"
                                            onClick={() => handleApprove(producao)}
                                            disabled={approveMutation.isPending || rejectMutation.isPending}
                                          >
                                            <ThumbsUp className="w-4 h-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Deferido</p>
                                        </TooltipContent>
                                      </Tooltip>

                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="icon"
                                            className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
                                            onClick={() => handleReject(producao)}
                                            disabled={approveMutation.isPending || rejectMutation.isPending}
                                          >
                                            <ThumbsDown className="w-4 h-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Indeferido</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </TooltipProvider>
                                </TableCell>
                              )}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={isDocente ? 6 : 7} className="text-center py-8 text-muted-foreground">
                              {searchTerm ? "Nenhuma produção encontrada" : "Nenhum registro para exibir"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* DataTable Controls - Bottom */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {currentProducoes.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredProducoes.length)} de {filteredProducoes.length} registros
                      {searchTerm && ` (filtrados de ${producoes.length} registros totais)`}
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
                            // Show first page, last page, current page, and 2 pages around current
                            return page === 1 || 
                                   page === totalPages || 
                                   Math.abs(page - currentPage) <= 2;
                          })
                          .map((page, index, arr) => {
                            // Add ellipsis if there's a gap
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

      {/* Confirmation Modal */}
      <Dialog open={modal.isOpen} onOpenChange={() => setModal({ isOpen: false, type: null, publication: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal.type === 'approve' ? 'Deferir Publicação' : 'Indeferir Publicação'}
            </DialogTitle>
            <DialogDescription>
              {modal.type === 'approve'
                ? 'Você tem certeza que deseja deferir esta publicação?'
                : 'Você tem certeza que deseja indeferir esta publicação?'
              }
            </DialogDescription>
          </DialogHeader>

          {modal.publication && (
            <div className="py-4">
              <div className="space-y-2">
                <div><strong>Título:</strong> {modal.publication.titulo}</div>
                <div><strong>Discente:</strong> {modal.publication.discente}</div>
                <div><strong>Docente:</strong> {modal.publication.docente}</div>
                <div><strong>Periódico:</strong> {modal.publication.periodico}</div>
                <div><strong>Qualis:</strong> {modal.publication.qualis}</div>
                <div><strong>Data de Publicação:</strong> {modal.publication.dataPublicacao}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant={modal.type === 'approve' ? 'default' : 'destructive'}
              onClick={confirmAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {approveMutation.isPending || rejectMutation.isPending ? 'Processando...' :
               modal.type === 'approve' ? 'Deferir' : 'Indeferir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Producoes;