import { useQuery } from "@tanstack/react-query";
// Importa los tipos correctos desde tu esquema (asegúrate de haber añadido la exportación de Macroprocess)
import { Macroprocess, Subprocess } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton"; // Asegúrate que la ruta a Skeleton sea correcta

interface ProcessMapProps {
  // La prop ahora espera una función que recibe un Macroprocess
  onSelectMacroprocess: (macroprocess: Macroprocess) => void;
}

// Recibe la prop con el nombre correcto: onSelectMacroprocess
export default function ProcessMap({ onSelectMacroprocess }: ProcessMapProps) {

  // Cambia la consulta para obtener Macroprocesos
  const { data: macroprocesses, isLoading: macroprocessesLoading } = useQuery<Macroprocess[]>({
    // ¡¡IMPORTANTE!! Verifica que '/api/macroprocesses' sea tu endpoint real en el backend
    queryKey: ['/api/macroprocesses'],
  });

  // La consulta de subprocesses parece correcta, usa el tipo Subprocess
  const { data: subprocesses, isLoading: subprocessesLoading } = useQuery<Subprocess[]>({
    // Verifica que '/api/subprocesses' devuelva los subprocesos
    queryKey: ['/api/subprocesses'],
  });

  // Verifica si alguna de las consultas está cargando
  if (macroprocessesLoading || subprocessesLoading) {
    return <ProcessMapSkeleton />;
  }

  // Si hay errores (opcional pero recomendado)
  // if (macroprocessesError || subprocessesError) {
  //   console.error("Error fetching data:", { macroprocessesError, subprocessesError });
  //   return <div>Error al cargar los datos.</div>;
  // }

  // Agrupa los MACROPROCESOS por categoría usando los datos de 'macroprocesses'
  const strategicMacroprocesses = macroprocesses?.filter(macro => macro.category === 'Estratégicos') || [];
  const operationalMacroprocesses = macroprocesses?.filter(macro => macro.category === 'Operativos') || [];
  const supportMacroprocesses = macroprocesses?.filter(macro => macro.category === 'Apoyo') || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-secondary-dark mb-4">Mapa de Procesos</h2>

      {/* Categorías de Procesos */}
      <div className="space-y-8">
        {/* Procesos Estratégicos */}
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos Estratégicos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Usa la variable correcta para verificar la longitud */}
            {strategicMacroprocesses.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-500">
                {/* Texto actualizado */}
                No hay macroprocesos estratégicos configurados
              </div>
            ) : (
              // Itera sobre la variable correcta y usa 'macro' como nombre
              strategicMacroprocesses.map(macro => (
                <div
                  key={macro.id} // Usa macro.id
                  className="process-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all strategic-card flex"
                  // Llama a la prop correcta (onSelectMacroprocess) con el objeto 'macro'
                  onClick={() => onSelectMacroprocess(macro)}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                    {/* Icono (puedes mantenerlo o cambiarlo) */}
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    {/* Muestra el nombre del macroproceso */}
                    <h4 className="font-semibold text-lg text-gray-800">{macro.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Gestión y planificación estratégica</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {/* Filtra subprocesses usando la clave foránea correcta 'macroprocessId' */}
                      {subprocesses?.filter(sub => sub.macroprocessId === macro.id).length || 0} subprocesos
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Procesos Operativos (Mismos cambios aplicados) */}
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos Operativos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {operationalMacroprocesses.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-500">
                No hay macroprocesos operativos configurados
              </div>
            ) : (
              operationalMacroprocesses.map(macro => (
                <div
                  key={macro.id}
                  className="process-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all operational-card flex"
                  onClick={() => onSelectMacroprocess(macro)}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                     <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-800">{macro.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Gestión de operaciones</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {subprocesses?.filter(sub => sub.macroprocessId === macro.id).length || 0} subprocesos
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Procesos de Apoyo (Mismos cambios aplicados) */}
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos de Apoyo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportMacroprocesses.length === 0 ? (
              <div className="col-span-full text-center py-4 text-gray-500">
                No hay macroprocesos de apoyo configurados
              </div>
            ) : (
              supportMacroprocesses.map(macro => (
                <div
                  key={macro.id}
                  className="process-card bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-all support-card flex"
                  onClick={() => onSelectMacroprocess(macro)}
                >
                   <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                     <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-800">{macro.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">Servicios de soporte</p>
                    <div className="text-xs text-gray-400 mt-2">
                      {subprocesses?.filter(sub => sub.macroprocessId === macro.id).length || 0} subprocesos
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

// El Skeleton se mantiene igual, pero puedes ajustar la altura si quieres
function ProcessMapSkeleton() {
   return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-secondary-dark mb-4">Mapa de Procesos</h2>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos Estratégicos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)} {/* Altura aumentada como ejemplo */}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos Operativos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-secondary mb-2 border-b border-gray-200 pb-2">Procesos de Apoyo</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
          </div>
        </div>
      </div>
    </div>
  );
}