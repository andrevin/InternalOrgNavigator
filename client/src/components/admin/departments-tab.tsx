import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Department, 
  InsertDepartment, 
  insertDepartmentSchema 
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

const departmentFormSchema = insertDepartmentSchema.extend({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es demasiado largo"),
  category: z.enum(["Estratégicos", "Operativos", "Apoyo"], {
    required_error: "La categoría es requerida",
  }),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export default function DepartmentsTab() {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);

  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
  });

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      category: "Estratégicos",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (department: InsertDepartment) => {
      const res = await apiRequest("POST", "/api/departments", department);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({ title: "Departamento creado correctamente" });
      setFormOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error al crear el departamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, department }: { id: number; department: InsertDepartment }) => {
      const res = await apiRequest("PUT", `/api/departments/${id}`, department);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({ title: "Departamento actualizado correctamente" });
      setFormOpen(false);
      setEditingDepartment(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar el departamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/departments'] });
      toast({ title: "Departamento eliminado correctamente" });
      setDeletingDepartment(null);
    },
    onError: (error) => {
      toast({
        title: "Error al eliminar el departamento",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleOpenForm = (department?: Department) => {
    if (department) {
      setEditingDepartment(department);
      form.reset({
        name: department.name,
        category: department.category as "Estratégicos" | "Operativos" | "Apoyo",
      });
    } else {
      setEditingDepartment(null);
      form.reset({
        name: "",
        category: "Estratégicos",
      });
    }
    setFormOpen(true);
  };

  const onSubmit = (values: DepartmentFormValues) => {
    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, department: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-800">Gestión de Departamentos</h4>
        <Button 
          onClick={() => handleOpenForm()} 
          className="bg-primary hover:bg-primary-dark text-white"
        >
          <PlusCircle className="h-5 w-5 mr-1" />
          Nuevo Departamento
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments && departments.length > 0 ? (
                departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeClass(dept.category)}`}>
                        {dept.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenForm(dept)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setDeletingDepartment(dept)}
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
                    No hay departamentos configurados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Department Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDepartment ? "Editar Departamento" : "Crear Departamento"}
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
                      <Input placeholder="Nombre del departamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Estratégicos">Estratégicos</SelectItem>
                        <SelectItem value="Operativos">Operativos</SelectItem>
                        <SelectItem value="Apoyo">Apoyo</SelectItem>
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
        open={!!deletingDepartment} 
        onOpenChange={(open) => !open && setDeletingDepartment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el departamento "{deletingDepartment?.name}" 
              y todos los subprocesos y documentos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingDepartment && deleteMutation.mutate(deletingDepartment.id)}
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
