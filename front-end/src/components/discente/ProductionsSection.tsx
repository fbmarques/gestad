import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Plus, Edit, Trash2, FileDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Producao {
  id: string;
  titulo: string;
  periodico: string;
  dataSubmissao: string;
  dataAprovacao?: string;
  dataPublicacao?: string;
  status: "enviado" | "aprovado" | "reprovado";
}

export const ProductionsSection = () => {
  const [producoes, setProducoes] = useState<Producao[]>([
    {
      id: "1",
      titulo: "Uma Abordagem Inovadora para Análise de Dados em Tempo Real",
      periodico: "Journal of Computer Science",
      dataSubmissao: "2024-01-15",
      dataAprovacao: "2024-02-20",
      status: "aprovado"
    },
    {
      id: "2",
      titulo: "Algoritmos de Machine Learning para Detecção de Anomalias",
      periodico: "IEEE Transactions on Artificial Intelligence",
      dataSubmissao: "2024-03-10",
      status: "enviado"
    }
  ]);

  const [selectedProducoes, setSelectedProducoes] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    periodico: "",
    titulo: "",
    dataSubmissao: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Mock data
  const periodicosDisponiveis = [
    { id: "1", nome: "Journal of Computer Science" },
    { id: "2", nome: "IEEE Transactions on Artificial Intelligence" },
    { id: "3", nome: "Communications of the ACM" },
    { id: "4", nome: "Nature Machine Intelligence" }
  ];

  const handleAddProducao = async () => {
    if (!formData.periodico || !formData.titulo || !formData.dataSubmissao) {
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
      
      const periodicoSelecionado = periodicosDisponiveis.find(p => p.id === formData.periodico);

      if (periodicoSelecionado) {
        const novaProducao: Producao = {
          id: Date.now().toString(),
          titulo: formData.titulo,
          periodico: periodicoSelecionado.nome,
          dataSubmissao: formData.dataSubmissao,
          status: "enviado"
        };

        setProducoes(prev => [...prev, novaProducao]);
        setFormData({ 
          periodico: "", 
          titulo: "", 
          dataSubmissao: new Date().toISOString().split('T')[0] 
        });
        setIsModalOpen(false);

        toast({
          title: "Sucesso",
          description: "Produção adicionada com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar produção",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveProducao = async (id: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducoes(prev => prev.filter(p => p.id !== id));
      setSelectedProducoes(prev => prev.filter(pid => pid !== id));
      toast({
        title: "Sucesso",
        description: "Produção removida com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao remover produção",
        variant: "destructive"
      });
    }
  };

  const handleSelectProducao = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProducoes(prev => [...prev, id]);
    } else {
      setSelectedProducoes(prev => prev.filter(pid => pid !== id));
    }
  };

  const handleGerarPDF = () => {
    if (selectedProducoes.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos uma produção para gerar o PDF",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "PDF Gerado",
      description: `PDF gerado com ${selectedProducoes.length} produção(ões)`
    });
  };

  const handleDateEdit = async (id: string, field: string, value: string) => {
    setProducoes(prev => 
      prev.map(prod => 
        prod.id === id 
          ? { ...prod, [field]: value }
          : prod
      )
    );

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      toast({
        title: "Sucesso",
        description: "Data atualizada automaticamente"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar data",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "enviado":
        return <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-primary bg-primary/10 rounded-full">E</span>;
      case "aprovado":
        return <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-success bg-success/10 rounded-full">A</span>;
      case "reprovado":
        return <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium text-destructive bg-destructive/10 rounded-full">R</span>;
      default:
        return null;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const canSelectProducao = (producao: Producao) => {
    return producao.status === "aprovado" && !producao.dataPublicacao;
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
            onClick={handleGerarPDF}
            className="gap-2"
            disabled={selectedProducoes.length === 0}
          >
            <FileDown className="w-4 h-4" />
            PDF ({selectedProducoes.length})
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
                  <Select value={formData.periodico} onValueChange={(value) => setFormData(prev => ({ ...prev, periodico: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um periódico" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodicosDisponiveis.map((periodico) => (
                        <SelectItem key={periodico.id} value={periodico.id}>
                          {periodico.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Título da Produção</label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Digite o título da produção"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Submissão</label>
                  <Input
                    type="date"
                    value={formData.dataSubmissao}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataSubmissao: e.target.value }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleAddProducao} disabled={isLoading} className="flex-1">
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
              {producoes.map((producao) => (
                <TableRow key={producao.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {canSelectProducao(producao) && (
                        <Checkbox
                          checked={selectedProducoes.includes(producao.id)}
                          onCheckedChange={(checked) => handleSelectProducao(producao.id, checked as boolean)}
                        />
                      )}
                      {getStatusBadge(producao.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <span title={producao.titulo}>
                      {truncateText(producao.titulo, 50)}
                    </span>
                  </TableCell>
                  <TableCell>{producao.periodico}</TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={producao.dataSubmissao}
                      onChange={(e) => handleDateEdit(producao.id, "dataSubmissao", e.target.value)}
                      className="w-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={producao.dataAprovacao || ""}
                      onChange={(e) => handleDateEdit(producao.id, "dataAprovacao", e.target.value)}
                      className="w-auto"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="date"
                      value={producao.dataPublicacao || ""}
                      onChange={(e) => handleDateEdit(producao.id, "dataPublicacao", e.target.value)}
                      className="w-auto"
                    />
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
                            Tem certeza que deseja excluir a produção "{producao.titulo}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemoveProducao(producao.id)}>
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