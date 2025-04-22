import { useQuery } from "@tanstack/react-query";
import { Department } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, FileText, Tool, FolderIcon } from "lucide-react";

interface ProcessMapProps {
  onSelectDepartment: (department: Department) => void;
}

export default function ProcessMap({ onSelectDepartment }: ProcessMapProps) {
  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  if (isLoading) {
    return <ProcessMapSkeleton />;
  }

  // Group departments by category
  const strategicDepartments = departments?.filter(dept => dept.category === 'Estratégicos') || [];
  const operationalDepartments = departments?.filter(dept => dept.category === 'Operativos') || [];
  const supportDepartments = departments?.filter(dept => dept.category === 'Apoyo') || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-secondary-dark mb-4">Mapa de Procesos</h2>
      
      {/* Process Categories */}
      <div className="space-y-8">
        {/* Strategic Processes */}
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos Estratégicos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategicDepartments.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-500">
                No hay departamentos estratégicos configurados
              </div>
            ) : (
              strategicDepartments.map(dept => (
                <div
                  key={dept.id}
                  className="process-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all strategic-card flex"
                  onClick={() => onSelectDepartment(dept)}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-800">{dept.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Planificación y gestión estratégica</p>
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <FolderIcon className="h-3 w-3 mr-1" />
                      <span>9 subprocesos</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Operational Processes */}
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos Operativos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {operationalDepartments.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-500">
                No hay departamentos operativos configurados
              </div>
            ) : (
              operationalDepartments.map(dept => (
                <div
                  key={dept.id}
                  className="process-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all operational-card flex"
                  onClick={() => onSelectDepartment(dept)}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-800">{dept.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Ejecución y operaciones clave</p>
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <FolderIcon className="h-3 w-3 mr-1" />
                      <span>12 subprocesos</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Support Processes */}
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos de Apoyo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportDepartments.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-500">
                No hay departamentos de apoyo configurados
              </div>
            ) : (
              supportDepartments.map(dept => (
                <div
                  key={dept.id}
                  className="process-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all support-card flex"
                  onClick={() => onSelectDepartment(dept)}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mr-3">
                    <Tool className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-800">{dept.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Soporte y servicios internos</p>
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <FolderIcon className="h-3 w-3 mr-1" />
                      <span>6 subprocesos</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessMapSkeleton() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-secondary-dark mb-4">Mapa de Procesos</h2>
      
      {/* Process Categories */}
      <div className="space-y-8">
        {/* Strategic Processes */}
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos Estratégicos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Operational Processes */}
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos Operativos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
        
        {/* Support Processes */}
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos de Apoyo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
