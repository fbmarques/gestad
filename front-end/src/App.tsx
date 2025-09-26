import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Selecao from "./pages/Selecao";
import Administrativo from "./pages/Administrativo";
import LinhasPesquisa from "./pages/LinhasPesquisa";
import LinhasPesquisaExcluidas from "./pages/LinhasPesquisaExcluidas";
import Disciplinas from "./pages/Disciplinas";
import DisciplinasExcluidas from "./pages/DisciplinasExcluidas";
import Agencias from "./pages/Agencias";
import AgenciasExcluidas from "./pages/AgenciasExcluidas";
import Revistas from "./pages/Revistas";
import RevistasExcluidas from "./pages/RevistasExcluidas";
import Eventos from "./pages/Eventos";
import EventosExcluidos from "./pages/EventosExcluidos";
import Docentes from "./pages/Docentes";
import DocentesExcluidos from "./pages/DocentesExcluidos";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/selecao" element={<Selecao />} />
            <Route path="/administrativo" element={<Administrativo />} />
            <Route path="/docente" element={<div>Docente</div>} />
            <Route path="/discente" element={<div>Discente</div>} />
            <Route path="/linhaspesquisa" element={<LinhasPesquisa />} />
            <Route path="/linhapesquisa" element={<LinhasPesquisa />} />
            <Route path="/linhaspesquisa-excluidas" element={<LinhasPesquisaExcluidas />} />
            <Route path="/disciplinas" element={<Disciplinas />} />
            <Route path="/disciplina" element={<Disciplinas />} />
            <Route path="/disciplinas-excluidas" element={<DisciplinasExcluidas />} />
            <Route path="/agencias" element={<Agencias />} />
            <Route path="/agencia" element={<Agencias />} />
            <Route path="/agencias-excluidas" element={<AgenciasExcluidas />} />
            <Route path="/revistas" element={<Revistas />} />
            <Route path="/revista" element={<Revistas />} />
            <Route path="/revistas-excluidas" element={<RevistasExcluidas />} />
            <Route path="/eventos" element={<Eventos />} />
            <Route path="/evento" element={<Eventos />} />
            <Route path="/eventos-excluidos" element={<EventosExcluidos />} />
            <Route path="/docentes" element={<Docentes />} />
            <Route path="/docente" element={<Docentes />} />
            <Route path="/docentes-excluidos" element={<DocentesExcluidos />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
