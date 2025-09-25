import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getJournals, createJournal, updateJournal, deleteJournal, type Journal, type JournalFormData } from "@/lib/api";

const Revistas = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [formData, setFormData] = useState({ nome: "", instituicao: "", quali: "", issn: "", tipo: "none" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch journals from API
  const { data: revistas = [], isLoading, error } = useQuery({
    queryKey: ['journals'],
    queryFn: getJournals,
  });

  // Create journal mutation
  const createMutation = useMutation({
    mutationFn: createJournal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      setIsDialogOpen(false);
      setFormData({ nome: "", instituicao: "", quali: "", issn: "", tipo: "none" });
    },
  });

  // Update journal mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: JournalFormData }) => updateJournal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      setIsDialogOpen(false);
      setEditingJournal(null);
      setFormData({ nome: "", instituicao: "", quali: "", issn: "", tipo: "none" });
    },
  });

  // Delete journal mutation
  const deleteMutation = useMutation({
    mutationFn: deleteJournal,
    onSuccess: () => {
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredRevistas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRevistas = filteredRevistas.slice(startIndex, endIndex);

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = () => {
    if (!formData.nome || formData.tipo === "none") return;

    const journalData: JournalFormData = {
      nome: formData.nome,
      instituicao: formData.instituicao || undefined,
      quali: formData.quali || undefined,
      issn: formData.issn || undefined,
      tipo: formData.tipo,
    };

    if (editingJournal) {
      updateMutation.mutate({ id: editingJournal.id, data: journalData });
    } else {
      createMutation.mutate(journalData);
    }
  };

  const handleEdit = (journal: Journal) => {
    setEditingJournal(journal);
    setFormData({
      nome: journal.nome,
      instituicao: journal.instituicao || "",
      quali: journal.quali || "",
      issn: journal.issn || "",
      tipo: journal.tipo,
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingJournal(null);
    setFormData({ nome: "", instituicao: "", quali: "", issn: "", tipo: "none" });
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

  if (isLoading) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <div className="min-h-screen bg-background">
          <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          <div className="p-6 bg-background">
            <div className="max-w-7xl mx-auto">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">Carregando revistas...</div>
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
                    Erro ao carregar revistas: {error instanceof Error ? error.message : 'Erro desconhecido'}
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
                  <CardTitle>Gerenciamento de Revistas</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
                          <Plus className="w-4 h-4" />
                          Nova Revista
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingJournal ? 'Editar Revista' : 'Adicionar Nova Revista'}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Nome da revista"
                            value={formData.nome}
                            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                          />
                          <Input
                            placeholder="Instituição"
                            value={formData.instituicao}
                            onChange={(e) => setFormData({ ...formData, instituicao: e.target.value })}
                          />
                          <Input
                            placeholder="Quali (A1, A2, B1, B2, etc.)"
                            value={formData.quali}
                            onChange={(e) => setFormData({ ...formData, quali: e.target.value })}
                          />
                          <Input
                            placeholder="ISSN"
                            value={formData.issn}
                            onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                          />
                          <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo da revista" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Selecione o tipo</SelectItem>
                              <SelectItem value="Nacional">Nacional</SelectItem>
                              <SelectItem value="Internacional">Internacional</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
                            <Button
                              onClick={handleSubmit}
                              disabled={!formData.nome || formData.tipo === "none" || createMutation.isPending || updateMutation.isPending}
                            >
                              {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Recuperar revistas excluídas"
                      onClick={() => navigate("/revistas-excluidas")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
                          <TableHead className="w-12 font-bold text-foreground">Edt</TableHead>
                          <TableHead className="w-12 font-bold text-foreground">Exc</TableHead>
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
                            <TableCell>
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500"
                                onClick={() => handleEdit(revista)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja excluir a revista &quot;{revista.nome}&quot;? Esta ação pode ser desfeita na recuperação de revistas excluídas.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(revista.id)}>
                                      Excluir
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
                              {searchTerm ? "Nenhuma revista encontrada" : "Nenhum registro para exibir"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* DataTable Controls - Bottom */}
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
    </div>
  );
};

export default Revistas;
