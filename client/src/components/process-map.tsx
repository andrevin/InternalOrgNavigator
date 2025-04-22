import { useQuery } from "@tanstack/react-query";
import { Department } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

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
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-800">{dept.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Gestión y planificación estratégica</p>
                    <div className="text-xs text-gray-400 mt-2">3 subprocesos</div>
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
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-800">{dept.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Gestión de operaciones</p>
                    <div className="text-xs text-gray-400 mt-2">3 subprocesos</div>
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
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-800">{dept.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Servicios de soporte</p>
                    <div className="text-xs text-gray-400 mt-2">3 subprocesos</div>
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
