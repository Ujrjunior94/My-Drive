import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Navigation,
  DollarSign,
  Fuel,
  Gauge,
  Info,
  X,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  Wind,
  ShieldCheck,
  Calculator
} from "lucide-react";
import { UserSettings } from "../types";

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
}

export default function TripPlannerModal({ isOpen, onClose, settings }: TripPlannerModalProps) {
  const [distanceKm, setDistanceKm] = useState<number>(180);
  const [fuelPrice, setFuelPrice] = useState<number>(5.89);
  const [tollsCost, setTollsCost] = useState<number>(18.50);
  
  // Custom vehicle consumption km/l (defaults to calibrated settings or 12.1)
  const defaultKmL = settings.customKmL || (settings.fuelType?.toLowerCase().includes("etanol") ? 8.1 : 12.1);
  const [kmPerLiter, setKmPerLiter] = useState<number>(defaultKmL);
  const [cruisingSpeed, setCruisingSpeed] = useState<number>(80); // Target speed km/h

  // Calculations
  const totalLitersNeeded = kmPerLiter > 0 ? distanceKm / kmPerLiter : 0;
  
  // Speed Impact Multiplier on Fuel Consumption
  // Base at 75-80 km/h is 1.0 (100% efficiency)
  // At 100 km/h multiplier ~1.18, at 120 km/h multiplier ~1.38
  let speedMultiplier = 1.0;
  if (cruisingSpeed <= 80) {
    speedMultiplier = 1.0;
  } else if (cruisingSpeed <= 90) {
    speedMultiplier = 1.08;
  } else if (cruisingSpeed <= 100) {
    speedMultiplier = 1.18;
  } else if (cruisingSpeed <= 110) {
    speedMultiplier = 1.28;
  } else {
    speedMultiplier = 1.40;
  }

  const adjustedLitersNeeded = totalLitersNeeded * speedMultiplier;
  const fuelTotalCost = adjustedLitersNeeded * fuelPrice;
  const totalTripCost = fuelTotalCost + tollsCost;
  const costPerKm = distanceKm > 0 ? totalTripCost / distanceKm : 0;

  const tankCapacity = settings.tankCapacityLiters || 50;
  const numRefuelsNeeded = Math.ceil(adjustedLitersNeeded / tankCapacity) - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-100 rounded-xl bg-neutral-800/80 cursor-pointer transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-neutral-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Navigation className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-100 font-sans flex items-center gap-2">
                  <span>Calculadora de Viagem Programada</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded border border-emerald-500/30 font-bold">
                    ECO-DRIVE AI
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                  Simule quilometragem, custos e a velocidade ideal para a maior economia de combustível.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-5 font-sans">
              
              {/* Inputs Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
                {/* Distância da Viagem (KM) */}
                <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Distância (KM)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 px-3 text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Preço do Combustível (R$/L) */}
                <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Preço/Litro (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="20"
                    value={fuelPrice}
                    onChange={(e) => setFuelPrice(Math.max(0.1, Number(e.target.value)))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 px-3 text-sm font-bold text-emerald-400 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Média de Consumo (km/L) */}
                <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Média Veículo (km/L)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="30"
                    value={kmPerLiter}
                    onChange={(e) => setKmPerLiter(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 px-3 text-sm font-bold text-amber-400 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Gastos com Pedágio (R$) */}
                <div className="bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    Pedágios (R$)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    min="0"
                    max="1000"
                    value={tollsCost}
                    onChange={(e) => setTollsCost(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 px-3 text-sm font-bold text-neutral-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Seletor de Velocidade de Cruzeiro Mantida */}
              <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-cyan-400" />
                    Simular Velocidade de Cruzeiro Mantida na Rodovia
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    cruisingSpeed <= 85
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : cruisingSpeed <= 100
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}>
                    {cruisingSpeed} KM/H
                  </span>
                </div>

                <input
                  type="range"
                  min="60"
                  max="130"
                  step="5"
                  value={cruisingSpeed}
                  onChange={(e) => setCruisingSpeed(Number(e.target.value))}
                  className="w-full accent-cyan-400 bg-neutral-800 h-2 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-neutral-500 font-bold">
                  <span>60 km/h (Econômico)</span>
                  <span className="text-emerald-400">75-85 km/h (Zona de Ouro)</span>
                  <span>100 km/h (+18% consumo)</span>
                  <span className="text-red-400">120 km/h (+40% consumo)</span>
                </div>
              </div>

              {/* Resultado Resumo da Viagem */}
              <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-cyan-500/30 rounded-2xl p-4 shadow-xl space-y-3">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block font-mono">
                  Resumo Financeiro da Viagem
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block uppercase font-bold">Litros Estimados</span>
                    <span className="text-xl font-black text-cyan-400">{adjustedLitersNeeded.toFixed(1)} L</span>
                    <span className="text-[9px] text-neutral-500 block">{(adjustedLitersNeeded * speedMultiplier - adjustedLitersNeeded).toFixed(1)}L por velocidade</span>
                  </div>

                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block uppercase font-bold">Custo Combustível</span>
                    <span className="text-xl font-black text-emerald-400">R$ {fuelTotalCost.toFixed(2)}</span>
                    <span className="text-[9px] text-neutral-500 block">Preço R$ {fuelPrice.toFixed(2)}/L</span>
                  </div>

                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block uppercase font-bold">Custo Total (C/ Pedágio)</span>
                    <span className="text-xl font-black text-neutral-100">R$ {totalTripCost.toFixed(2)}</span>
                    <span className="text-[9px] text-neutral-500 block">R$ {tollsCost.toFixed(2)} pedágios</span>
                  </div>

                  <div className="bg-neutral-900/90 p-3 rounded-xl border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 block uppercase font-bold">Custo por KM</span>
                    <span className="text-xl font-black text-amber-400">R$ {costPerKm.toFixed(2)}</span>
                    <span className="text-[9px] text-neutral-500 block">{distanceKm} KM total</span>
                  </div>
                </div>

                {numRefuelsNeeded > 0 && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-mono flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Atenção: A distância exige <strong>{numRefuelsNeeded} parada(s) para reabastecimento</strong> com capacidade de {tankCapacity}L.</span>
                  </div>
                )}
              </div>

              {/* SEÇÃO TÉCNICA: QUAL O PADRÃO DE VELOCIDADE DEVE SE MANTER PARA MAIOR ECONOMIA */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Guia de Velocidade Ideal para Maior Economia</span>
                </div>

                <div className="space-y-2 text-xs text-neutral-300 leading-relaxed font-sans">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-200">
                    <p className="font-bold font-mono text-emerald-300 mb-1 text-xs">
                      🏆 Velocidade Padrão Recomendada: 70 km/h a 85 km/h em 5ª Marcha
                    </p>
                    <p className="text-[11px] text-neutral-300">
                      Para veículos 1.0/flex (como o Sandero), a zona de menor consumo ocorre ao manter a marcha mais alta em giro constante entre <strong>2.000 e 2.400 RPM</strong> (sem pisar fundo no acelerador).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                    <div className="bg-neutral-900 p-2.5 rounded-xl border border-emerald-500/30">
                      <span className="text-emerald-400 font-bold block mb-1">70 - 85 KM/H (Ideal)</span>
                      <p className="text-[10px] text-neutral-400">Resistência do ar mínima. Eficiência do motor ~100%. Maior rendimento de km/L.</p>
                    </div>

                    <div className="bg-neutral-900 p-2.5 rounded-xl border border-amber-500/30">
                      <span className="text-amber-400 font-bold block mb-1">90 - 100 KM/H</span>
                      <p className="text-[10px] text-neutral-400">O atrito aerodinâmico cresce ao quadrado. Aumento de ~15% a 20% no consumo.</p>
                    </div>

                    <div className="bg-neutral-900 p-2.5 rounded-xl border border-red-500/30">
                      <span className="text-red-400 font-bold block mb-1">110 - 120 KM/H</span>
                      <p className="text-[10px] text-neutral-400">Arrasto aerodinâmico severo. Consome até 40% a mais de combustível no trecho.</p>
                    </div>
                  </div>

                  <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1.5 text-[11px]">
                    <span className="font-bold text-cyan-400 font-mono block">💡 4 Dicas Práticas de Eco-Drive na Estrada:</span>
                    <ul className="list-disc list-inside space-y-1 text-neutral-400">
                      <li><strong>Janelas Fechadas acima de 70 km/h:</strong> Janelas abertas criam paraquedas de ar, aumentando o consumo em até 10%.</li>
                      <li><strong>Uso do Freio Motor em Descidas:</strong> Em descidas com a marcha engatada e o pé fora do acelerador, a injeção corta o combustível (Cut-off = 0.0 l/100km).</li>
                      <li><strong>Calibragem Correta dos Pneus:</strong> Pneus murchos aumentam o atrito com o asfalto e queimam até 5% a mais de combustível.</li>
                      <li><strong>Acelerações Suaves e Progressivas:</strong> Evite retomadas bruscas em subidas; ganhe embalo suave antes das aclives.</li>
                    </ul>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end font-sans">
              <button
                onClick={onClose}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold px-5 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Fechar Simulador
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
