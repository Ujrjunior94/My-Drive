import React, { useState } from "react";
import { Settings, Save, Sparkles, Fuel, Target, User, DollarSign, Smartphone, Car, Gauge, Wrench, Check, Zap } from "lucide-react";
import { UserSettings, VehicleSpecs } from "../types";
import { motion } from "motion/react";
import PWAInstallBanner from "./PWAInstallBanner";

export const RENAULT_SANDERO_2013_SPECS: VehicleSpecs = {
  modelName: "Renault Sandero 2013 1.0 Expression",
  engine: "1.0 16V Hi-Flex (D4D) - 4 Cilindros",
  powerHp: "77 cv (Etanol) / 76 cv (Gasolina) @ 5.850 rpm",
  torqueKgfm: "10,1 kgfm (Etanol) / 9,9 kgfm (Gasolina) @ 4.250 rpm",
  tankCapacityLiters: 50,
  trunkCapacityLiters: 320,
  factoryConsumptionEtanolUrban: 8.1,
  factoryConsumptionEtanolHighway: 9.2,
  factoryConsumptionGasolinaUrban: 12.1,
  factoryConsumptionGasolinaHighway: 13.0,
  recommendedTirePressure: "29 PSI dianteira / 29 PSI traseira (32 PSI com carga)",
  tireSize: "185/65 R15",
  topSpeedKmH: 161,
  accel0to100: 14.1
};

interface SettingsPanelProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export default function SettingsPanel({ settings, onSave }: SettingsPanelProps) {
  const [displayName, setDisplayName] = useState(settings.displayName || "Piloto Profissional");
  const [targetDailyProfit, setTargetDailyProfit] = useState(settings.targetDailyProfit || 250);
  const [fuelType, setFuelType] = useState(settings.fuelType || "Flex (Etanol/Gasolina)");
  const [currency, setCurrency] = useState(settings.currency || "BRL");
  const [tankCapacityLiters, setTankCapacityLiters] = useState(settings.tankCapacityLiters || 50);
  const [customKmL, setCustomKmL] = useState<number>(settings.customKmL || 12.1);
  const [routeType, setRouteType] = useState<"urban" | "highway" | "mixed">(settings.routeType || "mixed");
  const [vehicleSpecs, setVehicleSpecs] = useState<VehicleSpecs | undefined>(
    settings.vehicleSpecs || RENAULT_SANDERO_2013_SPECS
  );
  const [saved, setSaved] = useState(false);

  const calculatedAutonomyKm = (Number(tankCapacityLiters) || 50) * (Number(customKmL) || 12.1);

  const handleApplySanderoPreset = () => {
    setTankCapacityLiters(50);
    setFuelType("Flex (Etanol/Gasolina)");
    setCustomKmL(12.1);
    setRouteType("mixed");
    setVehicleSpecs(RENAULT_SANDERO_2013_SPECS);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);

    onSave({
      displayName,
      targetDailyProfit: Number(targetDailyProfit),
      fuelType,
      currency,
      tankCapacityLiters: Number(tankCapacityLiters) || 50,
      customKmL: Number(customKmL) || 12.1,
      routeType,
      vehicleSpecs
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div id="settings-panel-container" className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-emerald-500" />

      <div className="mb-6">
        <h2 className="text-lg font-bold text-neutral-100 flex items-center gap-2 font-sans">
          <Settings className="w-5 h-5 text-cyan-400" />
          Configurações de Telemetria
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Ajuste as metas de faturamento, tipo de combustível e apelido do painel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Nome do Piloto
            </label>
            <input
              id="settings-display-name"
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-4 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-sans"
              placeholder="Ex: Carlos Silva"
            />
          </div>

          {/* Daily Profit Target */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              Meta de Lucro Diário (Líquido)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-neutral-500 font-mono">R$</span>
              <input
                id="settings-target-profit"
                type="number"
                required
                min="1"
                value={targetDailyProfit}
                onChange={(e) => setTargetDailyProfit(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-9 pr-4 text-sm font-mono text-neutral-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
              />
            </div>
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Dias com lucro acima deste valor serão marcados em **Verde** no calendário de bordo.
            </span>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-cyan-400" />
              Combustível Principal do Veículo
            </label>
            <select
              id="settings-fuel-type"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-4 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-sans cursor-pointer"
            >
              <option value="Flex (Etanol/Gasolina)">Flex (Etanol/Gasolina)</option>
              <option value="Gasolina Comum / Aditivada">Gasolina Comum / Aditivada</option>
              <option value="Etanol Comum">Etanol Comum</option>
              <option value="GNV (Gás Natural Veicular)">GNV (Gás Natural Veicular)</option>
              <option value="Diesel S10 / Aditivado">Diesel S10 / Aditivado</option>
              <option value="Elétrico / Híbrido">Elétrico / Híbrido</option>
            </select>
          </div>

          {/* Tank Capacity in Liters */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              Capacidade do Tanque (em Litros)
            </label>
            <div className="relative">
              <input
                id="settings-tank-capacity"
                type="number"
                required
                min="5"
                max="300"
                value={tankCapacityLiters}
                onChange={(e) => setTankCapacityLiters(Number(e.target.value))}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-4 pr-12 text-sm font-mono text-neutral-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20"
                placeholder="Ex: 50"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-mono font-bold text-neutral-500">
                Litros
              </span>
            </div>
            <span className="text-[10px] text-neutral-500 mt-1 block">
              Usado para os cálculos de autonomia, volume de abastecimento e telemetria de consumo.
            </span>
          </div>

          {/* Currency format */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              Moeda de Exibição
            </label>
            <select
              id="settings-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-4 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 font-sans cursor-pointer"
            >
              <option value="BRL">Real Brasileiro (BRL)</option>
              <option value="USD">Dólar Americano (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>

        </div>

        {/* SEÇÃO DE CALIBRAGEM DA AUTONOMIA DO COMPUTADOR DE BORDO */}
        <div className="mt-6 pt-5 border-t border-neutral-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Calibragem da Autonomia do Computador de Bordo
              </h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Ajuste o consumo médio de combustível (km/l) para calcular com precisão a autonomia de tanque cheio e de bordo.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-[10px] font-mono font-bold text-cyan-300">
              ~{calculatedAutonomyKm.toFixed(0)} KM Tanque Cheio
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Consumo Médio (km/L) */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-emerald-400" />
                Consumo Médio Calibrado (km/L)
              </label>
              <div className="relative">
                <input
                  id="settings-custom-km-l"
                  type="number"
                  required
                  step="0.1"
                  min="1"
                  max="40"
                  value={customKmL}
                  onChange={(e) => setCustomKmL(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 pl-4 pr-14 text-sm font-mono text-neutral-100 font-bold focus:outline-none focus:border-cyan-500/50"
                  placeholder="Ex: 12.1"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-mono text-neutral-400 font-bold">
                  km/l
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 mt-1 block font-mono">
                Base para projeção da autonomia em tempo real.
              </span>
            </div>

            {/* Perfil de Percurso Predominante */}
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-amber-400" />
                Percurso Predominante
              </label>
              <select
                id="settings-route-type"
                value={routeType}
                onChange={(e) => setRouteType(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-2.5 px-4 text-sm text-neutral-200 focus:outline-none focus:border-cyan-500/50 font-sans cursor-pointer"
              >
                <option value="urban">Urbano (Cidade / Semáforos)</option>
                <option value="highway">Rodoviário (Estrada / Pista)</option>
                <option value="mixed">Misto (Cidade + Estrada)</option>
              </select>
              <span className="text-[10px] text-neutral-500 mt-1 block font-mono">
                Influencia o cálculo de desgaste e autonomia no trânsito.
              </span>
            </div>

            {/* Total Autonomia Projetada Card */}
            <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono font-bold">
                Autonomia Total Projetada (Tanque {tankCapacityLiters}L)
              </span>
              <div className="my-1 font-mono">
                <span className="text-2xl font-black text-emerald-400">
                  {calculatedAutonomyKm.toFixed(0)}
                </span>
                <span className="text-xs text-neutral-400 ml-1 font-bold">KM</span>
              </div>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (calculatedAutonomyKm / 700) * 100)}%` }}
                />
              </div>
            </div>

          </div>

          {/* Calibragem Rápida - Presets Ficha Sandero 2013 1.0 */}
          <div className="pt-2">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono font-bold block mb-2">
              Ajuste Rápido de Consumo / Autonomia (Renault Sandero 2013 1.0)
            </span>
            <div className="flex flex-wrap gap-2 font-mono">
              <button
                type="button"
                onClick={() => { setCustomKmL(12.1); setRouteType("urban"); }}
                className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/40 rounded-lg text-xs text-emerald-400 font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Gasolina Urbana:</span>
                <span className="text-neutral-100">12,1 km/l (~605 km)</span>
              </button>

              <button
                type="button"
                onClick={() => { setCustomKmL(13.0); setRouteType("highway"); }}
                className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-500/40 rounded-lg text-xs text-cyan-400 font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Gasolina Rodovia:</span>
                <span className="text-neutral-100">13,0 km/l (~650 km)</span>
              </button>

              <button
                type="button"
                onClick={() => { setCustomKmL(8.1); setRouteType("urban"); }}
                className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-500/40 rounded-lg text-xs text-amber-400 font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Etanol Urbano:</span>
                <span className="text-neutral-100">8,1 km/l (~405 km)</span>
              </button>

              <button
                type="button"
                onClick={() => { setCustomKmL(9.2); setRouteType("highway"); }}
                className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-amber-300/40 rounded-lg text-xs text-amber-300 font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Etanol Rodovia:</span>
                <span className="text-neutral-100">9,2 km/l (~460 km)</span>
              </button>

              <button
                type="button"
                onClick={() => { setCustomKmL(10.5); setRouteType("mixed"); }}
                className="px-2.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-blue-500/40 rounded-lg text-xs text-blue-400 font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Misto Real Aplicativo:</span>
                <span className="text-neutral-100">10,5 km/l (~525 km)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800/60">
          <div>
            {saved && (
              <motion.span 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-mono text-emerald-400 font-bold"
              >
                ✓ Configurações gravadas com sucesso!
              </motion.span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleApplySanderoPreset}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition-all cursor-pointer"
              title="Carrega 50L de Tanque e Ficha Técnica de Fábrica do Sandero 2013 1.0 Expression"
            >
              <Car className="w-4 h-4" />
              <span>Ativar Preset Sandero 2013 1.0</span>
            </button>

            <button
              type="submit"
              id="settings-save-btn"
              className="flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-neutral-900 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/10 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Preferências</span>
            </button>
          </div>
        </div>

      </form>

      {/* FICHA TÉCNICA DE FÁBRICA DO VEÍCULO (RENAULT SANDERO 2013 1.0 EXPRESSION) */}
      <div className="mt-8 pt-6 border-t border-neutral-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-400" />
              Ficha Técnica de Fábrica (Renault Sandero 2013 1.0 Expression)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5 font-sans">
              Dados oficiais homologados pela montadora para calibração de consumo, autonomia e manutenção de bordo.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/25 rounded-lg text-[10px] font-mono font-bold text-amber-300">
            Hi-Flex 1.0 16V
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          
          {/* Motor & Potência */}
          <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-bold">Motorização</span>
            <p className="text-neutral-100 font-bold text-sm">1.0 16V Hi-Flex (D4D)</p>
            <p className="text-[11px] text-amber-400">77 cv (Etanol) / 76 cv (Gasolina)</p>
            <p className="text-[10px] text-neutral-400">Torque: 10,1 kgfm @ 4.250 rpm</p>
          </div>

          {/* Tanque e Capacidade */}
          <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-bold">Tanque & Porta-malas</span>
            <p className="text-neutral-100 font-bold text-sm">50 Litros (Tanque)</p>
            <p className="text-[11px] text-cyan-400">Porta-malas: 320 Litros</p>
            <p className="text-[10px] text-neutral-400">Partida a Frio: Reservatório 0.8L</p>
          </div>

          {/* Consumo Oficial Inmetro/Fábrica */}
          <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-bold">Consumo de Fábrica</span>
            <p className="text-emerald-400 font-bold text-xs">Gasolina: 12,1 km/l (Urb) | 13,0 km/l (Rod)</p>
            <p className="text-amber-400 font-bold text-xs">Etanol: 8,1 km/l (Urb) | 9,2 km/l (Rod)</p>
            <p className="text-[10px] text-neutral-400">Autonomia Gasolina Urb: ~605 km</p>
          </div>

          {/* Pneus e Calibragem */}
          <div className="bg-neutral-950/80 border border-neutral-800 p-3.5 rounded-xl space-y-1">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-bold">Pneus e Pressão</span>
            <p className="text-neutral-100 font-bold text-sm">185/65 R15</p>
            <p className="text-[11px] text-cyan-400">Dianteira: 29 PSI | Traseira: 29 PSI</p>
            <p className="text-[10px] text-neutral-400">Carga Máxima/Rodovia: 32 PSI</p>
          </div>

        </div>
      </div>

      {/* INSTALAÇÃO PWA / MODO WEB */}
      <div className="mt-8 pt-6 border-t border-neutral-800/80">
        <PWAInstallBanner />
      </div>

      {/* GUIA DE IDENTIDADE VISUAL & DESIGN SYSTEM MOCKUPS */}
      <div className="mt-8 pt-8 border-t border-neutral-800/80">
        <div className="mb-6">
          <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            GUIA DE IDENTIDADE VISUAL & DESIGN SYSTEM PREMIUM
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Explore a especificação de design, mockups de interface e padrões de componentes integrados no painel de bordo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Typography & Palette */}
          <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">01. Cores & Tipografia</span>
            
            <div className="space-y-2.5">
              <span className="text-xs text-neutral-300 font-medium block">Paleta de Bordo Cockpit</span>
              <div className="grid grid-cols-4 gap-1.5">
                <div className="h-10 bg-neutral-950 rounded-lg border border-neutral-800 flex flex-col justify-end p-1">
                  <span className="text-[8px] font-mono text-neutral-400">Deep Black</span>
                </div>
                <div className="h-10 bg-neutral-900 rounded-lg border border-neutral-800 flex flex-col justify-end p-1">
                  <span className="text-[8px] font-mono text-neutral-400">Pure Grey</span>
                </div>
                <div className="h-10 bg-blue-600 rounded-lg flex flex-col justify-end p-1">
                  <span className="text-[8px] font-mono text-neutral-100">Electric Blue</span>
                </div>
                <div className="h-10 bg-emerald-500 rounded-lg flex flex-col justify-end p-1">
                  <span className="text-[8px] font-mono text-neutral-900 font-black">Emerald</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs text-neutral-300 font-medium block">Tipografia de Alta Performance</span>
              <div className="p-3 bg-neutral-900/60 border border-neutral-800/40 rounded-xl space-y-1">
                <p className="text-xs font-sans font-black tracking-tight text-neutral-100">Inter - Display Title Pairings</p>
                <p className="text-[10px] font-mono text-neutral-400">JetBrains Mono - Real-time telemetry & numbers</p>
              </div>
            </div>
          </div>

          {/* Core UI Components Mockup */}
          <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">02. Componentes de Interface</span>
            
            <div className="space-y-2.5">
              <span className="text-xs text-neutral-300 font-medium block">Botões Premium e Estados</span>
              <div className="flex flex-wrap gap-2">
                <button className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-[10px] rounded-lg shadow-md shadow-blue-500/10">
                  Principal
                </button>
                <button className="px-3.5 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-[10px] rounded-lg">
                  Secundário
                </button>
                <button className="px-3 py-1.5 bg-red-950/40 border border-red-500/20 text-red-400 text-[10px] rounded-lg">
                  Perigo
                </button>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <span className="text-xs text-neutral-300 font-medium block">Chips de Telemetria e Badges</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[9px] font-mono rounded font-bold uppercase">UBER CONNECT</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[9px] font-mono rounded font-bold uppercase">STATUS: EM JORNADA</span>
                <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/25 text-yellow-400 text-[9px] font-mono rounded font-bold uppercase">META DIÁRIA</span>
              </div>
            </div>
          </div>

          {/* Architecture specifications */}
          <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
            <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-widest block">03. Filosofia de UX do Cockpit</span>
            
            <p className="text-[11px] text-neutral-400 leading-relaxed font-sans">
              O design foi elaborado simulando o painel dinâmico de veículos de alta tecnologia. O uso de layouts de coluna otimizados para toque, grades de telemetria claras e fontes mono-espaçadas garante fácil leitura durante as horas de voo no trânsito.
            </p>

            <div className="p-3 bg-blue-950/20 border border-blue-900/30 rounded-xl">
              <span className="text-[10px] font-bold text-blue-400 block mb-0.5 uppercase">Acessibilidade de Contraste</span>
              <p className="text-[9px] text-neutral-400 font-mono">Contraste de nível triplo AAA para leitura perfeita sob forte luz solar ou penumbra noturna.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
