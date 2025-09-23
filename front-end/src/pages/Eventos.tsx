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

interface Evento {
  id: string;
  nome: string;
  alias: string;
  tipo: string;
  natureza: string;
}

const mockEventos: Evento[] = [
  { id: "1", nome: "International Conference on Software Engineering", alias: "ICSE", tipo: "Conferência", natureza: "Internacional" },
  { id: "2", nome: "Simpósio Brasileiro de Engenharia de Software", alias: "SBES", tipo: "Simpósio", natureza: "Nacional" },
  { id: "3", nome: "ACM SIGMOD International Conference", alias: "SIGMOD", tipo: "Conferência", natureza: "Internacional" },
  { id: "4", nome: "Workshop de Teses e Dissertações", alias: "WTD", tipo: "Workshop", natureza: "Nacional" },
  { id: "5", nome: "International Conference on Machine Learning", alias: "ICML", tipo: "Conferência", natureza: "Internacional" },
  { id: "6", nome: "Congresso da Sociedade Brasileira de Computação", alias: "CSBC", tipo: "Congresso", natureza: "Nacional" },
  { id: "7", nome: "IEEE International Conference on Computer Vision", alias: "ICCV", tipo: "Conferência", natureza: "Internacional" },
  { id: "8", nome: "Simpósio Brasileiro de Redes de Computadores", alias: "SBRC", tipo: "Simpósio", natureza: "Nacional" },
  { id: "9", nome: "Conference on Neural Information Processing Systems", alias: "NeurIPS", tipo: "Conferência", natureza: "Internacional" },
  { id: "10", nome: "Workshop de Informática na Escola", alias: "WIE", tipo: "Workshop", natureza: "Nacional" },
  { id: "11", nome: "International World Wide Web Conference", alias: "WWW", tipo: "Conferência", natureza: "Internacional" },
  { id: "12", nome: "Simpósio Brasileiro de Banco de Dados", alias: "SBBD", tipo: "Simpósio", natureza: "Nacional" },
  { id: "13", nome: "ACM Conference on Human Factors in Computing", alias: "CHI", tipo: "Conferência", natureza: "Internacional" },
  { id: "14", nome: "Workshop de Computação Aplicada", alias: "WCA", tipo: "Workshop", natureza: "Nacional" },
  { id: "15", nome: "International Conference on Robotics and Automation", alias: "ICRA", tipo: "Conferência", natureza: "Internacional" },
  { id: "16", nome: "Simpósio Brasileiro de Segurança da Informação", alias: "SBSeg", tipo: "Simpósio", natureza: "Nacional" },
  { id: "17", nome: "European Conference on Computer Vision", alias: "ECCV", tipo: "Conferência", natureza: "Internacional" },
  { id: "18", nome: "Workshop de Tecnologia da Informação", alias: "WTI", tipo: "Workshop", natureza: "Nacional" },
  { id: "19", nome: "International Conference on Data Mining", alias: "ICDM", tipo: "Conferência", natureza: "Internacional" },
  { id: "20", nome: "Congresso Nacional de Matemática Aplicada", alias: "CNMAC", tipo: "Congresso", natureza: "Nacional" }
];

const Eventos = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventos, setEventos] = useState<Evento[]>(mockEventos);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const filteredEventos = eventos.filter(evento =>
    evento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.natureza.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredEventos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEventos = filteredEventos.slice(startIndex, endIndex);

  const handleDelete = (id: string) => {
    setEventos(prev => prev.filter(e => e.id !== id));
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
                  <CardTitle>Gerenciamento de Eventos</CardTitle>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="w-4 h-4" />
                          Novo Evento
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Novo Evento</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input placeholder="Nome do evento" />
                          <Input placeholder="Alias/Sigla" />
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Tipo do evento" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Conferência">Conferência</SelectItem>
                              <SelectItem value="Simpósio">Simpósio</SelectItem>
                              <SelectItem value="Workshop">Workshop</SelectItem>
                              <SelectItem value="Congresso">Congresso</SelectItem>
                            </SelectContent>
                          </Select>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Natureza do evento" />
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
                      title="Recuperar eventos excluídos"
                      onClick={() => navigate("/eventos-excluidos")}
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
                        <TableHead className="font-bold text-foreground">Alias</TableHead>
                        <TableHead className="font-bold text-foreground">Tipo</TableHead>
                        <TableHead className="font-bold text-foreground">Natureza</TableHead>
                        <TableHead className="w-12 font-bold text-foreground">Edt</TableHead>
                        <TableHead className="w-12 font-bold text-foreground">Exc</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentEventos.map((evento) => (
                        <TableRow key={evento.id}>
                          <TableCell className="font-medium">{evento.nome}</TableCell>
                          <TableCell>{evento.alias}</TableCell>
                          <TableCell>{evento.tipo}</TableCell>
                          <TableCell>{evento.natureza}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon" className="bg-amber-400 border-amber-400 text-white hover:bg-amber-500 hover:border-amber-500">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Evento</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <Input defaultValue={evento.nome} placeholder="Nome do evento" />
                                  <Input defaultValue={evento.alias} placeholder="Alias/Sigla" />
                                  <Select defaultValue={evento.tipo}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Tipo do evento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Conferência">Conferência</SelectItem>
                                      <SelectItem value="Simpósio">Simpósio</SelectItem>
                                      <SelectItem value="Workshop">Workshop</SelectItem>
                                      <SelectItem value="Congresso">Congresso</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select defaultValue={evento.natureza}>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Natureza do evento" />
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
                                    Tem certeza que deseja excluir o evento &quot;{evento.nome}&quot;? Esta ação pode ser desfeita na recuperação de eventos excluídos.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(evento.id)}>
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      {currentEventos.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            {searchTerm ? "Nenhum evento encontrado" : "Nenhum registro para exibir"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* DataTable Controls - Bottom */}
                <div className="flex justify-between items-center pt-4">
                  <div className="text-sm text-muted-foreground">
                    Mostrando {currentEventos.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredEventos.length)} de {filteredEventos.length} registros
                    {searchTerm && ` (filtrados de ${eventos.length} registros totais)`}
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

export default Eventos;
