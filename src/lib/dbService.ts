import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { handleFirestoreError, OperationType } from "./firestoreError";
import { Journey, UserSettings, Refuel, Maintenance } from "../types";

// Realistic Mock Data for Demo Mode based on current local time: July 2026
const DEMO_REFUELS: Refuel[] = [
  {
    id: "ref-1",
    userId: "demo-user",
    date: "2026-07-15",
    value: 180.00,
    liters: 42.95,
    pricePerLiter: 4.19,
    stationName: "Posto Ipiranga Centro",
    odometer: 124280,
    fuelType: "Etanol Comum"
  },
  {
    id: "ref-2",
    userId: "demo-user",
    date: "2026-07-11",
    value: 168.00,
    liters: 40.00,
    pricePerLiter: 4.20,
    stationName: "Posto Shell Marginal",
    odometer: 124700,
    fuelType: "Etanol Comum"
  }
];

const DEMO_MAINTENANCES: Maintenance[] = [
  {
    id: "maint-1",
    userId: "demo-user",
    date: "2026-06-10",
    type: "Troca de Óleo e Filtro Motor",
    odometer: 116000,
    cost: 280.00,
    nextOdometerCheck: 126000,
    notes: "Óleo 5W30 sintético original"
  },
  {
    id: "maint-2",
    userId: "demo-user",
    date: "2026-05-20",
    type: "Pastilhas de Freio Dianteiras ABS",
    odometer: 115200,
    cost: 320.00,
    nextOdometerCheck: 125200,
    notes: "Verificação e substituição do jogo de pastilhas Bosch"
  },
  {
    id: "maint-3",
    userId: "demo-user",
    date: "2026-07-01",
    type: "Alinhamento e Balanceamento",
    odometer: 122500,
    cost: 150.00,
    nextOdometerCheck: 132500,
    notes: "Ajuste de convergência e balanceamento das rodas"
  }
];
const DEMO_JOURNEYS: Journey[] = [
  {
    id: "demo-1",
    userId: "demo-user",
    date: "2026-07-10",
    startTime: "07:00",
    endTime: "16:00",
    startKm: 124500,
    endKm: 124720,
    totalKm: 220,
    startFuelLevel: 100,
    endFuelLevel: 35,
    earnings: { uber: 310.50, 99: 150.00, others: 20.00 },
    expenses: { fuel: 120.00, tolls: 15.00, food: 25.00, others: 10.00 },
    metrics: {
      grossEarnings: 480.50,
      totalExpenses: 170.00,
      netProfit: 310.50, // High Profit (> 250) -> Green
      profitPerHour: 34.50,
      profitPerKm: 1.41,
      costPerKm: 0.77
    },
    notes: "Sexta-feira muito dinâmica. Chuva leve à tarde impulsionou tarifas."
  },
  {
    id: "demo-2",
    userId: "demo-user",
    date: "2026-07-11",
    startTime: "08:00",
    endTime: "15:00",
    startKm: 124720,
    endKm: 124890,
    totalKm: 170,
    startFuelLevel: 100,
    endFuelLevel: 45,
    earnings: { uber: 190.00, 99: 90.00, others: 0.00 },
    expenses: { fuel: 95.00, tolls: 8.50, food: 20.00, others: 5.00 },
    metrics: {
      grossEarnings: 280.00,
      totalExpenses: 128.50,
      netProfit: 151.50, // Medium Profit (100 - 250) -> Blue
      profitPerHour: 21.64,
      profitPerKm: 0.89,
      costPerKm: 0.76
    },
    notes: "Sábado de manhã regular. Trânsito calmo."
  },
  {
    id: "demo-3",
    userId: "demo-user",
    date: "2026-07-13",
    startTime: "06:30",
    endTime: "12:30",
    startKm: 124890,
    endKm: 125010,
    totalKm: 120,
    startFuelLevel: 80,
    endFuelLevel: 40,
    earnings: { uber: 120.00, 99: 45.00, others: 10.00 },
    expenses: { fuel: 65.00, tolls: 0.00, food: 18.00, others: 0.00 },
    metrics: {
      grossEarnings: 175.00,
      totalExpenses: 83.00,
      netProfit: 92.00, // Low Profit (< 100) -> Yellow
      profitPerHour: 15.33,
      profitPerKm: 0.76,
      costPerKm: 0.69
    },
    notes: "Segunda de manhã fraca, muitas corridas curtas."
  },
  {
    id: "demo-4",
    userId: "demo-user",
    date: "2026-07-14",
    startTime: "07:00",
    endTime: "17:00",
    startKm: 125010,
    endKm: 125260,
    totalKm: 250,
    startFuelLevel: 100,
    endFuelLevel: 25,
    earnings: { uber: 340.00, 99: 180.00, others: 30.00 },
    expenses: { fuel: 140.00, tolls: 22.00, food: 30.00, others: 15.00 },
    metrics: {
      grossEarnings: 550.00,
      totalExpenses: 207.00,
      netProfit: 343.00, // High Profit -> Green
      profitPerHour: 34.30,
      profitPerKm: 1.37,
      costPerKm: 0.82
    },
    notes: "Terça-feira excelente! Muitas viagens longas e aeroporto."
  },
  {
    id: "demo-5",
    userId: "demo-user",
    date: "2026-07-15",
    startTime: "07:30",
    endTime: "16:30",
    startKm: 125260,
    endKm: 125460,
    totalKm: 200,
    startFuelLevel: 100,
    endFuelLevel: 38,
    earnings: { uber: 220.00, 99: 110.00, others: 15.00 },
    expenses: { fuel: 110.00, tolls: 12.00, food: 22.00, others: 5.00 },
    metrics: {
      grossEarnings: 345.00,
      totalExpenses: 149.00,
      netProfit: 196.00, // Medium Profit -> Blue
      profitPerHour: 21.78,
      profitPerKm: 0.98,
      costPerKm: 0.74
    },
    notes: "Quarta-feira mediana. Ritmo constante durante todo o dia."
  }
];

const DEFAULT_SETTINGS: UserSettings = {
  fuelType: "Flex (Etanol/Gasolina)",
  targetDailyProfit: 250,
  currency: "BRL",
  displayName: "Piloto Profissional"
};

export const dbService = {
  // GET JOURNEYS
  async getJourneys(userId: string, isDemo: boolean): Promise<Journey[]> {
    if (isDemo || !userId) {
      const stored = localStorage.getItem(`drive_analytics_journeys_${userId || "demo"}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed parsing localStorage journeys, resetting to default demo", e);
        }
      }
      // Save default demo journeys if empty
      localStorage.setItem(`drive_analytics_journeys_${userId || "demo"}`, JSON.stringify(DEMO_JOURNEYS));
      return DEMO_JOURNEYS;
    }

    try {
      const q = query(
        collection(db, "users", userId, "journeys"),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(q);
      const journeys: Journey[] = [];
      querySnapshot.forEach((doc) => {
        journeys.push({ id: doc.id, ...doc.data() } as Journey);
      });
      return journeys;
    } catch (error) {
      console.error("Error fetching journeys from Firestore, falling back to local storage:", error);
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/journeys`);
      const stored = localStorage.getItem(`drive_analytics_journeys_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
  },

  // SAVE JOURNEY
  async saveJourney(userId: string, journey: Journey, isDemo: boolean): Promise<void> {
    if (isDemo || !userId) {
      const journeys = await this.getJourneys(userId || "demo", true);
      const existingIndex = journeys.findIndex((j) => j.id === journey.id);
      if (existingIndex > -1) {
        journeys[existingIndex] = journey;
      } else {
        journeys.unshift(journey); // Add at beginning
      }
      // Sort by date descending
      journeys.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem(`drive_analytics_journeys_${userId || "demo"}`, JSON.stringify(journeys));
      return;
    }

    try {
      const docRef = doc(db, "users", userId, "journeys", journey.id);
      await setDoc(docRef, { ...journey, createdAt: new Date() });
      
      // Also cache locally
      const journeys = await this.getJourneys(userId, false);
      const existingIndex = journeys.findIndex((j) => j.id === journey.id);
      if (existingIndex > -1) {
        journeys[existingIndex] = journey;
      } else {
        journeys.unshift(journey);
      }
      journeys.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem(`drive_analytics_journeys_${userId}`, JSON.stringify(journeys));
    } catch (error) {
      console.error("Error saving journey to Firestore:", error);
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/journeys/${journey.id}`);
      throw error;
    }
  },

  // DELETE JOURNEY
  async deleteJourney(userId: string, journeyId: string, isDemo: boolean): Promise<void> {
    if (isDemo || !userId) {
      const journeys = await this.getJourneys(userId || "demo", true);
      const updated = journeys.filter((j) => j.id !== journeyId);
      localStorage.setItem(`drive_analytics_journeys_${userId || "demo"}`, JSON.stringify(updated));
      return;
    }

    try {
      const docRef = doc(db, "users", userId, "journeys", journeyId);
      await deleteDoc(docRef);

      // Cache locally
      const journeys = await this.getJourneys(userId, false);
      const updated = journeys.filter((j) => j.id !== journeyId);
      localStorage.setItem(`drive_analytics_journeys_${userId}`, JSON.stringify(updated));
    } catch (error) {
      console.error("Error deleting journey from Firestore:", error);
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/journeys/${journeyId}`);
      throw error;
    }
  },

  // GET USER SETTINGS
  async getUserSettings(userId: string, isDemo: boolean): Promise<UserSettings> {
    if (isDemo || !userId) {
      const stored = localStorage.getItem(`drive_analytics_settings_${userId || "demo"}`);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    }

    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().settings) {
        return docSnap.data().settings as UserSettings;
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error("Error fetching user settings, falling back to local:", error);
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      const stored = localStorage.getItem(`drive_analytics_settings_${userId}`);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    }
  },

  // SAVE USER SETTINGS
  async saveUserSettings(userId: string, settings: UserSettings, isDemo: boolean): Promise<void> {
    if (isDemo || !userId) {
      localStorage.setItem(`drive_analytics_settings_${userId || "demo"}`, JSON.stringify(settings));
      return;
    }

    try {
      const docRef = doc(db, "users", userId);
      await setDoc(docRef, { settings }, { merge: true });
      localStorage.setItem(`drive_analytics_settings_${userId}`, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings to Firestore:", error);
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
      throw error;
    }
  },

  // GET REFUELS
  async getRefuels(userId: string, isDemo: boolean): Promise<Refuel[]> {
    if (isDemo || !userId) {
      const stored = localStorage.getItem(`drivepilot_refuels_${userId || "demo"}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed parsing localStorage refuels", e);
        }
      }
      localStorage.setItem(`drivepilot_refuels_${userId || "demo"}`, JSON.stringify(DEMO_REFUELS));
      return DEMO_REFUELS;
    }

    try {
      const q = query(collection(db, "users", userId, "refuels"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      const res: Refuel[] = [];
      snap.forEach((doc) => {
        res.push({ id: doc.id, ...doc.data() } as Refuel);
      });
      return res;
    } catch (error) {
      console.error("Error fetching refuels from Firestore", error);
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/refuels`);
      const stored = localStorage.getItem(`drivepilot_refuels_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
  },

  // SAVE REFUEL
  async saveRefuel(userId: string, refuel: Refuel, isDemo: boolean): Promise<void> {
    if (isDemo || !userId) {
      const list = await this.getRefuels(userId || "demo", true);
      const idx = list.findIndex((r) => r.id === refuel.id);
      if (idx > -1) {
        list[idx] = refuel;
      } else {
        list.unshift(refuel);
      }
      list.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem(`drivepilot_refuels_${userId || "demo"}`, JSON.stringify(list));
      return;
    }

    try {
      const docRef = doc(db, "users", userId, "refuels", refuel.id);
      await setDoc(docRef, refuel);
      
      const list = await this.getRefuels(userId, false);
      const idx = list.findIndex((r) => r.id === refuel.id);
      if (idx > -1) {
        list[idx] = refuel;
      } else {
        list.unshift(refuel);
      }
      list.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem(`drivepilot_refuels_${userId}`, JSON.stringify(list));
    } catch (error) {
      console.error("Error saving refuel to Firestore", error);
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/refuels/${refuel.id}`);
      throw error;
    }
  },

  // DELETE REFUEL
  async deleteRefuel(userId: string, refuelId: string, isDemo: boolean): Promise<void> {
    if (isDemo || !userId) {
      const list = await this.getRefuels(userId || "demo", true);
      const filtered = list.filter((r) => r.id !== refuelId);
      localStorage.setItem(`drivepilot_refuels_${userId || "demo"}`, JSON.stringify(filtered));
      return;
    }

    try {
      const docRef = doc(db, "users", userId, "refuels", refuelId);
      await deleteDoc(docRef);

      const list = await this.getRefuels(userId, false);
      const filtered = list.filter((r) => r.id !== refuelId);
      localStorage.setItem(`drivepilot_refuels_${userId}`, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting refuel", error);
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/refuels/${refuelId}`);
      throw error;
    }
  },

  // GET MAINTENANCES
  async getMaintenances(userId: string, isDemo: boolean): Promise<Maintenance[]> {
    if (isDemo || !userId) {
      const stored = localStorage.getItem(`drivepilot_maintenances_${userId || "demo"}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error("Failed parsing localStorage maintenances", e);
        }
      }
      localStorage.setItem(`drivepilot_maintenances_${userId || "demo"}`, JSON.stringify(DEMO_MAINTENANCES));
      return DEMO_MAINTENANCES;
    }

    try {
      const q = query(collection(db, "users", userId, "maintenances"), orderBy("date", "desc"));
      const snap = await getDocs(q);
      const res: Maintenance[] = [];
      snap.forEach((doc) => {
        res.push({ id: doc.id, ...doc.data() } as Maintenance);
      });
      return res;
    } catch (error) {
      console.error("Error fetching maintenances from Firestore", error);
      handleFirestoreError(error, OperationType.LIST, `users/${userId}/maintenances`);
      const stored = localStorage.getItem(`drivepilot_maintenances_${userId}`);
      return stored ? JSON.parse(stored) : [];
    }
  },

  // SAVE MAINTENANCE
  async saveMaintenance(userId: string, maintenance: Maintenance, isDemo: boolean): Promise<void> {
    if (isDemo || !userId) {
      const list = await this.getMaintenances(userId || "demo", true);
      const idx = list.findIndex((m) => m.id === maintenance.id);
      if (idx > -1) {
        list[idx] = maintenance;
      } else {
        list.unshift(maintenance);
      }
      list.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem(`drivepilot_maintenances_${userId || "demo"}`, JSON.stringify(list));
      return;
    }

    try {
      const docRef = doc(db, "users", userId, "maintenances", maintenance.id);
      await setDoc(docRef, maintenance);
      
      const list = await this.getMaintenances(userId, false);
      const idx = list.findIndex((m) => m.id === maintenance.id);
      if (idx > -1) {
        list[idx] = maintenance;
      } else {
        list.unshift(maintenance);
      }
      list.sort((a, b) => b.date.localeCompare(a.date));
      localStorage.setItem(`drivepilot_maintenances_${userId}`, JSON.stringify(list));
    } catch (error) {
      console.error("Error saving maintenance to Firestore", error);
      handleFirestoreError(error, OperationType.WRITE, `users/${userId}/maintenances/${maintenance.id}`);
      throw error;
    }
  },

  // DELETE MAINTENANCE
  async deleteMaintenance(userId: string, maintenanceId: string, isDemo: boolean): Promise<void> {
    if (isDemo || !userId) {
      const list = await this.getMaintenances(userId || "demo", true);
      const filtered = list.filter((m) => m.id !== maintenanceId);
      localStorage.setItem(`drivepilot_maintenances_${userId || "demo"}`, JSON.stringify(filtered));
      return;
    }

    try {
      const docRef = doc(db, "users", userId, "maintenances", maintenanceId);
      await deleteDoc(docRef);

      const list = await this.getMaintenances(userId, false);
      const filtered = list.filter((m) => m.id !== maintenanceId);
      localStorage.setItem(`drivepilot_maintenances_${userId}`, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting maintenance", error);
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}/maintenances/${maintenanceId}`);
      throw error;
    }
  }
};
