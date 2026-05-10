/**
 * Comprime imagens para reduzir o tamanho do arquivo
 * Redimensiona para no máximo 1200x1200px e comprime com qualidade 0.7
 */
export async function compressImage(file: File): Promise<{ data: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Redimensionar se a imagem for muito grande
        const MAX_SIZE = 1200;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Falha ao obter contexto do canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Comprimir para JPEG com qualidade 0.7
        const compressedData = canvas.toDataURL("image/jpeg", 0.7);
        const size = Math.round((compressedData.length * 3) / 4); // Tamanho aproximado em bytes

        resolve({ data: compressedData, size });
      };
      img.onerror = () => reject(new Error("Falha ao carregar imagem"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

/**
 * Formata o tamanho do arquivo em formato legível (KB, MB, etc)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
