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
import { Plus, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Disciplina {
  id: string;
  codigo: string;
  nome: string;
  creditos: number;
}


const mockDisciplinas: Disciplina[] = [
  { id: "1", codigo: "CC001", nome: "Algoritmos e Estruturas de Dados", creditos: 4 },
  { id: "2", codigo: "CC002", nome: "Programação Orientada a Objetos", creditos: 4 },
  { id: "3", codigo: "CC003", nome: "Banco de Dados", creditos: 4 },
  { id: "4", codigo: "CC004", nome: "Engenharia de Software", creditos: 4 },
  { id: "5", codigo: "CC005", nome: "Redes de Computadores", creditos: 4 },
  { id: "6", codigo: "CC006", nome: "Sistemas Operacionais", creditos: 4 },
  { id: "7", codigo: "CC007", nome: "Inteligência Artificial", creditos: 4 },
  { id: "8", codigo: "CC008", nome: "Compiladores", creditos: 4 },
  { id: "9", codigo: "CC009", nome: "Computação Gráfica", creditos: 4 },
  { id: "10", codigo: "CC010", nome: "Segurança da Informação", creditos: 4 },
  { id: "11", codigo: "CC011", nome: "Interação Humano-Computador", creditos: 3 },
  { id: "12", codigo: "CC012", nome: "Mineração de Dados", creditos: 4 },
  { id: "13", codigo: "CC013", nome: "Sistemas Distribuídos", creditos: 4 },
  { id: "14", codigo: "CC014", nome: "Arquitetura de Computadores", creditos: 4 },
  { id: "15", codigo: "CC015", nome: "Teoria da Computação", creditos: 4 },
  { id: "16", codigo: "CC016", nome: "Métodos Numéricos", creditos: 3 },
  { id: "17", codigo: "CC017", nome: "Processamento de Imagens", creditos: 4 },
  { id: "18", codigo: "CC018", nome: "Robótica", creditos: 4 },
  { id: "19", codigo: "CC019", nome: "Computação Móvel", creditos: 3 },
  { id: "20", codigo: "CC020", nome: "Blockchain e Criptomoedas", creditos: 3 }
];

const Disciplinas = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>(mockDisciplinas);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const filteredDisciplinas = disciplinas.filter(disciplina =>
    disciplina.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disciplina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    disciplina.creditos.toString().includes(searchTerm)
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredDisciplinas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDisciplinas = filteredDisciplinas.slice(startIndex, endIndex);

  const handleDelete = (id: string) => {
    setDisciplinas(prev => prev.filter(d => d.id !== id));
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
        
        {/* Main Content */}
        <div className="p-6 bg-background">
          <div className="max-w-7xl mx-auto space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gerenciamento de Disciplinas</CardTitle>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          Nova Disciplina
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Nova Disciplina</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input placeholder="Código da disciplina" />
                          <Input placeholder="Nome da disciplina" />
                          <Input placeholder="Número de créditos" type="number" />
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancelar</Button>
                            <Button>Salvar</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title="Recuperar disciplinas excluídas"
                      onClick={() => navigate("/disciplinas-excluidas")}
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
                          <TableHead className="font-bold text-foreground">Código</TableHead>
                          <TableHead className="font-bold text-foreground">Nome</TableHead>
                          <TableHead className="font-bold text-foreground">Créditos</TableHead>
                          <TableHead className="w-12 font-bold text-foreground">Edt</TableHead>
                          <TableHead className="w-12 font-bold text-foreground">Exc</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentDisciplinas.map((disciplina) => (
                          <TableRow key={disciplina.id}>
                            <TableCell className="font-medium">{disciplina.codigo}</TableCell>
                            <TableCell>{disciplina.nome}</TableCell>
                            <TableCell>{disciplina.creditos}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Editar Disciplina</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Input defaultValue={disciplina.codigo} placeholder="Código da disciplina" />
                                    <Input defaultValue={disciplina.nome} placeholder="Nome da disciplina" />
                                    <Input defaultValue={disciplina.creditos.toString()} placeholder="Número de créditos" type="number" />
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline">Cancelar</Button>
                                      <Button>Salvar</Button>
                                    </div>
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
                                      Tem certeza que deseja excluir a disciplina "{disciplina.nome}"? Esta ação pode ser desfeita na recuperação de disciplinas excluídas.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(disciplina.id)}>
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                        {currentDisciplinas.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              {searchTerm ? "Nenhuma disciplina encontrada" : "Nenhum registro para exibir"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* DataTable Controls - Bottom */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {currentDisciplinas.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredDisciplinas.length)} de {filteredDisciplinas.length} registros
                      {searchTerm && ` (filtrados de ${disciplinas.length} registros totais)`}
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

export default Disciplinas;