import React from "react";
import { motion } from "motion/react";
import { Fuel, AlertTriangle, CheckCircle2, Zap, ArrowUpRight, Droplets } from "lucide-react";

interface FuelGaugeAnimationProps {
  currentLiters: number;
  tankCapacity: number;
  estimatedAutonomyKm: number;
  missingLitersToFill: number;
  fuelType?: string;
}

export default function FuelGaugeAnimation({
  currentLiters,
  tankCapacity,
  estimatedAutonomyKm,
  missingLitersToFill,
  fuelType = "Flex (Etanol/Gasolina)"
}: FuelGaugeAnimationProps) {
  const fillPercentage = Math.min(100, Math.max(0, (currentLiters / tankCapacity) * 100));

  let statusColor = "from-emerald-500 to-cyan-400";
  let statusBadgeBg = "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  let statusText = "Nível Ideal para Rodagem";
  let statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-400" />;

  if (fillPercentage < 20) {
    statusColor = "from-red-600 to-amber-500";
    statusBadgeBg = "bg-red-500/20 text-red-300 border-red-500/40";
    statusText = "Atenção: Entrando na Reserva";
    statusIcon = <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />;
  } else if (fillPercentage < 40) {
    statusColor = "from-amber-500 to-yellow-400";
    statusBadgeBg = "bg-amber-500/20 text-amber-300 border-amber-500/40";
    statusText = "Recomendável Reabastecer em Breve";
    statusIcon = <Zap className="w-4 h-4 text-amber-400" />;
  } else if (fillPercentage >= 85) {
    statusColor = "from-cyan-400 to-emerald-400";
    statusBadgeBg = "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    statusText = "Tanque Praticamente Cheio";
    statusIcon = <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
  }

  return (
    <div className="bg-neutral-950 border border-neutral-800/90 rounded-2xl p-4 md:p-5 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Animated Fuel Tank Container Visualizer */}
        <div className="relative w-36 h-48 bg-neutral-900 border-2 border-neutral-800 rounded-2xl p-2 flex flex-col justify-end shadow-inner overflow-hidden shrink-0">
          
          {/* Grid background markers inside tank */}
          <div className="absolute inset-x-2 top-2 bottom-2 flex flex-col justify-between pointer-events-none opacity-30 z-10 font-mono text-[9px] text-neutral-400">
            <div className="flex justify-between items-center border-b border-neutral-700/50 pb-0.5">
              <span>F</span>
              <span>{tankCapacity}L</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-700/50 pb-0.5">
              <span>3/4</span>
              <span>{(tankCapacity * 0.75).toFixed(0)}L</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-700/50 pb-0.5">
              <span>1/2</span>
              <span>{(tankCapacity * 0.5).toFixed(0)}L</span>
            </div>
            <div className="flex justify-between items-center border-b border-neutral-700/50 pb-0.5">
              <span>1/4</span>
              <span>{(tankCapacity * 0.25).toFixed(0)}L</span>
            </div>
            <div className="flex justify-between items-center text-red-400">
              <span>E</span>
              <span>0L</span>
            </div>
          </div>

          {/* Liquid animated height motion */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${fillPercentage}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={`w-full bg-gradient-to-t ${statusColor} rounded-xl relative shadow-lg overflow-hidden`}
          >
            {/* Animated Liquid Wave Effect */}
            <motion.div
              animate={{
                x: [-20, 0, -20],
                y: [0, -3, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-3 left-0 right-0 h-6 bg-white/20 blur-[2px] rounded-full opacity-60"
            />
            {/* Gloss shine */}
            <div className="absolute top-0 inset-x-0 h-1 bg-white/40" />
          </motion.div>

          {/* Center Overlay Badge inside Tank Visual */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none drop-shadow-md">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-black font-mono text-white tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            >
              {fillPercentage.toFixed(0)}%
            </motion.span>
            <span className="text-[10px] font-mono font-bold text-neutral-200 uppercase bg-neutral-950/70 backdrop-blur-xs px-2 py-0.5 rounded border border-white/10">
              {currentLiters.toFixed(1)} / {tankCapacity}L
            </span>
          </div>
        </div>

        {/* Detailed Animated Fuel Telemetry Metrics */}
        <div className="flex-1 space-y-3.5 w-full">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800/80 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg">
                <Fuel className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold font-mono text-neutral-100 tracking-wider uppercase block">
                  Estimativa de Bordo no Tanque
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {fuelType}
                </span>
              </div>
            </div>

            <div className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${statusBadgeBg}`}>
              {statusIcon}
              <span>{statusText}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            
            {/* Litros Estimados */}
            <div className="bg-neutral-900/90 border border-neutral-800/80 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-bold flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" />
                No Tanque Agora
              </span>
              <motion.div
                key={currentLiters}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-black text-cyan-400"
              >
                {currentLiters.toFixed(1)} <span className="text-xs text-neutral-400 font-normal">Litros</span>
              </motion.div>
              <span className="text-[9px] text-neutral-500 block">
                {(tankCapacity - currentLiters).toFixed(1)}L consumidos
              </span>
            </div>

            {/* Autonomia Estimada */}
            <div className="bg-neutral-900/90 border border-neutral-800/80 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-bold flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                Autonomia Estimada
              </span>
              <motion.div
                key={estimatedAutonomyKm}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-black text-emerald-400"
              >
                ~{estimatedAutonomyKm.toFixed(0)} <span className="text-xs text-neutral-400 font-normal">KM</span>
              </motion.div>
              <span className="text-[9px] text-neutral-500 block">
                Sem necessidade de parar
              </span>
            </div>

            {/* Para Completar Tanque */}
            <div className="bg-neutral-900/90 border border-neutral-800/80 p-3 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-bold flex items-center gap-1">
                <Fuel className="w-3 h-3 text-amber-400" />
                Para Encher
              </span>
              <motion.div
                key={missingLitersToFill}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-black text-amber-400"
              >
                {missingLitersToFill.toFixed(1)} <span className="text-xs text-neutral-400 font-normal">Litros</span>
              </motion.div>
              <span className="text-[9px] text-neutral-500 block">
                Capacidade: {tankCapacity}L
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
