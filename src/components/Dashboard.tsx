import React, { useState, useEffect } from "react";
import { DollarSign, Trash2, Fuel, TrendingUp, Calendar, Zap, Clock, ShieldAlert, Sparkles, Navigation, Award, Download, Wrench, AlertTriangle, CheckCircle2, Bell, ChevronRight } from "lucide-react";
import { Journey, UserSettings, Maintenance } from "../types";
import { dbService } from "../lib/dbService";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { motion } from "motion/react";

interface DashboardProps {
  journeys: Journey[];
  settings: UserSettings;
  loading?: boolean;
  userId?: string;
  isDemo?: boolean;
  currentOdometer?: number;
  onNavigateTab?: (tab: string) => void;
}

const Skeleton = ({ className = "h-4 w-full" }: { className?: string }) => (
  <motion.div
    className={`bg-neutral-800/70 rounded-md ${className}`}
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  />
);

export default function Dashboard({ journeys, settings, loading, userId, isDemo, currentOdometer, onNavigateTab }: DashboardProps) {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [maintenancesLoading, setMaintenancesLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadMaint = async () => {
      try {
        const list = await dbService.getMaintenances(userId || "demo", isDemo || false);
        if (isMounted) setMaintenances(list);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setMaintenancesLoading(false);
      }
    };
    loadMaint();
    return () => { isMounted = false; };
  }, [userId, isDemo]);

  const calculatedOdometer = currentOdometer || (journeys.length > 0 ? Math.max(...journeys.map(j => j.endKm)) : 125460);

  // Filter maintenances by urgency relative to currentOdometer
  const maintenanceAlerts = maintenances.map(m => {
    const nextKm = m.nextOdometerCheck || 0;
    const diffKm = nextKm - calculatedOdometer;
    const isOverdue = diffKm <= 0;
    const isClose = diffKm > 0 && diffKm <= 1500;
    const isApproaching = diffKm > 1500 && diffKm <= 3000;

    return {
      ...m,
      diffKm,
      isOverdue,
      isClose,
      isApproaching,
      status: isOverdue ? "CRITICAL" : isClose ? "WARNING" : isApproaching ? "NOTICE" : "OK"
    };
  }).filter(m => m.status !== "OK");

  // Sort alerts: CRITICAL first, then WARNING, then NOTICE
  const sortedAlerts = [...maintenanceAlerts].sort((a, b) => {
    const priority = { CRITICAL: 0, WARNING: 1, NOTICE: 2, OK: 3 };
    return priority[a.status] - priority[b.status];
  });

  const overdueCount = sortedAlerts.filter(m => m.isOverdue).length;
  const warningCount = sortedAlerts.filter(m => m.isClose).length;
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: settings.currency || "BRL" }).format(val);
  };

  const hasData = journeys && journeys.length > 0;

  const handleExportCSV = () => {
    if (!journeys || journeys.length === 0) return;
    
    // Create CSV Headers
    const headers = [
      "ID", "Data", "KM Inicial", "KM Final", "Total KM", 
      "Ganhos Uber (R$)", "Ganhos 99 (R$)", "Ganhos Outros (R$)", "Ganhos Brutos (R$)", 
      "Abastecimento (R$)", "Pedagios (R$)", "Outras Despesas (R$)", "Despesas Totais (R$)", 
      "Lucro Liquido (R$)", "Combustivel Inicial (%)", "Combustivel Final (%)", "Observacoes"
    ];
    
    // Compile rows
    const rows = journeys.map(j => [
      j.id,
      j.date,
      j.startKm,
      j.endKm,
      j.totalKm,
      j.earnings.uber,
      j.earnings["99"],
      j.earnings.others,
      j.metrics.grossEarnings,
      j.expenses.fuel,
      j.expenses.tolls,
      j.expenses.others,
      j.metrics.totalExpenses,
      j.metrics.netProfit,
      j.startFuelLevel,
      j.endFuelLevel,
      `"${(j.notes || "").replace(/"/g, '""')}"`
    ]);
    
    // Build CSV payload
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DrivePilot_Relatorio_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Calculate General Aggregates
  const tankCapacity = settings.tankCapacityLiters || 50;
  const sortedJourneysList = [...journeys].sort((a, b) => b.date.localeCompare(a.date));
  const totalGross = journeys.reduce((sum, j) => sum + j.metrics.grossEarnings, 0);
  const totalExpenses = journeys.reduce((sum, j) => sum + j.metrics.totalExpenses, 0);
  const totalNet = totalGross - totalExpenses;
  const totalKm = journeys.reduce((sum, j) => sum + j.totalKm, 0);
  
  // Calculate average daily work hours
  const totalHours = journeys.reduce((sum, j) => {
    try {
      const [startH, startM] = j.startTime.split(":").map(Number);
      const [endH, endM] = j.endTime.split(":").map(Number);
      let diff = (endH * 60 + endM) - (startH * 60 + startM);
      if (diff < 0) diff += 24 * 60; // crossed midnight
      return sum + (diff / 60);
    } catch {
      return sum + 8;
    }
  }, 0);

  // General KPIs
  const avgProfitPerHour = totalHours > 0 ? totalNet / totalHours : 0;
  const avgProfitPerKm = totalKm > 0 ? totalNet / totalKm : 0;
  const avgCostPerKm = totalKm > 0 ? totalExpenses / totalKm : 0;

  // Platform Share Analysis
  const totalUber = journeys.reduce((sum, j) => sum + j.earnings.uber, 0);
  const total99 = journeys.reduce((sum, j) => sum + j.earnings["99"], 0);
  const totalOthers = journeys.reduce((sum, j) => sum + j.earnings.others, 0);

  const platformData = [
    { name: "Uber", value: totalUber, color: "#3b82f6" }, // Elegant Blue
    { name: "99 App", value: total99, color: "#eab308" }, // Warm Yellow-Orange
    { name: "Outros / Privado", value: totalOthers, color: "#6b7280" } // Sleek gray
  ].filter(p => p.value > 0);

  // 2. Prepare Trend Chart Data (sorted chronological)
  const trendData = [...journeys]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(j => ({
      dateFormatted: j.date.split("-").reverse().slice(0, 2).join("/"), // DD/MM
      "Receita Bruta": j.metrics.grossEarnings,
      "Lucro Líquido": j.metrics.netProfit,
      "Despesas": j.metrics.totalExpenses
    }));

  // 3. Prepare Fuel Level & KM Data
  const efficiencyData = [...journeys]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(j => ({
      dateFormatted: j.date.split("-").reverse().slice(0, 2).join("/"),
      "KM Rodados": j.totalKm,
      "Combustível Gasto (%)": Math.max(0, j.startFuelLevel - j.endFuelLevel)
    }));

  return (
    <div id="dashboard-cockpit-container" className="space-y-6">
      
      {/* Cockpit Subheader with Title and CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5">
        <div>
          <h2 className="text-base font-black font-mono tracking-wider text-cyan-400 flex items-center gap-2 uppercase">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Cockpit de Comando (Geral)
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Métricas unificadas de receita, despesa, lucros por hora/km e gráficos de produtividade.
          </p>
        </div>

        {hasData && (
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/30 text-emerald-400 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md self-start sm:self-center"
            title="Download report of all recorded journeys in CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Planilha (CSV)</span>
          </button>
        )}
      </div>

      {/* VISUAL MAINTENANCE NOTIFICATIONS SYSTEM (OFICINA) */}
      {!maintenancesLoading && (
        <div id="dashboard-maintenance-notifications" className="space-y-3">
          {sortedAlerts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-5 shadow-xl transition-all relative overflow-hidden ${
                overdueCount > 0
                  ? "bg-gradient-to-r from-red-950/40 via-neutral-900 to-neutral-950 border-red-500/40 shadow-red-950/20"
                  : "bg-gradient-to-r from-amber-950/30 via-neutral-900 to-neutral-950 border-amber-500/40 shadow-amber-950/20"
              }`}
            >
              {/* Top Accent Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 ${
                  overdueCount > 0 ? "bg-red-500 animate-pulse" : "bg-amber-500"
                }`}
              />

              {/* Banner Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-neutral-800/80">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                      overdueCount > 0
                        ? "bg-red-500/20 border-red-500/40 text-red-400 animate-bounce"
                        : "bg-amber-500/20 border-amber-500/40 text-amber-400 animate-pulse"
                    }`}
                  >
                    {overdueCount > 0 ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Wrench className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-black font-mono tracking-wider uppercase text-neutral-100 flex items-center gap-2">
                        <span>Alertas da Oficina e Manutenção Preventiva</span>
                      </h3>
                      {overdueCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold rounded-full animate-pulse">
                          {overdueCount} CRÍTICO(S) VENCIDO(S)
                        </span>
                      )}
                      {warningCount > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold rounded-full">
                          {warningCount} PRÓXIMO(S) DO VENCIMENTO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5 font-sans">
                      Odômetro Atual do Veículo:{" "}
                      <strong className="text-cyan-400 font-mono">
                        {calculatedOdometer.toLocaleString("pt-BR")} KM
                      </strong>{" "}
                      &bull; Atenção aos prazos cadastrados na aba Oficina.
                    </p>
                  </div>
                </div>

                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab("maintenances")}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-neutral-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-cyan-500/10 shrink-0 self-start md:self-center"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Gerenciar na Oficina</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Alert List Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                {sortedAlerts.map((item) => {
                  const absDiff = Math.abs(item.diffKm);
                  const maxRange = item.nextOdometerCheck - item.odometer || 10000;
                  const elapsedKm = calculatedOdometer - item.odometer;
                  const progressPct = Math.min(
                    100,
                    Math.max(0, (elapsedKm / maxRange) * 100)
                  );

                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 transition-all ${
                        item.isOverdue
                          ? "bg-red-950/30 border-red-500/40"
                          : item.isClose
                          ? "bg-amber-950/20 border-amber-500/40"
                          : "bg-neutral-900 border-neutral-800"
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-neutral-100 line-clamp-1">
                            {item.type}
                          </span>
                          {item.isOverdue ? (
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-mono font-bold rounded shrink-0 uppercase animate-pulse">
                              Vencido há {absDiff.toLocaleString("pt-BR")} KM
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono font-bold rounded shrink-0 uppercase">
                              Faltam {absDiff.toLocaleString("pt-BR")} KM
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span>Revisado em: {item.odometer.toLocaleString("pt-BR")} KM</span>
                          <span className="font-bold text-neutral-200">
                            Prazo: {item.nextOdometerCheck.toLocaleString("pt-BR")} KM
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 mt-1">
                          <div
                            className={`h-full transition-all duration-500 ${
                              item.isOverdue
                                ? "bg-red-500"
                                : item.isClose
                                ? "bg-amber-400"
                                : "bg-cyan-400"
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {item.notes && (
                        <p className="text-[10px] text-neutral-400 italic line-clamp-1 border-t border-neutral-800/60 pt-1.5 mt-1">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            /* Healthy State: No Pending Maintenance Warnings */
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-black text-neutral-200 uppercase tracking-wide">
                    Sistemas de Oficina em Dia
                  </h4>
                  <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                    Odômetro atual em{" "}
                    <strong className="text-emerald-400 font-mono">
                      {calculatedOdometer.toLocaleString("pt-BR")} KM
                    </strong>
                    . Nenhuma revisão preventiva pendente ou próxima do vencimento.
                  </p>
                </div>
              </div>

              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("maintenances")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold rounded-xl text-xs transition-all cursor-pointer shrink-0"
                >
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Ver Histórico da Oficina</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 1. Cockpit Header KPI Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-neutral-900 border border-neutral-800/80 p-4.5 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-emerald-500" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Receita Bruta</span>
          <div className="mt-2.5">
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                {formatCurrency(totalGross)}
              </span>
            )}
            <span className="block text-[9px] text-neutral-500 font-mono mt-1">Total acumulado</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-neutral-900 border border-neutral-800/80 p-4.5 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-red-500" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Despesas Totais</span>
          <div className="mt-2.5">
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-xl font-black text-red-400 font-mono tracking-tight">
                {formatCurrency(totalExpenses)}
              </span>
            )}
            <span className="block text-[9px] text-neutral-500 font-mono mt-1">
              {totalGross > 0 ? `${((totalExpenses / totalGross) * 100).toFixed(0)}% do faturamento` : "Sem dados"}
            </span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-neutral-900 border border-neutral-800/80 p-4.5 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-cyan-500" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Lucro Líquido</span>
          <div className="mt-2.5">
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-xl font-black text-cyan-400 font-mono tracking-tight">
                {formatCurrency(totalNet)}
              </span>
            )}
            <span className="block text-[9px] text-neutral-500 font-mono mt-1">Lucro real de bolso</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-neutral-900 border border-neutral-800/80 p-4.5 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-yellow-500" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Lucro / Hora</span>
          <div className="mt-2.5">
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-xl font-black text-neutral-100 font-mono tracking-tight">
                {formatCurrency(avgProfitPerHour)}
              </span>
            )}
            <span className="block text-[9px] text-neutral-500 font-mono mt-1">
              Média por hora online
            </span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-neutral-900 border border-neutral-800/80 p-4.5 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-purple-500" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Lucro / KM</span>
          <div className="mt-2.5">
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-xl font-black text-neutral-100 font-mono tracking-tight">
                {formatCurrency(avgProfitPerKm)}
              </span>
            )}
            <span className="block text-[9px] text-neutral-500 font-mono mt-1">Lucro real por km rodado</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-neutral-900 border border-neutral-800/80 p-4.5 rounded-2xl flex flex-col justify-between shadow-md relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-orange-500" />
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider font-mono">Custo / KM</span>
          <div className="mt-2.5">
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-xl font-black text-neutral-100 font-mono tracking-tight">
                {formatCurrency(avgCostPerKm)}
              </span>
            )}
            <span className="block text-[9px] text-neutral-500 font-mono mt-1">Custo operacional por km</span>
          </div>
        </motion.div>

      </div>

      {/* PAINEL VIRTUAL DE BORDO (INSTRUMENT CLUSTER) */}
      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-neutral-900 border border-neutral-800/80 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
          {/* Neon gradient mesh background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.06),transparent_60%)] pointer-events-none" />
          
          {/* Gauge 1: Tacômetro de Meta Diária */}
          <div className="flex flex-col items-center text-center relative p-2">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> Meta Diária (Rendimento)
            </span>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Circular SVG Progress */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="40" stroke="#1c1c1c" strokeWidth="6" fill="transparent" strokeDasharray="188.5" strokeDashoffset="47.1" strokeLinecap="round" />
                {/* Gradient path */}
                <circle cx="50" cy="50" r="40" stroke="url(#goalGradient)" strokeWidth="6.5" fill="transparent" 
                  strokeDasharray="188.5" 
                  strokeDashoffset={188.5 - (188.5 - 47.1) * Math.min(1, (totalGross / journeys.length) / settings.targetDailyProfit)} 
                  strokeLinecap="round" 
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
                
                <defs>
                  <linearGradient id="goalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Central text display */}
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black font-mono text-neutral-100 tracking-tight">
                  {Math.min(999, Math.round(((totalGross / journeys.length) / settings.targetDailyProfit) * 100))}%
                </span>
                <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider font-mono">Alcançado</span>
              </div>

              {/* needle dial pointer */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  transform: `rotate(${Math.min(180, (((totalGross / journeys.length) / settings.targetDailyProfit) * 180) - 90)}deg)`,
                  transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[2px] h-5 bg-gradient-to-t from-transparent to-cyan-400 rounded-full shadow-lg shadow-cyan-400/80" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xs font-bold text-neutral-200 block font-mono">
                {formatCurrency(totalGross / journeys.length)} / dia
              </span>
              <span className="text-[9px] text-neutral-500 font-mono uppercase">
                Meta do piloto: {formatCurrency(settings.targetDailyProfit)}
              </span>
            </div>
          </div>

          {/* Gauge 2: Tacômetro de Lucratividade / Hora */}
          <div className="flex flex-col items-center text-center relative p-2 border-y md:border-y-0 md:border-x border-neutral-800/85">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Velocidade Financeira
            </span>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#1c1c1c" strokeWidth="6" fill="transparent" strokeDasharray="188.5" strokeDashoffset="47.1" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="6.5" fill="transparent" 
                  strokeDasharray="188.5" 
                  strokeDashoffset={188.5 - (188.5 - 47.1) * Math.min(1, avgProfitPerHour / 60)} 
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-black font-mono text-neutral-100">
                  {formatCurrency(avgProfitPerHour)}
                </span>
                <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider font-mono">Por Hora</span>
              </div>

              {/* needle */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  transform: `rotate(${Math.min(180, ((avgProfitPerHour / 60) * 180) - 90)}deg)`,
                  transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[2px] h-5 bg-gradient-to-t from-transparent to-blue-500 rounded-full shadow-lg" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xs font-bold text-neutral-200 block font-mono">
                {totalHours.toFixed(1)}h Totais
              </span>
              <span className="text-[9px] text-neutral-500 font-mono uppercase">
                Taxa de rendimento de bordo
              </span>
            </div>
          </div>

          {/* Gauge 3: Indicador de Eficiência Operacional */}
          <div className="flex flex-col items-center text-center relative p-2">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-emerald-400" /> Eficiência de Combustível
            </span>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#1c1c1c" strokeWidth="6" fill="transparent" strokeDasharray="188.5" strokeDashoffset="47.1" strokeLinecap="round" />
                <circle cx="50" cy="50" r="40" stroke="#10b981" strokeWidth="6.5" fill="transparent" 
                  strokeDasharray="188.5" 
                  strokeDashoffset={188.5 - (188.5 - 47.1) * Math.min(1, avgCostPerKm > 0 ? 0.35 / avgCostPerKm : 1)} 
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
              </svg>
              
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-black font-mono text-emerald-400">
                  {avgCostPerKm > 0 ? `${(1 / avgCostPerKm).toFixed(1)} km` : "N/D"}
                </span>
                <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-wider font-mono">por {settings.currency}</span>
              </div>

              {/* needle pointer */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{ 
                  transform: `rotate(${Math.min(180, ((avgCostPerKm > 0 ? 0.35 / avgCostPerKm : 1) * 180) - 90)}deg)`,
                  transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[2px] h-5 bg-gradient-to-t from-transparent to-emerald-400 rounded-full shadow-lg" />
              </div>
            </div>

            <div className="mt-3">
              <span className="text-xs font-bold text-neutral-200 block font-mono">
                {avgCostPerKm > 0 ? `${formatCurrency(avgCostPerKm)}/km` : "R$ 0,00"} Custo
              </span>
              <span className="text-[9px] text-neutral-500 font-mono uppercase">
                Custo de Combustível/KM
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FOLHA DE PONTO E TELEMETRIA DE TURNOS */}
      {hasData && (
        <div id="timesheet-telemetry-panel" className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-xl space-y-4 my-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Folha de Ponto e Telemetria de Turnos (Multi-Turno)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                Registros de início/término de expediente, odometria inicial e final, volume de combustível consumido e lucro líquido por turno.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-xs font-mono font-bold text-cyan-300">
                {journeys.length} Registros no Histórico
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Data & Turno</th>
                  <th className="py-2.5 px-3">Horário Ponto</th>
                  <th className="py-2.5 px-3">Odômetro (KM)</th>
                  <th className="py-2.5 px-3">Distância</th>
                  <th className="py-2.5 px-3">Consumo Est.</th>
                  <th className="py-2.5 px-3">Eficiência</th>
                  <th className="py-2.5 px-3">Faturamento</th>
                  <th className="py-2.5 px-3 text-right">Lucro Líquido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 text-neutral-200">
                {sortedJourneysList.slice(0, 10).map((j) => {
                  const shiftTitle = j.shiftName || "Turno Padrão";
                  const startLiters = ((j.startFuelLevel ?? 100) / 100) * tankCapacity;
                  const endLiters = ((j.endFuelLevel ?? 50) / 100) * tankCapacity;
                  const consumedLiters = Math.max(0, startLiters - endLiters);
                  const kmL = consumedLiters > 0 ? j.totalKm / consumedLiters : 0;

                  return (
                    <tr key={j.id} className="hover:bg-neutral-950/50 transition-colors">
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-neutral-100">{j.date}</div>
                        <div className="text-[10px] font-mono font-semibold text-cyan-400">{shiftTitle}</div>
                      </td>
                      <td className="py-3 px-3 text-neutral-300">
                        {j.startTime} - {j.endTime}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-neutral-400">{j.startKm.toLocaleString("pt-BR")}</span>
                        <span className="text-neutral-600 mx-1">→</span>
                        <span className="text-neutral-100 font-bold">{j.endKm.toLocaleString("pt-BR")}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-cyan-300">
                        {j.totalKm} KM
                      </td>
                      <td className="py-3 px-3 text-amber-400">
                        {consumedLiters.toFixed(1)} L <span className="text-[9px] text-neutral-500">({(j.startFuelLevel ?? 100) - (j.endFuelLevel ?? 50)}%)</span>
                      </td>
                      <td className="py-3 px-3 text-emerald-400">
                        {kmL > 0 ? `${kmL.toFixed(1)} km/l` : "-"}
                      </td>
                      <td className="py-3 px-3 font-bold text-neutral-200">
                        {formatCurrency(j.metrics.grossEarnings)}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-400">
                        {formatCurrency(j.metrics.netProfit)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Visual Graphs Section (Grid) */}
      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Area Trend Chart (AreaChart) */}
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-xl lg:col-span-8 flex flex-col">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5 font-sans">
                <TrendingUp className="text-cyan-400 w-4 h-4" />
                Histórico de Faturamento e Lucro Real
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Comparativo real entre o seu faturamento bruto diário e o lucro que efetivamente sobrou.
              </p>
            </div>

            <div className="h-72 w-full mt-2 font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="dateFormatted" stroke="#737373" />
                  <YAxis stroke="#737373" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", color: "#e5e5e5" }}
                    itemStyle={{ color: "#e5e5e5" }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Receita Bruta" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGross)" />
                  <Area type="monotone" dataKey="Lucro Líquido" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNet)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform distribution Donut Chart (PieChart) */}
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-xl lg:col-span-4 flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5 font-sans">
                <Navigation className="text-cyan-400 w-4 h-4" />
                Desempenho por Plataforma
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Proporção do seu faturamento distribuído entre os aplicativos.
              </p>
            </div>

            <div className="h-44 w-full flex justify-center items-center relative font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", color: "#e5e5e5" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Total display inside Donut */}
              <div className="absolute flex flex-col items-center">
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono">Receita</span>
                <span className="text-sm font-black text-neutral-100 font-mono">
                  {formatCurrency(totalGross)}
                </span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="space-y-2.5 mt-4">
              {platformData.map((plat, idx) => (
                <div key={`legend-${idx}`} className="flex items-center justify-between text-xs font-mono p-1.5 bg-neutral-950/40 border border-neutral-800/40 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plat.color }} />
                    <span className="text-neutral-300 font-medium">{plat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-100 font-bold block">{formatCurrency(plat.value)}</span>
                    <span className="text-[9px] text-neutral-500">
                      {totalGross > 0 ? `${((plat.value / totalGross) * 100).toFixed(0)}%` : "0%"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fuel usage and KM bar chart (BarChart) */}
          <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-5 shadow-xl lg:col-span-12">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5 font-sans">
                <Fuel className="text-cyan-400 w-4 h-4" />
                Odometria vs Nível de Combustível Gasto
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Relação entre os quilômetros rodados e a porcentagem aproximada consumida do tanque por jornada.
              </p>
            </div>

            <div className="h-64 w-full mt-2 font-mono text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={efficiencyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="dateFormatted" stroke="#737373" />
                  <YAxis stroke="#737373" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#262626", borderRadius: "12px", color: "#e5e5e5" }}
                  />
                  <Legend />
                  <Bar dataKey="KM Rodados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Combustível Gasto (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-12 text-center shadow-xl">
          <Award className="w-12 h-12 text-neutral-600 mx-auto mb-4 animate-bounce" />
          <h3 className="text-base font-bold text-neutral-300">Sem Telemetria Registrada</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Por favor, registre a sua primeira jornada no botão abaixo ou use o Modo de Demonstração para popular o Cockpit com dados realistas!
          </p>
        </div>
      )}
    </div>
  );
}
