import { useQuery } from "@tanstack/react-query";
import { Department, Subprocess } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { File } from "lucide-react";

interface SubprocessViewProps {
  department: Department;
  onSelectSubprocess: (subprocess: Subprocess) => void;
}

export default function SubprocessView({ department, onSelectSubprocess }: SubprocessViewProps) {
  const { data: documents } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    queryFn: async () => {
      const response = await fetch('/api/documents');
      if (!response.ok) throw new Error('Error al cargar los documentos');
      return response.json();
    }
  });

  const { data: subprocesses, isLoading } = useQuery<Subprocess[]>({
    queryKey: ['/api/subprocesses', { departmentId: department.id }],
    queryFn: async () => {
      const response = await fetch(`/api/subprocesses?departmentId=${department.id}`);
      if (!response.ok) throw new Error('Error al cargar los subprocesos');
      return response.json();
    }
  });

  // Function to get category badge class
  const getCategoryClass = (category: string) => {
    switch(category) {
      case 'Estratégicos':
        return 'bg-green-100 text-green-800';
      case 'Operativos':
        return 'bg-blue-100 text-blue-800';
      case 'Apoyo':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <SubprocessViewSkeleton department={department} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-secondary-dark">{department.name}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryClass(department.category)}`}>
          {department.category}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {subprocesses && subprocesses.length > 0 ? (
          subprocesses.map(subprocess => (
            <div 
              key={subprocess.id}
              className="process-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all border border-gray-200"
              onClick={() => onSelectSubprocess(subprocess)}
            >
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{subprocess.name}</h4>
              <p className="text-sm text-gray-600 mb-3">Gestión y documentación del subproceso</p>
              
              <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center text-xs text-gray-500">
                  <File className="h-4 w-4 mr-1" />
                  <span>{documents?.filter(doc => doc.type === 'Manuales' && doc.subprocessId === subprocess.id).length || 0} Manuales</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <File className="h-4 w-4 mr-1" />
                  <span>{documents?.filter(doc => doc.type === 'SOPs' && doc.subprocessId === subprocess.id).length || 0} SOPs</span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <File className="h-4 w-4 mr-1" />
                  <span>{documents?.filter(doc => doc.type === 'Formatos' && doc.subprocessId === subprocess.id).length || 0} Formatos</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No hay subprocesos configurados para este departamento
          </div>
        )}
      </div>
    </div>
  );
}

function SubprocessViewSkeleton({ department }: { department: Department }) {
  const getCategoryClass = (category: string) => {
    switch(category) {
      case 'Estratégicos':
        return 'bg-green-100 text-green-800';
      case 'Operativos':
        return 'bg-blue-100 text-blue-800';
      case 'Apoyo':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-secondary-dark">{department.name}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryClass(department.category)}`}>
          {department.category}
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
