import { useState, useEffect } from "react";
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
import {
  getResearchLines,
  createResearchLine,
  updateResearchLine,
  deleteResearchLine,
  getDocentes,
  ResearchLine,
  ResearchLineFormData,
  Docente
} from "@/lib/api";

const LinhasPesquisa = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLine, setEditingLine] = useState<ResearchLine | null>(null);
  const [formData, setFormData] = useState<ResearchLineFormData>({
    name: "",
    alias: "",
    description: "",
    coordinator_id: undefined,
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Queries
  const { data: researchLines = [], isLoading, error } = useQuery({
    queryKey: ['researchLines'],
    queryFn: getResearchLines
  });

  const { data: docentes = [] } = useQuery({
    queryKey: ['docentes'],
    queryFn: getDocentes
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createResearchLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchLines'] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResearchLineFormData }) =>
      updateResearchLine(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchLines'] });
      setIsEditDialogOpen(false);
      resetForm();
      setEditingLine(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteResearchLine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['researchLines'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      alias: "",
      description: "",
      coordinator_id: undefined,
    });
  };

  // Filter and paginate research lines
  const filteredLinhasPesquisa = researchLines.filter(linha =>
    linha.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    linha.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredLinhasPesquisa.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLinhasPesquisa = filteredLinhasPesquisa.slice(startIndex, endIndex);

  // Handlers
  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleEdit = (line: ResearchLine) => {
    setEditingLine(line);
    setFormData({
      name: line.name,
      alias: line.alias,
      description: line.description || "",
      coordinator_id: line.coordinator_id || undefined,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (editingLine) {
      updateMutation.mutate({ id: editingLine.id, data: formData });
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
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
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro ao carregar linhas de pesquisa</div>;
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
        
        {/* Main Content */}
        <div className="p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Gerenciamento de Linhas de Pesquisa</CardTitle>
                        <div className="flex gap-2">
                          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                              <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Nova Linha
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Adicionar Nova Linha de Pesquisa</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Input
                                  placeholder="Apelido da linha de pesquisa"
                                  value={formData.alias}
                                  onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                                />
                                <Input
                                  placeholder="Nome da linha de pesquisa"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <Input
                                  placeholder="Descrição (opcional)"
                                  value={formData.description}
                                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                                <Select
                                  value={formData.coordinator_id?.toString() || "none"}
                                  onValueChange={(value) => setFormData({ ...formData, coordinator_id: value === "none" ? undefined : parseInt(value) })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um coordenador (opcional)" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Sem coordenador</SelectItem>
                                    {docentes.map((docente) => (
                                      <SelectItem key={docente.id} value={docente.id.toString()}>
                                        {docente.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}
                                    disabled={createMutation.isPending}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleCreate}
                                    disabled={createMutation.isPending || !formData.name || !formData.alias}
                                  >
                                    {createMutation.isPending ? "Salvando..." : "Salvar"}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="icon" 
                            title="Recuperar linhas de pesquisa excluídas"
                            onClick={() => navigate("/linhaspesquisa-excluidas")}
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
                                <TableHead className="font-bold text-foreground">Coordenador</TableHead>
                                <TableHead className="w-12 font-bold text-foreground">Edt</TableHead>
                                <TableHead className="w-12 font-bold text-foreground">Exc</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentLinhasPesquisa.map((linha) => (
                                <TableRow key={linha.id}>
                                  <TableCell className="font-medium">{linha.alias}</TableCell>
                                  <TableCell>{linha.name}</TableCell>
                                  <TableCell>{linha.coordinator}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500"
                                      onClick={() => handleEdit(linha)}
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
                                            Tem certeza que deseja excluir a linha de pesquisa "{linha.alias}"? Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(linha.id)}>
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {currentLinhasPesquisa.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "Nenhuma linha de pesquisa encontrada" : "Nenhum registro para exibir"}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* DataTable Controls - Bottom */}
                        <div className="flex justify-between items-center pt-4">
                          <div className="text-sm text-muted-foreground">
                            Mostrando {currentLinhasPesquisa.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredLinhasPesquisa.length)} de {filteredLinhasPesquisa.length} registros
                            {searchTerm && ` (filtrados de ${researchLines.length} registros totais)`}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Linha de Pesquisa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Apelido da linha de pesquisa"
              value={formData.alias}
              onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
            />
            <Input
              placeholder="Nome da linha de pesquisa"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Descrição (opcional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Select
              value={formData.coordinator_id?.toString() || "none"}
              onValueChange={(value) => setFormData({ ...formData, coordinator_id: value === "none" ? undefined : parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um coordenador (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem coordenador</SelectItem>
                {docentes.map((docente) => (
                  <SelectItem key={docente.id} value={docente.id.toString()}>
                    {docente.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  resetForm();
                  setEditingLine(null);
                }}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || !formData.name || !formData.alias}
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinhasPesquisa;