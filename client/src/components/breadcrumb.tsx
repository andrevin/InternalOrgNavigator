import { Department, Subprocess } from "@shared/schema";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps {
  view: 'processMap' | 'subprocessView' | 'documentationView';
  department: Department | null;
  subprocess: Subprocess | null;
  onShowProcessMap: () => void;
  onShowSubprocesses: () => void;
}

export default function Breadcrumb({ 
  view, 
  department, 
  subprocess,
  onShowProcessMap,
  onShowSubprocesses
}: BreadcrumbProps) {
  return (
    <nav className="mb-4 text-sm" aria-label="Breadcrumb">
      <ol className="list-none p-0 inline-flex">
        <li className="flex items-center text-primary-dark">
          <button 
            onClick={onShowProcessMap}
            className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
          >
            Mapa de Procesos
          </button>
        </li>
        
        {view === 'subprocessView' && department && (
          <li className="flex items-center">
            <ChevronRight className="h-5 w-5 text-gray-400 mx-1" />
            <span className="text-gray-700">{department.name}</span>
          </li>
        )}
        
        {view === 'documentationView' && department && subprocess && (
          <>
            <li className="flex items-center">
              <ChevronRight className="h-5 w-5 text-gray-400 mx-1" />
              <button 
                onClick={onShowSubprocesses}
                className="hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
              >
                {department.name}
              </button>
            </li>
            <li className="flex items-center">
              <ChevronRight className="h-5 w-5 text-gray-400 mx-1" />
              <span className="text-gray-700">{subprocess.name}</span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}
