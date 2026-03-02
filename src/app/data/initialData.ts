import { Event, InventoryItem, Vehicle, Worker } from '../types/allegra';

// Versión del inventario - incrementar cuando se agreguen nuevos items
export const INVENTORY_VERSION = 21;

// Versión de vehículos - incrementar cuando se agreguen nuevos vehículos
export const VEHICLES_VERSION = 4;

// Versión de eventos - incrementar cuando se modifiquen eventos iniciales
export const EVENTS_VERSION = 3;

// Versión de trabajadores - incrementar cuando se modifiquen trabajadores iniciales
export const WORKERS_VERSION = 5;

// Base de datos vacía - sin datos precargados
export const INITIAL_EVENTS: Event[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_VEHICLES: Vehicle[] = [];

export const INITIAL_WORKERS: Worker[] = [];
