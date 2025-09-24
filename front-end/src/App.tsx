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
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
