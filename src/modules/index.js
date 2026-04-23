import routeAtlas from "./routeAtlas.js";

// Single-module dispatcher. Shape kept so future modules slot in without
// touching the controller. To add a module: import it, add to MODULE_LIST.
const MODULE_LIST = [routeAtlas];

export const MODULES = Object.fromEntries(MODULE_LIST.map((m) => [m.type, m]));
export const MODULE_TYPES = MODULE_LIST.map((m) => m.type);

export function getModule(type) {
  return MODULES[type] ?? null;
}
