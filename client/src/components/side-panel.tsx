import { Skeleton } from "@/components/ui/skeleton";

interface SidePanelProps {
  url: string;
  isLoading: boolean;
}

export default function SidePanel({ url, isLoading }: SidePanelProps) {
  return (
    <div className="w-full md:w-1/4 bg-white border-l border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-secondary-dark mb-3">Panel de Indicadores</h2>
      <div className="bg-gray-100 rounded-lg p-2 mb-3">
        <div className="text-xs text-gray-500 mb-1">Contenido externo</div>
        <div className="rounded overflow-hidden bg-white shadow-inner">
          {isLoading ? (
            <div className="w-full h-[500px] flex items-center justify-center bg-gray-50">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : url ? (
            <iframe
              src={url}
              className="w-full h-[500px] border-0"
              title="Contenido externo"
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-[500px] bg-gray-50">
              <p className="text-gray-500">No hay contenido configurado</p>
            </div>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <p className="mb-2">Este panel muestra información externa relacionada con los procesos seleccionados.</p>
        <p>La fuente de datos se configura a través del panel de administración.</p>
      </div>
    </div>
  );
}
