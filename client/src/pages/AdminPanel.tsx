import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, LogOut, Users, Bell, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"authorizations" | "edit">("authorizations");
  const [showNotification, setShowNotification] = useState(false);
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [roomsData, setRoomsData] = useState<any[]>([]);
  const [editingCell, setEditingCell] = useState<{ roomId: number; guestId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLocation("/");
    }
  }, [user, setLocation]);

  const { data: pendingAuthorizations, isLoading: loadingPending } = trpc.authorization.getPending.useQuery(undefined, {
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });

  const approveMutation = trpc.authorization.approve.useMutation({
    onSuccess: () => {
      trpc.useUtils().authorization.getPending.invalidate();
      toast.success("Solicitação aprovada!");
    },
  });

  const rejectMutation = trpc.authorization.reject.useMutation({
    onSuccess: () => {
      trpc.useUtils().authorization.getPending.invalidate();
      toast.success("Solicitação rejeitada!");
    },
  });

  // Carregar dados dos quartos do localStorage
  useEffect(() => {
    const savedRooms = localStorage.getItem("hostel_rooms_data");
    if (savedRooms) {
      try {
        setRoomsData(JSON.parse(savedRooms));
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
  }, []);

  // Mostrar notificação quando há novas solicitações
  useEffect(() => {
    if (pendingAuthorizations && pendingAuthorizations.length > 0) {
      if (pendingAuthorizations.length > notificationCount) {
        setShowNotification(true);
        setNotificationCount(pendingAuthorizations.length);
        setTimeout(() => setShowNotification(false), 5000);
      }
    }
  }, [pendingAuthorizations?.length]);

  if (!user || user.role !== "admin") {
    return <div className="flex items-center justify-center min-h-screen">Acesso negado</div>;
  }

  const handleApprove = async (authId: number) => {
    try {
      await approveMutation.mutateAsync({ authId });
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      toast.error("Erro ao aprovar solicitação");
    }
  };

  const handleReject = async (authId: number) => {
    try {
      await rejectMutation.mutateAsync({ authId });
    } catch (error) {
      console.error("Erro ao rejeitar:", error);
      toast.error("Erro ao rejeitar solicitação");
    }
  };

  const handleEditCell = (roomId: number, guestId: string, field: string, currentValue: string) => {
    setEditingCell({ roomId, guestId, field });
    setEditValue(currentValue);
  };

  const handleSaveEdit = () => {
    if (!editingCell) return;

    const updatedRooms = roomsData.map((room) => {
      if (room.roomNumber === editingCell.roomId) {
        return {
          ...room,
          guests: room.guests.map((guest: any) => {
            if (guest.id === editingCell.guestId) {
              return {
                ...guest,
                [editingCell.field]: editValue,
              };
            }
            return guest;
          }),
        };
      }
      return room;
    });

    setRoomsData(updatedRooms);
    try {
      localStorage.setItem("hostel_rooms_data", JSON.stringify(updatedRooms));
    } catch (e: any) {
      if (e?.name === "QuotaExceededError" || e?.code === 22) {
        // Salvar versão compactada sem binários
        const compact = updatedRooms.map((room: any) => ({
          ...room,
          guests: room.guests.map((g: any) => ({ ...g, documentFile: "", photoFile: "" })),
          history: [],
          historyIndex: 0,
        }));
        try { localStorage.setItem("hostel_rooms_data", JSON.stringify(compact)); } catch {}
      }
    }
    setEditingCell(null);
    toast.success("Dados atualizados com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notificação flutuante */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
          <Bell className="w-5 h-5" />
          <span>Nova solicitação de acesso recebida!</span>
        </div>
      )}

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
            className="relative"
          >
            <Users className="w-4 h-4 mr-2" />
            Solicitações de Acesso
            {pendingAuthorizations && pendingAuthorizations.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {pendingAuthorizations.length}
              </span>
            )}
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
                      className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200"
                    >
                      <div>
                        <p className="font-semibold">Usuário ID: {auth.userId}</p>
                        <p className="text-sm text-gray-600">
                          Solicitado em: {new Date(auth.requestedAt).toLocaleString("pt-BR")}
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
              <CardDescription>Edite linhas com datas passadas ou bloqueadas - clique nos campos para editar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roomsData.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Nenhum dado disponível</div>
                ) : (
                  roomsData.map((room) => (
                    <div key={room.roomNumber} className="border rounded-lg p-4 bg-white">
                      <button
                        onClick={() => setEditingRoom(editingRoom === room.roomNumber ? null : room.roomNumber)}
                        className="flex items-center justify-between w-full mb-3 font-semibold hover:bg-gray-100 p-2 rounded transition"
                      >
                        <span>Quarto {room.roomNumber}</span>
                        <span className="text-sm text-gray-500">{room.guests.length} hóspede(s)</span>
                      </button>

                      {editingRoom === room.roomNumber && (
                        <div className="space-y-3 bg-gray-50 p-3 rounded">
                          {room.guests.map((guest: any) => (
                            <div key={guest.id} className="border-t pt-3 first:border-t-0 first:pt-0">
                              <p className="font-semibold text-sm mb-2">
                                {guest.firstName} {guest.lastName} (Dia {guest.day})
                              </p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {["daily", "launch", "payment", "finalBalance"].map((field) => (
                                  <div key={field} className="flex items-center gap-2">
                                    {editingCell?.roomId === room.roomNumber &&
                                    editingCell?.guestId === guest.id &&
                                    editingCell?.field === field ? (
                                      <div className="flex gap-1 w-full">
                                        <Input
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          className="h-8 text-xs"
                                          autoFocus
                                        />
                                        <button
                                          onClick={handleSaveEdit}
                                          className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                                          title="Salvar"
                                        >
                                          <Save className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => setEditingCell(null)}
                                          className="p-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                                          title="Cancelar"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          handleEditCell(room.roomNumber, guest.id, field, guest[field] || "")
                                        }
                                        className="flex items-center gap-1 p-1 hover:bg-blue-100 rounded flex-1 transition"
                                      >
                                        <span className="text-xs font-medium text-gray-600">
                                          {field === "daily"
                                            ? "Diária"
                                            : field === "launch"
                                              ? "Lançamento"
                                              : field === "payment"
                                                ? "Pagamento"
                                                : "Saldo"}
                                          :
                                        </span>
                                        <span className="text-xs flex-1 text-left font-mono">
                                          {guest[field] || "-"}
                                        </span>
                                        <Edit2 className="w-3 h-3 text-blue-500" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
