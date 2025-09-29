import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2, FileDown, ThumbsUp, ThumbsDown } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStudentPublications,
  addStudentPublication,
  updateStudentPublication,
  removeStudentPublication,
  getAvailableJournals,
  type StudentPublication,
  type AvailableJournal,
  type AddStudentPublicationRequest,
  type UpdateStudentPublicationRequest,
} from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const ProductionsSection = () => {
  const [selectedPublications, setSelectedPublications] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<{ id: number; field: 'approval_date' | 'publication_date' } | null>(null);
  const [tempDateValue, setTempDateValue] = useState("");
  const [journalSearch, setJournalSearch] = useState("");
  const [journalSelectOpen, setJournalSelectOpen] = useState(false);
  const [formData, setFormData] = useState({
    journal_id: "",
    title: "",
    submission_date: new Date().toISOString().split('T')[0]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const journalDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (journalDropdownRef.current && !journalDropdownRef.current.contains(event.target as Node)) {
        setJournalSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load publications data
  const { data: publications = [], isLoading: isLoadingPublications } = useQuery({
    queryKey: ['student-publications'],
    queryFn: getStudentPublications,
  });

  // Load available journals
  const { data: availableJournals = [] } = useQuery({
    queryKey: ['available-journals'],
    queryFn: getAvailableJournals,
  });

  // Mutations
  const addPublicationMutation = useMutation({
    mutationFn: (data: AddStudentPublicationRequest) => addStudentPublication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-publications'] });
      setFormData({
        journal_id: "",
        title: "",
        submission_date: new Date().toISOString().split('T')[0]
      });
      setIsModalOpen(false);
      toast({
        title: "Sucesso",
        description: "Publicação adicionada com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Falha ao adicionar publicação",
        variant: "destructive"
      });
    }
  });

  const updatePublicationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStudentPublicationRequest }) =>
      updateStudentPublication(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-publications'] });
      toast({
        title: "Sucesso",
        description: "Data atualizada automaticamente"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Falha ao atualizar publicação",
        variant: "destructive"
      });
    }
  });

  const removePublicationMutation = useMutation({
    mutationFn: (id: number) => removeStudentPublication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-publications'] });
      setSelectedPublications(prev => prev.filter(pid => pid !== id));
      toast({
        title: "Sucesso",
        description: "Publicação removida com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Falha ao remover publicação",
        variant: "destructive"
      });
    }
  });

  const handleAddPublication = async () => {
    if (!formData.journal_id || !formData.title || !formData.submission_date) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    addPublicationMutation.mutate({
      journal_id: parseInt(formData.journal_id),
      title: formData.title,
      submission_date: formData.submission_date,
    });
  };

  const handleRemovePublication = (id: number) => {
    removePublicationMutation.mutate(id);
  };

  const handleSelectPublication = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedPublications(prev => [...prev, id]);
    } else {
      setSelectedPublications(prev => prev.filter(pid => pid !== id));
    }
  };

  const handleGeneratePDF = () => {
    if (selectedPublications.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos uma publicação para gerar o PDF",
        variant: "destructive"
      });
      return;
    }

    // TODO: Implementar geração de PDF real
    toast({
      title: "PDF Gerado",
      description: `PDF gerado com ${selectedPublications.length} publicação(ões)`
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const parseDate = (dateString: string) => {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const validateDate = (publicationId: number, field: 'approval_date' | 'publication_date', value: string) => {
    const publication = publications.find(p => p.id === publicationId);
    if (!publication) return { isValid: false, message: 'Publicação não encontrada' };

    const submissionDate = new Date(publication.submission_date);
    const inputDate = new Date(value);

    if (field === 'approval_date') {
      if (inputDate < submissionDate) {
        return { isValid: false, message: 'Data de aprovação deve ser posterior à data de submissão' };
      }
      if (publication.publication_date && inputDate > new Date(publication.publication_date)) {
        return { isValid: false, message: 'Data de aprovação deve ser anterior ou igual à data de publicação' };
      }
    }

    if (field === 'publication_date') {
      if (inputDate < submissionDate) {
        return { isValid: false, message: 'Data de publicação deve ser posterior à data de submissão' };
      }
      if (publication.approval_date && inputDate < new Date(publication.approval_date)) {
        return { isValid: false, message: 'Data de publicação deve ser posterior ou igual à data de aprovação' };
      }
    }

    return { isValid: true, message: '' };
  };

  const handleDateEdit = (id: number, field: 'approval_date' | 'publication_date', value: string) => {
    const validation = validateDate(id, field, value);

    if (!validation.isValid) {
      toast({
        title: "Erro de validação",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }

    updatePublicationMutation.mutate({
      id,
      data: { [field]: value || null }
    });
  };

  const startDateEdit = (id: number, field: 'approval_date' | 'publication_date', currentValue: string | null) => {
    setEditingDate({ id, field });
    setTempDateValue(currentValue || '');
  };

  const saveDateEdit = () => {
    if (editingDate && tempDateValue) {
      handleDateEdit(editingDate.id, editingDate.field, tempDateValue);
    }
    cancelDateEdit();
  };

  const cancelDateEdit = () => {
    setEditingDate(null);
    setTempDateValue('');
  };

  const getStatusBadge = (status: 'S' | 'A' | 'P' | 'E' | 'D' | 'I') => {
    switch (status) {
      case 'S':
        return (
          <span
            className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-blue-600 bg-blue-100 rounded-full cursor-help"
            title="Submetido - Artigo foi submetido ao periódico"
          >
            S
          </span>
        );
      case 'A':
        return (
          <span
            className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full cursor-help"
            title="Aprovado - Artigo foi aprovado para publicação"
          >
            A
          </span>
        );
      case 'P':
        return (
          <span
            className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-green-600 bg-green-100 rounded-full cursor-help"
            title="Publicado - Artigo foi publicado no periódico"
          >
            P
          </span>
        );
      case 'E':
        return (
          <span
            className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-purple-600 bg-purple-100 rounded-full cursor-help"
            title="Enviado - Artigo foi enviado para avaliação"
          >
            E
          </span>
        );
      case 'D':
        return (
          <ThumbsUp
            className="w-5 h-5 text-green-600 cursor-help"
            title="Deferido pelo colegiado - Artigo foi aprovado pelo colegiado"
          />
        );
      case 'I':
        return (
          <ThumbsDown
            className="w-5 h-5 text-red-600 cursor-help"
            title="Indeferido pelo colegiado - Artigo foi rejeitado pelo colegiado"
          />
        );
      default:
        return null;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const canSelectPublication = (publication: StudentPublication) => {
    return publication.can_select_for_pdf;
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="w-5 h-5 text-primary" />
          Produções em Periódicos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGeneratePDF}
            className="gap-2"
            disabled={selectedPublications.length === 0}
          >
            <FileDown className="w-4 h-4" />
            PDF ({selectedPublications.length})
          </Button>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Produção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Produção</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Periódico</label>
                  <div className="relative" ref={journalDropdownRef}>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Digite para buscar ou clique para ver todos..."
                        value={
                          formData.journal_id && availableJournals
                            ? availableJournals.find(j => j.id.toString() === formData.journal_id)?.name || journalSearch
                            : journalSearch
                        }
                        onChange={(e) => {
                          setJournalSearch(e.target.value);
                          setFormData(prev => ({ ...prev, journal_id: "" })); // Limpar seleção quando digitar
                          setJournalSelectOpen(true);
                        }}
                        onFocus={() => setJournalSelectOpen(true)}
                        className="w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setJournalSelectOpen(!journalSelectOpen)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {journalSelectOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {availableJournals
                          ?.filter((journal) =>
                            journalSearch === "" ||
                            journal.name.toLowerCase().includes(journalSearch.toLowerCase()) ||
                            journal.qualis?.toLowerCase().includes(journalSearch.toLowerCase())
                          )
                          ?.map((journal) => (
                            <button
                              key={journal.id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, journal_id: journal.id.toString() }));
                                setJournalSearch(journal.name);
                                setJournalSelectOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-sm">
                                {journal.name} {journal.qualis && <span className="text-blue-600">({journal.qualis})</span>}
                              </div>
                            </button>
                          )) || (
                          <div className="px-3 py-2 text-gray-500 text-sm">Carregando periódicos...</div>
                        )}

                        {availableJournals && availableJournals.length > 0 && journalSearch !== "" &&
                         availableJournals.filter((journal) =>
                           journal.name.toLowerCase().includes(journalSearch.toLowerCase()) ||
                           journal.qualis?.toLowerCase().includes(journalSearch.toLowerCase())
                         ).length === 0 && (
                          <div className="px-3 py-2 text-gray-500 text-sm">Nenhum periódico encontrado para "{journalSearch}"</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Título da Publicação</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Digite o título da publicação"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Submissão</label>
                  <Input
                    type="date"
                    value={formData.submission_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, submission_date: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleAddPublication} disabled={addPublicationMutation.isPending} className="flex-1">
                    {addPublicationMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Periódico</TableHead>
                <TableHead>Submissão</TableHead>
                <TableHead>Aprovação</TableHead>
                <TableHead>Publicação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingPublications ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Carregando publicações...
                  </TableCell>
                </TableRow>
              ) : publications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhuma publicação encontrada. Adicione sua primeira publicação!
                  </TableCell>
                </TableRow>
              ) : (
                publications.map((publication) => (
                  <TableRow key={publication.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canSelectPublication(publication) && (
                          <Checkbox
                            checked={selectedPublications.includes(publication.id)}
                            onCheckedChange={(checked) => handleSelectPublication(publication.id, checked as boolean)}
                          />
                        )}
                        {getStatusBadge(publication.status)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs">
                      <span title={publication.title}>
                        {truncateText(publication.title, 50)}
                      </span>
                    </TableCell>
                    <TableCell>{publication.journal}</TableCell>
                    <TableCell>
                      <span className="text-sm">{formatDate(publication.submission_date)}</span>
                    </TableCell>
                    <TableCell>
                      {editingDate?.id === publication.id && editingDate?.field === 'approval_date' ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={tempDateValue}
                            onChange={(e) => setTempDateValue(e.target.value)}
                            className="w-auto"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveDateEdit();
                              if (e.key === 'Escape') cancelDateEdit();
                            }}
                            autoFocus
                          />
                          <Button size="sm" onClick={saveDateEdit} disabled={updatePublicationMutation.isPending}>Salvar</Button>
                          <Button size="sm" variant="outline" onClick={cancelDateEdit}>Cancelar</Button>
                        </div>
                      ) : publication.approval_date ? (
                        <span className="text-sm">{formatDate(publication.approval_date)}</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startDateEdit(publication.id, 'approval_date', null)}
                          disabled={updatePublicationMutation.isPending}
                          className="text-xs"
                        >
                          Adicionar data
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {/* Só mostrar campo de publicação se já tem aprovação */}
                      {publication.approval_date ? (
                        editingDate?.id === publication.id && editingDate?.field === 'publication_date' ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="date"
                              value={tempDateValue}
                              onChange={(e) => setTempDateValue(e.target.value)}
                              className="w-auto"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveDateEdit();
                                if (e.key === 'Escape') cancelDateEdit();
                              }}
                              autoFocus
                            />
                            <Button size="sm" onClick={saveDateEdit} disabled={updatePublicationMutation.isPending}>Salvar</Button>
                            <Button size="sm" variant="outline" onClick={cancelDateEdit}>Cancelar</Button>
                          </div>
                        ) : publication.publication_date ? (
                          <span className="text-sm">{formatDate(publication.publication_date)}</span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startDateEdit(publication.id, 'publication_date', null)}
                            disabled={updatePublicationMutation.isPending}
                            className="text-xs"
                          >
                            Adicionar data
                          </Button>
                        )
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
                            disabled={removePublicationMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a publicação "{publication.title}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemovePublication(publication.id)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};