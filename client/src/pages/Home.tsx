import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Download, RotateCcw, RotateCw } from "lucide-react";

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

const STORAGE_KEY = "hostel_guests_data";
const HISTORY_KEY = "hostel_guests_history";

export default function Home() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [history, setHistory] = useState<Guest[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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

  // Carregar dados do localStorage ao montar o componente
  useEffect(() => {
    const savedGuests = localStorage.getItem(STORAGE_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);

    if (savedGuests) {
      try {
        const parsedGuests = JSON.parse(savedGuests).map(normalizeGuest);
        setGuests(parsedGuests);
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory).map((guests: any[]) =>
            guests.map(normalizeGuest)
          );
          setHistory(parsedHistory);
          setHistoryIndex(parsedHistory.length - 1);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
        createInitialGuests();
      }
    } else {
      createInitialGuests();
    }
  }, []);

  const createInitialGuests = () => {
    const initialGuests = [
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
    setGuests(initialGuests);
    setHistory([initialGuests]);
    setHistoryIndex(0);
  };

  // Salvar dados no localStorage sempre que guests mudar
  useEffect(() => {
    if (guests.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
    }
  }, [guests]);

  // Salvar histórico no localStorage sempre que history mudar
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }
  }, [history]);

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

  const updateGuestsWithHistory = (newGuests: Guest[]) => {
    setGuests(newGuests);
    
    // Adicionar ao histórico
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGuests);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleInputChange = (id: string, field: keyof Guest, value: string) => {
    let finalValue = value;
    
    if ((field === "daily" || field === "balance" || field === "payment") && value) {
      finalValue = formatCurrency(value);
    }
    
    const updatedGuests = guests.map((guest) =>
      guest.id === id ? { ...guest, [field]: finalValue } : guest
    );
    
    // Lógica de carregamento de saldo entre dias
    if (field === "daily" || field === "balance" || field === "payment") {
      const currentGuestIndex = updatedGuests.findIndex((g) => g.id === id);
      
      if (currentGuestIndex !== -1 && currentGuestIndex < updatedGuests.length - 1) {
        const currentGuest = updatedGuests[currentGuestIndex];
        const nextGuest = updatedGuests[currentGuestIndex + 1];
        
        // Calcular o saldo total (saldo anterior + diária)
        const dailyValue = convertCurrencyToNumber(currentGuest.daily);
        const previousBalance = convertCurrencyToNumber(currentGuest.balance);
        const totalBalance = dailyValue + previousBalance;
        
        const currentPayment = convertCurrencyToNumber(currentGuest.payment);
        
        // Se há saldo total e não há pagamento, o saldo vai para o próximo dia
        if (totalBalance > 0 && currentPayment === 0) {
          updatedGuests[currentGuestIndex + 1] = {
            ...nextGuest,
            balance: formatCurrency(String(Math.round(totalBalance * 100))),
          };
        }
        // Se há pagamento, diminui do saldo do próximo dia
        else if (currentPayment > 0 && totalBalance > 0) {
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
        }
        // Se não há saldo ou foi zerado, limpa o saldo do próximo dia
        else if (totalBalance === 0 && currentPayment === 0) {
          updatedGuests[currentGuestIndex + 1] = {
            ...nextGuest,
            balance: "",
          };
        }
      }
    }
    
    updateGuestsWithHistory(updatedGuests);
  };

  const handleAddRow = () => {
    const newId = String(Math.max(...guests.map((g) => parseInt(g.id)), 0) + 1);
    const newGuests = [
      ...guests,
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
    updateGuestsWithHistory(newGuests);
  };

  const handleDeleteRow = (id: string) => {
    const newGuests = guests.filter((guest) => guest.id !== id);
    updateGuestsWithHistory(newGuests);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setGuests(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setGuests(history[newIndex]);
    }
  };

  const handleExport = () => {
    const csv = [
      ["DIA", "NOME DO HÓSPEDE", "MOTOR DE RESERVA", "DIÁRIA", "SALDO", "PAGAMENTO", "FORMA DE PAGAMENTO"],
      ...guests.map((g) => [
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
    element.setAttribute("download", "hostel_guests.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearAll = () => {
    if (confirm("Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.")) {
      const clearedGuests = guests.map((g) => ({
        ...g,
        guestName: "",
        reservationEngine: "",
        daily: "",
        balance: "",
        payment: "",
        paymentMethod: "",
      }));
      updateGuestsWithHistory(clearedGuests);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-600">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              HOSTEL BRYAN TATUAPÉ
            </h1>
            <p className="text-gray-600">Gestão de Hóspedes e Reservas</p>
            <p className="text-sm text-gray-500 mt-2">
              Mês de {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <Button
            onClick={handleAddRow}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus size={18} />
            Adicionar Linha
          </Button>
          <Button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            variant="outline"
            className="flex items-center gap-2 border-gray-300"
          >
            <RotateCcw size={18} />
            Desfazer
          </Button>
          <Button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            variant="outline"
            className="flex items-center gap-2 border-gray-300"
          >
            <RotateCw size={18} />
            Refazer
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2 border-gray-300"
          >
            <Download size={18} />
            Exportar CSV
          </Button>
          <Button
            onClick={handleClearAll}
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
                {guests.map((guest, index) => (
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
                            handleInputChange(guest.id, "day", e.target.value)
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
                          handleInputChange(guest.id, "guestName", e.target.value)
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
                          handleInputChange(guest.id, "daily", e.target.value)
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
                          handleInputChange(guest.id, "balance", e.target.value)
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
                          handleInputChange(guest.id, "payment", e.target.value)
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
                        onClick={() => handleDeleteRow(guest.id)}
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
    </div>
  );
}
