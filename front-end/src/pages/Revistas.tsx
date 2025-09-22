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

interface Revista {
  id: string;
  nome: string;
  instituicao: string;
  quali: string;
  issn: string;
  tipo: string;
}

const mockRevistas: Revista[] = [
  { id: "1", nome: "Journal of Computer Science", instituicao: "IEEE", quali: "A1", issn: "1234-5678", tipo: "Internacional" },
  { id: "2", nome: "Revista Brasileira de Informática", instituicao: "SBC", quali: "B1", issn: "2345-6789", tipo: "Nacional" },
  { id: "3", nome: "ACM Computing Surveys", instituicao: "ACM", quali: "A1", issn: "3456-7890", tipo: "Internacional" },
  { id: "4", nome: "Journal of Software Engineering", instituicao: "Elsevier", quali: "A2", issn: "4567-8901", tipo: "Internacional" },
  { id: "5", nome: "Revista de Engenharia de Software", instituicao: "UFRJ", quali: "B2", issn: "5678-9012", tipo: "Nacional" },
  { id: "6", nome: "Data Mining and Knowledge Discovery", instituicao: "Springer", quali: "A1", issn: "6789-0123", tipo: "Internacional" },
  { id: "7", nome: "Journal of Artificial Intelligence", instituicao: "MIT Press", quali: "A1", issn: "7890-1234", tipo: "Internacional" },
  { id: "8", nome: "Revista Brasileira de Redes", instituicao: "USP", quali: "B1", issn: "8901-2345", tipo: "Nacional" },
  { id: "9", nome: "Computer Networks", instituicao: "Elsevier", quali: "A2", issn: "9012-3456", tipo: "Internacional" },
  { id: "10", nome: "Revista de Computação Gráfica", instituicao: "UNICAMP", quali: "B2", issn: "0123-4567", tipo: "Nacional" },
  { id: "11", nome: "IEEE Transactions on Software Engineering", instituicao: "IEEE", quali: "A1", issn: "1357-2468", tipo: "Internacional" },
  { id: "12", nome: "Information Systems", instituicao: "Pergamon", quali: "A2", issn: "2468-1357", tipo: "Internacional" },
  { id: "13", nome: "Journal of Database Management", instituicao: "IGI Global", quali: "B1", issn: "3579-0246", tipo: "Internacional" },
  { id: "14", nome: "Revista Brasileira de Sistemas", instituicao: "UFMG", quali: "B1", issn: "4680-1357", tipo: "Nacional" },
  { id: "15", nome: "Expert Systems with Applications", instituicao: "Elsevier", quali: "A2", issn: "5791-2468", tipo: "Internacional" },
  { id: "16", nome: "Revista de Inteligência Artificial", instituicao: "PUC-Rio", quali: "B2", issn: "6802-3579", tipo: "Nacional" },
  { id: "17", nome: "Pattern Recognition", instituicao: "Pergamon", quali: "A1", issn: "7913-4680", tipo: "Internacional" },
  { id: "18", nome: "Computers & Graphics", instituicao: "Pergamon", quali: "A2", issn: "8024-5791", tipo: "Internacional" },
  { id: "19", nome: "Revista de Segurança da Informação", instituicao: "UFRGS", quali: "B1", issn: "9135-6802", tipo: "Nacional" },
  { id: "20", nome: "International Journal of Human-Computer Studies", instituicao: "Academic Press", quali: "A2", issn: "0246-7913", tipo: "Internacional" }
];

const Revistas = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [revistas, setRevistas] = useState<Revista[]>(mockRevistas);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const filteredRevistas = revistas.filter(revista =>
    revista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    revista.instituicao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    revista.quali.toLowerCase().includes(searchTerm.toLowerCase()) ||
    revista.issn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    revista.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredRevistas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRevistas = filteredRevistas.slice(startIndex, endIndex);

  const handleDelete = (id: string) => {
    setRevistas(prev => prev.filter(r => r.id !== id));
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
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Gerenciamento de Revistas</CardTitle>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          Nova Revista
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Nova Revista</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input placeholder="Nome da revista" />
                          <Input placeholder="Instituição" />
                          <Input placeholder="Quali (A1, A2, B1, B2, etc.)" />
                          <Input placeholder="ISSN" />
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo da revista" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Nacional">Nacional</SelectItem>
                              <SelectItem value="Internacional">Internacional</SelectItem>
                            </SelectContent>
                          </Select>
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
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Editar Revista</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <Input defaultValue={revista.nome} placeholder="Nome da revista" />
                                    <Input defaultValue={revista.instituicao} placeholder="Instituição" />
                                    <Input defaultValue={revista.quali} placeholder="Quali (A1, A2, B1, B2, etc.)" />
                                    <Input defaultValue={revista.issn} placeholder="ISSN" />
                                    <Select defaultValue={revista.tipo}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Tipo da revista" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Nacional">Nacional</SelectItem>
                                        <SelectItem value="Internacional">Internacional</SelectItem>
                                      </SelectContent>
                                    </Select>
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
