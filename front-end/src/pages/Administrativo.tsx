import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AcademicDashboard } from "@/components/AcademicDashboard";
import AdminTopNav from "@/components/AdminTopNav";

const Administrativo = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };



  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        {/* Header Navigation */}
        <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        {/* Main Content */}
        <main className="p-6">
          <AcademicDashboard />
        </main>
      </div>
    </div>
  );
};

export default Administrativo;