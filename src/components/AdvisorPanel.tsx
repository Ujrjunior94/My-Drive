import React, { useState, useMemo } from "react";
import { Sparkles, Brain, Cpu, MessageSquare, ShieldAlert, Zap, RotateCw, TrendingUp, Calendar, DollarSign, Target, Calculator, Clock, ArrowUpRight, CheckCircle2, Info, Fuel, Gauge, PiggyBank, TrendingDown, Sliders, Droplet, Wrench, RefreshCw } from "lucide-react";
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
  const [projectionMode, setProjectionMode] = useState<"calendar" | "worked">("calendar");

  // Fuel Efficiency Calculator State
  const [fuelTotalCost, setFuelTotalCost] = useState<string>("180.00");
  const [distanceKm, setDistanceKm] = useState<string>("350");
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<string>("5.85");
  const [fuelType, setFuelType] = useState<"gasolina" | "etanol" | "gnv" | "diesel">("gasolina");
  const [targetEconomyPct, setTargetEconomyPct] = useState<number>(10);

  const hasData = journeys && journeys.length > 0;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: settings.currency || "BRL" }).format(val);
  };

  // Calculation of last 30 days average & revenue projection to end of month
  const projection = useMemo(() => {
    if (!journeys || journeys.length === 0) return null;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based
    const currentDay = now.getDate(); // 1-31

    // Days in current month
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const remainingDays = Math.max(0, totalDaysInMonth - currentDay);

    // 30 days window start date
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Filter journeys in last 30 days
    const journeysLast30Days = journeys.filter(j => {
      if (!j.date) return false;
      const jDate = new Date(j.date + "T00:00:00");
      return jDate >= thirtyDaysAgo && jDate <= now;
    });

    // Filter journeys in current calendar month
    const journeysCurrentMonth = journeys.filter(j => {
      if (!j.date) return false;
      const jDate = new Date(j.date + "T00:00:00");
      return jDate.getFullYear() === currentYear && jDate.getMonth() === currentMonth;
    });

    // Total gross earnings in last 30 days
    const totalGrossLast30Days = journeysLast30Days.reduce((sum, j) => {
      const gross = j.metrics?.grossEarnings ?? ((j.earnings?.uber || 0) + (j.earnings?.[99] || 0) + (j.earnings?.others || 0));
      return sum + gross;
    }, 0);

    // Worked days in last 30 days (distinct dates)
    const workedDatesLast30 = new Set(journeysLast30Days.map(j => j.date)).size;

    // Daily averages over last 30 days
    const dailyAvg30DaysCalendar = totalGrossLast30Days / 30;
    const dailyAvg30DaysWorked = workedDatesLast30 > 0 ? totalGrossLast30Days / workedDatesLast30 : 0;

    // Current month accumulated
    const accumulatedGrossCurrentMonth = journeysCurrentMonth.reduce((sum, j) => {
      const gross = j.metrics?.grossEarnings ?? ((j.earnings?.uber || 0) + (j.earnings?.[99] || 0) + (j.earnings?.others || 0));
      return sum + gross;
    }, 0);

    const accumulatedNetCurrentMonth = journeysCurrentMonth.reduce((sum, j) => {
      return sum + (j.metrics?.netProfit ?? 0);
    }, 0);

    const workedDaysCurrentMonth = new Set(journeysCurrentMonth.map(j => j.date)).size;

    // Projections
    // 1. Calendar rate (assuming 30-day average applies directly to remaining calendar days)
    const projectedRemainingGrossCalendar = dailyAvg30DaysCalendar * remainingDays;
    const projectedTotalGrossMonthCalendar = accumulatedGrossCurrentMonth + projectedRemainingGrossCalendar;

    // 2. Worked rate (estimating work frequency in last 30 days)
    const workRatio = workedDatesLast30 > 0 ? workedDatesLast30 / 30 : 0.7;
    const estimatedRemainingWorkDays = Math.round(remainingDays * workRatio);
    const projectedRemainingGrossWorked = dailyAvg30DaysWorked * estimatedRemainingWorkDays;
    const projectedTotalGrossMonthWorked = accumulatedGrossCurrentMonth + projectedRemainingGrossWorked;

    // Target monthly revenue based on settings.targetDailyProfit
    const targetDaily = settings.targetDailyProfit || 250;
    const targetMonthlyRevenue = targetDaily * totalDaysInMonth;

    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const currentMonthName = monthNames[currentMonth];

    return {
      currentDay,
      totalDaysInMonth,
      remainingDays,
      currentMonthName,
      journeysLast30Count: journeysLast30Days.length,
      workedDatesLast30,
      totalGrossLast30Days,
      dailyAvg30DaysCalendar,
      dailyAvg30DaysWorked,
      accumulatedGrossCurrentMonth,
      accumulatedNetCurrentMonth,
      workedDaysCurrentMonth,
      projectedRemainingGrossCalendar,
      projectedTotalGrossMonthCalendar,
      estimatedRemainingWorkDays,
      projectedRemainingGrossWorked,
      projectedTotalGrossMonthWorked,
      targetDaily,
      targetMonthlyRevenue
    };
  }, [journeys, settings]);

  // Auto-fill fuel calculator from logged journey history
  const handleAutofillFuelFromJourneys = () => {
    if (!journeys || journeys.length === 0) return;

    let totalFuelCost = 0;
    let totalKmDriven = 0;

    journeys.forEach(j => {
      const fuel = j.expenses?.fuel ?? 0;
      totalFuelCost += fuel;

      const dist = j.totalKm ?? (j.endKm && j.startKm ? Math.max(0, j.endKm - j.startKm) : 0);
      totalKmDriven += dist;
    });

    if (totalFuelCost > 0) setFuelTotalCost(totalFuelCost.toFixed(2));
    if (totalKmDriven > 0) setDistanceKm(totalKmDriven.toFixed(0));
  };

  // Real-time Fuel Efficiency & Economy Goal Calculation
  const fuelCalc = useMemo(() => {
    const cost = parseFloat(fuelTotalCost) || 0;
    const dist = parseFloat(distanceKm) || 0;
    const price = parseFloat(fuelPricePerLiter) || 5.85;

    const costPerKm = dist > 0 ? cost / dist : 0;
    const litersConsumed = price > 0 ? cost / price : 0;
    const kmPerLiter = litersConsumed > 0 ? dist / litersConsumed : 0;
    const litersPer100Km = dist > 0 ? (litersConsumed / dist) * 100 : 0;

    // Fuel rating logic
    let ratingLabel = "Insuficiente";
    let ratingColor = "text-neutral-400";
    let ratingBadge = "bg-neutral-800 text-neutral-300 border-neutral-700";

    if (kmPerLiter > 0) {
      if (fuelType === "gasolina" || fuelType === "diesel") {
        if (kmPerLiter >= 13.5) {
          ratingLabel = "Excelente (Altíssima Eficiência)";
          ratingColor = "text-emerald-400";
          ratingBadge = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300";
        } else if (kmPerLiter >= 10.5) {
          ratingLabel = "Bom (Consumo Adequado)";
          ratingColor = "text-cyan-400";
          ratingBadge = "bg-cyan-500/20 border-cyan-500/40 text-cyan-300";
        } else if (kmPerLiter >= 8.5) {
          ratingLabel = "Moderado (Espaço para Otimização)";
          ratingColor = "text-amber-400";
          ratingBadge = "bg-amber-500/20 border-amber-500/40 text-amber-300";
        } else {
          ratingLabel = "Alto Consumo (Atenção ao Pé)";
          ratingColor = "text-rose-400";
          ratingBadge = "bg-rose-500/20 border-rose-500/40 text-rose-300";
        }
      } else if (fuelType === "etanol") {
        if (kmPerLiter >= 10.0) {
          ratingLabel = "Excelente (Etanol)";
          ratingColor = "text-emerald-400";
          ratingBadge = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300";
        } else if (kmPerLiter >= 7.8) {
          ratingLabel = "Bom (Etanol)";
          ratingColor = "text-cyan-400";
          ratingBadge = "bg-cyan-500/20 border-cyan-500/40 text-cyan-300";
        } else if (kmPerLiter >= 6.2) {
          ratingLabel = "Moderado (Etanol)";
          ratingColor = "text-amber-400";
          ratingBadge = "bg-amber-500/20 border-amber-500/40 text-amber-300";
        } else {
          ratingLabel = "Alto Consumo (Etanol)";
          ratingColor = "text-rose-400";
          ratingBadge = "bg-rose-500/20 border-rose-500/40 text-rose-300";
        }
      } else { // GNV
        if (kmPerLiter >= 13.0) {
          ratingLabel = "Excelente (GNV)";
          ratingColor = "text-emerald-400";
          ratingBadge = "bg-emerald-500/20 border-emerald-500/40 text-emerald-300";
        } else if (kmPerLiter >= 10.0) {
          ratingLabel = "Bom (GNV)";
          ratingColor = "text-cyan-400";
          ratingBadge = "bg-cyan-500/20 border-cyan-500/40 text-cyan-300";
        } else {
          ratingLabel = "Moderado / Elevado (GNV)";
          ratingColor = "text-amber-400";
          ratingBadge = "bg-amber-500/20 border-amber-500/40 text-amber-300";
        }
      }
    }

    // Savings target simulation
    const targetPctDec = targetEconomyPct / 100;
    const targetCostPerKm = costPerKm * (1 - targetPctDec);
    const targetKmPerLiter = kmPerLiter * (1 + targetPctDec);

    // Savings per 1,000 km driven
    const savingsPer1000Km = (costPerKm - targetCostPerKm) * 1000;

    // Projected monthly driven km
    const monthlyKmEstimate = projection && projection.workedDatesLast30 > 0
      ? Math.round((dist / projection.workedDatesLast30) * 26)
      : dist > 0 ? dist * 4 : 2500;

    const estimatedMonthlySavings = (costPerKm - targetCostPerKm) * monthlyKmEstimate;

    return {
      cost,
      dist,
      price,
      costPerKm,
      litersConsumed,
      kmPerLiter,
      litersPer100Km,
      ratingLabel,
      ratingColor,
      ratingBadge,
      targetCostPerKm,
      targetKmPerLiter,
      savingsPer1000Km,
      monthlyKmEstimate,
      estimatedMonthlySavings
    };
  }, [fuelTotalCost, distanceKm, fuelPricePerLiter, fuelType, targetEconomyPct, projection]);

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
          journeys: journeys.slice(0, 15),
          driverName: settings.displayName,
          projection: projection ? {
            dailyAvg30DaysCalendar: projection.dailyAvg30DaysCalendar,
            dailyAvg30DaysWorked: projection.dailyAvg30DaysWorked,
            workedDatesLast30: projection.workedDatesLast30,
            accumulatedGrossCurrentMonth: projection.accumulatedGrossCurrentMonth,
            remainingDays: projection.remainingDays,
            projectedTotalGrossMonth: projectionMode === "calendar" ? projection.projectedTotalGrossMonthCalendar : projection.projectedTotalGrossMonthWorked
          } : null
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

  const activeDailyAvg = projectionMode === "calendar"
    ? (projection?.dailyAvg30DaysCalendar || 0)
    : (projection?.dailyAvg30DaysWorked || 0);

  const activeProjectedTotal = projectionMode === "calendar"
    ? (projection?.projectedTotalGrossMonthCalendar || 0)
    : (projection?.projectedTotalGrossMonthWorked || 0);

  const activeRemainingProjected = projectionMode === "calendar"
    ? (projection?.projectedRemainingGrossCalendar || 0)
    : (projection?.projectedRemainingGrossWorked || 0);

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
            Diagnóstico de desempenho e projeção de faturamento com base no histórico de corridas.
          </p>
        </div>

        {hasData && !loading && (
          <button
            onClick={fetchInsights}
            id="fetch-insights-btn"
            className="flex items-center gap-1.5 px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-emerald-500/40 rounded-xl text-xs font-bold text-emerald-400 transition-all cursor-pointer shadow-md"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Recalcular Diagnóstico com IA</span>
          </button>
        )}
      </div>

      {/* Main UI body */}
      {!hasData ? (
        <div className="bg-neutral-950/40 border border-neutral-800/60 rounded-xl p-8 text-center">
          <Brain className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-300">Co-Piloto Aguardando Telemetria</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Grave pelo menos 1 jornada de trabalho para que o assistente inteligente possa analisar e compilar seu diagnóstico e projeção de faturamento.
          </p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* PROJECTION WIDGET CARD */}
          {projection && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 border border-cyan-500/30 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Card top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-500" />

              {/* Widget Header & Mode Switch */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-neutral-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-neutral-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <TrendingUp className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-black font-mono tracking-wider uppercase text-neutral-100 flex items-center gap-1.5">
                        <span>Projeção de Faturamento Mensal</span>
                      </h3>
                      <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold rounded-full">
                        MÉDIA 30 DIAS
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                      Projeção estimada para <strong className="text-neutral-200">{projection.currentMonthName}</strong> ({projection.currentDay}/{projection.totalDaysInMonth} dias decorridos &bull; <strong className="text-emerald-400 font-mono">{projection.remainingDays} dias restantes</strong>).
                    </p>
                  </div>
                </div>

                {/* Calculation Mode Selector */}
                <div className="flex items-center gap-1 bg-neutral-900 p-1 border border-neutral-800 rounded-xl self-start lg:self-center">
                  <button
                    onClick={() => setProjectionMode("calendar")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      projectionMode === "calendar"
                        ? "bg-cyan-500 text-neutral-950 shadow"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    Média Geral (30 Dias)
                  </button>
                  <button
                    onClick={() => setProjectionMode("worked")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      projectionMode === "worked"
                        ? "bg-cyan-500 text-neutral-950 shadow"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    Ritmo de Dias Rodados ({projection.workedDatesLast30}d/30)
                  </button>
                </div>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
                
                {/* 1. Média Diária 30d */}
                <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-neutral-400">Média Diária (30d)</span>
                    <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-lg font-black font-mono text-cyan-400">
                    {formatCurrency(activeDailyAvg)}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 font-sans">
                    {projectionMode === "calendar"
                      ? "Média em 30 dias de calendário"
                      : `Média nos ${projection.workedDatesLast30} dias rodados`}
                  </span>
                </div>

                {/* 2. Acumulado Mês Atual */}
                <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-neutral-400">Faturado no Mês</span>
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-lg font-black font-mono text-emerald-400">
                    {formatCurrency(projection.accumulatedGrossCurrentMonth)}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 font-sans">
                    {projection.workedDaysCurrentMonth} dias rodados em {projection.currentMonthName}
                  </span>
                </div>

                {/* 3. Estimativa Restante */}
                <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-neutral-400">Estimado a Faturar</span>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-lg font-black font-mono text-amber-400">
                    + {formatCurrency(activeRemainingProjected)}
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 font-sans">
                    {projectionMode === "calendar"
                      ? `Até o fim do mês (${projection.remainingDays} dias)`
                      : `Até o fim do mês (~${projection.estimatedRemainingWorkDays} dias de trabalho)`}
                  </span>
                </div>

                {/* 4. Total Projetado Fim do Mês */}
                <div className="p-4 bg-gradient-to-br from-cyan-950/40 via-neutral-900 to-emerald-950/40 border border-cyan-500/50 rounded-xl flex flex-col justify-between shadow-lg shadow-cyan-950/30">
                  <div className="flex items-center justify-between text-neutral-300 text-xs mb-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-cyan-300">Faturamento Projetado</span>
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                    {formatCurrency(activeProjectedTotal)}
                  </div>
                  <span className="text-[10px] text-emerald-400/90 font-mono mt-1 font-bold flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    Projeção p/ 30 de {projection.currentMonthName}
                  </span>
                </div>

              </div>

              {/* Progress & Target Comparison Bar */}
              <div className="bg-neutral-900/80 border border-neutral-800/90 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-400" />
                    <span className="text-neutral-300 font-bold">Meta Mensal Estimada:</span>
                    <span className="text-neutral-100 font-black">{formatCurrency(projection.targetMonthlyRevenue)}</span>
                    <span className="text-[10px] text-neutral-500">({formatCurrency(projection.targetDaily)}/dia)</span>
                  </div>

                  {activeProjectedTotal >= projection.targetMonthlyRevenue ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Projeção {formatCurrency(activeProjectedTotal - projection.targetMonthlyRevenue)} ACIMA DA META</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg text-[11px] font-bold">
                      <Info className="w-3.5 h-3.5" />
                      <span>Faltam {formatCurrency(projection.targetMonthlyRevenue - activeProjectedTotal)} no ritmo atual</span>
                    </div>
                  )}
                </div>

                {/* Progress bar visual */}
                <div className="space-y-1">
                  <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden p-0.5 border border-neutral-800 flex">
                    {/* Accumulated progress */}
                    <div
                      className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (projection.accumulatedGrossCurrentMonth / Math.max(activeProjectedTotal, projection.targetMonthlyRevenue)) * 100)}%`
                      }}
                      title="Faturado no mês"
                    />
                    {/* Remaining projected */}
                    <div
                      className="h-full bg-cyan-500/60 rounded-r-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (activeRemainingProjected / Math.max(activeProjectedTotal, projection.targetMonthlyRevenue)) * 100)}%`
                      }}
                      title="Projeção restante"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                    <span>Realizado: {formatCurrency(projection.accumulatedGrossCurrentMonth)}</span>
                    <span>Projeção Restante: {formatCurrency(activeRemainingProjected)}</span>
                    <span>Total Estimado: {formatCurrency(activeProjectedTotal)}</span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* FUEL EFFICIENCY & ECONOMY GOALS TOOL CARD */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-neutral-950 via-neutral-950 to-neutral-900 border border-amber-500/30 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Card top accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500" />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-neutral-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-black font-mono tracking-wider uppercase text-neutral-100 flex items-center gap-1.5">
                      <span>Calculadora de Eficiência & Metas de Combustível</span>
                    </h3>
                    <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold rounded-full">
                      FERRAMENTA DE ECONOMIA
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                    Informe o gasto e a quilometragem para calcular o custo por km, consumo médio (km/l) e simular metas de economia.
                  </p>
                </div>
              </div>

              {/* Auto-fill from history button */}
              {hasData && (
                <button
                  onClick={handleAutofillFuelFromJourneys}
                  className="flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                  title="Puxar somatório de combustível e km das jornadas salvas"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Preencher com Histórico</span>
                </button>
              )}
            </div>

            {/* Inputs Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
              
              {/* Input 1: Fuel Cost */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-neutral-300 uppercase flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Gasto Total Combustível</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={fuelTotalCost}
                    onChange={(e) => setFuelTotalCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/80 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-neutral-100 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Input 2: Distance Driven */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-neutral-300 uppercase flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Km Percorridos</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    placeholder="0"
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/80 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neutral-100 outline-none transition-colors"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs font-bold">km</span>
                </div>
              </div>

              {/* Input 3: Fuel Price per Liter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-neutral-300 uppercase flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-amber-400" />
                  <span>Preço/Litro ou m³</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 font-mono text-xs font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={fuelPricePerLiter}
                    onChange={(e) => setFuelPricePerLiter(e.target.value)}
                    placeholder="5.85"
                    className="w-full bg-neutral-900 border border-neutral-800 focus:border-amber-500/80 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-neutral-100 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Input 4: Fuel Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-bold text-neutral-300 uppercase flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Combustível Utilizado</span>
                </label>
                <div className="grid grid-cols-2 gap-1 bg-neutral-900 p-1 border border-neutral-800 rounded-xl">
                  {(["gasolina", "etanol", "gnv", "diesel"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFuelType(type)}
                      className={`py-1 px-2 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                        fuelType === type
                          ? "bg-amber-500 text-neutral-950 shadow"
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Calculated Results Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              
              {/* Cost Per Km */}
              <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">Custo por Quilômetro</span>
                <div className="text-xl font-black font-mono text-amber-400 my-1">
                  {formatCurrency(fuelCalc.costPerKm)} <span className="text-xs font-normal text-neutral-400">/ km</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-sans">
                  Gasto direto em combustível por km rodado
                </span>
              </div>

              {/* Efficiency Average km/l */}
              <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">Eficiência Média</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border ${fuelCalc.ratingBadge}`}>
                    {fuelCalc.ratingLabel}
                  </span>
                </div>
                <div className="text-xl font-black font-mono text-cyan-400 my-1">
                  {fuelCalc.kmPerLiter.toFixed(2)} <span className="text-xs font-normal text-neutral-400">{fuelType === "gnv" ? "km/m³" : "km/l"}</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-sans">
                  Litros consumidos: ~{fuelCalc.litersConsumed.toFixed(1)}L ({fuelCalc.litersPer100Km.toFixed(1)} L/100km)
                </span>
              </div>

              {/* Economy Goal Simulator Selection */}
              <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-xl flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-neutral-400">Meta de Redução de Consumo</span>
                <div className="flex items-center gap-1.5 my-1.5">
                  {[5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setTargetEconomyPct(pct)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                        targetEconomyPct === pct
                          ? "bg-emerald-500 text-neutral-950 border-emerald-400 shadow"
                          : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      -{pct}%
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  Meta selecionada: -{targetEconomyPct}% de consumo
                </span>
              </div>

            </div>

            {/* Simulated Target Impact Box */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-cyan-950/40 border border-emerald-500/40 rounded-xl p-4 my-4">
              <div className="flex items-center gap-2 mb-3">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-emerald-300">
                  Simulador de Economia (Meta -{targetEconomyPct}%)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-neutral-400 block text-[10px]">Novo Custo Alvo / km</span>
                  <span className="text-neutral-100 font-bold text-sm">{formatCurrency(fuelCalc.targetCostPerKm)} / km</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Nova Eficiência Alvo</span>
                  <span className="text-cyan-300 font-bold text-sm">{fuelCalc.targetKmPerLiter.toFixed(2)} {fuelType === "gnv" ? "km/m³" : "km/l"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Economia a cada 1.000 km</span>
                  <span className="text-emerald-400 font-bold text-sm">{formatCurrency(fuelCalc.savingsPer1000Km)}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px]">Economia Estimada no Mês</span>
                  <span className="text-emerald-400 font-black text-sm">{formatCurrency(fuelCalc.estimatedMonthlySavings)}</span>
                </div>
              </div>
            </div>

            {/* Actionable Economy Tips Checklist */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 mt-4">
              <h4 className="text-xs font-mono font-bold uppercase text-neutral-300 flex items-center gap-1.5 mb-2.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Recomendações Práticas para Alcançar a Meta de -{targetEconomyPct}%</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-neutral-400">
                <div className="flex items-start gap-2 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-200 block text-[11px]">Calibragem Semanal de Pneus:</strong>
                    Pneus com 3 PSI a menos aumentam o consumo em até 5%. Calibre sempre com pneus frios.
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-200 block text-[11px]">Condução Suave & Troca de Marcha:</strong>
                    Acelerações bruscas após o semáforo queimam até 20% a mais. Troque de marcha entre 2.000 e 2.300 RPM.
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-200 block text-[11px]">Uso Inteligente do Ar Condicionado:</strong>
                    Abaixo de 60 km/h no trânsito urbano, o ar condicionado consome mais. Acima de 70 km/h em rodovias, janelas abertas aumentam o atrito.
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-neutral-200 block text-[11px]">Pesquisa de Preço & Paridade Etanol/Gasolina:</strong>
                    No motor flex, o Etanol compensa se o preço for até 70% da Gasolina (Divida preço do Etanol pelo da Gasolina).
                  </div>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Action Trigger Box if no current insight */}
          {!insight && !loading && (
            <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-8 text-center flex flex-col items-center">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-2xl mb-4">
                <Cpu className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <h3 className="text-sm font-bold text-neutral-300">Telemetria & Projeção Prontas para Análise</h3>
              <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto mb-5">
                O assistente inteligente examina suas receitas brutas, faturamento projetado dos últimos 30 dias e custos de combustível para indicar estratégias e atingir sua meta.
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
                    <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>▶ Analisando projeção de 30 dias...</span>
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
                  if (line.trim().startsWith("1. ") || line.trim().startsWith("2. ") || line.trim().startsWith("3. ") || line.trim().startsWith("4. ") || line.trim().startsWith("5. ")) {
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
                ⚡ Relatório e projeção gerados dinamicamente via inteligência artificial (Gemini 3.5-Flash).
              </div>
            </motion.div>
          )}

        </div>
      )}
    </div>
  );
}
