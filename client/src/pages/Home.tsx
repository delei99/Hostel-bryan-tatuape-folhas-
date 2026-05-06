import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Download } from "lucide-react";

interface Guest {
  id: string;
  day: string;
  guestName: string;
  reservationEngine: string;
  balance: string;
  payment: string;
  paymentMethod: string;
}

export default function Home() {
  const [guests, setGuests] = useState<Guest[]>([
    ...Array.from({ length: 31 }, (_, index) => ({
      id: String(index + 1),
      day: String(index + 1).padStart(2, "0"),
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    })),
    ...Array.from({ length: 5 }, (_, index) => ({
      id: String(32 + index),
      day: "",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    })),
  ]);

  const formatCurrency = (value: string): string => {
    // Remove tudo que não é número
    let numericValue = value.replace(/\D/g, "");
    
    // Se vazio, retorna vazio
    if (!numericValue) return "";
    
    // Converte para número e divide por 100 para obter os centavos
    const numberValue = parseInt(numericValue, 10);
    const formatted = (numberValue / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return formatted;
  };

  const handleInputChange = (id: string, field: keyof Guest, value: string) => {
    let finalValue = value;
    
    // Aplicar formatação de moeda para SALDO e PAGAMENTO
    if ((field === "balance" || field === "payment") && value) {
      finalValue = formatCurrency(value);
    }
    
    setGuests(
      guests.map((guest) =>
        guest.id === id ? { ...guest, [field]: finalValue } : guest
      )
    );
  };

  const handleAddRow = () => {
    const newId = String(Math.max(...guests.map((g) => parseInt(g.id)), 0) + 1);
    setGuests([
      ...guests,
      {
        id: newId,
        day: "",
        guestName: "",
        reservationEngine: "",
        balance: "",
        payment: "",
        paymentMethod: "",
      },
    ]);
  };

  const handleDeleteRow = (id: string) => {
    setGuests(guests.filter((guest) => guest.id !== id));
  };

  const handleExport = () => {
    const csv = [
      ["DIA", "NOME DO HÓSPEDE", "MOTOR DE RESERVA", "SALDO", "PAGAMENTO", "FORMA DE PAGAMENTO"],
      ...guests.map((g) => [
        g.day,
        g.guestName,
        g.reservationEngine,
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
        <div className="flex gap-3 mb-6">
          <Button
            onClick={handleAddRow}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus size={18} />
            Adicionar Linha
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex items-center gap-2 border-gray-300"
          >
            <Download size={18} />
            Exportar CSV
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
        </div>
      </div>
    </div>
  );
}
