import React, { useState, useEffect } from "react";
import { Plus, Save, Trash2, Calendar, MapPin, Gauge, Clock, DollarSign, Tag, Check, AlertCircle, Sparkles } from "lucide-react";
import { Journey, UserSettings } from "../types";
import { motion } from "motion/react";

interface JourneyFormProps {
  userId: string;
  isDemo: boolean;
  selectedDate: string;
  editingJourney: Journey | null;
  allJourneys?: Journey[];
  settings: UserSettings;
  onSave: (journey: Journey) => void;
  onDelete: (journeyId: string) => void;
  onCancel: () => void;
}

export default function JourneyForm({
  userId,
  isDemo,
  selectedDate,
  editingJourney,
  allJourneys = [],
  settings,
  onSave,
  onDelete,
  onCancel
}: JourneyFormProps) {
  const [date, setDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("16:00");
  const [shiftName, setShiftName] = useState("Turno 1 - Manhã");
  const tankCapacity = settings.tankCapacityLiters || 50;

  const [startKm, setStartKm] = useState<number>(0);
  const [endKm, setEndKm] = useState<number>(0);
  const [startFuel, setStartFuel] = useState<number>(100);
  const [endFuel, setEndFuel] = useState<number>(50);
  const [startFuelLiters, setStartFuelLiters] = useState<number>(tankCapacity);
  const [endFuelLiters, setEndFuelLiters] = useState<number>(tankCapacity / 2);

  // Earnings
  const [uberEarn, setUberEarn] = useState<number>(0);
  const [earn99, setEarn99] = useState<number>(0);
  const [othersEarn, setOthersEarn] = useState<number>(0);

  // Expenses
  const [fuelExp, setFuelExp] = useState<number>(0);
  const [tollExp, setTollExp] = useState<number>(0);
  const [foodExp, setFoodExp] = useState<number>(0);
  const [othersExp, setOthersExp] = useState<number>(0);

  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  // Synchronize percentage, liters and auto-fill last odometer when creating a new turn/shift
  useEffect(() => {
    if (editingJourney) {
      setDate(editingJourney.date);
      setStartTime(editingJourney.startTime);
      setEndTime(editingJourney.endTime);
      setShiftName(editingJourney.shiftName || "Turno 1 - Manhã");
      setStartKm(editingJourney.startKm);
      setEndKm(editingJourney.endKm);
      
      const sFuel = editingJourney.startFuelLevel ?? 100;
      const eFuel = editingJourney.endFuelLevel ?? 50;
      setStartFuel(sFuel);
      setEndFuel(eFuel);
      setStartFuelLiters(Number(((sFuel / 100) * tankCapacity).toFixed(1)));
      setEndFuelLiters(Number(((eFuel / 100) * tankCapacity).toFixed(1)));

      setUberEarn(editingJourney.earnings.uber);
      setEarn99(editingJourney.earnings["99"]);
      setOthersEarn(editingJourney.earnings.others);
      setFuelExp(editingJourney.expenses.fuel);
      setTollExp(editingJourney.expenses.tolls);
      setFoodExp(editingJourney.expenses.food);
      setOthersExp(editingJourney.expenses.others);
      setNotes(editingJourney.notes);
    } else {
      setDate(selectedDate);
      
      // Calculate shifts existing on this selected date
      const sameDayJourneys = allJourneys.filter(j => j.date === selectedDate);
      const turnCount = sameDayJourneys.length;

      let suggestedStart = 0;
      if (allJourneys.length > 0) {
        // Find highest endKm from all journeys
        suggestedStart = Math.max(...allJourneys.map(j => j.endKm || 0));
      }

      if (turnCount === 0) {
        setShiftName("Turno 1 - Manhã");
        setStartTime("07:00");
        setEndTime("12:00");
      } else if (turnCount === 1) {
        setShiftName("Turno 2 - Tarde");
        setStartTime("12:30");
        setEndTime("17:30");
      } else if (turnCount === 2) {
        setShiftName("Turno 3 - Noite");
        setStartTime("18:00");
        setEndTime("23:00");
      } else {
        setShiftName(`Turno Extra #${turnCount + 1}`);
        setStartTime("22:00");
        setEndTime("04:00");
      }

      setStartKm(suggestedStart);
      setEndKm(suggestedStart ? suggestedStart + 100 : 0);
      setStartFuel(100);
      setEndFuel(50);
      setStartFuelLiters(tankCapacity);
      setEndFuelLiters(Number((tankCapacity / 2).toFixed(1)));
      setUberEarn(0);
      setEarn99(0);
      setOthersEarn(0);
      setFuelExp(0);
      setTollExp(0);
      setFoodExp(0);
      setOthersExp(0);
      setNotes("");
    }
  }, [editingJourney, selectedDate, tankCapacity, allJourneys]);

  const handleStartLitersChange = (liters: number) => {
    const validLiters = Math.max(0, Math.min(tankCapacity, liters));
    setStartFuelLiters(validLiters);
    setStartFuel(Math.round((validLiters / tankCapacity) * 100));
  };

  const handleEndLitersChange = (liters: number) => {
    const validLiters = Math.max(0, Math.min(tankCapacity, liters));
    setEndFuelLiters(validLiters);
    setEndFuel(Math.round((validLiters / tankCapacity) * 100));
  };

  const handleStartFuelPctChange = (pct: number) => {
    setStartFuel(pct);
    setStartFuelLiters(Number(((pct / 100) * tankCapacity).toFixed(1)));
  };

  const handleEndFuelPctChange = (pct: number) => {
    setEndFuel(pct);
    setEndFuelLiters(Number(((pct / 100) * tankCapacity).toFixed(1)));
  };

  // Derived Calculations
  const totalKm = Math.max(0, endKm - startKm);
  const consumedLiters = Math.max(0, startFuelLiters - endFuelLiters);
  const journeyKmL = consumedLiters > 0 && totalKm > 0 ? totalKm / consumedLiters : 0;

  // Calculate worked hours
  const calculateHours = () => {
    try {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      
      let startMin = startH * 60 + startM;
      let endMin = endH * 60 + endM;
      
      if (endMin < startMin) {
        // Crossed midnight
        endMin += 24 * 60;
      }
      
      return (endMin - startMin) / 60;
    } catch {
      return 8; // Default fallback
    }
  };

  const hoursWorked = calculateHours();
  const grossEarnings = uberEarn + earn99 + othersEarn;
  const totalExpenses = fuelExp + tollExp + foodExp + othersExp;
  const netProfit = grossEarnings - totalExpenses;

  // Efficiency metrics
  const profitPerHour = hoursWorked > 0 ? netProfit / hoursWorked : 0;
  const profitPerKm = totalKm > 0 ? netProfit / totalKm : 0;
  const costPerKm = totalKm > 0 ? totalExpenses / totalKm : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (endKm < startKm) {
      setError("O KM final não pode ser menor do que o KM inicial.");
      return;
    }

    if (totalKm === 0 && (grossEarnings > 0 || totalExpenses > 0)) {
      setError("Atenção: Por favor, preencha a quilometragem percorrida para calcular o desempenho.");
      return;
    }

    const journey: Journey = {
      id: editingJourney?.id || `journey-${Date.now()}`,
      userId,
      date,
      startTime,
      endTime,
      shiftName,
      startKm,
      endKm,
      totalKm,
      startFuelLevel: startFuel,
      endFuelLevel: endFuel,
      earnings: {
        uber: uberEarn,
        99: earn99,
        others: othersEarn
      },
      expenses: {
        fuel: fuelExp,
        tolls: tollExp,
        food: foodExp,
        others: othersExp
      },
      metrics: {
        grossEarnings,
        totalExpenses,
        netProfit,
        profitPerHour,
        profitPerKm,
        costPerKm
      },
      notes
    };

    onSave(journey);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: settings.currency || "BRL" }).format(val);
  };

  return (
    <div id="journey-form-container" className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Top ambient colored lighting */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-emerald-500" />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2 font-sans">
            <Gauge className="text-emerald-400 w-5 h-5 animate-pulse" />
            {editingJourney ? "Editar Registro de Corrida" : "Novo Registro de Corrida"}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Preencha os indicadores de telemetria e financeiros da sua jornada.
          </p>
        </div>

        {editingJourney && (
          <button
            type="button"
            id="delete-journey-btn"
            onClick={() => {
              if (window.confirm("Deseja realmente apagar esta jornada de trabalho?")) {
                onDelete(editingJourney.id);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/35 rounded-lg text-xs text-red-400 hover:text-red-300 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir</span>
          </button>
        )}
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-xs text-red-400 flex items-start gap-2">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Core telemetry widgets (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Day, Time & Shift Selection (Folha de Ponto) */}
          <div className="bg-neutral-950/60 border border-neutral-800/60 p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Tempo & Folha de Ponto
              </span>
              <span className="text-[9px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                Multi-Turno / Dia
              </span>
            </span>
            
            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Data</label>
              <input
                id="journey-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-neutral-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-sans"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Identificador do Turno / Ponto
              </label>
              <input
                id="journey-shift-name"
                type="text"
                required
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500/50"
                placeholder="Ex: Turno 1 - Manhã"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(["Turno 1 - Manhã", "Turno 2 - Tarde", "Turno 3 - Noite", "Turno Madrugada", "Turno Extra"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShiftName(s)}
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                      shiftName === s
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Hora Início</label>
                <input
                  id="journey-start-time"
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-neutral-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Hora Término</label>
                <input
                  id="journey-end-time"
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-neutral-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono"
                />
              </div>
            </div>
            <div className="text-[10px] text-neutral-500 font-mono text-right uppercase">
              Duração: <span className="text-neutral-300 font-bold">{hoursWorked.toFixed(1)} horas</span>
            </div>
          </div>

          {/* Odometer Metrics */}
          <div className="bg-neutral-950/60 border border-neutral-800/60 p-4 rounded-xl space-y-3">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Odômetro (KM)
            </span>

            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Km Inicial</label>
              <input
                id="journey-start-km"
                type="number"
                required
                min="0"
                value={startKm || ""}
                onChange={(e) => setStartKm(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-neutral-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono"
                placeholder="Ex: 124500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Km Final</label>
              <input
                id="journey-end-km"
                type="number"
                required
                min="0"
                value={endKm || ""}
                onChange={(e) => setEndKm(Number(e.target.value))}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-sm text-neutral-100 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-mono"
                placeholder="Ex: 124720"
              />
            </div>

            <div className="text-[10px] text-neutral-500 font-mono text-right uppercase">
              Rodado: <span className="text-neutral-300 font-bold">{totalKm} KM</span>
            </div>
          </div>

          {/* Fuel Level Dashboard Slider & Liters Input */}
          <div className="bg-neutral-950/60 border border-neutral-800/60 p-4 rounded-xl space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                Tanque & Combustível
              </span>
              <span className="text-[9px] font-mono text-neutral-400">
                Tanque: <strong className="text-neutral-200">{tankCapacity} L</strong>
              </span>
            </div>

            <div className="space-y-3">
              {/* Start Fuel in Liters & % */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-400">Partida:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={tankCapacity}
                      value={startFuelLiters}
                      onChange={(e) => handleStartLitersChange(Number(e.target.value))}
                      className="w-16 bg-neutral-900 border border-neutral-800 text-emerald-400 font-bold px-1.5 py-0.5 text-right rounded font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-neutral-400 font-bold">L</span>
                    <span className="text-neutral-500 text-[9px]">({startFuel}%)</span>
                  </div>
                </div>
                <input
                  id="start-fuel-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={startFuel}
                  onChange={(e) => handleStartFuelPctChange(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* End Fuel in Liters & % */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-neutral-400">Retorno:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={tankCapacity}
                      value={endFuelLiters}
                      onChange={(e) => handleEndLitersChange(Number(e.target.value))}
                      className="w-16 bg-neutral-900 border border-neutral-800 text-cyan-400 font-bold px-1.5 py-0.5 text-right rounded font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-neutral-400 font-bold">L</span>
                    <span className="text-neutral-500 text-[9px]">({endFuel}%)</span>
                  </div>
                </div>
                <input
                  id="end-fuel-slider"
                  type="range"
                  min="0"
                  max="100"
                  value={endFuel}
                  onChange={(e) => handleEndFuelPctChange(Number(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>

            <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between border-t border-neutral-800/60 pt-2">
              <span>Consumido: <strong className="text-neutral-100">{consumedLiters.toFixed(1)} L</strong> ({Math.max(0, startFuel - endFuel)}%)</span>
              {journeyKmL > 0 && (
                <span className="text-emerald-400 font-bold">{journeyKmL.toFixed(2)} km/L</span>
              )}
            </div>
          </div>

        </div>

        {/* Finance breakdown sections (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Earnings by Platform */}
          <div className="bg-neutral-950/40 border border-neutral-800/60 p-4 rounded-xl space-y-4">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1 border-b border-neutral-800/60 pb-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Ganhos por Plataforma
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Uber</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-neutral-500 font-mono">R$</span>
                  <input
                    id="uber-earnings"
                    type="number"
                    step="0.01"
                    min="0"
                    value={uberEarn || ""}
                    onChange={(e) => setUberEarn(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 pl-7 pr-2.5 text-sm font-mono text-neutral-100 focus:outline-none focus:border-emerald-500/50"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">99 App</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-neutral-500 font-mono">R$</span>
                  <input
                    id="99-earnings"
                    type="number"
                    step="0.01"
                    min="0"
                    value={earn99 || ""}
                    onChange={(e) => setEarn99(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 pl-7 pr-2.5 text-sm font-mono text-neutral-100 focus:outline-none focus:border-emerald-500/50"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Outros / Privado</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-neutral-500 font-mono">R$</span>
                  <input
                    id="others-earnings"
                    type="number"
                    step="0.01"
                    min="0"
                    value={othersEarn || ""}
                    onChange={(e) => setOthersEarn(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 pl-7 pr-2.5 text-sm font-mono text-neutral-100 focus:outline-none focus:border-emerald-500/50"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/15 p-3 rounded-xl flex justify-between items-center text-xs font-mono">
              <span className="text-emerald-400 font-bold">Faturamento Bruto:</span>
              <span className="text-emerald-300 font-black text-sm">{formatCurrency(grossEarnings)}</span>
            </div>
          </div>

          {/* Expenses detailing */}
          <div className="bg-neutral-950/40 border border-neutral-800/60 p-4 rounded-xl space-y-4">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider font-mono flex items-center gap-1 border-b border-neutral-800/60 pb-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              Gastos de Operação
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Combustível</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-neutral-500 font-mono">R$</span>
                  <input
                    id="fuel-expense"
                    type="number"
                    step="0.01"
                    min="0"
                    value={fuelExp || ""}
                    onChange={(e) => setFuelExp(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 pl-6 pr-1 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500/50"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Pedágios</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-neutral-500 font-mono">R$</span>
                  <input
                    id="tolls-expense"
                    type="number"
                    step="0.01"
                    min="0"
                    value={tollExp || ""}
                    onChange={(e) => setTollExp(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 pl-6 pr-1 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500/50"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Alimentação</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-neutral-500 font-mono">R$</span>
                  <input
                    id="food-expense"
                    type="number"
                    step="0.01"
                    min="0"
                    value={foodExp || ""}
                    onChange={(e) => setFoodExp(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 pl-6 pr-1 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500/50"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-mono">Outros</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-xs text-neutral-500 font-mono">R$</span>
                  <input
                    id="others-expense"
                    type="number"
                    step="0.01"
                    min="0"
                    value={othersExp || ""}
                    onChange={(e) => setOthersExp(Number(e.target.value))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-1.5 pl-6 pr-1 text-xs font-mono text-neutral-100 focus:outline-none focus:border-red-500/50"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="bg-red-950/20 border border-red-500/15 p-3 rounded-xl flex justify-between items-center text-xs font-mono">
              <span className="text-red-400 font-bold">Total Despesas:</span>
              <span className="text-red-300 font-black text-sm">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>

        </div>

        {/* Real-time calculated telemetry summary preview */}
        <div className="bg-neutral-950/60 border border-neutral-800/80 p-4 rounded-xl">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono flex items-center gap-1 border-b border-neutral-800/60 pb-2 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Cálculo Prévio Telemetria
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-2 border border-neutral-800/40 rounded-lg">
              <span className="block text-[9px] text-neutral-500 uppercase tracking-wider font-mono">Lucro Líquido</span>
              <span className={`text-base font-black font-mono ${netProfit >= settings.targetDailyProfit ? "text-emerald-400" : netProfit >= 100 ? "text-cyan-400" : "text-amber-400"}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>

            <div className="p-2 border border-neutral-800/40 rounded-lg">
              <span className="block text-[9px] text-neutral-500 uppercase tracking-wider font-mono">Lucro por Hora</span>
              <span className="text-sm font-bold font-mono text-neutral-200">
                {formatCurrency(profitPerHour)}/h
              </span>
            </div>

            <div className="p-2 border border-neutral-800/40 rounded-lg">
              <span className="block text-[9px] text-neutral-500 uppercase tracking-wider font-mono">Lucro por KM</span>
              <span className="text-sm font-bold font-mono text-neutral-200">
                {formatCurrency(profitPerKm)}/km
              </span>
            </div>

            <div className="p-2 border border-neutral-800/40 rounded-lg">
              <span className="block text-[9px] text-neutral-500 uppercase tracking-wider font-mono">Custo por KM</span>
              <span className="text-sm font-bold font-mono text-red-400">
                {formatCurrency(costPerKm)}/km
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider font-mono">
            Observações de Bordo
          </label>
          <textarea
            id="journey-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all font-sans"
            placeholder="Como estava a dinâmica? Algum incidente, trânsito lento ou zona boa de corridas?"
          />
        </div>

        {/* Actions bar */}
        <div className="flex justify-end gap-3.5 pt-2 border-t border-neutral-800/60">
          <button
            type="button"
            id="cancel-journey-btn"
            onClick={onCancel}
            className="px-5 py-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-neutral-200 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            id="submit-journey-btn"
            className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-neutral-900 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Telemetria</span>
          </button>
        </div>

      </form>
    </div>
  );
}
