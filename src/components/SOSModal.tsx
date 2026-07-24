import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Phone,
  MapPin,
  Copy,
  Check,
  Share2,
  RefreshCw,
  X,
  ExternalLink,
  AlertTriangle,
  Siren,
  LifeBuoy
} from "lucide-react";

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GeoLocationData {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  timestamp: string | null;
  error: string | null;
  loading: boolean;
}

export default function SOSModal({ isOpen, onClose }: SOSModalProps) {
  const [geo, setGeo] = useState<GeoLocationData>({
    latitude: null,
    longitude: null,
    accuracy: null,
    altitude: null,
    speed: null,
    timestamp: null,
    error: null,
    loading: false
  });

  const [copied, setCopied] = useState<boolean>(false);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setGeo(prev => ({
        ...prev,
        error: "Geolocalização não é suportada por este navegador/dispositivo.",
        loading: false
      }));
      return;
    }

    setGeo(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy, altitude, speed } = position.coords;
        setGeo({
          latitude,
          longitude,
          accuracy,
          altitude,
          speed,
          timestamp: new Date().toLocaleTimeString("pt-BR"),
          error: null,
          loading: false
        });
      },
      (err) => {
        let msg = "Não foi possível obter a localização geográfica.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Permissão de localização foi negada no navegador.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "Sinal de GPS/Localização indisponível no momento.";
        } else if (err.code === err.TIMEOUT) {
          msg = "Tempo limite excedido ao buscar GPS.";
        }
        setGeo(prev => ({ ...prev, error: msg, loading: false }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    if (isOpen) {
      fetchLocation();
    }
  }, [isOpen]);

  const mapsUrl = geo.latitude && geo.longitude
    ? `https://www.google.com/maps?q=${geo.latitude},${geo.longitude}`
    : "";

  const handleCopyLocation = () => {
    if (!geo.latitude || !geo.longitude) return;
    const text = `Minha Localização de Emergência (DrivePilot AI): Lat ${geo.latitude.toFixed(6)}, Lng ${geo.longitude.toFixed(6)} - ${mapsUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!geo.latitude || !geo.longitude) return;
    const message = encodeURIComponent(
      `🚨 *SINAL DE EMERGÊNCIA / SOCORRO - DRIVEPILOT AI*\n\nPreciso de suporte/assistência no meu trajeto!\n\n📍 *Localização GPS:* ${mapsUrl}\n📌 Lat: ${geo.latitude.toFixed(6)} | Lng: ${geo.longitude.toFixed(6)}\n🕒 Horário: ${geo.timestamp || "Agora"}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-neutral-900 border-2 border-red-500/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header Alert Ambient */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-100 rounded-xl bg-neutral-800/80 cursor-pointer transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title Section */}
            <div className="flex items-center gap-3.5 mb-4 pb-3 border-b border-neutral-800">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0 animate-pulse">
                <Siren className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                  <span>Sinal SOS & Emergência</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] font-mono rounded border border-red-500/30 font-bold">
                    URGENTE
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                  Atalhos imediatos de socorro e telemetria de posição GPS.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-mono">
              
              {/* Geolocation Telemetry Card */}
              <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    Log de Localização GPS Atual
                  </span>

                  <button
                    onClick={fetchLocation}
                    disabled={geo.loading}
                    className="p-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-all border border-neutral-800"
                    title="Atualizar GPS"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${geo.loading ? "animate-spin text-cyan-400" : ""}`} />
                    <span className="text-[10px]">Atualizar</span>
                  </button>
                </div>

                {geo.loading ? (
                  <div className="py-4 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-xs text-neutral-400 font-sans">Obtendo coordenadas do satélite...</p>
                  </div>
                ) : geo.error ? (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{geo.error}</span>
                  </div>
                ) : geo.latitude && geo.longitude ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800/80">
                        <span className="text-[10px] text-neutral-500 block">LATITUDE</span>
                        <span className="text-neutral-100 font-bold font-mono">{geo.latitude.toFixed(6)}</span>
                      </div>
                      <div className="bg-neutral-900/90 p-2.5 rounded-xl border border-neutral-800/80">
                        <span className="text-[10px] text-neutral-500 block">LONGITUDE</span>
                        <span className="text-neutral-100 font-bold font-mono">{geo.longitude.toFixed(6)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-400">
                      <div className="bg-neutral-900/50 p-2 rounded-lg border border-neutral-800/50">
                        <span className="text-[9px] text-neutral-500 block">PRECISÃO</span>
                        <span>{geo.accuracy ? `±${geo.accuracy.toFixed(0)}m` : "N/I"}</span>
                      </div>
                      <div className="bg-neutral-900/50 p-2 rounded-lg border border-neutral-800/50">
                        <span className="text-[9px] text-neutral-500 block">VELOCIDADE</span>
                        <span>{geo.speed ? `${(geo.speed * 3.6).toFixed(0)} km/h` : "0 km/h"}</span>
                      </div>
                      <div className="bg-neutral-900/50 p-2 rounded-lg border border-neutral-800/50">
                        <span className="text-[9px] text-neutral-500 block">HORÁRIO</span>
                        <span>{geo.timestamp || "-"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleCopyLocation}
                        className="flex-1 py-2 px-3 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-bold rounded-xl border border-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Copiar Posição</span>
                          </>
                        )}
                      </button>

                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Mapa</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500">Clique em 'Atualizar' para capturar posição GPS.</p>
                )}
              </div>

              {/* Botão de Envio de Alerta via WhatsApp */}
              {geo.latitude && geo.longitude && (
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 text-xs font-sans cursor-pointer uppercase tracking-wider"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Enviar Localização de Socorro pelo WhatsApp</span>
                </button>
              )}

              {/* Contatos de Emergência Diretos */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block font-mono">
                  Atalhos de Ligação de Emergência
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:190"
                    className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-red-500/30 rounded-2xl flex items-center gap-3 cursor-pointer transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 font-bold">
                      190
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-100 block font-sans">Polícia Militar</span>
                      <span className="text-[10px] text-neutral-400">Ocorrências / Perigo</span>
                    </div>
                  </a>

                  <a
                    href="tel:192"
                    className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-red-500/30 rounded-2xl flex items-center gap-3 cursor-pointer transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 font-bold">
                      192
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-100 block font-sans">SAMU</span>
                      <span className="text-[10px] text-neutral-400">Resgate Médico</span>
                    </div>
                  </a>

                  <a
                    href="tel:193"
                    className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-amber-500/30 rounded-2xl flex items-center gap-3 cursor-pointer transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-bold">
                      193
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-100 block font-sans">Bombeiros</span>
                      <span className="text-[10px] text-neutral-400">Acidentes / Fogo</span>
                    </div>
                  </a>

                  <a
                    href="tel:191"
                    className="p-3 bg-neutral-950 hover:bg-neutral-800 border border-cyan-500/30 rounded-2xl flex items-center gap-3 cursor-pointer transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 font-bold">
                      191
                    </div>
                    <div>
                      <span className="text-xs font-bold text-neutral-100 block font-sans">PRF (Rodovias)</span>
                      <span className="text-[10px] text-neutral-400">Polícia Rodoviária</span>
                    </div>
                  </a>
                </div>
              </div>

            </div>

            {/* Footer Close */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end font-sans">
              <button
                onClick={onClose}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold px-5 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Fechar Painel SOS
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
