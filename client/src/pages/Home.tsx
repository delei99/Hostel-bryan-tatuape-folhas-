import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Download } from "lucide-react";

interface Guest {
  id: string;
  roomNumber: string;
  guestName: string;
  reservationEngine: string;
  balance: string;
  payment: string;
  paymentMethod: string;
}

export default function Home() {
  const [guests, setGuests] = useState<Guest[]>([
    {
      id: "1",
      roomNumber: "01",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    },
    {
      id: "2",
      roomNumber: "02",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    },
    {
      id: "3",
      roomNumber: "03",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    },
    {
      id: "4",
      roomNumber: "04",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    },
    {
      id: "5",
      roomNumber: "05",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    },
    {
      id: "6",
      roomNumber: "06",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    },
    {
      id: "7",
      roomNumber: "07",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    },
    {
      id: "8",
      roomNumber: "08",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    },
    {
      id: "9",
      roomNumber: "09",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    },
    {
      id: "10",
      roomNumber: "10",
      guestName: "",
      reservationEngine: "",
      balance: "",
      payment: "",
      paymentMethod: "",
    },
  ]);

  const handleInputChange = (id: string, field: keyof Guest, value: string) => {
    setGuests(
      guests.map((guest) =>
        guest.id === id ? { ...guest, [field]: value } : guest
      )
    );
  };

  const handleAddRow = () => {
    const newId = String(Math.max(...guests.map((g) => parseInt(g.id)), 0) + 1);
    const newRoomNumber = String(guests.length + 1).padStart(2, "0");
    setGuests([
      ...guests,
      {
        id: newId,
        roomNumber: newRoomNumber,
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
      ["Nº QUARTO", "NOME DO HÓSPEDE", "MOTOR DE RESERVA", "SALDO", "PAGAMENTO", "FORMA DE PAGAMENTO"],
      ...guests.map((g) => [
        g.roomNumber,
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
              Data: {new Date().toLocaleDateString("pt-BR")}
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
                    Nº QUARTO
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
                      <div className="font-semibold text-gray-900 text-sm">
                        {guest.roomNumber}
                      </div>
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
                        placeholder="R$ 0,00"
                        className="border-gray-300 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="text"
                        value={guest.payment}
                        onChange={(e) =>
                          handleInputChange(guest.id, "payment", e.target.value)
                        }
                        placeholder="R$ 0,00"
                        className="border-gray-300 text-sm"
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
