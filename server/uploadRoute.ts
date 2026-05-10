import type { Express } from "express";
import { storagePut } from "./storage";

export function registerUploadRoute(app: Express) {
  // POST /api/upload — recebe base64 ou multipart e salva no S3
  app.post("/api/upload", async (req, res) => {
    try {
      const { fileName, fileData, contentType } = req.body as {
        fileName: string;
        fileData: string; // base64 data URL: "data:image/png;base64,..."
        contentType: string;
      };

      if (!fileName || !fileData || !contentType) {
        res.status(400).json({ error: "fileName, fileData e contentType são obrigatórios" });
        return;
      }

      // Extrair bytes do base64 (remover prefixo "data:...;base64,")
      const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData;
      const buffer = Buffer.from(base64Data, "base64");

      // Sanitizar nome do arquivo
      const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      const relKey = `hostel-uploads/${Date.now()}_${safeFileName}`;

      const { url } = await storagePut(relKey, buffer, contentType);

      res.json({ url });
    } catch (err: any) {
      console.error("[UploadRoute] Erro ao fazer upload:", err);
      res.status(500).json({ error: "Falha ao fazer upload do arquivo" });
    }
  });
}
