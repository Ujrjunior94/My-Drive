import React, { useState, useEffect } from "react";
import { Refuel, UserSettings } from "../types";
import { dbService } from "../lib/dbService";
import { Plus, Trash2, Fuel, Calendar, Compass, AlertCircle, Sparkles, Check, Droplets, ArrowUpRight, Calculator, Gauge, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Skeleton = ({ className = "h-4 w-full" }: { className?: string }) => (
  <motion.div
    className={`bg-neutral-800/70 rounded-md ${className}`}
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  />
);

interface RefuelsViewProps {
  userId: string;
  isDemo: boolean;
  settings: UserSettings;
  currentOdometer: number;
}

interface ComputedRefuelMetrics {
  kmSinceLast: number;
  spentLiters: number;
  segmentKmL: number | null;
  tankBefore: number;
  tankAfter: number;
  tankPctAfter: number;
}

export default function RefuelsView({ userId, isDemo, settings, currentOdometer }: RefuelsViewProps) {
  const [refuels, setRefuels] = useState<Refuel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [lastAddedResult, setLastAddedResult] = useState<{
    refuel: Refuel;
    metrics: ComputedRefuelMetrics;
  } | null>(null);

  // Form Fields
  const [date, setDate] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [liters, setLiters] = useState<string>("");
  const [pricePerLiter, setPricePerLiter] = useState<string>("");
  const [stationName, setStationName] = useState<string>("");
  const [odometer, setOdometer] = useState<string>("");
  const [fuelType, setFuelType] = useState<string>("Etanol Comum");

  const loadRefuels = async () => {
    setLoading(true);
    try {
      const list = await dbService.getRefuels(userId, isDemo);
      setRefuels(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefuels();
    
    // Set default date to today
    const today = new Date();
    const padMonth = String(today.getMonth() + 1).padStart(2, "0");
    const padDay = String(today.getDate()).padStart(2, "0");
    setDate(`${today.getFullYear()}-${padMonth}-${padDay}`);
  }, [userId, isDemo]);

  // Auto calculate price per liter or value when other inputs change
  useEffect(() => {
    const valNum = parseFloat(value);
    const litNum = parseFloat(liters);
    if (valNum > 0 && litNum > 0) {
      setPricePerLiter((valNum / litNum).toFixed(2));
    }
  }, [value, liters]);

  // Compute detailed chronological metrics for each refuel
  const tankCapacity = settings.tankCapacityLiters || 50;
  const isEtanol = (settings.fuelType || "").toLowerCase().includes("etanol");
  const effectiveKmL = settings.customKmL || (isEtanol ? 8.1 : 12.1);

  // Sorted list chronologically
  const sortedRefuels = [...refuels].sort((a, b) => a.odometer - b.odometer || new Date(a.date).getTime() - new Date(b.date).getTime());

  const computedMetricsMap = new Map<string, ComputedRefuelMetrics>();
  let runningTankAfter = 0;

  sortedRefuels.forEach((ref, index) => {
    if (index === 0) {
      const tankAfter = Math.min(tankCapacity, ref.liters);
      runningTankAfter = tankAfter;
      computedMetricsMap.set(ref.id, {
        kmSinceLast: 0,
        spentLiters: 0,
        segmentKmL: null,
        tankBefore: 0,
        tankAfter,
        tankPctAfter: Math.round((tankAfter / tankCapacity) * 100)
      });
    } else {
      const prevRef = sortedRefuels[index - 1];
      const kmSinceLast = Math.max(0, ref.odometer - prevRef.odometer);
      const spentLiters = kmSinceLast > 0 ? kmSinceLast / effectiveKmL : 0;
      const segmentKmL = ref.liters > 0 && kmSinceLast > 0 ? kmSinceLast / ref.liters : null;
      const tankBefore = Math.max(0, runningTankAfter - spentLiters);
      const tankAfter = Math.min(tankCapacity, tankBefore + ref.liters);
      runningTankAfter = tankAfter;

      computedMetricsMap.set(ref.id, {
        kmSinceLast,
        spentLiters,
        segmentKmL,
        tankBefore,
        tankAfter,
        tankPctAfter: Math.round((tankAfter / tankCapacity) * 100)
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !value || !liters || !odometer) {
      alert("Preencha todos os campos obrigatórios (Data, Valor, Litros e Odômetro).");
      return;
    }

    const newRefuel: Refuel = {
      id: "ref_" + Date.now(),
      userId,
      date,
      value: parseFloat(value),
      liters: parseFloat(liters),
      pricePerLiter: parseFloat(pricePerLiter) || (parseFloat(value) / parseFloat(liters)),
      stationName: stationName || "Posto Não Especificado",
      odometer: parseInt(odometer),
      fuelType
    };

    try {
      await dbService.saveRefuel(userId, newRefuel, isDemo);
      const updatedList = await dbService.getRefuels(userId, isDemo);
      setRefuels(updatedList);

      // Re-calculate newest refuel metric for pop-up / calculation callout
      const newSorted = [...updatedList].sort((a, b) => a.odometer - b.odometer || new Date(a.date).getTime() - new Date(b.date).getTime());
      const newIndex = newSorted.findIndex(r => r.id === newRefuel.id);
      
      let calcMetric: ComputedRefuelMetrics = {
        kmSinceLast: 0,
        spentLiters: 0,
        segmentKmL: null,
        tankBefore: 0,
        tankAfter: Math.min(tankCapacity, newRefuel.liters),
        tankPctAfter: Math.round((Math.min(tankCapacity, newRefuel.liters) / tankCapacity) * 100)
      };

      if (newIndex > 0) {
        const prevRef = newSorted[newIndex - 1];
        const kmSinceLast = Math.max(0, newRefuel.odometer - prevRef.odometer);
        const spentLiters = kmSinceLast > 0 ? kmSinceLast / effectiveKmL : 0;
        const segmentKmL = newRefuel.liters > 0 && kmSinceLast > 0 ? kmSinceLast / newRefuel.liters : null;
        
        // Find previous tank after
        const prevMetric = computedMetricsMap.get(prevRef.id);
        const prevTankAfter = prevMetric ? prevMetric.tankAfter : 0;
        const tankBefore = Math.max(0, prevTankAfter - spentLiters);
        const tankAfter = Math.min(tankCapacity, tankBefore + newRefuel.liters);

        calcMetric = {
          kmSinceLast,
          spentLiters,
          segmentKmL,
          tankBefore,
          tankAfter,
          tankPctAfter: Math.round((tankAfter / tankCapacity) * 100)
        };
      }

      setLastAddedResult({
        refuel: newRefuel,
        metrics: calcMetric
      });

      // Reset form
      setValue("");
      setLiters("");
      setPricePerLiter("");
      setStationName("");
      setOdometer("");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar abastecimento.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Confirmar a exclusão deste registro de abastecimento?")) {
      try {
        await dbService.deleteRefuel(userId, id, isDemo);
        await loadRefuels();
        if (lastAddedResult?.refuel.id === id) {
          setLastAddedResult(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: settings.currency
    }).format(val);
  };

  // Metrics analysis
  const totalSpent = refuels.reduce((sum, r) => sum + r.value, 0);
  const totalLiters = refuels.reduce((sum, r) => sum + r.liters, 0);
  const avgPrice = totalLiters > 0 ? totalSpent / totalLiters : 0;

  // Latest calculated tank status
  const latestSortedRefuel = sortedRefuels.length > 0 ? sortedRefuels[sortedRefuels.length - 1] : null;
  const latestMetric = latestSortedRefuel ? computedMetricsMap.get(latestSortedRefuel.id) : null;

  // Consumption estimation
  let averageConsumption = "N/D";
  if (refuels.length >= 2) {
    const firstOdo = sortedRefuels[0].odometer;
    const lastOdo = sortedRefuels[sortedRefuels.length - 1].odometer;
    const totalDist = lastOdo - firstOdo;
    const totalLit = sortedRefuels.slice(0, -1).reduce((sum, r) => sum + r.liters, 0);
    if (totalDist > 0 && totalLit > 0) {
      averageConsumption = (totalDist / totalLit).toFixed(2) + " km/L";
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6">
        <div>
          <h2 className="text-lg font-black font-mono tracking-wider text-cyan-400 flex items-center gap-2 uppercase">
            <Fuel className="w-5 h-5 text-emerald-400 animate-pulse" /> Registro de Abastecimentos & Telemetria
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-sans">
            Cálculo automático do consumo entre abastecimentos e auditoria do histórico de nível de combustível no tanque.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-neutral-900 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/10 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Fechar Painel" : "Abastecer Agora"}</span>
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 space-y-4">
              <span className="text-xs font-mono font-black text-cyan-400 uppercase tracking-widest block mb-1">
                Lançar Novo Abastecimento no Tanque
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Date */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Data do Abastecimento
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Value spent */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Valor Pago ({settings.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 150.00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Liters */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Quantidade (Litros)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 35.5"
                    value={liters}
                    onChange={(e) => setLiters(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Price per liter */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Preço por Litro ({settings.currency}/L)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Calculado automaticamente"
                    value={pricePerLiter}
                    onChange={(e) => setPricePerLiter(e.target.value)}
                    className="w-full bg-neutral-950/60 border border-neutral-800/80 text-neutral-300 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Odometer */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Odômetro no Ato (KM)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 124700"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Tipo de Combustível
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  >
                    <option value="Etanol Comum">Etanol Comum</option>
                    <option value="Gasolina Comum">Gasolina Comum</option>
                    <option value="Gasolina Aditivada">Gasolina Aditivada</option>
                    <option value="GNV">GNV</option>
                    <option value="Diesel">Diesel</option>
                  </select>
                </div>

                {/* Posto */}
                <div className="md:col-span-3">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Nome / Bandeira do Posto (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Posto Petrobras Av. Paulista"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-sans focus:outline-none"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-neutral-950 border border-neutral-800 text-neutral-400 font-bold text-xs rounded-xl cursor-pointer hover:bg-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-xs rounded-xl cursor-pointer shadow-md shadow-emerald-500/10 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Calcular e Salvar Abastecimento</span>
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CARD RESULTADO DO CÁLCULO RECENTE (LITROS GASTOS + NOVO TANQUE) */}
      {lastAddedResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-cyan-500/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Resultado do Cálculo de Bordo — Abastecimento Registrado!</span>
            </div>

            <button
              onClick={() => setLastAddedResult(null)}
              className="text-neutral-500 hover:text-neutral-300 text-xs font-mono cursor-pointer"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {/* Gastos entre abastecimentos */}
            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block uppercase font-bold flex items-center gap-1">
                <Droplets className="w-3 h-3 text-amber-400" />
                Gasto no Trecho Anter.
              </span>
              <span className="text-xl font-black text-amber-400 block my-1">
                {lastAddedResult.metrics.spentLiters.toFixed(1)} L
              </span>
              <span className="text-[9px] text-neutral-400">
                {lastAddedResult.metrics.kmSinceLast > 0
                  ? `Em ${lastAddedResult.metrics.kmSinceLast} KM percorridos`
                  : "Primeiro registro de referência"}
              </span>
            </div>

            {/* Consumo Obtido */}
            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block uppercase font-bold flex items-center gap-1">
                <Gauge className="w-3 h-3 text-cyan-400" />
                Eficiência do Trecho
              </span>
              <span className="text-xl font-black text-cyan-400 block my-1">
                {lastAddedResult.metrics.segmentKmL
                  ? `${lastAddedResult.metrics.segmentKmL.toFixed(1)} km/L`
                  : `${effectiveKmL.toFixed(1)} km/L`}
              </span>
              <span className="text-[9px] text-neutral-400">
                {lastAddedResult.metrics.segmentKmL ? "Média real obtida no posto" : "Consumo padrão configurado"}
              </span>
            </div>

            {/* O Quanto Está no Tanque Agora */}
            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block uppercase font-bold flex items-center gap-1">
                <Fuel className="w-3 h-3 text-emerald-400" />
                Tanque Atualizado
              </span>
              <span className="text-xl font-black text-emerald-400 block my-1">
                {lastAddedResult.metrics.tankAfter.toFixed(1)} L
              </span>
              <span className="text-[9px] text-neutral-400">
                {lastAddedResult.metrics.tankPctAfter}% do tanque ({tankCapacity}L max)
              </span>
            </div>

            {/* Nova Autonomia */}
            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800">
              <span className="text-[10px] text-neutral-500 block uppercase font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-blue-400" />
                Nova Autonomia
              </span>
              <span className="text-xl font-black text-neutral-100 block my-1">
                ~{(lastAddedResult.metrics.tankAfter * effectiveKmL).toFixed(0)} KM
              </span>
              <span className="text-[9px] text-neutral-400">
                Sem necessidade de abastecer
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Telemetry Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Cost */}
        <div className="bg-neutral-900 border border-neutral-800/70 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-red-400">
            <Fuel className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Gasto em Abastecimentos</span>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-lg font-black font-mono text-neutral-100">{formatCurrency(totalSpent)}</span>
            )}
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mt-0.5">Acumulado do Piloto</span>
          </div>
        </div>

        {/* Total Liters */}
        <div className="bg-neutral-900 border border-neutral-800/70 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Volume Abastecido</span>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-lg font-black font-mono text-neutral-100">{totalLiters.toFixed(1)} L</span>
            )}
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mt-0.5">Total Litros Carregados</span>
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-neutral-900 border border-neutral-800/70 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-950/30 border border-yellow-500/20 rounded-xl text-yellow-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Preço Médio</span>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-lg font-black font-mono text-neutral-100">{formatCurrency(avgPrice)}/L</span>
            )}
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mt-0.5">Média Ponderada</span>
          </div>
        </div>

        {/* Current Tank Level from History */}
        <div className="bg-neutral-900 border border-neutral-800/70 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Tanque Atual no Histórico</span>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-lg font-black font-mono text-emerald-400">
                {latestMetric ? `${latestMetric.tankAfter.toFixed(1)} L (${latestMetric.tankPctAfter}%)` : "N/D"}
              </span>
            )}
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mt-0.5">Histórico do Último Aporte</span>
          </div>
        </div>

      </div>

      {/* History List */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-widest">
            Histórico do Tanque & Cálculo Entre Abastecimentos
          </h3>
          <span className="text-[10px] font-mono text-neutral-500">
            Cálculos baseados em {tankCapacity}L e consumo de {effectiveKmL} km/L
          </span>
        </div>

        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800/60 text-neutral-500 text-[10px] uppercase tracking-wider">
                  <th className="pb-3 font-bold">Data</th>
                  <th className="pb-3 font-bold">Posto</th>
                  <th className="pb-3 font-bold text-right">Odômetro</th>
                  <th className="pb-3 font-bold text-right">Km no Trecho</th>
                  <th className="pb-3 font-bold text-right">Litros Gastos</th>
                  <th className="pb-3 font-bold text-right">Novo Aporte</th>
                  <th className="pb-3 font-bold text-right">No Tanque</th>
                  <th className="pb-3 font-bold text-right">Custo Total</th>
                  <th className="pb-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    <td className="py-4 text-right"><Skeleton className="h-4 w-14 ml-auto" /></td>
                    <td className="py-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="py-4 text-center"><Skeleton className="h-5 w-5 mx-auto rounded-lg" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : refuels.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
            Nenhum abastecimento registrado até o momento. Ligar painel e abastecer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800/60 text-neutral-500 text-[10px] uppercase tracking-wider">
                  <th className="pb-3 font-bold">Data</th>
                  <th className="pb-3 font-bold">Posto / Tipo</th>
                  <th className="pb-3 font-bold text-right">Odômetro</th>
                  <th className="pb-3 font-bold text-right">Km Rodados</th>
                  <th className="pb-3 font-bold text-right">Litros Gastos</th>
                  <th className="pb-3 font-bold text-right">Novo Aporte</th>
                  <th className="pb-3 font-bold text-right">No Tanque Pós</th>
                  <th className="pb-3 font-bold text-right">Custo Total</th>
                  <th className="pb-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {refuels.map((ref) => {
                  const m = computedMetricsMap.get(ref.id);
                  return (
                    <tr key={ref.id} className="hover:bg-neutral-850/40 transition-colors">
                      <td className="py-3 text-neutral-300 font-bold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                        {ref.date.split("-").reverse().join("/")}
                      </td>
                      <td className="py-3 text-neutral-400 max-w-[150px] truncate">
                        <div>{ref.stationName}</div>
                        <div className="text-[10px] text-emerald-400 font-bold">{ref.fuelType}</div>
                      </td>
                      <td className="py-3 text-right text-neutral-300 font-semibold">{ref.odometer} KM</td>
                      
                      {/* Km Rodados entre Abastecimentos */}
                      <td className="py-3 text-right text-cyan-400 font-bold">
                        {m && m.kmSinceLast > 0 ? `+${m.kmSinceLast} KM` : "Ref. Inicial"}
                      </td>

                      {/* Litros Gastos no Trecho */}
                      <td className="py-3 text-right text-amber-400 font-bold">
                        {m && m.spentLiters > 0 ? `${m.spentLiters.toFixed(1)} L` : "-"}
                      </td>

                      {/* Novo Aporte (Litros Abastecidos) */}
                      <td className="py-3 text-right text-emerald-400 font-bold">
                        +{ref.liters.toFixed(1)} L
                      </td>

                      {/* No Tanque Pós-Abastecimento */}
                      <td className="py-3 text-right font-black text-neutral-100">
                        {m ? `${m.tankAfter.toFixed(1)} L (${m.tankPctAfter}%)` : `${ref.liters.toFixed(1)} L`}
                      </td>

                      <td className="py-3 text-right text-neutral-200 font-black">{formatCurrency(ref.value)}</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleDelete(ref.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                          title="Excluir abastecimento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

