
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

const departmentSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

export default function NewDepartmentsTab() {
  const { data: departments, refetch } = useQuery({
    queryKey: ["/api/departments"],
    queryFn: async () => {
      const response = await fetch("/api/departments");
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    },
  });

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Network response was not ok");
      form.reset();
      refetch();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Network response was not ok");
      refetch();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
        <Input
          placeholder="Nombre del departamento"
          {...form.register("name")}
        />
        <Button type="submit">
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </form>

      <div className="grid gap-4">
        {departments?.map((dept: any) => (
          <Card key={dept.id} className="p-4 flex justify-between items-center">
            <span>{dept.name}</span>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDelete(dept.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
