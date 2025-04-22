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
                  className="process-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all strategic-card"
                  onClick={() => onSelectDepartment(dept)}
                >
                  <h4 className="font-semibold text-gray-800">{dept.name}</h4>
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
                  className="process-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all operational-card"
                  onClick={() => onSelectDepartment(dept)}
                >
                  <h4 className="font-semibold text-gray-800">{dept.name}</h4>
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
                  className="process-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all support-card"
                  onClick={() => onSelectDepartment(dept)}
                >
                  <h4 className="font-semibold text-gray-800">{dept.name}</h4>
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
