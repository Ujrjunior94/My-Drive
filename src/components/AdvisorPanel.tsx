import React, { useState } from "react";
import { Sparkles, Brain, Cpu, MessageSquare, ShieldAlert, Zap, Compass, RotateCw } from "lucide-react";
import { Journey, UserSettings } from "../types";
import { motion } from "motion/react";

const Skeleton = ({ className = "h-4 w-full" }: { className?: string }) => (
  <motion.div
    className={`bg-neutral-800/70 rounded-md ${className}`}
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  />
);

interface AdvisorPanelProps {
  journeys: Journey[];
  settings: UserSettings;
}

export default function AdvisorPanel({ journeys, settings }: AdvisorPanelProps) {
  const [insight, setInsight] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const hasData = journeys && journeys.length > 0;

  const fetchInsights = async () => {
    if (!hasData) return;
    setLoading(true);
    setError("");
    setInsight("");

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeys: journeys.slice(0, 10), // Send up to last 10 journeys to stay efficient
          driverName: settings.displayName
        })
      });

      if (!response.ok) {
        throw new Error("Falha ao se comunicar com o Co-Piloto de IA.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setInsight(data.insight);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro desconhecido ao carregar recomendações de IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="advisor-panel-container" className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-emerald-500" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none animate-pulse" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2 font-sans">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            Advisor - Co-Piloto Inteligente (IA)
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Diagnóstico de desempenho avançado por Inteligência Artificial baseado no seu histórico de corridas.
          </p>
        </div>

        {hasData && !loading && (
          <button
            onClick={fetchInsights}
            id="fetch-insights-btn"
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-400 transition-all cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Recalcular Diagnóstico</span>
          </button>
        )}
      </div>

      {/* Main UI body */}
      {!hasData ? (
        <div className="bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-8 text-center">
          <Brain className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-300">Co-Piloto Aguardando Telemetria</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Grave pelo menos 1 jornada de trabalho para que o assistente inteligente possa analisar e compilar seu diagnóstico de bordo.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* Action Trigger Box if no current insight */}
          {!insight && !loading && (
            <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-8 text-center flex flex-col items-center">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl mb-4">
                <Cpu className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <h3 className="text-sm font-bold text-neutral-300">Telemetria Pronta para Análise</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto mb-5">
                O assistente inteligente vai examinar suas receitas brutas, custos de combustível e taxas por hora para otimizar suas metas.
              </p>
              
              <button
                onClick={fetchInsights}
                id="get-insights-initial-btn"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-neutral-900 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/15 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Consultar Co-Piloto por IA</span>
              </button>
            </div>
          )}

          {/* Error feedback */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <div>
                <span className="font-bold block">Erro na Conexão de Diagnóstico</span>
                <span className="text-neutral-400 mt-0.5 block">{error}</span>
              </div>
            </div>
          )}

          {/* Loading progress visualization */}
          {loading && (
            <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-10 flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex flex-col items-center space-y-4 shrink-0 w-full md:w-1/3 text-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                  <Sparkles className="w-5 h-5 text-emerald-400 absolute animate-pulse" />
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider font-mono">Processando Telemetria...</h4>
                  <div className="flex flex-col gap-1.5 mt-2.5 text-[10px] text-neutral-500 font-mono">
                    <span className="animate-pulse">▶ Calculando rendimentos...</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>▶ Cruzando dados das Apps...</span>
                    <span className="animate-pulse" style={{ animationDelay: "0.8s" }}>▶ Compilando recomendações...</span>
                  </div>
                </div>
              </div>

              {/* Shimmering Text Document Skeleton */}
              <div className="flex-1 w-full space-y-4 border-t md:border-t-0 md:border-l border-neutral-800/60 pt-6 md:pt-0 md:pl-8">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-48" />
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-11/12" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-2 w-2 rounded-full shrink-0" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          )}

          {/* Render generated insights */}
          {insight && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-5 md:p-6"
            >
              <div className="flex items-center gap-2 border-b border-neutral-800/60 pb-3 mb-4.5">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest">RELATÓRIO DE BORDO COMPILADO</span>
              </div>

              {/* Styled output markdown text */}
              <div className="text-neutral-300 text-sm leading-relaxed space-y-3 font-sans">
                {insight.split("\n").map((line, index) => {
                  if (line.startsWith("### ")) {
                    return <h4 key={index} className="text-sm font-bold text-cyan-400 mt-5 mb-2 font-sans uppercase tracking-wider">{line.replace("### ", "")}</h4>;
                  }
                  if (line.startsWith("## ")) {
                    return <h3 key={index} className="text-base font-black text-emerald-400 mt-6 mb-3 font-sans uppercase tracking-tight">{line.replace("## ", "")}</h3>;
                  }
                  if (line.startsWith("# ")) {
                    return <h2 key={index} className="text-lg font-black text-neutral-100 mt-7 mb-4 font-sans border-b border-neutral-800 pb-2 uppercase">{line.replace("# ", "")}</h2>;
                  }
                  if (line.startsWith("- ") || line.startsWith("* ")) {
                    return (
                      <li key={index} className="ml-4 list-disc text-xs text-neutral-300 mt-1 pl-1">
                        {line.replace(/^[-*]\s+/, "")}
                      </li>
                    );
                  }
                  if (line.trim().startsWith("1. ") || line.trim().startsWith("2. ") || line.trim().startsWith("3. ") || line.trim().startsWith("4. ")) {
                    return (
                      <div key={index} className="pl-4 font-semibold text-neutral-200 text-xs mt-2.5">
                        {line}
                      </div>
                    );
                  }
                  // Bold text styling helper
                  const parts = line.split("**");
                  if (parts.length > 1) {
                    return (
                      <p key={index} className="text-xs md:text-sm my-2 text-neutral-300">
                        {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-cyan-400 font-bold font-mono">{part}</strong> : part)}
                      </p>
                    );
                  }

                  return <p key={index} className="text-xs md:text-sm my-1 text-neutral-400">{line}</p>;
                })}
              </div>

              {/* Backing notice */}
              <div className="mt-6 pt-4 border-t border-neutral-800/60 text-[9px] text-neutral-500 text-center font-mono uppercase tracking-wider">
                ⚡ Relatório gerado dinamicamente via inteligência artificial (Gemini 3.5-Flash).
              </div>
            </motion.div>
          )}

        </div>
      )}
    </div>
  );
}
