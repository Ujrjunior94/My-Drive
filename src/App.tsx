import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./lib/firebase";
import { dbService } from "./lib/dbService";
import { Journey, UserSettings } from "./types";
import { motion, AnimatePresence } from "motion/react";

// Icons
import { 
  Gauge, 
  Calendar as CalendarIcon, 
  Cpu, 
  Settings as SettingsIcon, 
  LogOut, 
  Car, 
  Plus, 
  User, 
  Menu, 
  X, 
  Sparkles, 
  Zap,
  Compass,
  Wrench,
  Fuel
} from "lucide-react";

// Components
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import CalendarView from "./components/CalendarView";
import JourneyForm from "./components/JourneyForm";
import AdvisorPanel from "./components/AdvisorPanel";
import SettingsPanel from "./components/SettingsPanel";
import RefuelsView from "./components/RefuelsView";
import MaintenancesView from "./components/MaintenancesView";
import PWAInstallBanner from "./components/PWAInstallBanner";

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Tab navigation & modals
  const [activeTab, setActiveTab] = useState<string>("cockpit");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [editingJourney, setEditingJourney] = useState<Journey | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Core Data State
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    fuelType: "Flex (Etanol/Gasolina)",
    targetDailyProfit: 250,
    currency: "BRL",
    displayName: "Piloto Profissional"
  });

  const [loading, setLoading] = useState<boolean>(false);

  // 1. Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setIsDemo(false);
      } else {
        // Only reset if they weren't in manual Demo Mode
        if (!isDemo) {
          setUserId(null);
        }
      }
      setAuthChecked(true);
    });
    return unsubscribe;
  }, [isDemo]);

  // 2. Load settings and journeys once authenticated or demo initialized
  useEffect(() => {
    async function loadData() {
      if (!userId && !isDemo) return;
      setLoading(true);
      try {
        const uId = userId || "demo";
        const loadedSettings = await dbService.getUserSettings(uId, isDemo);
        setSettings(loadedSettings);

        const loadedJourneys = await dbService.getJourneys(uId, isDemo);
        setJourneys(loadedJourneys);
      } catch (e) {
        console.error("Failed loading user data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId, isDemo]);

  // Handle Authentication flow Success
  const handleAuthSuccess = (uId: string, demoMode: boolean) => {
    if (demoMode) {
      setIsDemo(true);
      setUserId(null);
    } else {
      setIsDemo(false);
      setUserId(uId);
    }
  };

  // Log Out / Exit Telemetry
  const handleLogOut = async () => {
    if (isDemo) {
      setIsDemo(false);
    } else {
      await signOut(auth);
    }
    setUserId(null);
    setJourneys([]);
    setActiveTab("cockpit");
    setShowForm(false);
    setEditingJourney(null);
  };

  // Save telemetry record
  const handleSaveJourney = async (journey: Journey) => {
    setLoading(true);
    try {
      const uId = userId || "demo";
      await dbService.saveJourney(uId, journey, isDemo);
      
      // Reload journeys list
      const loadedJourneys = await dbService.getJourneys(uId, isDemo);
      setJourneys(loadedJourneys);
      
      // Close form and return to original active tab
      setShowForm(false);
      setEditingJourney(null);
    } catch (e) {
      alert("Erro ao gravar jornada. Tente novamente.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Delete telemetry record
  const handleDeleteJourney = async (journeyId: string) => {
    setLoading(true);
    try {
      const uId = userId || "demo";
      await dbService.deleteJourney(uId, journeyId, isDemo);
      
      // Reload journeys
      const loadedJourneys = await dbService.getJourneys(uId, isDemo);
      setJourneys(loadedJourneys);
      
      setShowForm(false);
      setEditingJourney(null);
    } catch (e) {
      alert("Erro ao excluir registro.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Save Settings Changes
  const handleSaveSettings = async (newSettings: UserSettings) => {
    setLoading(true);
    try {
      const uId = userId || "demo";
      await dbService.saveUserSettings(uId, newSettings, isDemo);
      setSettings(newSettings);
    } catch (e) {
      alert("Erro ao salvar preferências.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handle calendar triggers
  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setEditingJourney(null);
    setShowForm(true);
  };

  const handleEditJourney = (journey: Journey) => {
    setEditingJourney(journey);
    setSelectedDate(journey.date);
    setShowForm(true);
  };

  // Get greeting based on current local time hour
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Bom dia";
    if (hours < 18) return "Boa tarde";
    return "Boa noite";
  };

  // If loading and auth hasn't been verified yet, display clean supercar start screen
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1),transparent_70%)]" />
        <Car className="w-10 h-10 text-cyan-400 animate-bounce mb-3" />
        <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest animate-pulse">
          Carregando Sistemas de Bordo...
        </span>
      </div>
    );
  }

  // If no session found, show ignition/authentication panel
  if (!userId && !isDemo) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const currentOdometer = journeys.length > 0
    ? Math.max(...journeys.map(j => j.endKm))
    : 124700;

  return (
    <div id="drive-analytics-app" className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-cyan-500 selection:text-neutral-900 font-sans">
      
      {/* 1. Header (Dash Top Panel) */}
      <header className="bg-neutral-850/95 border-b border-neutral-800/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Brand/Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-cyan-400 relative">
              <Car className="w-5 h-5 animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400/20 blur rounded-xl opacity-20" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider flex items-center gap-1 font-sans">
                DRIVEPILOT <span className="text-cyan-400 font-mono text-xs">AI</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isDemo ? "bg-cyan-400 animate-pulse" : "bg-emerald-400"}`} />
                <span className="text-[9px] uppercase tracking-wider font-bold text-neutral-500 font-mono">
                  {isDemo ? "Painel de Demonstração" : "Telemetria Conectada"}
                </span>
              </div>
            </div>
          </div>

          {/* User Display Info & Fast Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-neutral-400 font-mono block">
                {getGreeting()}, <span className="text-cyan-400 font-sans font-bold">{settings.displayName}</span>
              </span>
              <span className="text-[10px] text-neutral-500 font-mono uppercase">
                Meta: {new Intl.NumberFormat("pt-BR", { style: "currency", currency: settings.currency }).format(settings.targetDailyProfit)}/dia
              </span>
            </div>

            <PWAInstallBanner compact={true} />

            <div className="w-[1px] h-6 bg-neutral-800" />

            <button
              id="header-new-journey-btn"
              onClick={() => {
                const today = new Date();
                const padMonth = String(today.getMonth() + 1).padStart(2, "0");
                const padDay = String(today.getDate()).padStart(2, "0");
                setSelectedDate(`${today.getFullYear()}-${padMonth}-${padDay}`);
                setEditingJourney(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-neutral-900 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-cyan-500/10"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ligar Motor (Nova Jornada)</span>
            </button>

            <button
              id="header-logout-btn"
              onClick={handleLogOut}
              className="p-2.5 bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-red-500/30 text-neutral-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
              title="Desconectar Painel"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 md:hidden">
            <PWAInstallBanner compact={true} />

            <button
              id="mobile-new-journey-btn"
              onClick={() => {
                const today = new Date();
                const padMonth = String(today.getMonth() + 1).padStart(2, "0");
                const padDay = String(today.getDate()).padStart(2, "0");
                setSelectedDate(`${today.getFullYear()}-${padMonth}-${padDay}`);
                setEditingJourney(null);
                setShowForm(true);
              }}
              className="p-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-neutral-900 rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 font-bold" />
            </button>

            <button
              id="mobile-menu-trigger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-400 hover:text-neutral-200 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </header>

      {/* 2. Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-neutral-900 border-b border-neutral-800/80 px-4 py-4 space-y-3 z-20 sticky top-16"
          >
            <div className="flex items-center justify-between p-2.5 bg-neutral-950 rounded-xl">
              <div>
                <span className="text-xs text-neutral-400 font-mono block">Piloto</span>
                <span className="text-sm text-cyan-400 font-bold">{settings.displayName}</span>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                {settings.fuelType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <button
                onClick={() => {
                  setActiveTab("cockpit");
                  setShowForm(false);
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-xs rounded-xl border font-bold flex items-center justify-center gap-1.5 ${
                  activeTab === "cockpit" && !showForm
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400"
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("calendar");
                  setShowForm(false);
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-xs rounded-xl border font-bold flex items-center justify-center gap-1.5 ${
                  activeTab === "calendar" && !showForm
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Calendário</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("refuels");
                  setShowForm(false);
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-xs rounded-xl border font-bold flex items-center justify-center gap-1.5 ${
                  activeTab === "refuels" && !showForm
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400"
                }`}
              >
                <Fuel className="w-3.5 h-3.5" />
                <span>Combustível</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("maintenances");
                  setShowForm(false);
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-xs rounded-xl border font-bold flex items-center justify-center gap-1.5 ${
                  activeTab === "maintenances" && !showForm
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400"
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Oficina</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("advisor");
                  setShowForm(false);
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-xs rounded-xl border font-bold flex items-center justify-center gap-1.5 col-span-2 ${
                  activeTab === "advisor" && !showForm
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>IA Co-Piloto Advisor</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("settings");
                  setShowForm(false);
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 text-xs rounded-xl border font-bold flex items-center justify-center gap-1.5 col-span-2 ${
                  activeTab === "settings" && !showForm
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400"
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Ajustes Cockpit</span>
              </button>
            </div>

            <button
              id="mobile-logout-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogOut();
              }}
              className="w-full py-2 px-4 bg-red-950/20 hover:bg-red-950/30 border border-red-500/35 rounded-xl text-red-400 text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Desconectar Telemetria</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Nav (Desktop Only) */}
        <nav className="hidden md:flex flex-col gap-2 w-64 shrink-0 font-mono text-xs">
          
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider px-3 mb-1">
            Navegação Cockpit
          </span>

          <button
            onClick={() => {
              setActiveTab("cockpit");
              setShowForm(false);
            }}
            className={`w-full py-3 px-4 rounded-xl border flex items-center gap-3 font-bold transition-all cursor-pointer ${
              activeTab === "cockpit" && !showForm
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/5"
                : "bg-neutral-900 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>Dashboard Geral</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("calendar");
              setShowForm(false);
            }}
            className={`w-full py-3 px-4 rounded-xl border flex items-center gap-3 font-bold transition-all cursor-pointer ${
              activeTab === "calendar" && !showForm
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/5"
                : "bg-neutral-900 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendário Mensal</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("refuels");
              setShowForm(false);
            }}
            className={`w-full py-3 px-4 rounded-xl border flex items-center gap-3 font-bold transition-all cursor-pointer ${
              activeTab === "refuels" && !showForm
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/5"
                : "bg-neutral-900 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>Combustível & Consumo</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("maintenances");
              setShowForm(false);
            }}
            className={`w-full py-3 px-4 rounded-xl border flex items-center gap-3 font-bold transition-all cursor-pointer ${
              activeTab === "maintenances" && !showForm
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/5"
                : "bg-neutral-900 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Oficina & Manutenção</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("advisor");
              setShowForm(false);
            }}
            className={`w-full py-3 px-4 rounded-xl border flex items-center gap-3 font-bold transition-all cursor-pointer ${
              activeTab === "advisor" && !showForm
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/5"
                : "bg-neutral-900 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Cpu className="w-4 h-4 animate-spin" style={{ animationDuration: "20s" }} />
            <span>IA Advisor</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("settings");
              setShowForm(false);
            }}
            className={`w-full py-3 px-4 rounded-xl border flex items-center gap-3 font-bold transition-all cursor-pointer ${
              activeTab === "settings" && !showForm
                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-500/5"
                : "bg-neutral-900 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Ajustes Painel</span>
          </button>

          {/* Quick Stats sidebar footer */}
          <div className="mt-auto p-4 bg-neutral-900 border border-neutral-800/80 rounded-2xl space-y-2.5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest font-mono block">Métricas Totais</span>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-neutral-500 block text-[9px] uppercase">Jornadas</span>
                <span className="text-neutral-200 font-bold block">{journeys.length} logged</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[9px] uppercase">Distância</span>
                <span className="text-neutral-200 font-bold block">{journeys.reduce((sum, j) => sum + j.totalKm, 0)} KM</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Primary Content Window */}
        <section className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="journey-form"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <JourneyForm
                  userId={userId || "demo"}
                  isDemo={isDemo}
                  selectedDate={selectedDate}
                  editingJourney={editingJourney}
                  settings={settings}
                  onSave={handleSaveJourney}
                  onDelete={handleDeleteJourney}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingJourney(null);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "cockpit" && (
                  <>
                    <PWAInstallBanner />
                    <Dashboard
                      journeys={journeys}
                      settings={settings}
                      loading={loading}
                      userId={userId || "demo"}
                      isDemo={isDemo}
                      currentOdometer={currentOdometer}
                      onNavigateTab={(tab) => setActiveTab(tab as any)}
                    />
                  </>
                )}
                {activeTab === "calendar" && (
                  <CalendarView
                    journeys={journeys}
                    settings={settings}
                    onSelectDate={handleSelectDate}
                    onEditJourney={handleEditJourney}
                  />
                )}
                {activeTab === "refuels" && (
                  <RefuelsView
                    userId={userId || "demo"}
                    isDemo={isDemo}
                    settings={settings}
                    currentOdometer={currentOdometer}
                  />
                )}
                {activeTab === "maintenances" && (
                  <MaintenancesView
                    userId={userId || "demo"}
                    isDemo={isDemo}
                    settings={settings}
                    currentOdometer={currentOdometer}
                  />
                )}
                {activeTab === "advisor" && (
                  <AdvisorPanel journeys={journeys} settings={settings} />
                )}
                {activeTab === "settings" && (
                  <SettingsPanel settings={settings} onSave={handleSaveSettings} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>

      {/* 4. Dashboard System Footer */}
      <footer className="mt-auto px-6 py-4 bg-neutral-950 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between font-mono text-[10px] text-neutral-500 uppercase tracking-widest gap-2">
        <div className="flex items-center gap-3.5">
          <span>DrivePilot AI • Cockpit Telemetry</span>
          <span className="text-emerald-500/50">●</span>
          <span>DB Sincronizado</span>
        </div>
        <div className="flex items-center gap-4 text-[9px] text-neutral-600">
          <span>Sistemas: OK</span>
          <span>GPS: Ativo</span>
          <span>Bateria: 100%</span>
        </div>
      </footer>

    </div>
  );
}
