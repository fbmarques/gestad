import { useState } from "react";
import AdminTopNav from "@/components/AdminTopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Agencia {
  id: string;
  apelido: string;
  nome: string;
}

const mockAgencias: Agencia[] = [
  { id: "1", apelido: "CNPq", nome: "Conselho Nacional de Desenvolvimento Científico e Tecnológico" },
  { id: "2", apelido: "CAPES", nome: "Coordenação de Aperfeiçoamento de Pessoal de Nível Superior" },
  { id: "3", apelido: "FAPESP", nome: "Fundação de Amparo à Pesquisa do Estado de São Paulo" },
  { id: "4", apelido: "FAPERJ", nome: "Fundação Carlos Chagas Filho de Amparo à Pesquisa do Estado do Rio de Janeiro" },
  { id: "5", apelido: "FAPEMIG", nome: "Fundação de Amparo à Pesquisa do Estado de Minas Gerais" },
  { id: "6", apelido: "FAPESB", nome: "Fundação de Amparo à Pesquisa do Estado da Bahia" },
  { id: "7", apelido: "FAPEAM", nome: "Fundação de Amparo à Pesquisa do Estado do Amazonas" },
  { id: "8", apelido: "FAPESC", nome: "Fundação de Amparo à Pesquisa e Inovação do Estado de Santa Catarina" },
  { id: "9", apelido: "FAPEG", nome: "Fundação de Amparo à Pesquisa do Estado de Goiás" },
  { id: "10", apelido: "FACEPE", nome: "Fundação de Amparo à Ciência e Tecnologia do Estado de Pernambuco" },
  { id: "11", apelido: "FUNCAP", nome: "Fundação Cearense de Apoio ao Desenvolvimento Científico e Tecnológico" },
  { id: "12", apelido: "FAPEAL", nome: "Fundação de Amparo à Pesquisa do Estado de Alagoas" },
  { id: "13", apelido: "FAPES", nome: "Fundação de Amparo à Pesquisa e Inovação do Espírito Santo" },
  { id: "14", apelido: "FAPDF", nome: "Fundação de Apoio à Pesquisa do Distrito Federal" },
  { id: "15", apelido: "FAPEPI", nome: "Fundação de Amparo à Pesquisa do Estado do Piauí" }
];

const Agencias = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [agencias, setAgencias] = useState<Agencia[]>(mockAgencias);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const filteredAgencias = agencias.filter(agencia =>
    agencia.apelido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agencia.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAgencias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAgencias = filteredAgencias.slice(startIndex, endIndex);

  const handleDelete = (id: string) => {
    setAgencias(prev => prev.filter(a => a.id !== id));
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          Nova Agência
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Nova Agência de Fomento</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input placeholder="Apelido da agência" />
                          <Input placeholder="Nome completo da agência" />
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
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Editar Agência</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Input defaultValue={agencia.apelido} placeholder="Apelido/Sigla" />
                                    <Input defaultValue={agencia.nome} placeholder="Nome completo da agência" />
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
                      {searchTerm && ` (filtrados de ${agencias.length} registros totais)`}
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
