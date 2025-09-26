import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Plus, Trash2, Edit, ChevronLeft, ChevronRight, User, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDocentes, getTrashedDocentes, createDocente, updateDocente, deleteDocente, resetDocentePassword, getResearchLinesDropdown, DocenteData, DocenteFormData, ResearchLineDropdown } from "@/lib/api";

// Form data interfaces for local state
interface FormData {
  nome: string;
  email: string;
  research_line_id: string;
  is_admin: boolean;
}

interface EditFormData extends FormData {
  id: number;
}

const Docentes = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newDocenteOpen, setNewDocenteOpen] = useState(false);
  const [editDocenteOpen, setEditDocenteOpen] = useState(false);

  // Form state
  const [newFormData, setNewFormData] = useState<FormData>({
    nome: "",
    email: "",
    research_line_id: "none",
    is_admin: false,
  });

  const [editFormData, setEditFormData] = useState<EditFormData>({
    id: 0,
    nome: "",
    email: "",
    research_line_id: "none",
    is_admin: false,
  });

  // React Query hooks
  const { data: docentes = [], isLoading, error } = useQuery({
    queryKey: ["docentes"],
    queryFn: getDocentes,
  });

  const { data: researchLines = [] } = useQuery({
    queryKey: ["research-lines-dropdown"],
    queryFn: getResearchLinesDropdown,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createDocente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docentes"] });
      setNewDocenteOpen(false);
      resetNewForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DocenteFormData }) =>
      updateDocente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docentes"] });
      setEditDocenteOpen(false);
      resetEditForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocente,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["docentes"] });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetDocentePassword,
    onSuccess: () => {
      // No need to invalidate queries, just show success feedback if needed
    },
  });

  const filteredDocentes = docentes.filter(docente =>
    docente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docente.linhaPesquisa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredDocentes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocentes = filteredDocentes.slice(startIndex, endIndex);

  // Helper functions
  const resetNewForm = () => {
    setNewFormData({
      nome: "",
      email: "",
      research_line_id: "none",
      is_admin: false,
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      id: 0,
      nome: "",
      email: "",
      research_line_id: "none",
      is_admin: false,
    });
  };

  // Event handlers
  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleResetPassword = (id: number) => {
    resetPasswordMutation.mutate(id);
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

  const handleCreateSubmit = () => {
    if (newFormData.research_line_id === "none") return;

    const formData: DocenteFormData = {
      nome: newFormData.nome,
      email: newFormData.email,
      research_line_id: parseInt(newFormData.research_line_id),
      is_admin: newFormData.is_admin,
    };

    createMutation.mutate(formData);
  };

  const handleEditSubmit = () => {
    if (editFormData.research_line_id === "none") return;

    const formData: DocenteFormData = {
      nome: editFormData.nome,
      email: editFormData.email,
      research_line_id: parseInt(editFormData.research_line_id),
      is_admin: editFormData.is_admin,
    };

    updateMutation.mutate({ id: editFormData.id, data: formData });
  };

  const openEditModal = (docente: DocenteData) => {
    setEditFormData({
      id: docente.id,
      nome: docente.nome,
      email: docente.email,
      research_line_id: docente.research_line_id?.toString() || "none",
      is_admin: docente.is_admin,
    });
    setEditDocenteOpen(true);
  };

  const handleCancelNew = () => {
    setNewDocenteOpen(false);
    resetNewForm();
  };

  const handleCancelEdit = () => {
    setEditDocenteOpen(false);
    resetEditForm();
  };

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
                        <CardTitle>Gerenciamento de Docentes</CardTitle>
                        <div className="flex gap-2">
                          <Dialog open={newDocenteOpen} onOpenChange={setNewDocenteOpen}>
                            <DialogTrigger asChild>
                              <Button className="gap-2">
                                <Plus className="w-4 h-4" />
                                Novo Docente
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader className="pb-4">
                                <DialogTitle className="text-xl font-semibold">Adicionar Novo Docente</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Informações Pessoais */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Informações Pessoais</h3>
                                  <div className="space-y-3">
                                    <div>
                                      <Label htmlFor="nome" className="text-sm font-medium">Nome completo *</Label>
                                      <Input
                                        id="nome"
                                        placeholder="Nome completo"
                                        className="mt-1"
                                        value={newFormData.nome}
                                        onChange={(e) => setNewFormData({ ...newFormData, nome: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                                      <Input
                                        id="email"
                                        placeholder="Email"
                                        type="email"
                                        className="mt-1"
                                        value={newFormData.email}
                                        onChange={(e) => setNewFormData({ ...newFormData, email: e.target.value })}
                                      />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        id="is-admin"
                                        checked={newFormData.is_admin}
                                        onCheckedChange={(checked) => setNewFormData({ ...newFormData, is_admin: checked })}
                                      />
                                      <Label htmlFor="is-admin" className="text-sm font-medium">Usuário também é administrador</Label>
                                    </div>
                                  </div>
                                </div>

                                {/* Linha de Pesquisa */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Área de Atuação</h3>
                                  <div>
                                    <Label className="text-sm font-medium">Linha de Pesquisa *</Label>
                                    <Select
                                      value={newFormData.research_line_id}
                                      onValueChange={(value) => setNewFormData({ ...newFormData, research_line_id: value })}
                                    >
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Selecione uma linha de pesquisa" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">Selecione uma linha de pesquisa</SelectItem>
                                        {researchLines.map((line) => (
                                          <SelectItem key={line.id} value={line.id.toString()}>
                                            {line.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button variant="outline" onClick={handleCancelNew}>Cancelar</Button>
                                <Button
                                  onClick={handleCreateSubmit}
                                  disabled={createMutation.isPending}
                                >
                                  {createMutation.isPending ? "Salvando..." : "Salvar Docente"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="outline" 
                            size="icon" 
                            title="Recuperar docentes excluídos"
                            onClick={() => navigate("/docentes-excluidos")}
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
                                <TableHead className="font-bold text-foreground">Email</TableHead>
                                <TableHead className="font-bold text-foreground">Linha de Pesquisa</TableHead>
                                <TableHead className="w-12 font-bold text-foreground">Adm</TableHead>
                                <TableHead className="w-12 font-bold text-foreground">Edt</TableHead>
                                <TableHead className="w-12 font-bold text-foreground">Exc</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {isLoading ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center py-8">
                                    Carregando...
                                  </TableCell>
                                </TableRow>
                              ) : error ? (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center py-8 text-red-500">
                                    Erro ao carregar docentes
                                  </TableCell>
                                </TableRow>
                              ) : currentDocentes.map((docente) => (
                                <TableRow key={docente.id}>
                                  <TableCell className="font-medium">{docente.nome}</TableCell>
                                  <TableCell>{docente.email}</TableCell>
                                  <TableCell>{docente.linhaPesquisa}</TableCell>
                                  <TableCell className="text-center">
                                    {docente.is_admin ? (
                                      <User className="w-4 h-4 mx-auto text-blue-600" />
                                    ) : null}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500"
                                      onClick={() => openEditModal(docente)}
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
                                            Tem certeza que deseja excluir o docente "{docente.nome}"? Esta ação pode ser desfeita na recuperação de docentes excluídos.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDelete(docente.id)}>
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {currentDocentes.length === 0 && !isLoading && !error && (
                                <TableRow>
                                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "Nenhum docente encontrado" : "Nenhum registro para exibir"}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* DataTable Controls - Bottom */}
                        <div className="flex justify-between items-center pt-4">
                          <div className="text-sm text-muted-foreground">
                            Mostrando {currentDocentes.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredDocentes.length)} de {filteredDocentes.length} registros
                            {searchTerm && ` (filtrados de ${docentes.length} registros totais)`}
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

        {/* Edit Docente Modal */}
        <Dialog open={editDocenteOpen} onOpenChange={setEditDocenteOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold">Editar Docente</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informações Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Informações Pessoais</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-nome" className="text-sm font-medium">Nome completo *</Label>
                    <Input
                      id="edit-nome"
                      placeholder="Nome completo"
                      className="mt-1"
                      value={editFormData.nome}
                      onChange={(e) => setEditFormData({ ...editFormData, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email" className="text-sm font-medium">Email *</Label>
                    <Input
                      id="edit-email"
                      placeholder="Email"
                      type="email"
                      className="mt-1"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-is-admin"
                      checked={editFormData.is_admin}
                      onCheckedChange={(checked) => setEditFormData({ ...editFormData, is_admin: checked })}
                    />
                    <Label htmlFor="edit-is-admin" className="text-sm font-medium">Usuário também é administrador</Label>
                  </div>
                </div>
              </div>

              {/* Linha de Pesquisa */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Área de Atuação</h3>
                <div>
                  <Label className="text-sm font-medium">Linha de Pesquisa *</Label>
                  <Select
                    value={editFormData.research_line_id}
                    onValueChange={(value) => setEditFormData({ ...editFormData, research_line_id: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione uma linha de pesquisa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Selecione uma linha de pesquisa</SelectItem>
                      {researchLines.map((line) => (
                        <SelectItem key={line.id} value={line.id.toString()}>
                          {line.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-yellow-500 border-yellow-500 text-white hover:bg-yellow-600 hover:border-yellow-600">
                      <KeyRound className="w-4 h-4 mr-2" />
                      Resetar Senha
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar reset de senha</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja resetar a senha do docente "{editFormData.nome}" para "123321"?
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleResetPassword(editFormData.id)}>
                        Resetar Senha
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleCancelEdit}>Cancelar</Button>
                <Button
                  onClick={handleEditSubmit}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Docentes;