import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Download, RotateCcw, RotateCw, ChevronRight } from "lucide-react";

interface Guest {
  id: string;
  day: string;
  guestName: string;
  reservationEngine: string;
  daily: string;
  balance: string;
  payment: string;
  paymentMethod: string;
}

interface RoomData {
  roomNumber: number;
  guests: Guest[];
  history: Guest[][];
  historyIndex: number;
}

const STORAGE_KEY = "hostel_rooms_data";
const NUM_ROOMS = 7;

export default function Home() {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [selectedRoom, setSelectedRoom] = useState(1);

  // Normalizar dados para garantir que todos os campos estejam definidos
  const normalizeGuest = (guest: any): Guest => ({
    id: guest.id || "",
    day: guest.day ?? "",
    guestName: guest.guestName ?? "",
    reservationEngine: guest.reservationEngine ?? "",
    daily: guest.daily ?? "",
    balance: guest.balance ?? "",
    payment: guest.payment ?? "",
    paymentMethod: guest.paymentMethod ?? "",
  });

  // Criar dados iniciais para um quarto
  const createInitialGuestsForRoom = (): Guest[] => {
    return [
      ...Array.from({ length: 31 }, (_, index) => ({
        id: String(index + 1),
        day: String(index + 1).padStart(2, "0"),
        guestName: "",
        reservationEngine: "",
        daily: "",
        balance: "",
        payment: "",
        paymentMethod: "",
      })),
      ...Array.from({ length: 5 }, (_, index) => ({
        id: String(32 + index),
        day: "",
        guestName: "",
        reservationEngine: "",
        daily: "",
        balance: "",
        payment: "",
        paymentMethod: "",
      })),
    ];
  };

  // Carregar dados do localStorage ao montar o componente
  useEffect(() => {
    const savedRooms = localStorage.getItem(STORAGE_KEY);

    if (savedRooms) {
      try {
        const parsedRooms = JSON.parse(savedRooms).map((room: any) => ({
          ...room,
          guests: room.guests.map(normalizeGuest),
          history: room.history.map((guests: any[]) =>
            guests.map(normalizeGuest)
          ),
        }));
        setRooms(parsedRooms);
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
        createInitialRooms();
      }
    } else {
      createInitialRooms();
    }
  }, []);

  const createInitialRooms = () => {
    const newRooms: RoomData[] = Array.from({ length: NUM_ROOMS }, (_, index) => {
      const initialGuests = createInitialGuestsForRoom();
      return {
        roomNumber: index + 1,
        guests: initialGuests,
        history: [initialGuests],
        historyIndex: 0,
      };
    });
    setRooms(newRooms);
  };

  // Salvar dados no localStorage sempre que rooms mudar
  useEffect(() => {
    if (rooms.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
    }
  }, [rooms]);

  const formatCurrency = (value: string): string => {
    let numericValue = value.replace(/\D/g, "");
    
    if (!numericValue) return "";
    
    const numberValue = parseInt(numericValue, 10);
    const formatted = (numberValue / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatted;
  };

  const convertCurrencyToNumber = (value: string): number => {
    const cleaned = value.replace(/R\$\s?/g, "").replace(/\./g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  };

  const updateRoomData = (roomNumber: number, newGuests: Guest[], newHistory: Guest[][], newHistoryIndex: number) => {
    setRooms(
      rooms.map((room) =>
        room.roomNumber === roomNumber
          ? {
              ...room,
              guests: newGuests,
              history: newHistory,
              historyIndex: newHistoryIndex,
            }
          : room
      )
    );
  };

  const handleInputChange = (roomNumber: number, id: string, field: keyof Guest, value: string) => {
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room) return;

    let finalValue = value;
    
    if ((field === "daily" || field === "balance" || field === "payment") && value) {
      finalValue = formatCurrency(value);
    }
    
    const updatedGuests = room.guests.map((guest) =>
      guest.id === id ? { ...guest, [field]: finalValue } : guest
    );
    
    // Lógica de carregamento de saldo entre dias
    if (field === "daily" || field === "balance" || field === "payment") {
      const currentGuestIndex = updatedGuests.findIndex((g) => g.id === id);
      
      if (currentGuestIndex !== -1 && currentGuestIndex < updatedGuests.length - 1) {
        const currentGuest = updatedGuests[currentGuestIndex];
        const nextGuest = updatedGuests[currentGuestIndex + 1];
        
        const dailyValue = convertCurrencyToNumber(currentGuest.daily);
        const previousBalance = convertCurrencyToNumber(currentGuest.balance);
        const totalBalance = dailyValue + previousBalance;
        
        const currentPayment = convertCurrencyToNumber(currentGuest.payment);
        
        if (totalBalance > 0 && currentPayment === 0) {
          updatedGuests[currentGuestIndex + 1] = {
            ...nextGuest,
            balance: formatCurrency(String(Math.round(totalBalance * 100))),
          };
        } else if (currentPayment > 0 && totalBalance > 0) {
          const remainingBalance = totalBalance - currentPayment;
          if (remainingBalance > 0) {
            updatedGuests[currentGuestIndex + 1] = {
              ...nextGuest,
              balance: formatCurrency(String(Math.round(remainingBalance * 100))),
            };
          } else {
            updatedGuests[currentGuestIndex + 1] = {
              ...nextGuest,
              balance: "",
            };
          }
        } else if (totalBalance === 0 && currentPayment === 0) {
          updatedGuests[currentGuestIndex + 1] = {
            ...nextGuest,
            balance: "",
          };
        }
      }
    }
    
    const newHistory = room.history.slice(0, room.historyIndex + 1);
    newHistory.push(updatedGuests);
    updateRoomData(roomNumber, updatedGuests, newHistory, newHistory.length - 1);
  };

  const handleAddRow = (roomNumber: number) => {
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room) return;

    const newId = String(Math.max(...room.guests.map((g) => parseInt(g.id)), 0) + 1);
    const newGuests = [
      ...room.guests,
      {
        id: newId,
        day: "",
        guestName: "",
        reservationEngine: "",
        daily: "",
        balance: "",
        payment: "",
        paymentMethod: "",
      },
    ];

    const newHistory = room.history.slice(0, room.historyIndex + 1);
    newHistory.push(newGuests);
    updateRoomData(roomNumber, newGuests, newHistory, newHistory.length - 1);
  };

  const handleDeleteRow = (roomNumber: number, id: string) => {
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room) return;

    const newGuests = room.guests.filter((guest) => guest.id !== id);
    const newHistory = room.history.slice(0, room.historyIndex + 1);
    newHistory.push(newGuests);
    updateRoomData(roomNumber, newGuests, newHistory, newHistory.length - 1);
  };

  const handleUndo = (roomNumber: number) => {
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room || room.historyIndex <= 0) return;

    const newIndex = room.historyIndex - 1;
    updateRoomData(roomNumber, room.history[newIndex], room.history, newIndex);
  };

  const handleRedo = (roomNumber: number) => {
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room || room.historyIndex >= room.history.length - 1) return;

    const newIndex = room.historyIndex + 1;
    updateRoomData(roomNumber, room.history[newIndex], room.history, newIndex);
  };

  const handleExport = (roomNumber: number) => {
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room) return;

    const csv = [
      ["DIA", "NOME DO HÓSPEDE", "MOTOR DE RESERVA", "DIÁRIA", "SALDO", "PAGAMENTO", "FORMA DE PAGAMENTO"],
      ...room.guests.map((g) => [
        g.day,
        g.guestName,
        g.reservationEngine,
        g.daily,
        g.balance,
        g.payment,
        g.paymentMethod,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const element = document.createElement("a");
    element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    element.setAttribute("download", `hostel_quarto_${roomNumber}.csv`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearAll = (roomNumber: number) => {
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room) return;

    if (confirm("Tem certeza que deseja limpar todos os dados deste quarto? Esta ação não pode ser desfeita.")) {
      const clearedGuests = room.guests.map((g) => ({
        ...g,
        guestName: "",
        reservationEngine: "",
        daily: "",
        balance: "",
        payment: "",
        paymentMethod: "",
      }));

      const newHistory = room.history.slice(0, room.historyIndex + 1);
      newHistory.push(clearedGuests);
      updateRoomData(roomNumber, clearedGuests, newHistory, newHistory.length - 1);
    }
  };

  const currentRoom = rooms.find((r) => r.roomNumber === selectedRoom);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Painel Lateral Esquerdo */}
      <div className="w-24 bg-blue-600 text-white flex flex-col items-center py-6 gap-4 shadow-lg">
        <h2 className="text-sm font-bold text-center px-2">QUARTOS</h2>
        <div className="flex-1 flex flex-col gap-2 w-full px-2">
          {rooms.map((room) => (
            <button
              key={room.roomNumber}
              onClick={() => setSelectedRoom(room.roomNumber)}
              className={`py-3 px-2 rounded-lg font-bold text-sm transition-all ${
                selectedRoom === room.roomNumber
                  ? "bg-white text-blue-600 shadow-lg"
                  : "bg-blue-500 hover:bg-blue-400 text-white"
              }`}
            >
              {room.roomNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 p-6 overflow-auto">
        {currentRoom && (
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  HOSTEL BRYAN TATUAPÉ
                </h1>
                <p className="text-gray-600">Gestão de Hóspedes e Reservas - Quarto {currentRoom.roomNumber}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Mês de {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <Button
                onClick={() => handleAddRow(currentRoom.roomNumber)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Plus size={18} />
                Adicionar Linha
              </Button>
              <Button
                onClick={() => handleUndo(currentRoom.roomNumber)}
                disabled={currentRoom.historyIndex <= 0}
                variant="outline"
                className="flex items-center gap-2 border-gray-300"
              >
                <RotateCcw size={18} />
                Desfazer
              </Button>
              <Button
                onClick={() => handleRedo(currentRoom.roomNumber)}
                disabled={currentRoom.historyIndex >= currentRoom.history.length - 1}
                variant="outline"
                className="flex items-center gap-2 border-gray-300"
              >
                <RotateCw size={18} />
                Refazer
              </Button>
              <Button
                onClick={() => handleExport(currentRoom.roomNumber)}
                variant="outline"
                className="flex items-center gap-2 border-gray-300"
              >
                <Download size={18} />
                Exportar CSV
              </Button>
              <Button
                onClick={() => handleClearAll(currentRoom.roomNumber)}
                variant="outline"
                className="flex items-center gap-2 border-gray-300 text-orange-600 hover:text-orange-700"
              >
                Limpar Tudo
              </Button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-blue-600 text-white">
                      <th className="px-4 py-3 text-left font-semibold text-sm">
                        DIA
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">
                        NOME DO HÓSPEDE
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">
                        MOTOR DE RESERVA
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">
                        DIÁRIA
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">
                        SALDO
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">
                        PAGAMENTO
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-sm">
                        FORMA DE PAGAMENTO
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-sm">
                        AÇÃO
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRoom.guests.map((guest, index) => (
                      <tr
                        key={guest.id}
                        className={`border-b ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50"
                        } hover:bg-blue-50 transition-colors`}
                      >
                        <td className="px-4 py-3">
                          {index < 31 ? (
                            <div className="font-semibold text-gray-900 text-sm">
                              {guest.day}
                            </div>
                          ) : (
                            <Input
                              type="text"
                              value={guest.day}
                              onChange={(e) =>
                                handleInputChange(currentRoom.roomNumber, guest.id, "day", e.target.value)
                              }
                              placeholder="Dia"
                              className="border-gray-300 text-sm"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={guest.guestName}
                            onChange={(e) =>
                              handleInputChange(currentRoom.roomNumber, guest.id, "guestName", e.target.value)
                            }
                            placeholder="Nome do hóspede"
                            className="border-gray-300 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={guest.reservationEngine}
                            onChange={(e) =>
                              handleInputChange(
                                currentRoom.roomNumber,
                                guest.id,
                                "reservationEngine",
                                e.target.value
                              )
                            }
                            placeholder="Motor de reserva"
                            className="border-gray-300 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={guest.daily}
                            onChange={(e) =>
                              handleInputChange(currentRoom.roomNumber, guest.id, "daily", e.target.value)
                            }
                            placeholder="Digite o valor"
                            className={`border-gray-300 text-sm ${
                              guest.daily ? "text-blue-600 font-semibold" : ""
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={guest.balance}
                            onChange={(e) =>
                              handleInputChange(currentRoom.roomNumber, guest.id, "balance", e.target.value)
                            }
                            placeholder="Digite o valor"
                            className={`border-gray-300 text-sm ${
                              guest.balance ? "text-blue-600 font-semibold" : ""
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={guest.payment}
                            onChange={(e) =>
                              handleInputChange(currentRoom.roomNumber, guest.id, "payment", e.target.value)
                            }
                            placeholder="Digite o valor"
                            className={`border-gray-300 text-sm ${
                              guest.payment ? "text-red-600 font-semibold" : ""
                            }`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="text"
                            value={guest.paymentMethod}
                            onChange={(e) =>
                              handleInputChange(
                                currentRoom.roomNumber,
                                guest.id,
                                "paymentMethod",
                                e.target.value
                              )
                            }
                            placeholder="PIX, DN, CC, CD, AP, TB, QR, DB"
                            className="border-gray-300 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            onClick={() => handleDeleteRow(currentRoom.roomNumber, guest.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-300">
              <p className="text-xs text-gray-600">
                <strong>Formas de Pagamento:</strong> PIX, DN (Dinheiro), CC (Cartão de Crédito), CD (Cartão de Débito), AP (Antecipado), TB (Transferência Bancária), QR (QR Code), DB (Débito)
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Nota:</strong> A coluna DIÁRIA é somada ao SALDO. Se houver saldo total e sem pagamento, o saldo passa automaticamente para o dia seguinte. Se houver pagamento, ele diminui automaticamente do saldo do dia seguinte.
              </p>
              <p className="text-xs text-gray-600 mt-2">
                <strong>Dados salvos automaticamente:</strong> Todos os seus dados são salvos automaticamente no navegador. Use os botões Desfazer/Refazer para navegar pelo histórico de alterações.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
