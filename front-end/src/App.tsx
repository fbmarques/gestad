import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Selecao from "./pages/Selecao";
import Administrativo from "./pages/Administrativo";
import Docente from "./pages/Docente";
import Discente from "./pages/Discente";
import Discentes from "./pages/Discentes";
import Docentes from "./pages/Docentes";
import Disciplinas from "./pages/Disciplinas";
import Revistas from "./pages/Revistas";
import Eventos from "./pages/Eventos";
import Producoes from "./pages/Producoes";
import ProducoesStatus from "./pages/ProducoesStatus";
import Agencias from "./pages/Agencias";
import LinhasPesquisa from "./pages/LinhasPesquisa";
import Chat from "./pages/Chat";
import Relatorios from "./pages/Relatorios";
import NotFound from "./pages/NotFound";
// Páginas de excluídos
import DiscentesExcluidos from "./pages/DiscentesExcluidos";
import DocentesExcluidos from "./pages/DocentesExcluidos";
import DisciplinasExcluidas from "./pages/DisciplinasExcluidas";
import RevistasExcluidas from "./pages/RevistasExcluidas";
import EventosExcluidos from "./pages/EventosExcluidos";
import AgenciasExcluidas from "./pages/AgenciasExcluidas";
import LinhasPesquisaExcluidas from "./pages/LinhasPesquisaExcluidas";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/selecao" element={<Selecao />} />
          <Route path="/administrativo" element={<Administrativo />} />
          <Route path="/docente" element={<Docente />} />
          <Route path="/discente" element={<Discente />} />
          <Route path="/discentes" element={<Discentes />} />
          <Route path="/docentes" element={<Docentes />} />
          <Route path="/disciplinas" element={<Disciplinas />} />
          <Route path="/revistas" element={<Revistas />} />
          <Route path="/eventos" element={<Eventos />} />
            <Route path="/producoes" element={<Producoes />} />
            <Route path="/producoes-status" element={<ProducoesStatus />} />
            <Route path="/agencias" element={<Agencias />} />
            <Route path="/linhaspesquisa" element={<LinhasPesquisa />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/chat" element={<Chat />} />
            {/* Rotas de recuperação de excluídos */}
            <Route path="/discentes-excluidos" element={<DiscentesExcluidos />} />
            <Route path="/docentes-excluidos" element={<DocentesExcluidos />} />
            <Route path="/disciplinas-excluidas" element={<DisciplinasExcluidas />} />
            <Route path="/revistas-excluidas" element={<RevistasExcluidas />} />
            <Route path="/eventos-excluidos" element={<EventosExcluidos />} />
            <Route path="/agencias-excluidas" element={<AgenciasExcluidas />} />
            <Route path="/linhaspesquisa-excluidas" element={<LinhasPesquisaExcluidas />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
