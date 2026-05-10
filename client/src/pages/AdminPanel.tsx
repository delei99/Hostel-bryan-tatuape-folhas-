import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, LogOut, Users } from "lucide-react";

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"authorizations" | "edit">("authorizations");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  const { data: pendingAuthorizations, isLoading: loadingPending } = trpc.authorization.getPending.useQuery();
  const approveMutation = trpc.authorization.approve.useMutation({
    onSuccess: () => {
      trpc.useUtils().authorization.getPending.invalidate();
    },
  });
  const rejectMutation = trpc.authorization.reject.useMutation({
    onSuccess: () => {
      trpc.useUtils().authorization.getPending.invalidate();
    },
  });

  if (!user || user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Acesso negado</div>;
  }

  const handleApprove = async (authId: number) => {
    try {
      await approveMutation.mutateAsync({ authId });
    } catch (error) {
      console.error("Erro ao aprovar:", error);
    }
  };

  const handleReject = async (authId: number) => {
    try {
      await rejectMutation.mutateAsync({ authId });
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Painel de Administração</h1>
            <p className="text-gray-600">Gerenciar autorizações e dados bloqueados</p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "authorizations" ? "default" : "outline"}
            onClick={() => setActiveTab("authorizations")}
          >
            <Users className="w-4 h-4 mr-2" />
            Solicitações de Acesso
          </Button>
          <Button
            variant={activeTab === "edit" ? "default" : "outline"}
            onClick={() => setActiveTab("edit")}
          >
            Editar Dados Bloqueados
          </Button>
        </div>

        {/* Authorizations Tab */}
        {activeTab === "authorizations" && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Pendentes</CardTitle>
              <CardDescription>
                {loadingPending ? "Carregando..." : `${pendingAuthorizations?.length || 0} solicitação(ões) pendente(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <div className="text-center py-8">Carregando...</div>
              ) : !pendingAuthorizations || pendingAuthorizations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma solicitação pendente</div>
              ) : (
                <div className="space-y-4">
                  {pendingAuthorizations.map((auth) => (
                    <div
                      key={auth.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold">Usuário ID: {auth.userId}</p>
                        <p className="text-sm text-gray-600">
                          Solicitado em: {new Date(auth.requestedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(auth.id)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(auth.id)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Blocked Data Tab */}
        {activeTab === "edit" && (
          <Card>
            <CardHeader>
              <CardTitle>Editar Dados Bloqueados</CardTitle>
              <CardDescription>Edite linhas com datas passadas ou bloqueadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Funcionalidade em desenvolvimento...
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
