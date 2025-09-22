import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Disciplina {
  id: string;
  codigo: string;
  nome: string;
  creditos: number;
  docente: string;
}

export const DisciplinesSection = () => {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([
    {
      id: "1",
      codigo: "PPGCC001",
      nome: "Metodologia de Pesquisa",
      creditos: 3,
      docente: "Prof. Dr. João Silva"
    },
    {
      id: "2", 
      codigo: "PPGCC002",
      nome: "Algoritmos Avançados",
      creditos: 4,
      docente: "Prof. Dr. Maria Santos"
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    disciplina: "",
    docente: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Mock data
  const disciplinasDisponiveis = [
    { id: "1", codigo: "PPGCC003", nome: "Inteligência Artificial", creditos: 4 },
    { id: "2", codigo: "PPGCC004", nome: "Banco de Dados Avançados", creditos: 3 },
    { id: "3", codigo: "PPGCC005", nome: "Redes de Computadores", creditos: 3 }
  ];

  const docentesDisponiveis = [
    { id: "1", nome: "Prof. Dr. Carlos Oliveira" },
    { id: "2", nome: "Prof. Dr. Ana Costa" },
    { id: "3", nome: "Prof. Dr. Pedro Alves" }
  ];

  const creditosNecessarios = 24; // Para mestrado
  const creditosAtuais = disciplinas.reduce((total, disc) => total + disc.creditos, 0);
  const progressoPercentual = Math.min((creditosAtuais / creditosNecessarios) * 100, 100);

  const handleAddDisciplina = async () => {
    if (!formData.disciplina || !formData.docente) {
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
      
      const disciplinaSelecionada = disciplinasDisponiveis.find(d => d.id === formData.disciplina);
      const docenteSelecionado = docentesDisponiveis.find(d => d.id === formData.docente);

      if (disciplinaSelecionada && docenteSelecionado) {
        const novaDisciplina: Disciplina = {
          id: Date.now().toString(),
          codigo: disciplinaSelecionada.codigo,
          nome: disciplinaSelecionada.nome,
          creditos: disciplinaSelecionada.creditos,
          docente: docenteSelecionado.nome
        };

        setDisciplinas(prev => [...prev, novaDisciplina]);
        setFormData({ disciplina: "", docente: "" });
        setIsModalOpen(false);

        toast({
          title: "Sucesso",
          description: "Disciplina adicionada com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar disciplina",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveDisciplina = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setDisciplinas(prev => prev.filter(d => d.id !== id));
      toast({
        title: "Sucesso",
        description: "Disciplina removida com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover disciplina",
        variant: "destructive"
      });
    }
  };

  const getProgressColor = () => {
    if (progressoPercentual >= 100) return "bg-success";
    if (progressoPercentual >= 75) return "bg-primary";
    if (progressoPercentual >= 50) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Card className="border-card-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BookOpen className="w-5 h-5 text-primary" />
          Disciplinas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Total: {creditosAtuais}/{creditosNecessarios} créditos
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar Disciplina
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Disciplina</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Disciplina</label>
                  <Select value={formData.disciplina} onValueChange={(value) => setFormData(prev => ({ ...prev, disciplina: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma disciplina" />
                    </SelectTrigger>
                    <SelectContent>
                      {disciplinasDisponiveis.map((disc) => (
                        <SelectItem key={disc.id} value={disc.id}>
                          {disc.codigo} - {disc.nome} ({disc.creditos} créditos)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Docente</label>
                  <Select value={formData.docente} onValueChange={(value) => setFormData(prev => ({ ...prev, docente: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um docente" />
                    </SelectTrigger>
                    <SelectContent>
                      {docentesDisponiveis.map((docente) => (
                        <SelectItem key={docente.id} value={docente.id}>
                          {docente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleAddDisciplina} disabled={isLoading} className="flex-1">
                    {isLoading ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Progress value={progressoPercentual} className="h-6" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground">
            {progressoPercentual.toFixed(0)}%
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Docente</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disciplinas.map((disciplina) => (
                <TableRow key={disciplina.id}>
                  <TableCell className="font-medium">{disciplina.codigo}</TableCell>
                  <TableCell>{disciplina.nome}</TableCell>
                  <TableCell>{disciplina.creditos}</TableCell>
                  <TableCell>{disciplina.docente}</TableCell>
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
                            Tem certeza que deseja excluir a disciplina "{disciplina.nome}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveDisciplina(disciplina.id)}>
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