import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStudentEventParticipations,
  addStudentEventParticipation,
  removeStudentEventParticipation,
  getAvailableEvents,
  type StudentEventParticipation,
  type AvailableEvent,
  type AddStudentEventParticipationRequest,
} from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const EventsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState("");
  const [eventSelectOpen, setEventSelectOpen] = useState(false);
  const [formData, setFormData] = useState({
    event_id: "",
    title: "",
    name: "",
    location: "",
    year: new Date().getFullYear(),
    type: "" as "" | "Conferência" | "Simpósio" | "Workshop" | "Congresso"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const eventDropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target as Node)) {
        setEventSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load participations data
  const { data: participations = [], isLoading: isLoadingParticipations } = useQuery({
    queryKey: ['student-event-participations'],
    queryFn: getStudentEventParticipations,
  });

  // Load available events
  const { data: availableEvents = [] } = useQuery({
    queryKey: ['available-events'],
    queryFn: getAvailableEvents,
  });

  const tiposTrabalho = [
    { id: "Conferência", nome: "Conferência" },
    { id: "Simpósio", nome: "Simpósio" },
    { id: "Workshop", nome: "Workshop" },
    { id: "Congresso", nome: "Congresso" }
  ];

  // Mutations
  const addParticipationMutation = useMutation({
    mutationFn: (data: AddStudentEventParticipationRequest) => addStudentEventParticipation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-event-participations'] });
      setFormData({
        event_id: "",
        title: "",
        name: "",
        location: "",
        year: new Date().getFullYear(),
        type: ""
      });
      setEventSearch("");
      setIsModalOpen(false);
      toast({
        title: "Sucesso",
        description: "Participação adicionada com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Falha ao adicionar participação",
        variant: "destructive"
      });
    }
  });

  const removeParticipationMutation = useMutation({
    mutationFn: (id: number) => removeStudentEventParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-event-participations'] });
      toast({
        title: "Sucesso",
        description: "Participação removida com sucesso"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Falha ao remover participação",
        variant: "destructive"
      });
    }
  });

  const handleEventoChange = (eventoId: string) => {
    const eventoSelecionado = availableEvents.find(e => e.id.toString() === eventoId);
    setFormData(prev => ({
      ...prev,
      event_id: eventoId,
      name: eventoSelecionado?.nome || ""
    }));
  };

  const handleAddParticipacao = async () => {
    if (!formData.event_id || !formData.title || !formData.name || !formData.location || !formData.year || !formData.type) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    addParticipationMutation.mutate({
      event_id: parseInt(formData.event_id),
      title: formData.title,
      name: formData.name,
      location: formData.location,
      year: formData.year,
      type: formData.type as "Conferência" | "Simpósio" | "Workshop" | "Congresso",
    });
  };

  const handleRemoveParticipacao = (id: number) => {
    removeParticipationMutation.mutate(id);
  };

  const getTipoTrabalhoColor = (tipo: string) => {
    switch (tipo) {
      case "Conferência":
        return "bg-primary/10 text-primary border-primary/20";
      case "Simpósio":
        return "bg-secondary/10 text-secondary-foreground border-secondary/20";
      case "Workshop":
        return "bg-success/10 text-success border-success/20";
      case "Congresso":
        return "bg-warning/10 text-warning border-warning/20";
      default:
        return "bg-muted/10 text-muted-foreground border-border";
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Calendar className="w-5 h-5 text-primary" />
          Participação em Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Participação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Participação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Evento</label>
                  <div className="relative" ref={eventDropdownRef}>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Digite para buscar ou clique para ver todos..."
                        value={
                          formData.event_id && availableEvents
                            ? availableEvents.find(e => e.id.toString() === formData.event_id)?.nome || eventSearch
                            : eventSearch
                        }
                        onChange={(e) => {
                          setEventSearch(e.target.value);
                          setFormData(prev => ({ ...prev, event_id: "" })); // Limpar seleção quando digitar
                          setEventSelectOpen(true);
                        }}
                        onFocus={() => setEventSelectOpen(true)}
                        className="w-full"
                      />
                      <button
                        type="button"
                        onClick={() => setEventSelectOpen(!eventSelectOpen)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>

                    {eventSelectOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {availableEvents
                          ?.filter((event) =>
                            eventSearch === "" ||
                            event.nome.toLowerCase().includes(eventSearch.toLowerCase()) ||
                            event.alias?.toLowerCase().includes(eventSearch.toLowerCase()) ||
                            event.tipo?.toLowerCase().includes(eventSearch.toLowerCase())
                          )
                          ?.map((event) => (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, event_id: event.id.toString() }));
                                setEventSearch(event.nome);
                                setEventSelectOpen(false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-sm">
                                {event.alias} - {event.nome} {event.tipo && <span className="text-blue-600">({event.tipo})</span>}
                              </div>
                            </button>
                          )) || (
                          <div className="px-3 py-2 text-gray-500 text-sm">Carregando eventos...</div>
                        )}

                        {availableEvents && availableEvents.length > 0 && eventSearch !== "" &&
                         availableEvents.filter((event) =>
                           event.nome.toLowerCase().includes(eventSearch.toLowerCase()) ||
                           event.alias?.toLowerCase().includes(eventSearch.toLowerCase()) ||
                           event.tipo?.toLowerCase().includes(eventSearch.toLowerCase())
                         ).length === 0 && (
                          <div className="px-3 py-2 text-gray-500 text-sm">Nenhum evento encontrado para "{eventSearch}"</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Evento</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo do evento"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Título do Trabalho</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Digite o título do trabalho apresentado"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Local</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Cidade, Estado/País"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ano</label>
                    <Input
                      type="number"
                      value={formData.year.toString()}
                      onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                      min="2000"
                      max="2030"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo de Trabalho</label>
                  <div className="grid grid-cols-2 gap-2">
                    {tiposTrabalho.map((tipo) => (
                      <Button
                        key={tipo.id}
                        variant={formData.type === tipo.id ? "default" : "outline"}
                        onClick={() => setFormData(prev => ({ ...prev, type: tipo.id as "Conferência" | "Simpósio" | "Workshop" | "Congresso" }))}
                        className="justify-start"
                      >
                        {tipo.nome}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleAddParticipacao} disabled={addParticipationMutation.isPending} className="flex-1">
                    {addParticipationMutation.isPending ? "Salvando..." : "Salvar"}
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
                <TableHead>Evento</TableHead>
                <TableHead>Título do Trabalho</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingParticipations ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando participações...
                  </TableCell>
                </TableRow>
              ) : participations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma participação encontrada. Adicione sua primeira participação!
                  </TableCell>
                </TableRow>
              ) : (
                participations.map((participation) => (
                  <TableRow key={participation.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{participation.event_alias}</div>
                        <div className="text-xs text-muted-foreground max-w-xs" title={participation.name}>
                          {truncateText(participation.name, 40)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <span title={participation.title}>
                        {truncateText(participation.title, 50)}
                      </span>
                    </TableCell>
                    <TableCell>{participation.location}</TableCell>
                    <TableCell>{participation.year}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTipoTrabalhoColor(participation.type)}`}>
                        {participation.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
                            disabled={removeParticipationMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a participação "{participation.title}" do evento {participation.event_alias}? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveParticipacao(participation.id)}>
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