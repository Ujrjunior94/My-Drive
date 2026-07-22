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
      const { journeys, driverName, projection } = req.body;
      
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

      let projectionStr = "";
      if (projection) {
        projectionStr = `
PROJEÇÃO DE FATURAMENTO MENSAL (BASEADA NOS ÚLTIMOS 30 DIAS):
- Média Diária dos Últimos 30 Dias (Geral): R$ ${Number(projection.dailyAvg30DaysCalendar || 0).toFixed(2)} / dia
- Média por Dia Trabalhado (30 Dias): R$ ${Number(projection.dailyAvg30DaysWorked || 0).toFixed(2)} / dia rodado (${projection.workedDatesLast30 || 0} dias rodados nos últimos 30 dias)
- Faturamento Acumulado no Mês Atual: R$ ${Number(projection.accumulatedGrossCurrentMonth || 0).toFixed(2)}
- Dias Restantes no Mês: ${projection.remainingDays || 0} dias
- Faturamento Total Projetado para o Fim do Mês: R$ ${Number(projection.projectedTotalGrossMonth || 0).toFixed(2)}
`;
      }

      const prompt = `Você é o co-piloto inteligente e assistente de IA pessoal do motorista de aplicativo ${driverName || "Motorista"}.
Sua tarefa é analisar os dados de desempenho recentes das jornadas de trabalho do motorista e fornecer insights práticos, diretos e altamente motivacionais em português.

Dados recentes das jornadas:
${dataStr}
${projectionStr}

Por favor, forneça uma análise estruturada contendo:
1. **Resumo de Bordo**: Análise rápida da saúde financeira (lucro líquido e receita bruta).
2. **Projeção de Faturamento**: Comentários e avaliação da projeção estimada de faturamento para o final do mês com base nos últimos 30 dias. Avalie se o ritmo atual é sustentável ou precisa de ajustes.
3. **Eficiência de Corrida**: Análise sobre o lucro por km e por hora (se houver dados suficientes) ou dicas de melhoria.
4. **Plataformas**: Comentários sobre a divisão entre Uber, 99 e Outras.
5. **Dica do Piloto (Economia)**: Dicas úteis de redução de gastos (ex: controle de pé, manutenção, rotas de abastecimento).

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
