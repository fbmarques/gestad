import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Participacao {
  id: string;
  evento: string;
  nomeEvento: string;
  tituloTrabalho: string;
  local: string;
  ano: number;
  tipoTrabalho: "artigo-completo" | "artigo-resumido" | "apresentacao-oral" | "poster";
}

export const EventsSection = () => {
  const [participacoes, setParticipacoes] = useState<Participacao[]>([
    {
      id: "1",
      evento: "SBRC",
      nomeEvento: "Simpósio Brasileiro de Redes de Computadores e Sistemas Distribuídos",
      tituloTrabalho: "Análise de Performance em Redes 5G",
      local: "São Paulo, SP",
      ano: 2024,
      tipoTrabalho: "artigo-completo"
    },
    {
      id: "2",
      evento: "SBES",
      nomeEvento: "Simpósio Brasileiro de Engenharia de Software",
      tituloTrabalho: "Metodologias Ágeis em Projetos de IA",
      local: "Fortaleza, CE",
      ano: 2023,
      tipoTrabalho: "apresentacao-oral"
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    evento: "",
    nomeEvento: "",
    tituloTrabalho: "",
    local: "",
    ano: new Date().getFullYear().toString(),
    tipoTrabalho: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Mock data
  const eventosDisponiveis = [
    { id: "1", sigla: "SBRC", nome: "Simpósio Brasileiro de Redes de Computadores e Sistemas Distribuídos" },
    { id: "2", sigla: "SBES", nome: "Simpósio Brasileiro de Engenharia de Software" },
    { id: "3", sigla: "SBBD", nome: "Simpósio Brasileiro de Banco de Dados" },
    { id: "4", sigla: "ICSE", nome: "International Conference on Software Engineering" }
  ];

  const tiposTrabalho = [
    { id: "artigo-completo", nome: "Artigo Completo" },
    { id: "artigo-resumido", nome: "Artigo Resumido" },
    { id: "apresentacao-oral", nome: "Apresentação Oral" },
    { id: "poster", nome: "Poster" }
  ];

  const handleEventoChange = (eventoId: string) => {
    const eventoSelecionado = eventosDisponiveis.find(e => e.id === eventoId);
    setFormData(prev => ({
      ...prev,
      evento: eventoId,
      nomeEvento: eventoSelecionado?.nome || ""
    }));
  };

  const handleAddParticipacao = async () => {
    if (!formData.evento || !formData.tituloTrabalho || !formData.local || !formData.ano || !formData.tipoTrabalho) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const eventoSelecionado = eventosDisponiveis.find(e => e.id === formData.evento);

      if (eventoSelecionado) {
        const novaParticipacao: Participacao = {
          id: Date.now().toString(),
          evento: eventoSelecionado.sigla,
          nomeEvento: formData.nomeEvento,
          tituloTrabalho: formData.tituloTrabalho,
          local: formData.local,
          ano: parseInt(formData.ano),
          tipoTrabalho: formData.tipoTrabalho as Participacao["tipoTrabalho"]
        };

        setParticipacoes(prev => [...prev, novaParticipacao]);
        setFormData({ 
          evento: "",
          nomeEvento: "",
          tituloTrabalho: "",
          local: "",
          ano: new Date().getFullYear().toString(),
          tipoTrabalho: ""
        });
        setIsModalOpen(false);

        toast({
          title: "Sucesso",
          description: "Participação adicionada com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar participação",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveParticipacao = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setParticipacoes(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Sucesso",
        description: "Participação removida com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover participação",
        variant: "destructive"
      });
    }
  };

  const getTipoTrabalhoLabel = (tipo: string) => {
    const tipoEncontrado = tiposTrabalho.find(t => t.id === tipo);
    return tipoEncontrado?.nome || tipo;
  };

  const getTipoTrabalhoColor = (tipo: string) => {
    switch (tipo) {
      case "artigo-completo":
        return "bg-primary/10 text-primary border-primary/20";
      case "artigo-resumido":
        return "bg-secondary/10 text-secondary-foreground border-secondary/20";
      case "apresentacao-oral":
        return "bg-success/10 text-success border-success/20";
      case "poster":
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Evento</label>
                    <Select value={formData.evento} onValueChange={handleEventoChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um evento" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventosDisponiveis.map((evento) => (
                          <SelectItem key={evento.id} value={evento.id}>
                            {evento.sigla} - {evento.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome do Evento</label>
                    <Input
                      value={formData.nomeEvento}
                      onChange={(e) => setFormData(prev => ({ ...prev, nomeEvento: e.target.value }))}
                      placeholder="Nome completo do evento"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Título do Trabalho</label>
                  <Input
                    value={formData.tituloTrabalho}
                    onChange={(e) => setFormData(prev => ({ ...prev, tituloTrabalho: e.target.value }))}
                    placeholder="Digite o título do trabalho apresentado"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Local</label>
                    <Input
                      value={formData.local}
                      onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                      placeholder="Cidade, Estado/País"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ano</label>
                    <Input
                      type="number"
                      value={formData.ano}
                      onChange={(e) => setFormData(prev => ({ ...prev, ano: e.target.value }))}
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
                        variant={formData.tipoTrabalho === tipo.id ? "default" : "outline"}
                        onClick={() => setFormData(prev => ({ ...prev, tipoTrabalho: tipo.id }))}
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
                  <Button onClick={handleAddParticipacao} disabled={isLoading} className="flex-1">
                    {isLoading ? "Salvando..." : "Salvar"}
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
              {participacoes.map((participacao) => (
                <TableRow key={participacao.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{participacao.evento}</div>
                      <div className="text-xs text-muted-foreground max-w-xs" title={participacao.nomeEvento}>
                        {truncateText(participacao.nomeEvento, 40)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span title={participacao.tituloTrabalho}>
                      {truncateText(participacao.tituloTrabalho, 50)}
                    </span>
                  </TableCell>
                  <TableCell>{participacao.local}</TableCell>
                  <TableCell>{participacao.ano}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTipoTrabalhoColor(participacao.tipoTrabalho)}`}>
                      {getTipoTrabalhoLabel(participacao.tipoTrabalho)}
                    </span>
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
                            Tem certeza que deseja excluir a participação "{participacao.tituloTrabalho}" do evento {participacao.evento}? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveParticipacao(participacao.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};