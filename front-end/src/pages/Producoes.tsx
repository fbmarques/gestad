import { useState } from "react";
import AdminTopNav from "@/components/AdminTopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Producao {
  id: string;
  titulo: string;
  discente: string;
  docente: string;
  periodico: string;
  qualis: string;
  dataPublicacao: string;
}

const mockProducoes: Producao[] = [
  { id: "1", titulo: "Machine Learning Applications in Software Engineering", discente: "João Silva", docente: "Dr. Maria Santos", periodico: "IEEE Software", qualis: "A1", dataPublicacao: "2024-03-15" },
  { id: "2", titulo: "Análise de Redes Sociais usando Mineração de Dados", discente: "Ana Costa", docente: "Dr. Pedro Lima", periodico: "Revista Brasileira de Informática", qualis: "B1", dataPublicacao: "2024-02-20" },
  { id: "3", titulo: "Deep Learning for Image Recognition Systems", discente: "Carlos Oliveira", docente: "Dra. Julia Fernandes", periodico: "Computer Vision Journal", qualis: "A2", dataPublicacao: "2024-01-10" },
  { id: "4", titulo: "Segurança em Sistemas Distribuídos", discente: "Marina Rodrigues", docente: "Dr. Roberto Alves", periodico: "Security & Privacy", qualis: "A1", dataPublicacao: "2024-04-05" },
  { id: "5", titulo: "Blockchain Technology in Healthcare", discente: "Felipe Santos", docente: "Dra. Ana Carolina", periodico: "Health Informatics", qualis: "B2", dataPublicacao: "2024-03-28" },
  { id: "6", titulo: "Algoritmos Genéticos para Otimização", discente: "Lucia Fernandes", docente: "Dr. Carlos Eduardo", periodico: "Evolutionary Computation", qualis: "A2", dataPublicacao: "2024-02-14" },
  { id: "7", titulo: "Internet das Coisas em Smart Cities", discente: "Rafael Pereira", docente: "Dra. Mariana Costa", periodico: "IoT Journal", qualis: "B1", dataPublicacao: "2024-01-22" },
  { id: "8", titulo: "Natural Language Processing Techniques", discente: "Camila Souza", docente: "Dr. Paulo Ricardo", periodico: "Computational Linguistics", qualis: "A1", dataPublicacao: "2024-04-12" },
  { id: "9", titulo: "Realidade Virtual em Educação", discente: "Bruno Lima", docente: "Dra. Sandra Melo", periodico: "Educational Technology", qualis: "B2", dataPublicacao: "2024-03-03" },
  { id: "10", titulo: "Cloud Computing Security Models", discente: "Isabela Martins", docente: "Dr. Fernando Silva", periodico: "Cloud Computing Review", qualis: "A2", dataPublicacao: "2024-02-08" },
  { id: "11", titulo: "Bioinformática Aplicada à Genômica", discente: "Thiago Barbosa", docente: "Dra. Patrícia Rocha", periodico: "Bioinformatics Journal", qualis: "A1", dataPublicacao: "2024-01-18" },
  { id: "12", titulo: "Sistemas Embarcados para Robótica", discente: "Natália Gomes", docente: "Dr. Marcos Vieira", periodico: "Robotics & Automation", qualis: "B1", dataPublicacao: "2024-04-01" },
  { id: "13", titulo: "Quantum Computing Algorithms", discente: "Gustavo Almeida", docente: "Dra. Carla Nascimento", periodico: "Quantum Information", qualis: "A1", dataPublicacao: "2024-03-20" },
  { id: "14", titulo: "Análise de Big Data em Tempo Real", discente: "Larissa Castro", docente: "Dr. André Campos", periodico: "Big Data Analytics", qualis: "A2", dataPublicacao: "2024-02-25" },
  { id: "15", titulo: "Jogos Digitais e Aprendizagem", discente: "Diego Ribeiro", docente: "Dra. Mônica Teixeira", periodico: "Games & Learning", qualis: "B2", dataPublicacao: "2024-01-30" },
  { id: "16", titulo: "Modelagem de Sistemas Complexos", discente: "Amanda Cardoso", docente: "Dr. Sérgio Monteiro", periodico: "Complex Systems", qualis: "B1", dataPublicacao: "2024-04-08" },
  { id: "17", titulo: "Redes Neurais Convolucionais", discente: "Leandro Moreira", docente: "Dra. Beatriz Cunha", periodico: "Neural Networks", qualis: "A1", dataPublicacao: "2024-03-12" },
  { id: "18", titulo: "Processamento de Sinais Digitais", discente: "Priscila Dias", docente: "Dr. Rodrigo Nunes", periodico: "Signal Processing", qualis: "A2", dataPublicacao: "2024-02-18" },
  { id: "19", titulo: "Computação Paralela e Distribuída", discente: "Mateus Freitas", docente: "Dra. Renata Lopes", periodico: "Parallel Computing", qualis: "A1", dataPublicacao: "2024-01-25" },
  { id: "20", titulo: "Interfaces Naturais de Usuário", discente: "Vanessa Torres", docente: "Dr. Fábio Correia", periodico: "HCI International", qualis: "B1", dataPublicacao: "2024-04-15" }
];

const Producoes = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [producoes, setProducoes] = useState<Producao[]>(mockProducoes);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const filteredProducoes = producoes.filter(producao =>
    producao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producao.discente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producao.docente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producao.periodico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producao.qualis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducoes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducoes = filteredProducoes.slice(startIndex, endIndex);

  const handleApprove = (id: string) => {
    console.log("Aprovado:", id);
    // Aqui seria implementada a lógica de aprovação
  };

  const handleReject = (id: string) => {
    console.log("Rejeitado:", id);
    // Aqui seria implementada a lógica de rejeição
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Aprovação de Produções</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/producoes-status')}>
                  Situação
                </Button>
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
                          <TableHead className="font-bold text-foreground">Título</TableHead>
                          <TableHead className="font-bold text-foreground">Discente</TableHead>
                          <TableHead className="font-bold text-foreground">Docente</TableHead>
                          <TableHead className="font-bold text-foreground">Periódico</TableHead>
                          <TableHead className="font-bold text-foreground">Qualis</TableHead>
                          <TableHead className="font-bold text-foreground">Data Publicação</TableHead>
                          <TableHead className="w-24 font-bold text-foreground">Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentProducoes.map((producao) => (
                          <TableRow key={producao.id}>
                            <TableCell className="font-medium">{producao.titulo}</TableCell>
                            <TableCell>{producao.discente}</TableCell>
                            <TableCell>{producao.docente}</TableCell>
                            <TableCell>{producao.periodico}</TableCell>
                            <TableCell>{producao.qualis}</TableCell>
                            <TableCell>{new Date(producao.dataPublicacao).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="bg-green-500 border-green-500 text-white hover:bg-green-600 hover:border-green-600"
                                      onClick={() => handleApprove(producao.id)}
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Deferido</p>
                                  </TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
                                      onClick={() => handleReject(producao.id)}
                                    >
                                      <ThumbsDown className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Indeferido</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {currentProducoes.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              {searchTerm ? "Nenhuma produção encontrada" : "Nenhum registro para exibir"}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* DataTable Controls - Bottom */}
                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {currentProducoes.length > 0 ? startIndex + 1 : 0} a {Math.min(endIndex, filteredProducoes.length)} de {filteredProducoes.length} registros
                      {searchTerm && ` (filtrados de ${producoes.length} registros totais)`}
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

export default Producoes;