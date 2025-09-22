import { useState } from "react";
import AdminTopNav from "@/components/AdminTopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, RotateCcw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DocenteExcluido {
  id: string;
  nome: string;
  email: string;
  linhaPesquisa: string;
  dataExclusao: string;
}

const mockDocentesExcluidos: DocenteExcluido[] = [
  { 
    id: "1", 
    nome: "Dr. João Silva Excluído", 
    email: "joao.excluido@email.com", 
    linhaPesquisa: "Inteligência Artificial",
    dataExclusao: "07/09/2025 08:15:30"
  },
  { 
    id: "2", 
    nome: "Dra. Maria Santos Excluída", 
    email: "maria.excluida@email.com", 
    linhaPesquisa: "Banco de Dados",
    dataExclusao: "06/09/2025 14:22:10"
  },
  { 
    id: "3", 
    nome: "Dr. Pedro Costa Excluído", 
    email: "pedro.excluido@email.com", 
    linhaPesquisa: "Redes de Computadores",
    dataExclusao: "05/09/2025 11:45:55"
  }
];

const DocentesExcluidos = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [docentes, setDocentes] = useState<DocenteExcluido[]>(mockDocentesExcluidos);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  const totalPages = Math.ceil(filteredDocentes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocentes = filteredDocentes.slice(startIndex, endIndex);

  const handleRecover = (id: string) => {
    setDocentes(prev => prev.filter(d => d.id !== id));
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
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate("/docentes")}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </Button>
                    <CardTitle>Docentes Excluídos</CardTitle>
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
                          <TableHead className="font-bold text-foreground">Data Exclusão</TableHead>
                          <TableHead className="w-12 font-bold text-foreground">Rec</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentDocentes.map((docente) => (
                          <TableRow key={docente.id}>
                            <TableCell className="font-medium">{docente.nome}</TableCell>
                            <TableCell>{docente.email}</TableCell>
                            <TableCell>{docente.linhaPesquisa}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {docente.dataExclusao}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600">
                                    <RotateCcw className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar recuperação</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja recuperar o docente &quot;{docente.nome}&quot;? 
                                      Este registro será restaurado e voltará a aparecer na lista principal.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRecover(docente.id)}>
                                      Recuperar
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
                              {searchTerm ? "Nenhum docente encontrado" : "Nenhum registro excluído"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
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
                            return page === 1 || 
                                   page === totalPages || 
                                   Math.abs(page - currentPage) <= 2;
                          })
                          .map((page, index, arr) => {
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

export default DocentesExcluidos;