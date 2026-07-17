/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Earnings {
  uber: number;
  99: number;
  others: number;
}

export interface Expenses {
  fuel: number;
  tolls: number;
  food: number;
  others: number;
}

export interface JourneyMetrics {
  grossEarnings: number;
  totalExpenses: number;
  netProfit: number;
  profitPerHour: number;
  profitPerKm: number;
  costPerKm: number;
}

export interface Journey {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  startKm: number;
  endKm: number;
  totalKm: number;
  startFuelLevel: number; // 0 - 100
  endFuelLevel: number; // 0 - 100
  earnings: Earnings;
  expenses: Expenses;
  metrics: JourneyMetrics;
  notes: string;
  createdAt?: any;
}

export interface UserSettings {
  fuelType: string; // Flex / Gasolina / Etanol / GNV / Diesel / Elétrico
  targetDailyProfit: number; // e.g., 250
  currency: string; // e.g., BRL
  displayName: string;
}

export interface Refuel {
  id: string;
  userId: string;
  date: string;
  value: number; // R$ cost
  liters: number;
  pricePerLiter: number;
  stationName: string;
  odometer: number;
  fuelType: string;
}

export interface Maintenance {
  id: string;
  userId: string;
  date: string;
  type: string; // Troca de Óleo, Pneus, Freios, Revisão, Outros
  odometer: number;
  cost: number;
  nextOdometerCheck: number;
  notes: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  settings: UserSettings;
}
