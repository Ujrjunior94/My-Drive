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

export interface VehicleSpecs {
  modelName: string; // "Renault Sandero 2013 1.0 Expression"
  engine: string; // "1.0 16V Hi-Flex (D4D)"
  powerHp: string; // "77 cv (Etanol) / 76 cv (Gasolina) @ 5.850 rpm"
  torqueKgfm: string; // "10,1 kgfm (Etanol) / 9,9 kgfm (Gasolina) @ 4.250 rpm"
  tankCapacityLiters: number; // 50
  trunkCapacityLiters: number; // 320
  factoryConsumptionEtanolUrban: number; // 8.1 km/l
  factoryConsumptionEtanolHighway: number; // 9.2 km/l
  factoryConsumptionGasolinaUrban: number; // 12.1 km/l
  factoryConsumptionGasolinaHighway: number; // 13.0 km/l
  recommendedTirePressure: string; // "29 PSI dianteira / 29 PSI traseira (32 carregado)"
  tireSize: string; // "185/65 R15"
  topSpeedKmH?: number; // 161 km/h
  accel0to100?: number; // 14.1s
}

export interface Journey {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  shiftName?: string; // e.g. "Turno 1 - Manhã", "Turno 2 - Tarde", "Turno 3 - Noite"
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
  tankCapacityLiters?: number; // e.g., 50 (Litros)
  vehicleSpecs?: VehicleSpecs;
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
