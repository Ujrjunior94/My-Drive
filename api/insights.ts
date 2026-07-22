import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurações de CORS para Vercel
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

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
2. **Eficiência de Corrira**: Análise sobre o lucro por km e por hora (se houver dados suficientes) ou dicas de melhoria.
3. **Plataformas**: Comentários sobre a divisão entre Uber, 99 e Outras.
4. **Dica do Piloto (Economia)**: Dicas úteis de redução de gastos (ex: controle de pé, manutenção, rotas de abastecimento).

Responda em formato Markdown amigável e direto. Use termos típicos de motoristas no Brasil (como "corrida dinâmica", "consumo", "pedágio", "lucro real", "etanol", "GNV").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const text = response.text;
    return res.status(200).json({ insight: text });
  } catch (error: any) {
    console.error("Error generating insights on Vercel serverless:", error);
    return res.status(500).json({ error: error.message || "Erro ao gerar insights por IA." });
  }
}
