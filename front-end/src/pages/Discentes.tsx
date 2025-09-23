import { useState } from "react";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";
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
import { Plus, Trash2, Edit, ChevronLeft, ChevronRight, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Discente {
  id: string;
  nome: string;
  email: string;
  orientador: string;
  coOrientador?: string;
  nivelPosGraduacao: string;
  mestradoStatus: string;
  doutoradoStatus: string;
}

interface Docente {
  id: string;
  nome: string;
}

const mockDocentes: Docente[] = [
  { id: "1", nome: "Dr. Maria Santos" },
  { id: "2", nome: "Dr. Pedro Lima" },
  { id: "3", nome: "Dra. Julia Fernandes" },
  { id: "4", nome: "Dr. Roberto Alves" },
  { id: "5", nome: "Dra. Ana Carolina" },
  { id: "6", nome: "Dr. Carlos Eduardo" },
  { id: "7", nome: "Dra. Mariana Costa" },
  { id: "8", nome: "Dr. Paulo Ricardo" },
  { id: "9", nome: "Dra. Sandra Melo" },
  { id: "10", nome: "Dr. Fernando Silva" },
  { id: "11", nome: "Dra. Patrícia Rocha" },
  { id: "12", nome: "Dr. Marcos Vieira" },
  { id: "13", nome: "Dra. Carla Nascimento" },
  { id: "14", nome: "Dr. André Campos" },
  { id: "15", nome: "Dra. Mônica Teixeira" },
  { id: "16", nome: "Dr. Sérgio Monteiro" },
  { id: "17", nome: "Dra. Beatriz Cunha" },
  { id: "18", nome: "Dr. Rodrigo Nunes" },
  { id: "19", nome: "Dra. Renata Lopes" },
  { id: "20", nome: "Dr. Fábio Correia" }
];

const mockDiscentes: Discente[] = [
  { id: "1", nome: "João Silva", email: "joao.silva@email.com", orientador: "Dr. Maria Santos", nivelPosGraduacao: "mestrado", mestradoStatus: "em-curso", doutoradoStatus: "nao-iniciado" },
  { id: "2", nome: "Ana Costa", email: "ana.costa@email.com", orientador: "Dr. Pedro Lima", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "em-curso" },
  { id: "3", nome: "Carlos Oliveira", email: "carlos.oliveira@email.com", orientador: "Dra. Julia Fernandes", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "concluido" },
  { id: "4", nome: "Marina Rodrigues", email: "marina.rodrigues@email.com", orientador: "Dr. Roberto Alves", nivelPosGraduacao: "mestrado", mestradoStatus: "em-curso", doutoradoStatus: "nao-iniciado" },
  { id: "5", nome: "Felipe Santos", email: "felipe.santos@email.com", orientador: "Dra. Ana Carolina", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "em-curso" },
  { id: "6", nome: "Lucia Fernandes", email: "lucia.fernandes@email.com", orientador: "Dr. Carlos Eduardo", nivelPosGraduacao: "mestrado", mestradoStatus: "em-curso", doutoradoStatus: "nao-iniciado" },
  { id: "7", nome: "Rafael Pereira", email: "rafael.pereira@email.com", orientador: "Dra. Mariana Costa", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "concluido" },
  { id: "8", nome: "Camila Souza", email: "camila.souza@email.com", orientador: "Dr. Paulo Ricardo", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "em-curso" },
  { id: "9", nome: "Bruno Lima", email: "bruno.lima@email.com", orientador: "Dra. Sandra Melo", nivelPosGraduacao: "mestrado", mestradoStatus: "em-curso", doutoradoStatus: "nao-iniciado" },
  { id: "10", nome: "Isabela Martins", email: "isabela.martins@email.com", orientador: "Dr. Fernando Silva", nivelPosGraduacao: "mestrado", mestradoStatus: "em-curso", doutoradoStatus: "nao-iniciado" },
  { id: "11", nome: "Thiago Barbosa", email: "thiago.barbosa@email.com", orientador: "Dra. Patrícia Rocha", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "em-curso" },
  { id: "12", nome: "Natália Gomes", email: "natalia.gomes@email.com", orientador: "Dr. Marcos Vieira", nivelPosGraduacao: "mestrado", mestradoStatus: "em-curso", doutoradoStatus: "nao-iniciado" },
  { id: "13", nome: "Gustavo Almeida", email: "gustavo.almeida@email.com", orientador: "Dra. Carla Nascimento", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "concluido" },
  { id: "14", nome: "Larissa Castro", email: "larissa.castro@email.com", orientador: "Dr. André Campos", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "em-curso" },
  { id: "15", nome: "Diego Ribeiro", email: "diego.ribeiro@email.com", orientador: "Dra. Mônica Teixeira", nivelPosGraduacao: "mestrado", mestradoStatus: "concluido", doutoradoStatus: "nao-iniciado" },
  { id: "16", nome: "Amanda Cardoso", email: "amanda.cardoso@email.com", orientador: "Dr. Sérgio Monteiro", nivelPosGraduacao: "mestrado", mestradoStatus: "em-curso", doutoradoStatus: "nao-iniciado" },
  { id: "17", nome: "Leandro Moreira", email: "leandro.moreira@email.com", orientador: "Dra. Beatriz Cunha", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "em-curso" },
  { id: "18", nome: "Priscila Dias", email: "priscila.dias@email.com", orientador: "Dr. Rodrigo Nunes", nivelPosGraduacao: "mestrado", mestradoStatus: "em-curso", doutoradoStatus: "nao-iniciado" },
  { id: "19", nome: "Mateus Freitas", email: "mateus.freitas@email.com", orientador: "Dra. Renata Lopes", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "concluido" },
  { id: "20", nome: "Vanessa Torres", email: "vanessa.torres@email.com", orientador: "Dr. Fábio Correia", nivelPosGraduacao: "doutorado", mestradoStatus: "concluido", doutoradoStatus: "em-curso" }
];

const Discentes = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [discentes, setDiscentes] = useState<Discente[]>(mockDiscentes);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newDiscenteOpen, setNewDiscenteOpen] = useState(false);
  const [editDiscenteOpen, setEditDiscenteOpen] = useState(false);
  const [selectedOrientador, setSelectedOrientador] = useState("");
  const [selectedCoOrientador, setSelectedCoOrientador] = useState("");
  const [orientadorOpen, setOrientadorOpen] = useState(false);
  const [coOrientadorOpen, setCoOrientadorOpen] = useState(false);
  const [selectedNivelPosGraduacao, setSelectedNivelPosGraduacao] = useState("");
  const [selectedMestradoStatus, setSelectedMestradoStatus] = useState("");
  const [selectedDoutoradoStatus, setSelectedDoutoradoStatus] = useState("nao-iniciado");

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

  const handleDelete = (id: string) => {
    setDiscentes(prev => prev.filter(d => d.id !== id));
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
    setSelectedMestradoStatus("");
    setSelectedDoutoradoStatus("nao-iniciado");
  };

  const handleCancelEditDiscente = () => {
    setEditDiscenteOpen(false);
    setSelectedOrientador("");
    setSelectedCoOrientador("");
    setSelectedNivelPosGraduacao("");
    setSelectedMestradoStatus("");
    setSelectedDoutoradoStatus("nao-iniciado");
  };

  const handleNivelChange = (nivel: string) => {
    setSelectedNivelPosGraduacao(nivel);
    // Definir status padrão baseado no nível selecionado
    if (nivel === "mestrado") {
      setSelectedMestradoStatus("em-curso");
      setSelectedDoutoradoStatus("nao-iniciado");
    } else if (nivel === "doutorado") {
      setSelectedMestradoStatus("concluido");
      setSelectedDoutoradoStatus("em-curso");
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
                                      <Input id="nome" placeholder="Nome completo" className="mt-1" />
                                    </div>
                                    <div>
                                      <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                                      <Input id="email" placeholder="Email" type="email" className="mt-1" />
                                    </div>
                                  </div>
                                </div>

                                {/* Nível Acadêmico */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Nível Acadêmico</h3>
                                  <div>
                                    <Label className="text-sm font-medium">Nível de Pós-Graduação *</Label>
                                    <RadioGroup value={selectedNivelPosGraduacao} onValueChange={handleNivelChange} className="mt-3 space-y-2">
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
                                              ? mockDocentes.find((docente) => docente.nome === selectedOrientador)?.nome
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
                                                {mockDocentes.map((docente) => (
                                                  <CommandItem
                                                    key={docente.id}
                                                    value={docente.nome}
                                                    onSelect={(currentValue) => {
                                                      setSelectedOrientador(currentValue === selectedOrientador ? "" : currentValue);
                                                      setOrientadorOpen(false);
                                                    }}
                                                  >
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedOrientador === docente.nome ? "opacity-100" : "opacity-0"
                                                      )}
                                                    />
                                                    {docente.nome}
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
                                              ? mockDocentes.find((docente) => docente.nome === selectedCoOrientador)?.nome
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
                                                {mockDocentes.map((docente) => (
                                                  <CommandItem
                                                    key={docente.id}
                                                    value={docente.nome}
                                                    onSelect={(currentValue) => {
                                                      setSelectedCoOrientador(currentValue === selectedCoOrientador ? "" : currentValue);
                                                      setCoOrientadorOpen(false);
                                                    }}
                                                  >
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedCoOrientador === docente.nome ? "opacity-100" : "opacity-0"
                                                      )}
                                                    />
                                                    {docente.nome}
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
                                <Button variant="outline" onClick={handleCancelNewDiscente}>Cancelar</Button>
                                <Button>Salvar Discente</Button>
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
                                <TableHead className="w-12 font-bold text-foreground">Edt</TableHead>
                                <TableHead className="w-12 font-bold text-foreground">Exc</TableHead>
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
                                      discente.mestradoStatus === 'concluido' ? 'bg-green-100 text-green-800' :
                                      discente.mestradoStatus === 'em-curso' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {discente.mestradoStatus === 'concluido' ? 'Concluído' :
                                       discente.mestradoStatus === 'em-curso' ? 'Em curso' : 'Não iniciado'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      discente.doutoradoStatus === 'concluido' ? 'bg-green-100 text-green-800' :
                                      discente.doutoradoStatus === 'em-curso' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {discente.doutoradoStatus === 'concluido' ? 'Concluído' :
                                       discente.doutoradoStatus === 'em-curso' ? 'Em curso' : 'Não iniciado'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Dialog open={editDiscenteOpen} onOpenChange={setEditDiscenteOpen}>
                                      <DialogTrigger asChild>
                                         <Button variant="outline" size="icon" className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500">
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
                                                <Input id="edit-nome" defaultValue={discente.nome} placeholder="Nome completo" className="mt-1" />
                                              </div>
                                              <div>
                                                <Label htmlFor="edit-email" className="text-sm font-medium">Email *</Label>
                                                <Input id="edit-email" defaultValue={discente.email} placeholder="Email" type="email" className="mt-1" />
                                              </div>
                                            </div>
                                          </div>

                                          {/* Nível Acadêmico */}
                                          <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Nível Acadêmico</h3>
                                            <div>
                                              <Label className="text-sm font-medium">Nível de Pós-Graduação *</Label>
                                              <RadioGroup defaultValue={discente.nivelPosGraduacao} className="mt-3 space-y-2">
                                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                                                  <RadioGroupItem value="mestrado" id="edit-mestrado" />
                                                  <Label htmlFor="edit-mestrado" className="cursor-pointer">Mestrado</Label>
                                                </div>
                                                <div className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                                                  <RadioGroupItem value="doutorado" id="edit-doutorado" />
                                                  <Label htmlFor="edit-doutorado" className="cursor-pointer">Doutorado</Label>
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
                                                      {discente.orientador || "Selecione um orientador..."}
                                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                  </PopoverTrigger>
                                                  <PopoverContent className="w-full p-0">
                                                    <Command>
                                                      <CommandInput placeholder="Buscar orientador..." />
                                                      <CommandList>
                                                        <CommandEmpty>Nenhum orientador encontrado.</CommandEmpty>
                                                        <CommandGroup>
                                                          {mockDocentes.map((docente) => (
                                                            <CommandItem key={docente.id} value={docente.nome}>
                                                              <Check className="mr-2 h-4 w-4 opacity-0" />
                                                              {docente.nome}
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
                                                      {discente.coOrientador || "Selecione um co-orientador..."}
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
                                                          {mockDocentes.map((docente) => (
                                                            <CommandItem key={docente.id} value={docente.nome}>
                                                              <Check className="mr-2 h-4 w-4 opacity-0" />
                                                              {docente.nome}
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
                                          <Button variant="outline" onClick={handleCancelEditDiscente}>Cancelar</Button>
                                          <Button>Salvar Alterações</Button>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
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
                                </TableRow>
                              ))}
                              {currentDiscentes.length === 0 && (
                                 <TableRow>
                                   <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
      </div>
    </div>
  );
};

export default Discentes;