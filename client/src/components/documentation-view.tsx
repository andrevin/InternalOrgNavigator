import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Subprocess, Document } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { File } from "lucide-react";

interface DocumentationViewProps {
  subprocess: Subprocess;
}

type DocType = 'Manuales' | 'SOPs' | 'Formatos';

export default function DocumentationView({ subprocess }: DocumentationViewProps) {
  const [activeDocType, setActiveDocType] = useState<DocType>('Manuales');
  
  const { data: department } = useQuery({
    queryKey: ['/api/departments', subprocess.departmentId],
    queryFn: async () => {
      const response = await fetch(`/api/departments/${subprocess.departmentId}`);
      if (!response.ok) throw new Error('Error al cargar el departamento');
      return response.json();
    }
  });

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ['/api/documents', { subprocessId: subprocess.id, type: activeDocType }],
    queryFn: async () => {
      const response = await fetch(`/api/documents?subprocessId=${subprocess.id}&type=${activeDocType}`);
      if (!response.ok) throw new Error('Error al cargar los documentos');
      return response.json();
    }
  });

  if (isLoading) {
    return <DocumentationViewSkeleton subprocess={subprocess} />;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-secondary-dark">{subprocess.name}</h2>
        <p className="text-gray-600">{department?.name}</p>
      </div>
      
      {/* Documentation Tabs */}
      <div className="border-b border-gray-200">
        <ul className="flex -mb-px" role="tablist">
          <li className="mr-1">
            <button 
              className={`doc-tab ${activeDocType === 'Manuales' ? 'active' : ''}`}
              onClick={() => setActiveDocType('Manuales')}
              role="tab"
              aria-selected={activeDocType === 'Manuales'}
            >
              Manuales
            </button>
          </li>
          <li className="mr-1">
            <button 
              className={`doc-tab ${activeDocType === 'SOPs' ? 'active' : ''}`}
              onClick={() => setActiveDocType('SOPs')}
              role="tab"
              aria-selected={activeDocType === 'SOPs'}
            >
              SOPs
            </button>
          </li>
          <li className="mr-1">
            <button 
              className={`doc-tab ${activeDocType === 'Formatos' ? 'active' : ''}`}
              onClick={() => setActiveDocType('Formatos')}
              role="tab"
              aria-selected={activeDocType === 'Formatos'}
            >
              Formatos
            </button>
          </li>
        </ul>
      </div>
      
      {/* Tab Contents */}
      <div className="tab-content">
        <div className="block" role="tabpanel">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {documents && documents.length > 0 ? (
                documents.map(doc => (
                  <li key={doc.id} className="p-4 hover:bg-gray-50 transition-all">
                    <a 
                      href={doc.url} 
                      className="flex items-center text-gray-700 hover:text-primary" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <File className="h-5 w-5 mr-2 text-gray-400" />
                      <span>{doc.name}</span>
                    </a>
                  </li>
                ))
              ) : (
                <li className="p-8 text-center text-gray-500">
                  No hay documentos disponibles en esta categoría
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentationViewSkeleton({ subprocess }: { subprocess: Subprocess }) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-secondary-dark">{subprocess.name}</h2>
        <Skeleton className="h-4 w-32 mt-1" />
      </div>
      
      {/* Documentation Tabs */}
      <div className="border-b border-gray-200">
        <ul className="flex -mb-px" role="tablist">
          <li className="mr-1">
            <button className="doc-tab active">
              Manuales
            </button>
          </li>
          <li className="mr-1">
            <button className="doc-tab">
              SOPs
            </button>
          </li>
          <li className="mr-1">
            <button className="doc-tab">
              Formatos
            </button>
          </li>
        </ul>
      </div>
      
      {/* Tab Contents */}
      <div className="tab-content">
        <div className="block" role="tabpanel">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3].map(i => (
                <li key={i} className="p-4">
                  <Skeleton className="h-6 w-full" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
