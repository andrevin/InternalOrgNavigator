import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface HeaderProps {
  onToggleAdmin: () => void;
}

export default function Header({ onToggleAdmin }: HeaderProps) {
  const { user, logoutMutation } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
            <span className="text-white font-bold text-xl">GP</span>
          </div>
          <h1 className="text-xl font-semibold text-secondary-dark">Gestor de Procesos</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center">
            <span className="text-sm text-gray-600">Bienvenido, </span>
            <span className="text-sm font-medium ml-1 text-gray-800">{user?.username}</span>
          </div>
          
          <div className="flex space-x-2 items-center">
            {/* Admin button - only show for admin users */}
            {user?.isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleAdmin}
                aria-label="Panel de Administración"
                className="text-secondary"
              >
                <Settings className="h-6 w-6" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Salir
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
