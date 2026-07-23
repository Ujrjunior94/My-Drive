import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign, Fuel, Map, Clock } from "lucide-react";
import { Journey, UserSettings } from "../types";
import { motion } from "motion/react";

interface CalendarViewProps {
  journeys: Journey[];
  settings: UserSettings;
  onSelectDate: (dateStr: string) => void;
  onEditJourney: (journey: Journey) => void;
}

export default function CalendarView({ journeys, settings, onSelectDate, onEditJourney }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Default to July 2026 to showcase demo data perfectly!

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday: 0, Monday: 1, etc.
  const totalDays = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayIndex }, (_, i) => i);

  // Find journeys for a specific date (multiple shifts support)
  const getJourneysForDay = (day: number) => {
    const paddedMonth = String(month + 1).padStart(2, "0");
    const paddedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${paddedMonth}-${paddedDay}`;
    return journeys.filter((j) => j.date === dateStr);
  };

  // Get styling based on net profit
  const getDayStatusColor = (dayJourneys: Journey[]) => {
    const totalProfit = dayJourneys.reduce((sum, j) => sum + j.metrics.netProfit, 0);
    const target = settings.targetDailyProfit || 250;

    if (totalProfit >= target) {
      // High profit: neon green
      return {
        bg: "bg-emerald-950/40 border-emerald-500/40 text-emerald-300",
        badge: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        indicator: "bg-emerald-400"
      };
    } else if (totalProfit >= 100) {
      // Medium profit: electric blue
      return {
        bg: "bg-cyan-950/40 border-cyan-500/40 text-cyan-300",
        badge: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
        indicator: "bg-cyan-400"
      };
    } else {
      // Low profit: amber/yellow
      return {
        bg: "bg-amber-950/40 border-amber-500/40 text-amber-300",
        badge: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        indicator: "bg-amber-400"
      };
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: settings.currency || "BRL" }).format(val);
  };

  return (
    <div id="calendar-view-container" className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Visual Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2 font-sans">
            <CalendarIcon className="w-5 h-5 text-cyan-400" />
            Calendário Mensal
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Mapeamento cromático das suas jornadas de trabalho por lucro líquido diário.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={handlePrevMonth}
            id="prev-month-btn"
            className="p-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-400 hover:text-neutral-100 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm font-semibold font-mono text-cyan-400 min-w-[120px] text-center uppercase tracking-wider">
            {monthNames[month]} {year}
          </span>

          <button
            onClick={handleNextMonth}
            id="next-month-btn"
            className="p-2 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-400 hover:text-neutral-100 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 p-3 bg-neutral-950/60 border border-neutral-800/60 rounded-xl mb-6 text-xs text-neutral-400 font-mono">
        <span className="text-neutral-500 uppercase tracking-wider mr-1">Legenda:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span>Lucro Alto (★ {formatCurrency(settings.targetDailyProfit)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
          <span>Lucro Médio (R$ 100 - {formatCurrency(settings.targetDailyProfit)})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
          <span>Lucro Baixo (&lt; R$ 100)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
          <span>Sem Registro</span>
        </div>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono">
        <div>Dom</div>
        <div>Seg</div>
        <div>Ter</div>
        <div>Qua</div>
        <div>Qui</div>
        <div>Sex</div>
        <div>Sáb</div>
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 gap-2.5">
        {paddingDays.map((pad) => (
          <div key={`pad-${pad}`} className="aspect-square bg-neutral-950/25 border border-transparent rounded-xl" />
        ))}

        {daysArray.map((day) => {
          const dayJourneys = getJourneysForDay(day);
          const hasJourneys = dayJourneys.length > 0;
          const status = hasJourneys ? getDayStatusColor(dayJourneys) : null;
          const totalProfit = dayJourneys.reduce((sum, j) => sum + j.metrics.netProfit, 0);
          const paddedMonth = String(month + 1).padStart(2, "0");
          const paddedDay = String(day).padStart(2, "0");
          const dayDateStr = `${year}-${paddedMonth}-${paddedDay}`;

          return (
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.1 }}
              key={`day-${day}`}
              onClick={() => {
                if (hasJourneys) {
                  onEditJourney(dayJourneys[0]);
                } else {
                  onSelectDate(dayDateStr);
                }
              }}
              className={`aspect-square p-2 border rounded-xl flex flex-col justify-between transition-all cursor-pointer relative group overflow-hidden ${
                status 
                  ? `${status.bg} shadow-md` 
                  : "bg-neutral-950/40 border-neutral-800/80 hover:border-neutral-700 text-neutral-400"
              }`}
            >
              {/* Day Number and Multi-Shift Pill */}
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-mono font-bold ${status ? "text-neutral-100" : "text-neutral-500 group-hover:text-neutral-300"}`}>
                  {day}
                </span>
                {dayJourneys.length > 1 && (
                  <span className="text-[8px] font-mono font-bold px-1 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded">
                    {dayJourneys.length}T
                  </span>
                )}
              </div>

              {/* Status Badge & details if logged */}
              {hasJourneys ? (
                <div className="flex flex-col items-stretch mt-1">
                  <span className={`text-[9px] py-0.5 px-1 rounded font-bold font-mono text-center overflow-hidden text-ellipsis whitespace-nowrap ${status?.badge}`}>
                    {new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(totalProfit)}
                  </span>
                  
                  {/* Subtle pulsing glow */}
                  <span className="absolute bottom-1 right-1 flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status?.indicator}`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status?.indicator}`} />
                  </span>
                </div>
              ) : (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-center pb-1">
                  <span className="text-[9px] text-cyan-400 font-bold uppercase font-mono">+ Reg</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick guide */}
      <div className="mt-5 text-[10px] text-neutral-500 text-center font-mono uppercase tracking-wider">
        💡 Clique em um dia com registro para editar/excluir, ou em um dia vazio para registrar uma nova jornada.
      </div>
    </div>
  );
}
