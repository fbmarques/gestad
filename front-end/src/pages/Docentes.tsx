import { useState } from "react";
import AdminTopNav from "@/components/AdminTopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Moon, Sun, Plus, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Docente {
  id: string;
  nome: string;
  email: string;
  linhaPesquisa: string;
}

const linhasPesquisa = [
  "Inteligência Artificial",
  "Engenharia de Software", 
  "Banco de Dados",
  "Redes de Computadores",
  "Computação Gráfica",
  "Sistemas Distribuídos",
  "Segurança da Informação",
  "Algoritmos e Complexidade",
  "Interação Humano-Computador",
  "Visão Computacional",
  "Computação Móvel",
  "Mineração de Dados",
  "Robótica",
  "Processamento de Linguagem Natural",
  "Internet das Coisas",
  "Computação em Nuvem",
  "Bioinformática",
  "Sistemas Embarcados",
  "Computação Quântica",
  "Blockchain e Criptomoedas"
];

const mockDocentes: Docente[] = [
  { id: "1", nome: "Dr. Maria Santos", email: "maria.santos@email.com", linhaPesquisa: "Inteligência Artificial" },
  { id: "2", nome: "Dr. Pedro Lima", email: "pedro.lima@email.com", linhaPesquisa: "Engenharia de Software" },
  { id: "3", nome: "Dra. Julia Fernandes", email: "julia.fernandes@email.com", linhaPesquisa: "Banco de Dados" },
  { id: "4", nome: "Dr. Roberto Alves", email: "roberto.alves@email.com", linhaPesquisa: "Redes de Computadores" },
  { id: "5", nome: "Dra. Ana Carolina", email: "ana.carolina@email.com", linhaPesquisa: "Computação Gráfica" },
  { id: "6", nome: "Dr. Carlos Eduardo", email: "carlos.eduardo@email.com", linhaPesquisa: "Sistemas Distribuídos" },
  { id: "7", nome: "Dra. Mariana Costa", email: "mariana.costa@email.com", linhaPesquisa: "Segurança da Informação" },
  { id: "8", nome: "Dr. Paulo Ricardo", email: "paulo.ricardo@email.com", linhaPesquisa: "Algoritmos e Complexidade" },
  { id: "9", nome: "Dra. Sandra Melo", email: "sandra.melo@email.com", linhaPesquisa: "Interação Humano-Computador" },
  { id: "10", nome: "Dr. Fernando Silva", email: "fernando.silva@email.com", linhaPesquisa: "Visão Computacional" },
  { id: "11", nome: "Dra. Patrícia Rocha", email: "patricia.rocha@email.com", linhaPesquisa: "Computação Móvel" },
  { id: "12", nome: "Dr. Marcos Vieira", email: "marcos.vieira@email.com", linhaPesquisa: "Mineração de Dados" },
  { id: "13", nome: "Dra. Carla Nascimento", email: "carla.nascimento@email.com", linhaPesquisa: "Robótica" },
  { id: "14", nome: "Dr. André Campos", email: "andre.campos@email.com", linhaPesquisa: "Processamento de Linguagem Natural" },
  { id: "15", nome: "Dra. Mônica Teixeira", email: "monica.teixeira@email.com", linhaPesquisa: "Internet das Coisas" },
  { id: "16", nome: "Dr. Sérgio Monteiro", email: "sergio.monteiro@email.com", linhaPesquisa: "Computação em Nuvem" },
  { id: "17", nome: "Dra. Beatriz Cunha", email: "beatriz.cunha@email.com", linhaPesquisa: "Bioinformática" },
  { id: "18", nome: "Dr. Rodrigo Nunes", email: "rodrigo.nunes@email.com", linhaPesquisa: "Sistemas Embarcados" },
  { id: "19", nome: "Dra. Renata Lopes", email: "renata.lopes@email.com", linhaPesquisa: "Computação Quântica" },
  { id: "20", nome: "Dr. Fábio Correia", email: "fabio.correia@email.com", linhaPesquisa: "Blockchain e Criptomoedas" }
];

const Docentes = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [docentes, setDocentes] = useState<Docente[]>(mockDocentes);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [newDocenteOpen, setNewDocenteOpen] = useState(false);
  const [editDocenteOpen, setEditDocenteOpen] = useState(false);
  const [selectedLinhaPesquisa, setSelectedLinhaPesquisa] = useState("");
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

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

  const handleDelete = (id: string) => {
    setDocentes(prev => prev.filter(d => d.id !== id));
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

  const handleCancelNewDocente = () => {
    setNewDocenteOpen(false);
    setSelectedLinhaPesquisa("");
  };

  const handleCancelEditDocente = () => {
    setEditDocenteOpen(false);
    setSelectedLinhaPesquisa("");
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
                                      <Input id="nome" placeholder="Nome completo" className="mt-1" />
                                    </div>
                                    <div>
                                      <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                                      <Input id="email" placeholder="Email" type="email" className="mt-1" />
                                    </div>
                                  </div>
                                </div>

                                {/* Linha de Pesquisa */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Área de Atuação</h3>
                                  <div>
                                    <Label className="text-sm font-medium">Linha de Pesquisa *</Label>
                                    <div className="mt-3 max-h-48 overflow-y-auto border rounded-md p-3">
                                      <RadioGroup value={selectedLinhaPesquisa} onValueChange={setSelectedLinhaPesquisa} className="space-y-2">
                                        {linhasPesquisa.map((linha, index) => (
                                          <div key={index} className="flex items-center space-x-3 p-1 rounded-md hover:bg-muted/50">
                                            <RadioGroupItem value={linha} id={`linha-${index}`} />
                                            <Label htmlFor={`linha-${index}`} className="cursor-pointer text-sm">{linha}</Label>
                                          </div>
                                        ))}
                                      </RadioGroup>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex justify-end gap-3 pt-6 border-t">
                                <Button variant="outline" onClick={handleCancelNewDocente}>Cancelar</Button>
                                <Button>Salvar Docente</Button>
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
                                <TableHead className="w-12 font-bold text-foreground">Edt</TableHead>
                                <TableHead className="w-12 font-bold text-foreground">Exc</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentDocentes.map((docente) => (
                                <TableRow key={docente.id}>
                                  <TableCell className="font-medium">{docente.nome}</TableCell>
                                  <TableCell>{docente.email}</TableCell>
                                  <TableCell>{docente.linhaPesquisa}</TableCell>
                                  <TableCell>
                                    <Dialog open={editDocenteOpen} onOpenChange={setEditDocenteOpen}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="icon" className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500">
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                      </DialogTrigger>
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
                                                <Input id="edit-nome" defaultValue={docente.nome} placeholder="Nome completo" className="mt-1" />
                                              </div>
                                              <div>
                                                <Label htmlFor="edit-email" className="text-sm font-medium">Email *</Label>
                                                <Input id="edit-email" defaultValue={docente.email} placeholder="Email" type="email" className="mt-1" />
                                              </div>
                                            </div>
                                          </div>

                                          {/* Linha de Pesquisa */}
                                          <div className="space-y-4">
                                            <h3 className="text-lg font-medium text-muted-foreground border-b pb-2">Área de Atuação</h3>
                                            <div>
                                              <Label className="text-sm font-medium">Linha de Pesquisa *</Label>
                                              <div className="mt-3 max-h-48 overflow-y-auto border rounded-md p-3">
                                                <RadioGroup defaultValue={docente.linhaPesquisa} className="space-y-2">
                                                  {linhasPesquisa.map((linha, index) => (
                                                    <div key={index} className="flex items-center space-x-3 p-1 rounded-md hover:bg-muted/50">
                                                      <RadioGroupItem value={linha} id={`edit-linha-${index}`} />
                                                      <Label htmlFor={`edit-linha-${index}`} className="cursor-pointer text-sm">{linha}</Label>
                                                    </div>
                                                  ))}
                                                </RadioGroup>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex justify-end gap-3 pt-6 border-t">
                                          <Button variant="outline" onClick={handleCancelEditDocente}>Cancelar</Button>
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
                              {currentDocentes.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
      </div>
    </div>
  );
};

export default Docentes;