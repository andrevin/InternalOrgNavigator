import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Department, 
  Subprocess, 
  InsertSubprocess, 
  insertSubprocessSchema 
} from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Pencil, Trash2, Loader2 } from "lucide-react";
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

const subprocessFormSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es demasiado largo"),
  departmentId: z.coerce.number({
    required_error: "El departamento es requerido",
    invalid_type_error: "Seleccione un departamento válido",
  }),
});

type SubprocessFormValues = z.infer<typeof subprocessFormSchema>;

export default function SubprocessesTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubprocess, setEditingSubprocess] = useState<Subprocess | null>(null);
  const [deletingSubprocess, setDeletingSubprocess] = useState<Subprocess | null>(null);
  const [filterDepartmentId, setFilterDepartmentId] = useState<number | null>(null);

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

  const form = useForm<SubprocessFormValues>({
    resolver: zodResolver(subprocessFormSchema),
    defaultValues: {
      name: "",
      departmentId: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (subprocess: InsertSubprocess) => {
      const res = await apiRequest("POST", "/api/subprocesses", subprocess);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subprocesses'] });
      toast({ title: "Subproceso creado correctamente" });
      setFormOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error al crear el subproceso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, subprocess }: { id: number; subprocess: InsertSubprocess }) => {
      const res = await apiRequest("PUT", `/api/subprocesses/${id}`, subprocess);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subprocesses'] });
      toast({ title: "Subproceso actualizado correctamente" });
      setFormOpen(false);
      setEditingSubprocess(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el subproceso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/subprocesses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subprocesses'] });
      toast({ title: "Subproceso eliminado correctamente" });
      setDeletingSubprocess(null);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar el subproceso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenForm = (subprocess?: Subprocess) => {
    if (subprocess) {
      setEditingSubprocess(subprocess);
      form.reset({
        name: subprocess.name,
        departmentId: subprocess.departmentId,
      });
    } else {
      setEditingSubprocess(null);
      form.reset({
        name: "",
        departmentId: filterDepartmentId || 0,
      });
    }
    setFormOpen(true);
  };

  const onSubmit = (values: SubprocessFormValues) => {
    if (editingSubprocess) {
      updateMutation.mutate({ id: editingSubprocess.id, subprocess: values });
    } else {
      createMutation.mutate(values);
    }
  };

  // Find department name by ID
  const getDepartmentName = (departmentId: number) => {
    const department = departments?.find(d => d.id === departmentId);
    return department?.name || 'Departamento desconocido';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-800">Gestión de Subprocesos</h4>
        <Button 
          onClick={() => handleOpenForm()} 
          className="bg-primary hover:bg-primary-dark text-white"
        >
          <PlusCircle className="h-5 w-5 mr-1" />
          Nuevo Subproceso
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <FormLabel className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por Departamento
        </FormLabel>
        <Select
          value={filterDepartmentId?.toString() || ""}
          onValueChange={(value) => setFilterDepartmentId(value ? Number(value) : null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Todos los departamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los departamentos</SelectItem>
            {departments?.map(dept => (
              <SelectItem key={dept.id} value={dept.id.toString()}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {isLoadingDepartments || isLoadingSubprocesses ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subprocesses && subprocesses.length > 0 ? (
                subprocesses.map((subprocess) => (
                  <TableRow key={subprocess.id}>
                    <TableCell className="font-medium">{subprocess.name}</TableCell>
                    <TableCell>{getDepartmentName(subprocess.departmentId)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenForm(subprocess)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDeletingSubprocess(subprocess)}
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
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No hay subprocesos configurados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Subprocess Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubprocess ? "Editar Subproceso" : "Crear Subproceso"}
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
                      <Input placeholder="Nombre del subproceso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments?.map(dept => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  disabled={createMutation.isPending || updateMutation.isPending}
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
        open={!!deletingSubprocess} 
        onOpenChange={(open) => !open && setDeletingSubprocess(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el subproceso "{deletingSubprocess?.name}" 
              y todos los documentos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSubprocess && deleteMutation.mutate(deletingSubprocess.id)}
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
