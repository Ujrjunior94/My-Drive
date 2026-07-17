import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Insights
  app.post("/api/insights", async (req, res) => {
    try {
      const { journeys, driverName } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Chave API do Gemini não configurada." });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Se não houver jornadas, enviar prompt genérico
      const hasJourneys = journeys && journeys.length > 0;
      const dataStr = hasJourneys ? JSON.stringify(journeys, null, 2) : "Nenhuma jornada registrada ainda.";

      const prompt = `Você é o co-piloto inteligente e assistente de IA pessoal do motorista de aplicativo ${driverName || "Motorista"}.
Sua tarefa é analisar os dados de desempenho recentes das jornadas de trabalho do motorista e fornecer insights práticos, diretos e altamente motivacionais em português.

Dados recentes das jornadas:
${dataStr}

Por favor, forneça uma análise estruturada contendo:
1. **Resumo de Bordo**: Análise rápida da saúde financeira (lucro líquido e receita bruta).
2. **Eficiência de Corrida**: Análise sobre o lucro por km e por hora (se houver dados suficientes) ou dicas de melhoria.
3. **Plataformas**: Comentários sobre a divisão entre Uber, 99 e Outras.
4. **Dica do Piloto (Economia)**: Dicas úteis de redução de gastos (ex: controle de pé, manutenção, rotas de abastecimento).

Responda em formato Markdown amigável e direto. Use termos típicos de motoristas no Brasil (como "corrida dinâmica", "consumo", "pedágio", "lucro real", "etanol", "GNV").`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const text = response.text;
      return res.json({ insight: text });
    } catch (error: any) {
      console.error("Error generating insights:", error);
      return res.status(500).json({ error: error.message || "Erro ao gerar insights por IA." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
