import { SimulationConfig } from "./config.js";

export function ix(i: number, j: number, config: SimulationConfig): number {
  return i + (config.N + 2) * j;
}

export function forEachCell(
  config: SimulationConfig,
  action: (i: number, j: number) => void
): void {
  for (let i = 1; i <= config.N; i++) {
    for (let j = 1; j <= config.N; j++) {
      action(i, j);
    }
  }
}

let lastFPSValues = new Float32Array(60);
let numFPSValues = 0;
export let avgFPS = 0;

export function updateAvgFPS(currFPS: number) {
  if (numFPSValues < 60) {
    lastFPSValues[numFPSValues++] = currFPS;
  } else {
    numFPSValues = 0;
    avgFPS = lastFPSValues.reduce((acc, curr) => acc + curr, 0) / 60;
  }
}

export function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
