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
import { getAgencies, createAgency, updateAgency, deleteAgency, type Agency, type AgencyFormData } from "@/lib/api";

const Agencias = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [formData, setFormData] = useState({ name: "", alias: "", description: "" });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch agencies from API
  const { data: agencies = [], isLoading, error } = useQuery({
    queryKey: ['agencies'],
    queryFn: getAgencies,
  });

  // Create agency mutation
  const createMutation = useMutation({
    mutationFn: createAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      setIsDialogOpen(false);
      setFormData({ name: "", alias: "", description: "" });
    },
  });

  // Update agency mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AgencyFormData }) => updateAgency(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      setIsDialogOpen(false);
      setEditingAgency(null);
      setFormData({ name: "", alias: "", description: "" });
    },
  });

  // Delete agency mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAgency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
    },
  });

  const filteredAgencias = agencies.filter(agencia =>
    agencia.apelido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agencia.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAgencias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAgencias = filteredAgencias.slice(startIndex, endIndex);

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = (id: number) => {
    updateMutation.mutate({ id, data: formData });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const openCreateDialog = () => {
    setEditingAgency(null);
    setFormData({ name: "", alias: "", description: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (agency: Agency) => {
    setEditingAgency(agency);
    setFormData({
      name: agency.nome,
      alias: agency.apelido,
      description: agency.description || ""
    });
    setIsDialogOpen(true);
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
                  <div className="text-center">Carregando agências...</div>
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
                  <div className="text-center text-red-500">Erro ao carregar agências</div>
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
                  <CardTitle>Gerenciamento de Agências de Fomento</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2" onClick={openCreateDialog}>
                          <Plus className="w-4 h-4" />
                          Nova Agência
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingAgency ? "Editar Agência" : "Adicionar Nova Agência de Fomento"}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Apelido da agência"
                            value={formData.alias}
                            onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
                          />
                          <Input
                            placeholder="Nome completo da agência"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                          <Input
                            placeholder="Descrição (opcional)"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              onClick={() => {
                                if (editingAgency) {
                                  handleUpdate(editingAgency.id);
                                } else {
                                  handleCreate();
                                }
                              }}
                              disabled={!formData.name || !formData.alias}
                            >
                              Salvar
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Recuperar agências excluídas"
                      onClick={() => navigate("/agencias-excluidas")}
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
                          <TableHead className="font-bold text-foreground">Apelido</TableHead>
                          <TableHead className="font-bold text-foreground">Nome</TableHead>
                          <TableHead className="w-12 font-bold text-foreground">Edt</TableHead>
                          <TableHead className="w-12 font-bold text-foreground">Exc</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentAgencias.map((agencia) => (
                          <TableRow key={agencia.id}>
                            <TableCell className="font-medium">{agencia.apelido}</TableCell>
                            <TableCell>{agencia.nome}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="icon"
                                className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500"
                                onClick={() => openEditDialog(agencia)}
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
                                      Tem certeza que deseja excluir a agência "{agencia.apelido}"? Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(agencia.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                        {currentAgencias.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              {searchTerm ? "Nenhuma agência encontrada" : "Nenhum registro para exibir"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* DataTable Controls - Bottom */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {currentAgencias.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredAgencias.length)} de {filteredAgencias.length} registros
                      {searchTerm && ` (filtrados de ${agencies.length} registros totais)`}
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

export default Agencias;
