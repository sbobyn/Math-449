// Simulation Parameters
export class SimulationConfig {
  W: number;
  H: number;
  dt: number;
  diff: number;
  visc: number;
  force: number;
  source: number;

  constructor(
    W: number = 64,
    H: number = 64,
    dt: number = 1 / 10.0,
    diff: number = 0.0001,
    visc: number = 0.0,
    force: number = 5.0,
    source: number = 100.0
  ) {
    this.W = W;
    this.H = H;
    this.dt = dt;
    this.diff = diff;
    this.visc = visc;
    this.force = force;
    this.source = source;
  }

  size(): number {
    return (this.W + 2) * (this.H + 2);
  }
}

export const defaultConfig = new SimulationConfig();
