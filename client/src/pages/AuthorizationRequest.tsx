import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Clock, XCircle, LogOut } from "lucide-react";

export default function AuthorizationRequest() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const { data: authStatus, isLoading } = trpc.authorization.getStatus.useQuery();
  const requestAccessMutation = trpc.authorization.requestAccess.useMutation({
    onSuccess: () => {
      utils.authorization.getStatus.invalidate();
    },
  });

  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  const handleRequestAccess = async () => {
    try {
      await requestAccessMutation.mutateAsync();
    } catch (error) {
      console.error("Erro ao solicitar acesso:", error);
    }
  };

  const getStatusDisplay = () => {
    if (!authStatus) {
      return (
        <div className="space-y-4">
          <p className="text-gray-600">Você ainda não solicitou acesso ao sistema.</p>
          <Button onClick={handleRequestAccess} disabled={requestAccessMutation.isPending}>
            {requestAccessMutation.isPending ? "Solicitando..." : "Solicitar Acesso"}
          </Button>
        </div>
      );
    }

    switch (authStatus.status) {
      case "pending":
        return (
          <div className="flex items-center gap-3 text-yellow-600">
            <Clock className="w-6 h-6" />
            <div>
              <p className="font-semibold">Solicitação Pendente</p>
              <p className="text-sm">Aguardando aprovação do administrador...</p>
            </div>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Acesso Aprovado</p>
              <p className="text-sm">Você pode acessar o sistema agora</p>
              <Button onClick={() => setLocation("/")} className="mt-2">
                Ir para o Sistema
              </Button>
            </div>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-3 text-red-600">
            <XCircle className="w-6 h-6" />
            <div>
              <p className="font-semibold">Solicitação Rejeitada</p>
              <p className="text-sm">Sua solicitação foi rejeitada pelo administrador</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Autorização de Acesso</CardTitle>
          <CardDescription>Hostel Bryan Tatuapé - Sistema de Gestão</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Usuário logado:</p>
            <p className="font-semibold">{user?.name || user?.email}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            {getStatusDisplay()}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
