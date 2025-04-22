import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Breadcrumb from "@/components/breadcrumb";
import ProcessMap from "@/components/process-map";
import SubprocessView from "@/components/subprocess-view";
import DocumentationView from "@/components/documentation-view";
import SidePanel from "@/components/side-panel";
import AdminModal from "@/components/admin/admin-modal";
import { Department, Subprocess } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [view, setView] = useState<'processMap' | 'subprocessView' | 'documentationView'>('processMap');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedSubprocess, setSelectedSubprocess] = useState<Subprocess | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Fetch iframe config
  const { data: iframeConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['/api/config/iframeUrl'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/config/iframeUrl');
        if (!response.ok) return { value: '' };
        return await response.json();
      } catch (error) {
        return { value: '' };
      }
    }
  });

  const handleShowProcessMap = () => {
    setView('processMap');
    setSelectedDepartment(null);
    setSelectedSubprocess(null);
  };

  const handleShowSubprocesses = (department: Department) => {
    setView('subprocessView');
    setSelectedDepartment(department);
    setSelectedSubprocess(null);
  };

  const handleShowDocumentation = (subprocess: Subprocess) => {
    setView('documentationView');
    setSelectedSubprocess(subprocess);
  };

  const handleBackToDepartment = () => {
    if (selectedDepartment) {
      setView('subprocessView');
      setSelectedSubprocess(null);
    }
  };

  const toggleAdminModal = () => {
    setShowAdminModal(!showAdminModal);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleAdmin={toggleAdminModal} />

      <main className="flex-grow flex flex-col md:flex-row">
        {/* Main Section (75%) */}
        <div className="w-full md:w-3/4 bg-gray-100 p-4 md:p-6 overflow-y-auto transition-all">
          <Breadcrumb 
            view={view} 
            department={selectedDepartment} 
            subprocess={selectedSubprocess}
            onShowProcessMap={handleShowProcessMap}
            onShowSubprocesses={handleBackToDepartment}
          />

          {view === 'processMap' && (
            <ProcessMap onSelectDepartment={handleShowSubprocesses} />
          )}

          {view === 'subprocessView' && selectedDepartment && (
            <SubprocessView 
              department={selectedDepartment} 
              onSelectSubprocess={handleShowDocumentation} 
            />
          )}

          {view === 'documentationView' && selectedSubprocess && (
            <DocumentationView subprocess={selectedSubprocess} />
          )}
        </div>

        {/* Side Panel for iframe (25%) */}
        <SidePanel url={iframeConfig?.value || ''} isLoading={isLoadingConfig} />
      </main>

      {/* Admin Modal */}
      {showAdminModal && (
        <AdminModal onClose={toggleAdminModal} />
      )}
    </div>
  );
}
