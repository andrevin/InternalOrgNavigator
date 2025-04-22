import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X } from "lucide-react";
import DepartmentsTab from "./departments-tab";
import SubprocessesTab from "./subprocesses-tab";
import DocumentsTab from "./documents-tab";
import IframeTab from "./iframe-tab";
import UsersTab from "./users-tab";

interface AdminModalProps {
  onClose: () => void;
}

export default function AdminModal({ onClose }: AdminModalProps) {
  const [activeTab, setActiveTab] = useState("departments");

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="bg-secondary p-4 text-white flex justify-between items-center rounded-t-lg">
          <DialogTitle className="text-lg font-semibold">Panel de Administración</DialogTitle>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-200"
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" />
          </button>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col overflow-hidden h-full">
          <div className="p-1 bg-gray-200">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="departments" className="px-4 py-2">
                Departamentos
              </TabsTrigger>
              <TabsTrigger value="subprocesses" className="px-4 py-2">
                Subprocesos
              </TabsTrigger>
              <TabsTrigger value="documents" className="px-4 py-2">
                Documentación
              </TabsTrigger>
              <TabsTrigger value="iframe" className="px-4 py-2">
                Panel Lateral
              </TabsTrigger>
              <TabsTrigger value="users" className="px-4 py-2">
                Usuarios
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <TabsContent value="departments" className="mt-0 h-full">
              <DepartmentsTab />
            </TabsContent>
            
            <TabsContent value="subprocesses" className="mt-0 h-full">
              <SubprocessesTab />
            </TabsContent>
            
            <TabsContent value="documents" className="mt-0 h-full">
              <DocumentsTab />
            </TabsContent>
            
            <TabsContent value="iframe" className="mt-0 h-full">
              <IframeTab />
            </TabsContent>
            
            <TabsContent value="users" className="mt-0 h-full">
              <UsersTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
