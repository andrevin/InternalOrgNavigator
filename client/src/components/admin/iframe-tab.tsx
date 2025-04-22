import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const iframeConfigSchema = z.object({
  iframeUrl: z.string().url("URL inválida").min(1, "La URL es requerida"),
  iframeTitle: z.string().min(1, "El título es requerido").max(100, "El título es demasiado largo"),
  iframeHeight: z.coerce.number().min(100, "Altura mínima: 100px").max(2000, "Altura máxima: 2000px"),
  iframeDescription: z.string().optional(),
});

type IframeConfigValues = z.infer<typeof iframeConfigSchema>;

export default function IframeTab() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch iframe configurations
  const { data: urlConfig, isLoading: isLoadingUrl } = useQuery({
    queryKey: ['/api/config/iframeUrl'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/config/iframeUrl');
        if (!response.ok) return { value: '' };
        return await response.json();
      } catch (error) {
        return { value: '' };
      }
    }
  });

  const { data: titleConfig, isLoading: isLoadingTitle } = useQuery({
    queryKey: ['/api/config/iframeTitle'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/config/iframeTitle');
        if (!response.ok) return { value: 'Panel de Indicadores' };
        return await response.json();
      } catch (error) {
        return { value: 'Panel de Indicadores' };
      }
    }
  });

  const { data: heightConfig, isLoading: isLoadingHeight } = useQuery({
    queryKey: ['/api/config/iframeHeight'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/config/iframeHeight');
        if (!response.ok) return { value: '500' };
        return await response.json();
      } catch (error) {
        return { value: '500' };
      }
    }
  });

  const { data: descriptionConfig, isLoading: isLoadingDescription } = useQuery({
    queryKey: ['/api/config/iframeDescription'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/config/iframeDescription');
        if (!response.ok) return { value: 'Este panel muestra información externa relacionada con los procesos seleccionados.' };
        return await response.json();
      } catch (error) {
        return { value: 'Este panel muestra información externa relacionada con los procesos seleccionados.' };
      }
    }
  });

  const form = useForm<IframeConfigValues>({
    resolver: zodResolver(iframeConfigSchema),
    defaultValues: {
      iframeUrl: "",
      iframeTitle: "Panel de Indicadores",
      iframeHeight: 500,
      iframeDescription: "Este panel muestra información externa relacionada con los procesos seleccionados.",
    },
  });

  // Update form values when data is loaded
  useState(() => {
    if (
      urlConfig?.value &&
      titleConfig?.value &&
      heightConfig?.value &&
      descriptionConfig?.value &&
      !isLoadingUrl &&
      !isLoadingTitle &&
      !isLoadingHeight &&
      !isLoadingDescription
    ) {
      form.reset({
        iframeUrl: urlConfig.value,
        iframeTitle: titleConfig.value,
        iframeHeight: parseInt(heightConfig.value, 10),
        iframeDescription: descriptionConfig.value,
      });
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (values: IframeConfigValues) => {
      setIsLoading(true);
      // Save each config value
      await apiRequest("POST", "/api/config", { 
        key: "iframeUrl", 
        value: values.iframeUrl 
      });
      await apiRequest("POST", "/api/config", { 
        key: "iframeTitle", 
        value: values.iframeTitle 
      });
      await apiRequest("POST", "/api/config", { 
        key: "iframeHeight", 
        value: values.iframeHeight.toString() 
      });
      await apiRequest("POST", "/api/config", { 
        key: "iframeDescription", 
        value: values.iframeDescription || "" 
      });
      return values;
    },
    onSuccess: () => {
      setIsLoading(false);
      // Invalidate all config queries
      queryClient.invalidateQueries({ queryKey: ['/api/config/iframeUrl'] });
      queryClient.invalidateQueries({ queryKey: ['/api/config/iframeTitle'] });
      queryClient.invalidateQueries({ queryKey: ['/api/config/iframeHeight'] });
      queryClient.invalidateQueries({ queryKey: ['/api/config/iframeDescription'] });
      
      toast({ title: "Configuración guardada correctamente" });
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Error al guardar la configuración",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: IframeConfigValues) => {
    saveMutation.mutate(values);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-800 mb-4">Configuración del Panel Lateral (iframe)</h4>
      
      <Card>
        <CardContent className="pt-6">
          {isLoadingUrl || isLoadingTitle || isLoadingHeight || isLoadingDescription ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="iframeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL del contenido externo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://ejemplo.com/embed" 
                          type="url"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Introduce la URL completa del contenido que deseas mostrar en el panel lateral.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="iframeTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título del panel</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Título del panel" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iframeHeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura (px)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="500"
                            min={100}
                            max={2000}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="iframeDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe el contenido del panel" 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="mr-2"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>Guardar Configuración</>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      <div className="mt-8">
        <h5 className="text-sm font-medium text-gray-700 mb-2">Vista previa</h5>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-800 mb-2">
            {form.watch("iframeTitle") || "Panel de Indicadores"}
          </div>
          <div className="bg-gray-100 rounded-lg p-2 mb-3">
            <div className="text-xs text-gray-500 mb-1">Contenido externo</div>
            <div className="rounded overflow-hidden bg-white shadow-inner">
              {form.watch("iframeUrl") ? (
                <iframe
                  src={form.watch("iframeUrl")}
                  className="w-full border-0"
                  style={{ height: `${form.watch("iframeHeight") || 500}px` }}
                  title={form.watch("iframeTitle") || "Contenido externo"}
                ></iframe>
              ) : (
                <div 
                  className="flex items-center justify-center bg-gray-50"
                  style={{ height: `${form.watch("iframeHeight") || 500}px` }}
                >
                  <p className="text-gray-500">Introduce una URL para ver la vista previa</p>
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-600">
            <p>{form.watch("iframeDescription") || "Este panel muestra información externa relacionada con los procesos seleccionados."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
