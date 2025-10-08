import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AcademicDashboard } from "@/components/AcademicDashboard";
import AdminTopNav from "@/components/AdminTopNav";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const Docente = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Mock unread messages count - replace with real data later
  const unreadMessages = 3;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        {/* Header Navigation */}
        <AdminTopNav 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
          userType="docente"
        />

        {/* Main Content */}
        <main className="p-6">
          <AcademicDashboard 
            userType="docente"
            unreadMessages={unreadMessages}
          />
        </main>
      </div>
    </div>
  );
};

export default Docente;