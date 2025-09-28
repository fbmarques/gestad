import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getStudentDisciplines,
  addStudentDiscipline,
  removeStudentDiscipline,
  getAvailableCourses,
  getAvailableTeachers,
  StudentDiscipline,
  AvailableCourse,
  AvailableTeacher
} from "@/lib/api";

export const DisciplinesSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    disciplina: "none",
    docente: "none"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch student disciplines
  const { data: disciplinesData, isLoading: disciplinesLoading, error: disciplinesError } = useQuery({
    queryKey: ['student-disciplines'],
    queryFn: getStudentDisciplines,
  });

  // Fetch available courses
  const { data: availableCourses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ['available-courses'],
    queryFn: getAvailableCourses,
  });

  // Fetch available teachers
  const { data: availableTeachers = [], isLoading: teachersLoading } = useQuery({
    queryKey: ['available-teachers'],
    queryFn: getAvailableTeachers,
  });

  const disciplines = disciplinesData?.disciplines || [];
  const creditsInfo = disciplinesData?.credits_info || {
    total_credits: 0,
    required_credits: 18,
    progress_percentage: 0
  };

  // Add discipline mutation
  const addDisciplineMutation = useMutation({
    mutationFn: addStudentDiscipline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-disciplines'] });
      setFormData({ disciplina: "none", docente: "none" });
      setIsModalOpen(false);
      toast({
        title: "Sucesso",
        description: "Disciplina adicionada com sucesso"
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Falha ao adicionar disciplina";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  // Remove discipline mutation
  const removeDisciplineMutation = useMutation({
    mutationFn: removeStudentDiscipline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-disciplines'] });
      toast({
        title: "Sucesso",
        description: "Disciplina removida com sucesso"
      });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || "Falha ao remover disciplina";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  const handleAddDisciplina = async () => {
    if (formData.disciplina === "none") {
      toast({
        title: "Erro",
        description: "Selecione uma disciplina",
        variant: "destructive"
      });
      return;
    }

    const requestData: { course_id: number; docente_id?: number | null } = {
      course_id: parseInt(formData.disciplina)
    };

    // Only include docente_id if a docente was selected
    if (formData.docente !== "none") {
      requestData.docente_id = parseInt(formData.docente);
    }

    addDisciplineMutation.mutate(requestData);
  };

  const handleRemoveDisciplina = async (id: number) => {
    removeDisciplineMutation.mutate(id);
  };

  const getProgressColor = () => {
    if (creditsInfo.progress_percentage >= 100) return "bg-success";
    if (creditsInfo.progress_percentage >= 75) return "bg-primary";
    if (creditsInfo.progress_percentage >= 50) return "bg-warning";
    return "bg-destructive";
  };

  // Show loading state
  if (disciplinesLoading) {
    return (
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="w-5 h-5 text-primary" />
            Disciplinas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando disciplinas...</div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (disciplinesError) {
    return (
      <Card className="border-card-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BookOpen className="w-5 h-5 text-primary" />
            Disciplinas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">Erro ao carregar disciplinas</div>
        </CardContent>
      </Card>
    );
  }

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
            Total: {creditsInfo.total_credits}/{creditsInfo.required_credits} créditos
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
                      <SelectItem value="none">Selecione uma disciplina</SelectItem>
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.code} - {course.name} ({course.credits} créditos)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Docente (opcional)</label>
                  <Select value={formData.docente} onValueChange={(value) => setFormData(prev => ({ ...prev, docente: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um docente (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum docente selecionado</SelectItem>
                      {availableTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id.toString()}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1">
                    Cancelar
                  </Button>
                  <Button onClick={handleAddDisciplina} disabled={addDisciplineMutation.isPending} className="flex-1">
                    {addDisciplineMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Progress value={creditsInfo.progress_percentage} className="h-6" />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground">
            {creditsInfo.progress_percentage.toFixed(0)}%
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
              {disciplines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    Nenhuma disciplina adicionada ainda
                  </TableCell>
                </TableRow>
              ) : (
                disciplines.map((discipline) => (
                  <TableRow key={discipline.id}>
                    <TableCell className="font-medium">{discipline.code}</TableCell>
                    <TableCell>{discipline.name}</TableCell>
                    <TableCell>{discipline.credits}</TableCell>
                    <TableCell>{discipline.docente}</TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600"
                            disabled={removeDisciplineMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir a disciplina "{discipline.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveDisciplina(discipline.id)}>
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