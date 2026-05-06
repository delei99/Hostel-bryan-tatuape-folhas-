import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Download, RotateCcw, RotateCw, Upload, File, Printer } from "lucide-react";

interface Guest {
  id: string;
  day: string;
  firstName: string;
  lastName: string;
  documentNumber: string;
  documentFile: string;
  documentFileName: string;
  photoFile: string;
  photoFileName: string;
  reservationEngine: string;
  daily: string;
  balance: string;
  payment: string;
  paymentMethod: string;
  cpfValid: boolean;
}

interface RoomData {
  roomNumber: number;
  guests: Guest[];
  history: Guest[][];
  historyIndex: number;
}

const STORAGE_KEY = "hostel_rooms_data";
const NUM_ROOMS = 7;

// Obter dia atual do mês
const getCurrentDay = (): number => {
  return new Date().getDate();
};

// Verificar se é após 00:00 (meia-noite)
const isAfterMidnight = (): boolean => {
  const now = new Date();
  return now.getHours() === 0 && now.getMinutes() < 1;
};

// Capitalizar primeira letra
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Validar CPF
const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, "");
  
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

// Formatar CPF
const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/\D/g, "");
  if (cleanCPF.length !== 11) return cpf;
  return `${cleanCPF.substring(0, 3)}.${cleanCPF.substring(3, 6)}.${cleanCPF.substring(6, 9)}-${cleanCPF.substring(9)}`;
};

// Normalizar dados para garantir que todos os campos estejam definidos
const normalizeGuest = (guest: any): Guest => ({
  id: guest.id || "",
  day: guest.day ?? "",
  firstName: guest.firstName ?? "",
  lastName: guest.lastName ?? "",
  documentNumber: guest.documentNumber ?? "",
  documentFile: guest.documentFile ?? "",
  documentFileName: guest.documentFileName ?? "",
  photoFile: guest.photoFile ?? "",
  photoFileName: guest.photoFileName ?? "",
  reservationEngine: guest.reservationEngine ?? "",
  daily: guest.daily ?? "",
  balance: guest.balance ?? "",
  payment: guest.payment ?? "",
  paymentMethod: guest.paymentMethod ?? "",
  cpfValid: guest.cpfValid ?? false,
});

// Criar dados iniciais para um quarto
const createInitialGuestsForRoom = (): Guest[] => {
  return [
    ...Array.from({ length: 31 }, (_, index) => ({
      id: String(index + 1),
      day: String(index + 1).padStart(2, "0"),
      firstName: "",
      lastName: "",
      documentNumber: "",
      documentFile: "",
      documentFileName: "",
      photoFile: "",
      photoFileName: "",
      reservationEngine: "",
      daily: "",
      balance: "",
      payment: "",
      paymentMethod: "",
      cpfValid: false,
    })),
    ...Array.from({ length: 5 }, (_, index) => ({
      id: String(32 + index),
      day: "",
      firstName: "",
      lastName: "",
      documentNumber: "",
      documentFile: "",
      documentFileName: "",
      photoFile: "",
      photoFileName: "",
      reservationEngine: "",
      daily: "",
      balance: "",
      payment: "",
      paymentMethod: "",
      cpfValid: false,
    })),
  ];
};

// Criar dados iniciais para todos os quartos
const createInitialRoomsData = (): RoomData[] => {
  return Array.from({ length: NUM_ROOMS }, (_, index) => {
    const initialGuests = createInitialGuestsForRoom();
    return {
      roomNumber: index + 1,
      guests: initialGuests,
      history: [initialGuests],
      historyIndex: 0,
    };
  });
};

export default function Home() {
  const [rooms, setRooms] = useState<RoomData[]>(() => {
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
        return parsedRooms;
      } catch (error) {
        console.error("Erro ao carregar dados do localStorage:", error);
        return createInitialRoomsData();
      }
    }
    return createInitialRoomsData();
  });

  const [selectedRoom, setSelectedRoom] = useState(1);

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
    let cpfValid = false;
    
    // Capitalizar primeira letra para nome e sobrenome
    if ((field === "firstName" || field === "lastName") && value) {
      finalValue = capitalizeFirstLetter(value);
    }
    
    // Validar e formatar CPF
    if (field === "documentNumber" && value) {
      const cleanCPF = value.replace(/\D/g, "");
      if (cleanCPF.length === 11) {
        cpfValid = validateCPF(cleanCPF);
        finalValue = formatCPF(cleanCPF);
      } else {
        finalValue = value;
      }
    }
    
    if ((field === "daily" || field === "balance" || field === "payment") && value) {
      finalValue = formatCurrency(value);
    }
    
    const updatedGuests = room.guests.map((guest) =>
      guest.id === id 
        ? { 
            ...guest, 
            [field]: finalValue,
            ...(field === "documentNumber" && { cpfValid })
          } 
        : guest
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

  const handleFileUpload = (roomNumber: number, id: string, file: File, fileType: "document" | "photo") => {
    const room = rooms.find((r) => r.roomNumber === roomNumber);
    if (!room) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      const updatedGuests = room.guests.map((guest) =>
        guest.id === id
          ? fileType === "document"
            ? {
                ...guest,
                documentFile: fileContent,
                documentFileName: file.name,
              }
            : {
                ...guest,
                photoFile: fileContent,
                photoFileName: file.name,
              }
          : guest
      );

      const newHistory = room.history.slice(0, room.historyIndex + 1);
      newHistory.push(updatedGuests);
      updateRoomData(roomNumber, updatedGuests, newHistory, newHistory.length - 1);
    };
    reader.readAsDataURL(file);
  };

  const generateReceipt = (roomNumber: number, guest: Guest) => {
    const receiptHTML = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recibo - ${guest.firstName} ${guest.lastName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .receipt {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .header h1 {
            margin: 0;
            color: #0066cc;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-weight: bold;
            color: #0066cc;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .label {
            font-weight: 500;
            color: #333;
          }
          .value {
            text-align: right;
            color: #666;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            font-weight: bold;
            font-size: 16px;
            border-top: 2px solid #0066cc;
            border-bottom: 2px solid #0066cc;
            margin-top: 10px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #999;
            font-size: 12px;
          }
          .photo {
            text-align: center;
            margin-bottom: 20px;
          }
          .photo img {
            max-width: 150px;
            height: 150px;
            border-radius: 8px;
            border: 2px solid #0066cc;
          }
          @media print {
            body {
              background: white;
            }
            .receipt {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1>HOSTEL BRYAN TATUAPÉ</h1>
            <p>Recibo de Hospedagem</p>
            <p>Quarto ${roomNumber}</p>
          </div>

          ${guest.photoFile ? `
            <div class="photo">
              <img src="${guest.photoFile}" alt="Foto do hóspede">
            </div>
          ` : ''}

          <div class="section">
            <div class="section-title">Dados do Hóspede</div>
            <div class="row">
              <span class="label">Nome:</span>
              <span class="value">${guest.firstName} ${guest.lastName}</span>
            </div>
            <div class="row">
              <span class="label">CPF:</span>
              <span class="value">${guest.documentNumber}</span>
            </div>
            <div class="row">
              <span class="label">Data:</span>
              <span class="value">${guest.day}/${new Date().getMonth() + 1}/${new Date().getFullYear()}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Informações de Hospedagem</div>
            <div class="row">
              <span class="label">Motor de Reserva:</span>
              <span class="value">${guest.reservationEngine || '-'}</span>
            </div>
            <div class="row">
              <span class="label">Diária:</span>
              <span class="value">${guest.daily || '-'}</span>
            </div>
            <div class="row">
              <span class="label">Saldo:</span>
              <span class="value">${guest.balance || '-'}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Pagamento</div>
            <div class="row">
              <span class="label">Valor Pago:</span>
              <span class="value">${guest.payment || '-'}</span>
            </div>
            <div class="row">
              <span class="label">Forma de Pagamento:</span>
              <span class="value">${guest.paymentMethod || '-'}</span>
            </div>
          </div>

          <div class="total-row">
            <span>TOTAL:</span>
            <span>${guest.payment || 'R$ 0,00'}</span>
          </div>

          <div class="footer">
            <p>Recibo gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
            <p>Obrigado pela sua hospedagem!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.print();
    }
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
        firstName: "",
        lastName: "",
        documentNumber: "",
        documentFile: "",
        documentFileName: "",
        photoFile: "",
        photoFileName: "",
        reservationEngine: "",
        daily: "",
        balance: "",
        payment: "",
        paymentMethod: "",
        cpfValid: false,
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
      ["DIA", "NOME", "SOBRENOME", "CPF", "MOTOR RESERVA", "DIÁRIA", "SALDO", "PAGAMENTO", "FORMA PAGAMENTO"],
      ...room.guests.map((g) => [
        g.day,
        g.firstName,
        g.lastName,
        g.documentNumber,
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
        firstName: "",
        lastName: "",
        documentNumber: "",
        documentFile: "",
        documentFileName: "",
        photoFile: "",
        photoFileName: "",
        reservationEngine: "",
        daily: "",
        balance: "",
        payment: "",
        paymentMethod: "",
        cpfValid: false,
      }));

      const newHistory = room.history.slice(0, room.historyIndex + 1);
      newHistory.push(clearedGuests);
      updateRoomData(roomNumber, clearedGuests, newHistory, newHistory.length - 1);
    }
  };

  const currentRoom = useMemo(() => rooms.find((r) => r.roomNumber === selectedRoom), [rooms, selectedRoom]);

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

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
        <div className="max-w-full mx-auto">
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
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="px-3 py-3 text-left font-semibold text-xs">DIA</th>
                    <th className="px-3 py-3 text-left font-semibold text-xs">NOME</th>
                    <th className="px-3 py-3 text-left font-semibold text-xs">SOBRENOME</th>
                    <th className="px-3 py-3 text-left font-semibold text-xs">CPF</th>
                    <th className="px-3 py-3 text-left font-semibold text-xs">DOC</th>
                    <th className="px-3 py-3 text-left font-semibold text-xs">FOTO</th>
                    <th className="px-3 py-3 text-left font-semibold text-xs">MOTOR</th>
                    <th className="px-3 py-3 text-left font-semibold text-xs">DIÁRIA</th>
                    <th className="px-3 py-3 text-left font-semibold text-xs">SALDO</th>
                    <th className="px-3 py-3 text-left font-semibold text-xs">PAGAMENTO</th>
                    <th className="px-3 py-3 text-left font-semibold text-xs">FORMA PAG.</th>
                    <th className="px-3 py-3 text-center font-semibold text-xs">RECIBO</th>
                    <th className="px-3 py-3 text-center font-semibold text-xs">AÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRoom.guests.map((guest, index) => {
                    const currentDay = getCurrentDay();
                    const guestDay = parseInt(guest.day, 10);
                    const isLineBlocked = guestDay === currentDay && isAfterMidnight();
                    return (
                    <tr
                      key={guest.id}
                      className={`border-b ${
                        isLineBlocked ? "bg-gray-100 opacity-60" : index % 2 === 0 ? "bg-white" : "bg-slate-50"
                      } ${isLineBlocked ? "hover:bg-gray-100" : "hover:bg-blue-50"} transition-colors`}
                    >
                      <td className="px-3 py-3">
                        {index < 31 ? (
                          <div className={`font-semibold ${
                            isLineBlocked ? "text-gray-500 bg-yellow-100 px-2 py-1 rounded border border-yellow-300" : "text-gray-900"
                          }`}
                          title={isLineBlocked ? "Dia de hoje - Visualização apenas após 00:00" : ""}>
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
                            className="border-gray-300 text-xs h-8"
                            disabled={isLineBlocked}
                            title={isLineBlocked ? "Edição bloqueada após 00:00" : ""}
                          />
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          type="text"
                          value={guest.firstName}
                          onChange={(e) =>
                            handleInputChange(currentRoom.roomNumber, guest.id, "firstName", e.target.value)
                          }
                          placeholder="Nome"
                          className="border-gray-300 text-xs h-8"
                          required
                          disabled={isLineBlocked}
                          title={isLineBlocked ? "Edição bloqueada após 00:00" : ""}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          type="text"
                          value={guest.lastName}
                          onChange={(e) =>
                            handleInputChange(currentRoom.roomNumber, guest.id, "lastName", e.target.value)
                          }
                          placeholder="Sobrenome"
                          className="border-gray-300 text-xs h-8"
                          required
                          disabled={isLineBlocked}
                          title={isLineBlocked ? "Edição bloqueada após 00:00" : ""}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <Input
                            type="text"
                            value={guest.documentNumber}
                            onChange={(e) =>
                              handleInputChange(currentRoom.roomNumber, guest.id, "documentNumber", e.target.value)
                            }
                            placeholder="CPF"
                            className={`border-gray-300 text-xs h-8 ${
                              guest.documentNumber && guest.cpfValid ? "border-green-500" : guest.documentNumber ? "border-red-500" : ""
                            }`}
                            disabled={isLineBlocked}
                            title={isLineBlocked ? "Edição bloqueada após 00:00" : ""}
                          />
                          {guest.documentNumber && (
                            <span className={`text-xs font-bold ${guest.cpfValid ? "text-green-600" : "text-red-600"}`}>
                              {guest.cpfValid ? "✓" : "✗"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <label className={`cursor-pointer ${isLineBlocked ? "opacity-50 cursor-not-allowed" : ""}`}>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(currentRoom.roomNumber, guest.id, e.target.files[0], "document");
                                }
                              }}
                              className="hidden"
                              disabled={isLineBlocked}
                            />
                            <Upload size={14} className={`${isLineBlocked ? "text-gray-400" : "text-blue-600 hover:text-blue-700"}`} />
                          </label>
                          {guest.documentFileName && (
                            <a
                              href={guest.documentFile}
                              download={guest.documentFileName}
                              className="text-blue-600 hover:text-blue-700"
                              title={guest.documentFileName}
                            >
                              <File size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1">
                          <label className={`cursor-pointer ${isLineBlocked ? "opacity-50 cursor-not-allowed" : ""}`}>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleFileUpload(currentRoom.roomNumber, guest.id, e.target.files[0], "photo");
                                }
                              }}
                              className="hidden"
                              disabled={isLineBlocked}
                            />
                            <Upload size={14} className={`${isLineBlocked ? "text-gray-400" : "text-green-600 hover:text-green-700"}`} />
                          </label>
                          {guest.photoFileName && (
                            <a
                              href={guest.photoFile}
                              download={guest.photoFileName}
                              className="text-green-600 hover:text-green-700"
                              title={guest.photoFileName}
                            >
                              <File size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3">
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
                          placeholder="Motor"
                          className="border-gray-300 text-xs h-8"
                          disabled={isLineBlocked}
                          title={isLineBlocked ? "Edição bloqueada após 00:00" : ""}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          type="text"
                          value={guest.daily}
                          onChange={(e) =>
                            handleInputChange(currentRoom.roomNumber, guest.id, "daily", e.target.value)
                          }
                          placeholder="Valor"
                          className={`border-gray-300 text-xs h-8 ${
                            guest.daily ? "text-blue-600 font-semibold" : ""
                          }`}
                          disabled={isLineBlocked}
                          title={isLineBlocked ? "Edição bloqueada após 00:00" : ""}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          type="text"
                          value={guest.balance}
                          onChange={(e) =>
                            handleInputChange(currentRoom.roomNumber, guest.id, "balance", e.target.value)
                          }
                          placeholder="Valor"
                          className={`border-gray-300 text-xs h-8 ${
                            guest.balance ? "text-blue-600 font-semibold" : ""
                          }`}
                          disabled={isLineBlocked}
                          title={isLineBlocked ? "Edição bloqueada após 00:00" : ""}
                        />
                      </td>
                      <td className="px-3 py-3">
                        <Input
                          type="text"
                          value={guest.payment}
                          onChange={(e) =>
                            handleInputChange(currentRoom.roomNumber, guest.id, "payment", e.target.value)
                          }
                          placeholder="Valor"
                          className={`border-gray-300 text-xs h-8 ${
                            guest.payment ? "text-red-600 font-semibold" : ""
                          }`}
                          disabled={isLineBlocked}
                          title={isLineBlocked ? "Edição bloqueada após 00:00" : ""}
                        />
                      </td>
                      <td className="px-3 py-3">
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
                          placeholder="PIX"
                          className="border-gray-300 text-xs h-8"
                          disabled={isLineBlocked}
                          title={isLineBlocked ? "Edição bloqueada após 00:00" : ""}
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Button
                          onClick={() => generateReceipt(currentRoom.roomNumber, guest)}
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 h-8 w-8 p-0"
                          title="Gerar Recibo"
                          disabled={isLineBlocked}
                        >
                          <Printer size={14} />
                        </Button>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <Button
                          onClick={() => handleDeleteRow(currentRoom.roomNumber, guest.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          disabled={isLineBlocked}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-300">
            <p className="text-xs text-gray-600">
              <strong>Bloqueio de Edição:</strong> Após as 00:00 (meia-noite), toda a linha dos dias 01-31 fica bloqueada para edição, protegendo os dados do dia anterior.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>Validação de CPF:</strong> O CPF é validado automaticamente. Um ✓ verde indica CPF válido, ✗ vermelho indica inválido.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>Upload de Arquivos:</strong> Você pode fazer upload de documentos (PDF, JPG, PNG, DOC, DOCX) e fotos (JPG, PNG) para cada hóspede.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>Recibos:</strong> Clique no ícone de impressora para gerar um recibo personalizado com os dados do hóspede. O recibo inclui foto, dados pessoais e informações de hospedagem.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>Nota:</strong> A coluna DIÁRIA é somada ao SALDO. Se houver saldo total e sem pagamento, o saldo passa automaticamente para o dia seguinte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
