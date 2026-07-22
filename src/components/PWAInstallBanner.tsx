import React, { useState } from "react";
import { Download, Smartphone, Share, PlusSquare, X, Check, ShieldCheck, Sparkles, Monitor } from "lucide-react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { motion, AnimatePresence } from "motion/react";

interface PWAInstallBannerProps {
  compact?: boolean;
}

export default function PWAInstallBanner({ compact = false }: PWAInstallBannerProps) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [installedSuccess, setInstalledSuccess] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(false);

  if (dismissed || isInstalled) {
    if (compact) return null;
    return (
      <div id="pwa-installed-status" className="bg-neutral-900/80 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3 text-emerald-400 font-medium">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-neutral-100 font-semibold text-sm">App Instalado no Bordo</div>
            <div className="text-xs text-neutral-400">Modo Web App / PWA ativo em tela cheia sem barras.</div>
          </div>
        </div>
      </div>
    );
  }

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

  if (compact) {
    return (
      <>
        <button
          type="button"
          id="pwa-install-header-btn"
          onClick={handleInstallClick}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300 text-xs font-medium py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          title="Instalar DrivePilot no celular ou computador"
        >
          <Download className="w-3.5 h-3.5 animate-bounce" />
          <span className="hidden sm:inline">Instalar App</span>
          <span className="sm:hidden">PWA</span>
        </button>

        {/* Modal de Instruções em iOS ou Navegadores sem suporte automático */}
        <AnimatePresence>
          {showGuideModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative"
              >
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-200 rounded-xl bg-neutral-800/50"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-100">Instalar o DrivePilot AI</h3>
                    <p className="text-xs text-neutral-400">Acesse como um aplicativo nativo no painel do seu veículo</p>
                  </div>
                </div>

                {isIOS ? (
                  <div className="space-y-3 my-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-sm text-neutral-300">
                    <p className="font-semibold text-cyan-400 flex items-center gap-2">
                      <AppleIcon className="w-4 h-4" /> Passo a passo no iOS (Safari):
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300">
                      <li className="flex items-start gap-2">
                        <Share className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>Toque no botão de <strong>Compartilhar</strong> no Safari (na barra inferior).</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <PlusSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        <span>Confirme tocando em <strong>"Adicionar"</strong> no canto superior direito.</span>
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-3 my-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-sm text-neutral-300">
                    <p className="font-semibold text-cyan-400 flex items-center gap-2">
                      <Monitor className="w-4 h-4" /> Passo a passo no Chrome / Android:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300">
                      <li>Clique no ícone de <strong>Instalar</strong> na barra de endereço do navegador ou no menu de três pontos (⋮).</li>
                      <li>Selecione <strong>"Instalar DrivePilot AI"</strong>.</li>
                      <li>O app abrirá automaticamente em janela própria sem abas do navegador.</li>
                    </ol>
                  </div>
                )}

                <button
                  onClick={() => setShowGuideModal(false)}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold py-3 rounded-xl transition-all text-sm mt-2 cursor-pointer"
                >
                  Entendi
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div id="pwa-install-banner" className="bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-cyan-500/30 rounded-3xl p-5 shadow-xl relative overflow-hidden my-4">
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-neutral-100">Instalar App no Celular / Painel</h3>
              <span className="bg-cyan-500/20 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">
                PWA / MODO WEB
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 max-w-md">
              Acesse o cockpit direto da tela inicial como um app nativo, com resposta rápida e suporte a uso offline durante suas rotas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            id="pwa-banner-install-action"
            onClick={handleInstallClick}
            className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Download className="w-4 h-4" />
            <span>{isInstallable ? "Instalar Agora" : "Como Instalar"}</span>
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

      {/* Guide Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowGuideModal(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-200 rounded-xl bg-neutral-800/50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-100">Instalar DrivePilot AI</h3>
                  <p className="text-xs text-neutral-400">Instalação direta pelo navegador em modo Web App</p>
                </div>
              </div>

              {isIOS ? (
                <div className="space-y-3 my-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-sm text-neutral-300">
                  <p className="font-semibold text-cyan-400 flex items-center gap-2">Passo a passo no iPhone / iPad (Safari):</p>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300">
                    <li className="flex items-start gap-2">
                      <Share className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>Toque no ícone de <strong>Compartilhar</strong> na barra do Safari.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <PlusSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Selecione <strong>"Adicionar à Tela de Início"</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                      <span>Toque em <strong>"Adicionar"</strong> no canto superior.</span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 my-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-800 text-sm text-neutral-300">
                  <p className="font-semibold text-cyan-400 flex items-center gap-2">Passo a passo no Android / Chrome / Edge:</p>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-neutral-300">
                    <li>Abra o menu do navegador (⋮) no canto superior direito.</li>
                    <li>Clique em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
                    <li>Confirme a instalação e abra o ícone direto da área de trabalho do seu celular.</li>
                  </ol>
                </div>
              )}

              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold py-3 rounded-xl transition-all text-sm mt-2 cursor-pointer"
              >
                Entendi
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.82 1.13-1.96.99-3.1-.98.04-2.17.65-2.87 1.47-.62.72-1.16 1.88-.99 3 1.1.08 2.22-.55 2.87-1.37z" />
    </svg>
  );
}
