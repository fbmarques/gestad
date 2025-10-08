import { DocenteDashboard } from "@/components/DocenteDashboard";
import AdminTopNav from "@/components/AdminTopNav";
import { useTheme } from "@/hooks/useTheme";

const Docente = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        {/* Header Navigation */}
        <AdminTopNav isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

        {/* Main Content */}
        <main className="p-6">
          <DocenteDashboard />
        </main>
      </div>
    </div>
  );
};

export default Docente;
