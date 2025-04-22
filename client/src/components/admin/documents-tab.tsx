import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Department, 
  Subprocess, 
  Document,
  InsertDocument, 
  insertDocumentSchema 
} from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, Loader2, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const documentFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200, "El nombre es demasiado largo"),
  url: z.string().url("URL inválida").min(1, "La URL es requerida"),
  type: z.enum(["Manuales", "SOPs", "Formatos"], {
    required_error: "El tipo de documento es requerido",
  }),
  subprocessId: z.coerce.number({
    required_error: "El subproceso es requerido",
    invalid_type_error: "Seleccione un subproceso válido",
  }),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

export default function DocumentsTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(null);
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | null>(null);
  const [filterSubprocessId, setFilterSubprocessId] = useState<number | null>(null);

  const { data: departments, isLoading: isLoadingDepartments } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  const { data: subprocesses, isLoading: isLoadingSubprocesses } = useQuery<Subprocess[]>({
    queryKey: ['/api/subprocesses', { departmentId: filterDepartmentId }],
    queryFn: async () => {
      const url = filterDepartmentId 
        ? `/api/subprocesses?departmentId=${filterDepartmentId}` 
        : '/api/subprocesses';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar los subprocesos');
      return response.json();
    }
  });

  const { data: documents, isLoading: isLoadingDocuments } = useQuery<Document[]>({
    queryKey: ['/api/documents', { subprocessId: filterSubprocessId }],
    queryFn: async () => {
      let url = '/api/documents';
      if (filterSubprocessId) {
        url += `?subprocessId=${filterSubprocessId}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error al cargar los documentos');
      return response.json();
    }
  });

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: "",
      url: "",
      type: "Manuales",
      subprocessId: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (document: InsertDocument) => {
      const res = await apiRequest("POST", "/api/documents", document);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Documento creado correctamente" });
      setFormOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error al crear el documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, document }: { id: number; document: InsertDocument }) => {
      const res = await apiRequest("PUT", `/api/documents/${id}`, document);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Documento actualizado correctamente" });
      setFormOpen(false);
      setEditingDocument(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      toast({ title: "Documento eliminado correctamente" });
      setDeletingDocument(null);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar el documento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenForm = (document?: Document) => {
    if (document) {
      setEditingDocument(document);
      form.reset({
        name: document.name,
        url: document.url,
        type: document.type as "Manuales" | "SOPs" | "Formatos",
        subprocessId: document.subprocessId,
      });
    } else {
      setEditingDocument(null);
      form.reset({
        name: "",
        url: "",
        type: "Manuales",
        subprocessId: filterSubprocessId || 0,
      });
    }
    setFormOpen(true);
  };

  const onSubmit = (values: DocumentFormValues) => {
    if (editingDocument) {
      updateMutation.mutate({ id: editingDocument.id, document: values });
    } else {
      createMutation.mutate(values);
    }
  };

  // Find subprocess name by ID
  const getSubprocessName = (subprocessId: number) => {
    const subprocess = subprocesses?.find(s => s.id === subprocessId);
    return subprocess?.name || 'Subproceso desconocido';
  };

  // Get document type badge class
  const getDocTypeBadgeClass = (type: string) => {
    switch(type) {
      case 'Manuales':
        return 'bg-green-100 text-green-800';
      case 'SOPs':
        return 'bg-blue-100 text-blue-800';
      case 'Formatos':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle department filter change
  const handleDepartmentFilterChange = (value: string) => {
    const departmentId = value === 'all' ? null : Number(value);
    setFilterDepartmentId(departmentId);
    setFilterSubprocessId(null); // Reset subprocess filter when department changes
  };

  // Handle subprocess filter change
  const handleSubprocessFilterChange = (value: string) => {
    const subprocessId = value === 'all' ? null : Number(value);
    setFilterSubprocessId(subprocessId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-800">Gestión de Documentación</h4>
        <Button 
          onClick={() => handleOpenForm()} 
          className="bg-primary hover:bg-primary-dark text-white"
        >
          <PlusCircle className="h-5 w-5 mr-1" />
          Nuevo Documento
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Departamento
          </FormLabel>
          <Select
            value={filterDepartmentId?.toString() || ""}
            onValueChange={handleDepartmentFilterChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los departamentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los departamentos</SelectItem>
              {departments?.map(dept => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Subproceso
          </FormLabel>
          <Select
            value={filterSubprocessId?.toString() || ""}
            onValueChange={handleSubprocessFilterChange}
            disabled={isLoadingSubprocesses || !subprocesses?.length}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los subprocesos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los subprocesos</SelectItem>
              {subprocesses?.map(subprocess => (
                <SelectItem key={subprocess.id} value={subprocess.id.toString()}>
                  {subprocess.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoadingDocuments ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Subproceso</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents && documents.length > 0 ? (
                documents.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell className="font-medium">{document.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDocTypeBadgeClass(document.type)}`}>
                        {document.type}
                      </span>
                    </TableCell>
                    <TableCell>{getSubprocessName(document.subprocessId)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <a 
                        href={document.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        <LinkIcon className="h-3 w-3 mr-1" />
                        <span className="truncate">{document.url}</span>
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenForm(document)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDeletingDocument(document)}
                        className="text-destructive hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No hay documentos configurados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Document Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? "Editar Documento" : "Crear Documento"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del documento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://ejemplo.com/documento.pdf" 
                        type="url"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Documento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Manuales">Manuales</SelectItem>
                        <SelectItem value="SOPs">SOPs</SelectItem>
                        <SelectItem value="Formatos">Formatos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subprocessId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subproceso</FormLabel>
                    {isLoadingSubprocesses ? (
                      <div className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Cargando subprocesos...</span>
                      </div>
                    ) : (
                      <>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? field.value.toString() : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un subproceso" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subprocesses?.map(subprocess => (
                              <SelectItem key={subprocess.id} value={subprocess.id.toString()}>
                                {subprocess.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {!subprocesses?.length && (
                          <p className="text-xs text-amber-600 mt-1">
                            No hay subprocesos disponibles. Crea primero un subproceso.
                          </p>
                        )}
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending || !subprocesses?.length}
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>Guardar</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={!!deletingDocument} 
        onOpenChange={(open) => !open && setDeletingDocument(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el documento "{deletingDocument?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDocument && deleteMutation.mutate(deletingDocument.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>Eliminar</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
