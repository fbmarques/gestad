import { useState } from "react";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
import { useActiveRole } from "@/hooks/useActiveRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, Edit, ChevronLeft, ChevronRight, Check, ChevronsUpDown, RotateCcw, Map, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDiscentes, getDocentesDropdown, createDiscente, updateDiscente, deleteDiscente, getDiscenteAvailableLevels, resetDiscentePassword, getStudentAcademicBondDetails, Discente, DocenteDropdown, DiscenteFormData, StudentAcademicBondData } from "@/lib/api";

// Helper function to translate academic status to Brazilian Portuguese
const translateStatus = (status: string | null | undefined): string => {
  if (!status) return '';

  const statusMap: { [key: string]: string } = {
    'Not Scheduled': 'Não Agendada',
    'not scheduled': 'Não Agendada',
    'Scheduled': 'Agendada',
    'scheduled': 'Agendada',
    'Completed': 'Concluída',
    'completed': 'Concluída',
    'Approved': 'Aprovada',
    'approved': 'Aprovada',
    'Pending': 'Pendente',
    'pending': 'Pendente',
  };

  return statusMap[status] || status;
};

// Helper function to format academic requirement status with completion date
const formatAcademicStatus = (status: string | null | undefined, completionDate: string | null | undefined): string => {
  const translatedStatus = translateStatus(status);

  if (!translatedStatus) return '';

  // If status is "Concluída" and there's a completion date, append it
  if ((status === 'Completed' || status === 'completed') && completionDate) {
    return `${translatedStatus} - ${completionDate}`;
  }

  return translatedStatus;
};

const Discentes = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { activeRole } = useActiveRole();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newDiscenteOpen, setNewDiscenteOpen] = useState(false);
  const [editDiscenteOpen, setEditDiscenteOpen] = useState(false);
  const [editingDiscente, setEditingDiscente] = useState<Discente | null>(null);
  const [selectedOrientador, setSelectedOrientador] = useState("");
  const [selectedCoOrientador, setSelectedCoOrientador] = useState("");
  const [orientadorOpen, setOrientadorOpen] = useState(false);
  const [coOrientadorOpen, setCoOrientadorOpen] = useState(false);
  const [selectedNivelPosGraduacao, setSelectedNivelPosGraduacao] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [availableLevels, setAvailableLevels] = useState<string[]>([]);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedStudentData, setSelectedStudentData] = useState<StudentAcademicBondData | null>(null);

  const queryClient = useQueryClient();

  // Check if user is docente (should not see Edit and Delete buttons)
  const isDocente = activeRole === 'docente';

  // Fetch discentes
  const { data: discentes = [], isLoading } = useQuery({
    queryKey: ['discentes'],
    queryFn: getDiscentes,
  });

  // Fetch docentes for dropdown
  const { data: docentes = [] } = useQuery({
    queryKey: ['docentes-dropdown'],
    queryFn: getDocentesDropdown,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDiscente,
    onSuccess: () => {
      queryClient.invalidateQueries(['discentes']);
      handleCancelNewDiscente();
    },
    onError: (error: any) => {
      console.error('Create discente error:', error);
      const errorMessage = error?.response?.data?.message || 'Erro ao criar discente';
      const errors = error?.response?.data?.errors;

      if (errors) {
        const errorList = Object.values(errors).flat().join('\n');
        alert(`Erro de validação:\n${errorList}`);
      } else {
        alert(errorMessage);
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: DiscenteFormData }) =>
      updateDiscente(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['discentes']);
      handleCancelEditDiscente();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDiscente,
    onSuccess: () => {
      queryClient.invalidateQueries(['discentes']);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: resetDiscentePassword,
    onSuccess: () => {
      // Optional: show success message
    },
  });

  const filteredDiscentes = discentes.filter(discente =>
    discente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    discente.orientador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredDiscentes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDiscentes = filteredDiscentes.slice(startIndex, endIndex);

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
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

  const handleCancelNewDiscente = () => {
    setNewDiscenteOpen(false);
    setSelectedOrientador("");
    setSelectedCoOrientador("");
    setSelectedNivelPosGraduacao("");
    setNome("");
    setEmail("");
  };

  const handleCancelEditDiscente = () => {
    setEditDiscenteOpen(false);
    setEditingDiscente(null);
    setSelectedOrientador("");
    setSelectedCoOrientador("");
    setSelectedNivelPosGraduacao("");
    setNome("");
    setEmail("");
  };

  const handleCreateSubmit = () => {
    if (!nome || !email || !selectedOrientador || !selectedNivelPosGraduacao) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const orientadorId = docentes.find(d => d.name === selectedOrientador)?.id;
    const coOrientadorId = selectedCoOrientador ? docentes.find(d => d.name === selectedCoOrientador)?.id : undefined;

    if (!orientadorId) {
      alert(`Orientador não encontrado. Valor selecionado: "${selectedOrientador}"`);
      return;
    }

    const data: DiscenteFormData = {
      nome,
      email,
      orientador_id: orientadorId,
      co_orientador_id: coOrientadorId,
      nivel_pos_graduacao: selectedNivelPosGraduacao as 'mestrado' | 'doutorado',
    };

    createMutation.mutate(data);
  };

  const handleEditSubmit = () => {
    if (!editingDiscente || !nome || !email || !selectedOrientador || !selectedNivelPosGraduacao) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const orientadorId = docentes.find(d => d.name === selectedOrientador)?.id;
    const coOrientadorId = selectedCoOrientador ? docentes.find(d => d.name === selectedCoOrientador)?.id : undefined;

    if (!orientadorId) {
      alert('Orientador não encontrado.');
      return;
    }

    const data: DiscenteFormData = {
      nome,
      email,
      orientador_id: orientadorId,
      co_orientador_id: coOrientadorId,
      nivel_pos_graduacao: selectedNivelPosGraduacao as 'mestrado' | 'doutorado',
    };

    updateMutation.mutate({ id: editingDiscente.id, data });
  };

  const handleEditDiscente = async (discente: Discente) => {
    setEditingDiscente(discente);
    setNome(discente.nome);
    setEmail(discente.email);
    setSelectedOrientador(discente.orientador);
    setSelectedCoOrientador(discente.co_orientador || "");
    setSelectedNivelPosGraduacao(discente.nivel_pos_graduacao);

    // Fetch available levels for this discente
    try {
      const levelData = await getDiscenteAvailableLevels(discente.id);
      setAvailableLevels(levelData.available_levels);
    } catch (error) {
      console.error('Error fetching available levels:', error);
      setAvailableLevels([]);
    }

    setEditDiscenteOpen(true);
  };

  const handleViewStudentMap = async (discenteId: number) => {
    try {
      const data = await getStudentAcademicBondDetails(discenteId);
      setSelectedStudentData(data);
      setSelectedStudentId(discenteId);
      setMapModalOpen(true);
    } catch (error) {
      console.error('Error fetching student academic bond details:', error);
      alert('Erro ao carregar informações do discente.');
    }
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
                        <CardTitle>Gerenciamento de Discentes</CardTitle>
                        {!isDocente && (
                          <div className="flex gap-2">
                            <Dialog open={newDiscenteOpen} onOpenChange={setNewDiscenteOpen}>
                              <DialogTrigger asChild>
                                <Button className="gap-2">
                                  <Plus className="w-4 h-4" />
                                  Novo Discente
                                </Button>
                              </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader className="pb-4">
                                <DialogTitle className="text-xl font-semibold">Adicionar Novo Discente</DialogTitle>
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
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                                      <Input
                                        id="email"
                                        placeholder="Email"
                                        type="email"
                                        className="mt-1"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* Nível Acadêmico */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Nível Acadêmico</h3>
                                  <div>
                                    <Label className="text-sm font-medium">Nível de Pós-Graduação *</Label>
                                    <RadioGroup value={selectedNivelPosGraduacao} onValueChange={setSelectedNivelPosGraduacao} className="mt-3 space-y-2">
                                      <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                                        <RadioGroupItem value="mestrado" id="mestrado" />
                                        <Label htmlFor="mestrado" className="cursor-pointer">Mestrado</Label>
                                      </div>
                                      <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                                        <RadioGroupItem value="doutorado" id="doutorado" />
                                        <Label htmlFor="doutorado" className="cursor-pointer">Doutorado</Label>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                </div>

                                {/* Orientação - Span full width */}
                                <div className="md:col-span-2 space-y-4">
                                  <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Orientação</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="orientador" className="text-sm font-medium">Orientador *</Label>
                                      <Popover open={orientadorOpen} onOpenChange={setOrientadorOpen}>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={orientadorOpen}
                                            className="w-full justify-between mt-1"
                                          >
                                            {selectedOrientador
                                              ? docentes.find((docente) => docente.name === selectedOrientador)?.name
                                              : "Selecione um orientador..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                          <Command>
                                            <CommandInput placeholder="Buscar orientador..." />
                                            <CommandList>
                                              <CommandEmpty>Nenhum orientador encontrado.</CommandEmpty>
                                              <CommandGroup>
                                                {docentes.map((docente) => (
                                                  <CommandItem
                                                    key={docente.id}
                                                    value={docente.name}
                                                    onSelect={(currentValue) => {
                                                      setSelectedOrientador(currentValue === selectedOrientador ? "" : currentValue);
                                                      setOrientadorOpen(false);
                                                    }}
                                                  >
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedOrientador === docente.name ? "opacity-100" : "opacity-0"
                                                      )}
                                                    />
                                                    {docente.name}
                                                  </CommandItem>
                                                ))}
                                              </CommandGroup>
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    <div>
                                      <Label htmlFor="co-orientador" className="text-sm font-medium">Co-Orientador</Label>
                                      <Popover open={coOrientadorOpen} onOpenChange={setCoOrientadorOpen}>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={coOrientadorOpen}
                                            className="w-full justify-between mt-1"
                                          >
                                            {selectedCoOrientador
                                              ? docentes.find((docente) => docente.name === selectedCoOrientador)?.name
                                              : "Selecione um co-orientador..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                          <Command>
                                            <CommandInput placeholder="Buscar co-orientador..." />
                                            <CommandList>
                                              <CommandEmpty>Nenhum co-orientador encontrado.</CommandEmpty>
                                              <CommandGroup>
                                                <CommandItem
                                                  value=""
                                                  onSelect={() => {
                                                    setSelectedCoOrientador("");
                                                    setCoOrientadorOpen(false);
                                                  }}
                                                >
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      selectedCoOrientador === "" ? "opacity-100" : "opacity-0"
                                                    )}
                                                  />
                                                  Nenhum co-orientador
                                                </CommandItem>
                                                {docentes.map((docente) => (
                                                  <CommandItem
                                                    key={docente.id}
                                                    value={docente.name}
                                                    onSelect={(currentValue) => {
                                                      setSelectedCoOrientador(currentValue === selectedCoOrientador ? "" : currentValue);
                                                      setCoOrientadorOpen(false);
                                                    }}
                                                  >
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedCoOrientador === docente.name ? "opacity-100" : "opacity-0"
                                                      )}
                                                    />
                                                    {docente.name}
                                                  </CommandItem>
                                                ))}
                                              </CommandGroup>
                                            </CommandList>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button variant="outline" onClick={handleCancelNewDiscente} disabled={createMutation.isPending}>
                                  Cancelar
                                </Button>
                                <Button onClick={handleCreateSubmit} disabled={createMutation.isPending}>
                                  {createMutation.isPending ? 'Salvando...' : 'Salvar Discente'}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="icon"
                            title="Recuperar discentes excluídos"
                            onClick={() => navigate("/discentes-excluidos")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          </div>
                        )}
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
                                <TableHead className="w-12 font-bold text-foreground">Mapa</TableHead>
                                {!isDocente && <TableHead className="w-12 font-bold text-foreground">Edt</TableHead>}
                                {!isDocente && <TableHead className="w-12 font-bold text-foreground">Exc</TableHead>}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentDiscentes.map((discente) => (
                                <TableRow key={discente.id}>
                                  <TableCell className="font-medium">{discente.nome}</TableCell>
                                  <TableCell>{discente.email}</TableCell>
                                  <TableCell>{discente.orientador}</TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      discente.mestrado_status === 'completed' ? 'bg-green-100 text-green-800' :
                                      discente.mestrado_status === 'active' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {discente.mestrado_status === 'completed' ? 'Concluído' :
                                       discente.mestrado_status === 'active' ? 'Em curso' : 'Não iniciado'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      discente.doutorado_status === 'completed' ? 'bg-green-100 text-green-800' :
                                      discente.doutorado_status === 'active' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {discente.doutorado_status === 'completed' ? 'Concluído' :
                                       discente.doutorado_status === 'active' ? 'Em curso' : 'Não iniciado'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600"
                                      onClick={() => handleViewStudentMap(discente.id)}
                                      title="Ver mapa do discente"
                                    >
                                      <Map className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                  {!isDocente && (
                                    <TableCell>
                                      <Dialog open={editDiscenteOpen} onOpenChange={setEditDiscenteOpen}>
                                        <DialogTrigger asChild>
                                           <Button
                                             variant="outline"
                                             size="icon"
                                             className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500"
                                             onClick={() => handleEditDiscente(discente)}
                                           >
                                             <Edit className="w-4 h-4" />
                                           </Button>
                                        </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader className="pb-4">
                                          <DialogTitle className="text-xl font-semibold">Editar Discente</DialogTitle>
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
                                                  value={nome}
                                                  onChange={(e) => setNome(e.target.value)}
                                                  placeholder="Nome completo"
                                                  className="mt-1"
                                                />
                                              </div>
                                              <div>
                                                <Label htmlFor="edit-email" className="text-sm font-medium">Email *</Label>
                                                <Input
                                                  id="edit-email"
                                                  value={email}
                                                  onChange={(e) => setEmail(e.target.value)}
                                                  placeholder="Email"
                                                  type="email"
                                                  className="mt-1"
                                                />
                                              </div>
                                            </div>
                                          </div>

                                          {/* Nível Acadêmico */}
                                          <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Nível Acadêmico</h3>
                                            <div>
                                              <Label className="text-sm font-medium">Nível de Pós-Graduação *</Label>
                                              <RadioGroup value={selectedNivelPosGraduacao} onValueChange={setSelectedNivelPosGraduacao} className="mt-3 space-y-2">
                                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                                                  <RadioGroupItem
                                                    value="mestrado"
                                                    id="edit-mestrado"
                                                    disabled={!availableLevels.includes('mestrado')}
                                                  />
                                                  <Label
                                                    htmlFor="edit-mestrado"
                                                    className={`cursor-pointer ${!availableLevels.includes('mestrado') ? 'text-muted-foreground opacity-50' : ''}`}
                                                  >
                                                    Mestrado
                                                  </Label>
                                                </div>
                                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                                                  <RadioGroupItem
                                                    value="doutorado"
                                                    id="edit-doutorado"
                                                    disabled={!availableLevels.includes('doutorado')}
                                                  />
                                                  <Label
                                                    htmlFor="edit-doutorado"
                                                    className={`cursor-pointer ${!availableLevels.includes('doutorado') ? 'text-muted-foreground opacity-50' : ''}`}
                                                  >
                                                    Doutorado
                                                  </Label>
                                                </div>
                                              </RadioGroup>
                                            </div>
                                          </div>

                                          {/* Orientação - Span full width */}
                                          <div className="md:col-span-2 space-y-4">
                                            <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Orientação</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                <Label htmlFor="edit-orientador" className="text-sm font-medium">Orientador *</Label>
                                                <Popover>
                                                  <PopoverTrigger asChild>
                                                    <Button
                                                      variant="outline"
                                                      role="combobox"
                                                      className="w-full justify-between mt-1"
                                                    >
                                                      {selectedOrientador || "Selecione um orientador..."}
                                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                  </PopoverTrigger>
                                                  <PopoverContent className="w-full p-0">
                                                    <Command>
                                                      <CommandInput placeholder="Buscar orientador..." />
                                                      <CommandList>
                                                        <CommandEmpty>Nenhum orientador encontrado.</CommandEmpty>
                                                        <CommandGroup>
                                                          {docentes.map((docente) => (
                                                            <CommandItem
                                                              key={docente.id}
                                                              value={docente.name}
                                                              onSelect={(currentValue) => {
                                                                setSelectedOrientador(currentValue === selectedOrientador ? "" : currentValue);
                                                              }}
                                                            >
                                                              <Check
                                                                className={cn(
                                                                  "mr-2 h-4 w-4",
                                                                  selectedOrientador === docente.name ? "opacity-100" : "opacity-0"
                                                                )}
                                                              />
                                                              {docente.name}
                                                            </CommandItem>
                                                          ))}
                                                        </CommandGroup>
                                                      </CommandList>
                                                    </Command>
                                                  </PopoverContent>
                                                </Popover>
                                              </div>
                                              <div>
                                                <Label htmlFor="edit-co-orientador" className="text-sm font-medium">Co-Orientador</Label>
                                                <Popover>
                                                  <PopoverTrigger asChild>
                                                    <Button
                                                      variant="outline"
                                                      role="combobox"
                                                      className="w-full justify-between mt-1"
                                                    >
                                                      {selectedCoOrientador || "Selecione um co-orientador..."}
                                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                  </PopoverTrigger>
                                                  <PopoverContent className="w-full p-0">
                                                    <Command>
                                                      <CommandInput placeholder="Buscar co-orientador..." />
                                                      <CommandList>
                                                        <CommandEmpty>Nenhum co-orientador encontrado.</CommandEmpty>
                                                        <CommandGroup>
                                                          <CommandItem value="">
                                                            <Check className="mr-2 h-4 w-4 opacity-0" />
                                                            Nenhum co-orientador
                                                          </CommandItem>
                                                          {docentes.map((docente) => (
                                                            <CommandItem
                                                              key={docente.id}
                                                              value={docente.name}
                                                              onSelect={(currentValue) => {
                                                                setSelectedCoOrientador(currentValue === selectedCoOrientador ? "" : currentValue);
                                                              }}
                                                            >
                                                              <Check
                                                                className={cn(
                                                                  "mr-2 h-4 w-4",
                                                                  selectedCoOrientador === docente.name ? "opacity-100" : "opacity-0"
                                                                )}
                                                              />
                                                              {docente.name}
                                                            </CommandItem>
                                                          ))}
                                                        </CommandGroup>
                                                      </CommandList>
                                                    </Command>
                                                  </PopoverContent>
                                                </Popover>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex justify-between pt-6 border-t">
                                          <Button
                                            variant="outline"
                                            onClick={() => editingDiscente && resetPasswordMutation.mutate(editingDiscente.id)}
                                            disabled={resetPasswordMutation.isPending}
                                            className="flex items-center gap-2"
                                          >
                                            <RotateCcw className="w-4 h-4" />
                                            {resetPasswordMutation.isPending ? 'Resetando...' : 'Resetar Senha'}
                                          </Button>
                                          <div className="flex gap-3">
                                            <Button variant="outline" onClick={handleCancelEditDiscente}>Cancelar</Button>
                                            <Button onClick={handleEditSubmit}>Salvar Alterações</Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </TableCell>
                                  )}
                                  {!isDocente && (
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
                                              Tem certeza que deseja excluir o discente "{discente.nome}"? Esta ação pode ser desfeita na recuperação de discentes excluídos.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(discente.id)}>
                                              Excluir
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                              {currentDiscentes.length === 0 && (
                                 <TableRow>
                                   <TableCell colSpan={isDocente ? 6 : 8} className="text-center py-8 text-muted-foreground">
                                     {searchTerm ? "Nenhum discente encontrado" : "Nenhum registro para exibir"}
                                   </TableCell>
                                 </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                        
                        {/* DataTable Controls - Bottom */}
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

        {/* Fullscreen Student Map Modal */}
        {mapModalOpen && selectedStudentData && (
          <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">{selectedStudentData.student_name}</h2>
                <p className="text-sm text-muted-foreground">{selectedStudentData.student_email}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setMapModalOpen(false);
                  setSelectedStudentData(null);
                  setSelectedStudentId(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                {selectedStudentData.academic_bonds.map((bond, index) => (
                  <Card key={bond.id} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="flex items-center justify-between">
                        <span>{bond.level}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          bond.status === 'completed' ? 'bg-green-100 text-green-800' :
                          bond.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {bond.status === 'completed' ? 'Concluído' :
                           bond.status === 'active' ? 'Ativo' : bond.status}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Basic Info - Always show all 6 fields in 2 columns */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Orientador</p>
                          <p className="text-base">{bond.advisor}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Co-Orientador</p>
                          <p className="text-base">{bond.co_advisor || 'Sem co-orientador'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Linha de Pesquisa</p>
                          <p className="text-base">{bond.research_line}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Agência de Fomento</p>
                          <p className="text-base">{bond.agency || 'Sem agência'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Data de Início</p>
                          <p className="text-base">{bond.start_date || 'Não informada'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Data de Término</p>
                          <p className="text-base">{bond.end_date || 'Não informada'}</p>
                        </div>
                      </div>

                      {/* Research Definitions - Always show all 4 fields */}
                      <div className="border-t pt-4 space-y-4">
                        <h3 className="text-lg font-semibold">Definições de Pesquisa</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Problema</p>
                            <p className="text-sm">{bond.problem_text || 'Ainda não informado'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Questão de Pesquisa</p>
                            <p className="text-sm">{bond.question_text || ''}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Objetivos</p>
                            <p className="text-sm">{bond.objectives_text || ''}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Metodologia</p>
                            <p className="text-sm">{bond.methodology_text || ''}</p>
                          </div>
                        </div>
                      </div>

                      {/* Academic Requirements */}
                      <div className="border-t pt-4 space-y-4">
                        <h3 className="text-lg font-semibold">Requisitos Acadêmicos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Status da Qualificação</p>
                            <p className="text-base">{formatAcademicStatus(bond.qualification_status, bond.qualification_completion_date)}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Status da Defesa</p>
                            <p className="text-base">{formatAcademicStatus(bond.defense_status, bond.defense_completion_date)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Trabalho Concluído</p>
                          <p className="text-base">Não entregue</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {selectedStudentData.academic_bonds.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center text-muted-foreground">
                      Nenhum vínculo acadêmico encontrado para este discente.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discentes;