import React, { useState, useEffect } from "react";
import { Maintenance, UserSettings } from "../types";
import { dbService } from "../lib/dbService";
import { Plus, Trash2, Wrench, Calendar, Settings, AlertTriangle, AlertCircle, Check, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Sandero3DRotation from "./Sandero3DRotation";

const Skeleton = ({ className = "h-4 w-full" }: { className?: string }) => (
  <motion.div
    className={`bg-neutral-800/70 rounded-md ${className}`}
    animate={{ opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  />
);

interface MaintenancesViewProps {
  userId: string;
  isDemo: boolean;
  settings: UserSettings;
  currentOdometer: number;
}

export default function MaintenancesView({ userId, isDemo, settings, currentOdometer }: MaintenancesViewProps) {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form Fields
  const [date, setDate] = useState<string>("");
  const [type, setType] = useState<string>("Troca de Óleo e Filtro");
  const [odometer, setOdometer] = useState<string>("");
  const [cost, setCost] = useState<string>("");
  const [nextOdometerCheck, setNextOdometerCheck] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const loadMaintenances = async () => {
    setLoading(true);
    try {
      const list = await dbService.getMaintenances(userId, isDemo);
      setMaintenances(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaintenances();
    
    const today = new Date();
    const padMonth = String(today.getMonth() + 1).padStart(2, "0");
    const padDay = String(today.getDate()).padStart(2, "0");
    setDate(`${today.getFullYear()}-${padMonth}-${padDay}`);
  }, [userId, isDemo]);

  // Suggest next odometer check when current service odometer changes
  useEffect(() => {
    const odoNum = parseInt(odometer);
    if (odoNum > 0) {
      if (type.includes("Óleo")) {
        setNextOdometerCheck((odoNum + 10000).toString());
      } else if (type.includes("Alinhamento")) {
        setNextOdometerCheck((odoNum + 10000).toString());
      } else if (type.includes("Pneu")) {
        setNextOdometerCheck((odoNum + 40000).toString());
      } else if (type.includes("Freio")) {
        setNextOdometerCheck((odoNum + 20000).toString());
      } else {
        setNextOdometerCheck((odoNum + 10000).toString());
      }
    }
  }, [odometer, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !type || !odometer || !cost) {
      alert("Preencha todos os campos obrigatórios (Data, Tipo, Odômetro e Custo).");
      return;
    }

    const newMaint: Maintenance = {
      id: "maint_" + Date.now(),
      userId,
      date,
      type,
      odometer: parseInt(odometer),
      cost: parseFloat(cost),
      nextOdometerCheck: parseInt(nextOdometerCheck) || (parseInt(odometer) + 10000),
      notes: notes || "Nenhuma observação."
    };

    try {
      await dbService.saveMaintenance(userId, newMaint, isDemo);
      await loadMaintenances();
      
      // Reset form
      setOdometer("");
      setCost("");
      setNextOdometerCheck("");
      setNotes("");
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar manutenção.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Confirmar a exclusão deste registro de manutenção?")) {
      try {
        await dbService.deleteMaintenance(userId, id, isDemo);
        await loadMaintenances();
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

  // Determine critical alerts (maintenances that are close or overdue)
  const activeAlerts = maintenances.filter(m => {
    if (!m.nextOdometerCheck || !currentOdometer) return false;
    // Overdue or within 1500 km
    return currentOdometer >= (m.nextOdometerCheck - 1500);
  });

  const totalMaintenanceCost = maintenances.reduce((sum, m) => sum + m.cost, 0);

  return (
    <div className="space-y-6">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6">
        <div>
          <h2 className="text-lg font-black font-mono tracking-wider text-cyan-400 flex items-center gap-2 uppercase">
            <Wrench className="w-5 h-5 text-yellow-500 animate-bounce" /> Central de Manutenções & Revisões
          </h2>
          <p className="text-xs text-neutral-400 mt-1 font-sans">
            Acompanhe a integridade física do seu instrumento de trabalho e previna quebras inesperadas com alertas automáticos.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-neutral-900 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/10 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Fechar Painel" : "Registrar Serviço"}</span>
        </button>
      </div>

      {/* ANIMAÇÃO 3D RENAULT SANDERO PRATA GIRANDO */}
      <Sandero3DRotation odometer={currentOdometer} />

      {/* Dynamic Alerts HUD */}
      {activeAlerts.length > 0 ? (
        <div className="bg-red-950/20 border border-red-500/35 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-mono font-black text-red-400 uppercase tracking-wider">Alertas de Manutenção Críticos</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 font-sans">
                Seu odômetro atual ({currentOdometer} KM) excedeu ou está próximo do vencimento de {activeAlerts.length} serviço(s).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeAlerts.map(a => (
              <span key={a.id} className="px-2.5 py-1 bg-red-950/50 border border-red-500/30 rounded text-[9px] font-mono text-red-400 font-bold uppercase">
                {a.type}: vencer em {a.nextOdometerCheck} KM
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Voo Saudável — Sistemas Estáveis</h4>
            <p className="text-[11px] text-neutral-400 mt-0.5 font-sans">
              Nenhuma revisão ou vencimento pendente no momento para o odômetro de {currentOdometer} KM.
            </p>
          </div>
        </div>
      )}

      {/* Add Form */}
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
                Lançar Nova Ordem de Serviço
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Date */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Data da Manutenção
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Service Type */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Tipo de Serviço
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  >
                    <option value="Troca de Óleo e Filtro">Troca de Óleo e Filtro</option>
                    <option value="Alinhamento e Balanceamento">Alinhamento e Balanceamento</option>
                    <option value="Pastilhas de Freio">Pastilhas de Freio</option>
                    <option value="Substituição de Pneus">Substituição de Pneus</option>
                    <option value="Correia Dentada">Correia Dentada</option>
                    <option value="Revisão Preventiva Geral">Revisão Preventiva Geral</option>
                    <option value="Reparo Elétrico">Reparo Elétrico</option>
                  </select>
                </div>

                {/* Service Odometer */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Odômetro Atual (KM)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 122500"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Custo do Serviço ({settings.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 150.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Next Odometer Check */}
                <div>
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Próxima Troca/Aviso (KM)
                  </label>
                  <input
                    type="number"
                    placeholder="Sugerido automaticamente"
                    value={nextOdometerCheck}
                    onChange={(e) => setNextOdometerCheck(e.target.value)}
                    required
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-3">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Observações de Bordo / Detalhes das Peças
                  </label>
                  <textarea
                    placeholder="Ex: Filtro de ar também substituído, velas em bom estado."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-cyan-500 text-neutral-100 rounded-xl px-4 py-2.5 text-xs font-sans focus:outline-none resize-none"
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
                  <span>Salvar Manutenção</span>
                </button>
              </div>

            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics & Overall Spend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Cost */}
        <div className="bg-neutral-900 border border-neutral-800/70 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl text-blue-400">
            <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Gasto Total em Oficina</span>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-lg font-black font-mono text-neutral-100">{formatCurrency(totalMaintenanceCost)}</span>
            )}
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mt-0.5">Investimento de Conservação</span>
          </div>
        </div>

        {/* Total Services */}
        <div className="bg-neutral-900 border border-neutral-800/70 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-yellow-950/30 border border-yellow-500/20 rounded-xl text-yellow-500">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Total de Intervenções</span>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-lg font-black font-mono text-neutral-100">{maintenances.length} Serviços</span>
            )}
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mt-0.5">Checkups Registrados</span>
          </div>
        </div>

        {/* Current Vehicle Odometor HUD */}
        <div className="bg-neutral-900 border border-neutral-800/70 rounded-2xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-emerald-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">Odômetro do Cockpit</span>
            {loading ? (
              <Skeleton className="h-6 w-24 mt-1" />
            ) : (
              <span className="text-lg font-black font-mono text-emerald-400">{currentOdometer} KM</span>
            )}
            <span className="text-[9px] text-neutral-500 font-mono block uppercase mt-0.5">Medidor Digital Integrado</span>
          </div>
        </div>

      </div>

      {/* History Grid */}
      <div className="bg-neutral-900 border border-neutral-800/80 rounded-2xl p-6">
        <h3 className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-widest mb-4">
          Histórico de Serviços Preventivos
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 w-2/3">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-4 w-full mt-1.5" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl" />
                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/40">
                  <div className="space-y-1 w-1/3">
                    <Skeleton className="h-2 w-10" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="space-y-1 w-1/3">
                    <Skeleton className="h-2 w-12 ml-auto" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : maintenances.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
            Nenhum registro de oficina efetuado até agora. Registrar serviço.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenances.map((m) => {
              const isClose = m.nextOdometerCheck && currentOdometer >= (m.nextOdometerCheck - 1500);
              return (
                <div key={m.id} className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden">
                  {/* Warning strip decoration */}
                  {isClose && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-red-500 animate-pulse" />
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-neutral-500 uppercase flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {m.date.split("-").reverse().join("/")}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-100 mt-1 font-sans">{m.type}</h4>
                    </div>

                    <span className="text-sm font-black font-mono text-neutral-100">
                      {formatCurrency(m.cost)}
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800/40 text-[11px] text-neutral-400 font-sans leading-relaxed">
                    {m.notes}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-neutral-800/40">
                    <div className="text-[10px] font-mono">
                      <span className="text-neutral-500 uppercase block text-[8px]">Efetuado em</span>
                      <span className="text-neutral-300 font-bold">{m.odometer} KM</span>
                    </div>

                    <div className="text-[10px] font-mono text-right">
                      <span className="text-neutral-500 uppercase block text-[8px]">Próxima Revisão</span>
                      <span className={`font-bold ${isClose ? "text-red-400 animate-pulse" : "text-neutral-300"}`}>
                        {m.nextOdometerCheck} KM
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer self-end"
                      title="Excluir serviço"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
