import React, { useState } from "react";
import { Download, Smartphone, Share, PlusSquare, X, Check, ShieldCheck, Sparkles, Monitor, Zap, Globe, CheckCircle2, ArrowRight } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { motion, AnimatePresence } from "motion/react";

interface PWAInstallBannerProps {
  compact?: boolean;
}

export default function PWAInstallBanner({ compact = false }: PWAInstallBannerProps) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState<"android" | "ios" | "desktop">(
    isIOS ? "ios" : "android"
  );
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await promptInstall();
      if (success) {
        setInstalledSuccess(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  if (dismissed && !showGuideModal) {
    if (compact) return null;
  }

  if (isInstalled || installedSuccess) {
    if (compact) return null;
    return (
      <div id="pwa-installed-status" className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-sm my-4 shadow-xl">
        <div className="flex items-center gap-3 text-emerald-400 font-medium">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="text-neutral-100 font-bold text-sm flex items-center gap-2">
              <span>DrivePilot AI — Modo Web Instalado</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded-full font-bold">
                PWA ATIVO
              </span>
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              Aplicativo em execução no painel em tela cheia com alta performance de bordo.
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowGuideModal(true)}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
        >
          Ver Detalhes
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <>
        <button
          type="button"
          id="pwa-install-header-btn"
          onClick={() => setShowGuideModal(true)}
          className="bg-gradient-to-r from-cyan-500/20 to-blue-500/10 hover:from-cyan-500/30 hover:to-blue-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-cyan-500/10"
          title="Abrir Instalador do Modo Web (PWA)"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
          <span className="hidden sm:inline">Instalador Modo Web</span>
          <span className="sm:hidden font-mono">Modo Web</span>
        </button>

        {/* Modal Completo do Instalador do Modo Web */}
        <InstallerModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
          activeDeviceTab={activeDeviceTab}
          setActiveDeviceTab={setActiveDeviceTab}
          isInstallable={isInstallable}
          onTriggerInstall={handleInstallClick}
        />
      </>
    );
  }

  return (
    <div id="pwa-install-banner" className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden my-4">
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-100 font-sans">
                Instalador do Modo Web (PWA)
              </h3>
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                TELA CHEIA & OFFLINE
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-xl">
              Instale o <strong>DrivePilot AI</strong> diretamente no seu celular (Android/iOS) ou computador sem precisar de loja de aplicativos. Funciona sem abas e com navegação ultra fluida no veículo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
          <button
            type="button"
            id="pwa-banner-install-action"
            onClick={() => setShowGuideModal(true)}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-neutral-950 font-black px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Abrir Instalador Web</span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-2.5 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 rounded-xl transition-all cursor-pointer"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modal Completo do Instalador */}
      <InstallerModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        activeDeviceTab={activeDeviceTab}
        setActiveDeviceTab={setActiveDeviceTab}
        isInstallable={isInstallable}
        onTriggerInstall={handleInstallClick}
      />
    </div>
  );
}

// Subcomponente do Modal do Instalador do Modo Web
function InstallerModal({
  isOpen,
  onClose,
  activeDeviceTab,
  setActiveDeviceTab,
  isInstallable,
  onTriggerInstall
}: {
  isOpen: boolean;
  onClose: () => void;
  activeDeviceTab: "android" | "ios" | "desktop";
  setActiveDeviceTab: (tab: "android" | "ios" | "desktop") => void;
  isInstallable: boolean;
  onTriggerInstall: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-200 rounded-xl bg-neutral-800/50 cursor-pointer transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-neutral-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Globe className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-100 font-sans flex items-center gap-2">
                  <span>Instalador do Modo Web</span>
                  <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                    PWA v2.0
                  </span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Transforme o DrivePilot AI em um aplicativo nativo no seu dispositivo.
                </p>
              </div>
            </div>

            {/* Vantagens do Modo Web PWA */}
            <div className="grid grid-cols-2 gap-2 mb-5 font-mono text-[11px]">
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-neutral-300">Sem barra de navegação</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-neutral-300">Carregamento offline</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-neutral-300">Ícone na Tela Inicial</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800/80 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-neutral-300">0 MB de Download</span>
              </div>
            </div>

            {/* Device Selector Tabs */}
            <div className="flex border-b border-neutral-800 mb-4 font-mono text-xs">
              <button
                onClick={() => setActiveDeviceTab("android")}
                className={`flex-1 py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeDeviceTab === "android"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Android / Chrome</span>
              </button>

              <button
                onClick={() => setActiveDeviceTab("ios")}
                className={`flex-1 py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeDeviceTab === "ios"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <AppleIcon className="w-4 h-4" />
                <span>iPhone / iPad</span>
              </button>

              <button
                onClick={() => setActiveDeviceTab("desktop")}
                className={`flex-1 py-2.5 px-3 font-bold border-b-2 transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeDeviceTab === "desktop"
                    ? "border-cyan-400 text-cyan-400 bg-cyan-500/5"
                    : "border-transparent text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>PC / Mac</span>
              </button>
            </div>

            {/* Tab Instructions Content */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3 font-sans">
              {activeDeviceTab === "android" && (
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-300 space-y-3">
                  <p className="font-bold text-cyan-400 flex items-center gap-2 text-sm font-mono">
                    <Smartphone className="w-4 h-4" /> Passo a Passo no Android (Chrome / Edge / Brave):
                  </p>
                  
                  {isInstallable ? (
                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl space-y-2">
                      <p className="text-cyan-300 font-bold">Instalação Automática Disponível!</p>
                      <p className="text-neutral-300 text-xs">
                        Clique no botão abaixo para o navegador instalar o aplicativo diretamente na sua tela inicial.
                      </p>
                      <button
                        onClick={onTriggerInstall}
                        className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-black rounded-xl text-xs transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Instalar Agora no Android</span>
                      </button>
                    </div>
                  ) : (
                    <ol className="list-decimal list-inside space-y-2 text-neutral-300">
                      <li className="leading-relaxed">
                        Toque no botão de menu de <strong>três pontos (⋮)</strong> no canto superior direito do Chrome.
                      </li>
                      <li className="leading-relaxed">
                        Procure a opção <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à Tela Inicial"</strong>.
                      </li>
                      <li className="leading-relaxed">
                        Confirme tocando em <strong>"Instalar"</strong>.
                      </li>
                      <li className="leading-relaxed text-cyan-400 font-mono">
                        O ícone DrivePilot AI aparecerá na sua gaveta de aplicativos.
                      </li>
                    </ol>
                  )}
                </div>
              )}

              {activeDeviceTab === "ios" && (
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-300 space-y-3">
                  <p className="font-bold text-cyan-400 flex items-center gap-2 text-sm font-mono">
                    <AppleIcon className="w-4 h-4" /> Passo a Passo no iPhone / iPad (Safari):
                  </p>
                  <ol className="space-y-3 text-neutral-300">
                    <li className="flex items-start gap-2.5 bg-neutral-900 p-2.5 rounded-xl border border-neutral-800/60">
                      <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg shrink-0">
                        <Share className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-neutral-100 block">1. Toque em Compartilhar</strong>
                        <span className="text-[11px] text-neutral-400">Na barra inferior do Safari, toque no ícone com uma seta para cima.</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5 bg-neutral-900 p-2.5 rounded-xl border border-neutral-800/60">
                      <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
                        <PlusSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-neutral-100 block">2. Adicionar à Tela de Início</strong>
                        <span className="text-[11px] text-neutral-400">Role a lista de opções para baixo e selecione essa opção.</span>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5 bg-neutral-900 p-2.5 rounded-xl border border-neutral-800/60">
                      <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-neutral-100 block">3. Confirmar "Adicionar"</strong>
                        <span className="text-[11px] text-neutral-400">Toque em "Adicionar" no canto superior direito da tela.</span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {activeDeviceTab === "desktop" && (
                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-xs text-neutral-300 space-y-3">
                  <p className="font-bold text-cyan-400 flex items-center gap-2 text-sm font-mono">
                    <Monitor className="w-4 h-4" /> Passo a Passo no Computador (Windows / macOS / Linux):
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-neutral-300">
                    <li className="leading-relaxed">
                      No Google Chrome ou Microsoft Edge, localize o ícone de <strong>instalação de aplicativo</strong> (<Download className="w-3.5 h-3.5 inline text-cyan-400" />) no lado direito da barra de endereço.
                    </li>
                    <li className="leading-relaxed">
                      Clique em <strong>"Instalar DrivePilot AI"</strong>.
                    </li>
                    <li className="leading-relaxed">
                      O painel abrirá em uma janela dedicada de aplicativo, independente das abas do navegador.
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Footer Action */}
            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                Status: {isInstallable ? "Pronto para Instalação" : "PWA Configurado"}
              </span>

              <button
                onClick={onClose}
                className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold px-5 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.82 1.13-1.96.99-3.1-.98.04-2.17.65-2.87 1.47-.62.72-1.16 1.88-.99 3 1.1.08 2.22-.55 2.87-1.37z" />
    </svg>
  );
}

