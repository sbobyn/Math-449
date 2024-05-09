import { BoundaryConditions, SimulationConfig } from "./config.js";
import { ix, forEachCell } from "./utils.js";

enum ArrayType {
  DENS = 0,
  U = 1,
  V = 2,
}

export class FluidSolver {
  u: Float32Array;
  v: Float32Array;
  u_prev: Float32Array;
  v_prev: Float32Array;
  r_dens: Float32Array;
  r_dens_prev: Float32Array;
  g_dens: Float32Array;
  g_dens_prev: Float32Array;
  b_dens: Float32Array;
  b_dens_prev: Float32Array;
  tmp: Float32Array;
  config: SimulationConfig;

  constructor(config: SimulationConfig) {
    this.u = new Float32Array(config.size());
    this.v = new Float32Array(config.size());
    this.u_prev = new Float32Array(config.size());
    this.v_prev = new Float32Array(config.size());
    this.r_dens = new Float32Array(config.size());
    this.r_dens_prev = new Float32Array(config.size());
    this.g_dens = new Float32Array(config.size());
    this.g_dens_prev = new Float32Array(config.size());
    this.b_dens = new Float32Array(config.size());
    this.b_dens_prev = new Float32Array(config.size());
    this.tmp = new Float32Array(config.size());
    this.config = config;
  }

  private swap(x0: Float32Array, x: Float32Array) {
    this.tmp.set(x0);
    x0.set(x);
    x.set(this.tmp);
  }

  private addSource(x: Float32Array, s: Float32Array) {
    for (let i = 0; i < this.config.size(); i++) x[i] += this.config.dt * s[i];
  }

  // Dirichlet for density (b == 0)
  // Neumann for vertical velocity (b == 1)
  // Neumann for horizontal velocity (b == 2)
  private setBoundariesBox(type: ArrayType, x: Float32Array) {
    const W = this.config.W;
    const H = this.config.H;

    // horizontal bnds
    for (let i = 1; i <= W; i++) {
      x[ix(i, 0, this.config)] =
        type == 2 ? -x[ix(i, 1, this.config)] : x[ix(i, 1, this.config)];
      x[ix(i, H + 1, this.config)] =
        type == 2 ? -x[ix(i, H, this.config)] : x[ix(i, H, this.config)];
    }
    // vertical bnds
    for (let j = 1; j <= H; j++) {
      x[ix(0, j, this.config)] =
        type == 1 ? -x[ix(1, j, this.config)] : x[ix(1, j, this.config)];
      x[ix(W + 1, j, this.config)] =
        type == 1 ? -x[ix(W, j, this.config)] : x[ix(W, j, this.config)];
    }
    // corners
    x[ix(0, 0, this.config)] =
      0.5 * (x[ix(1, 0, this.config)] + x[ix(0, 1, this.config)]);
    x[ix(0, H + 1, this.config)] =
      0.5 * (x[ix(1, H + 1, this.config)] + x[ix(0, H, this.config)]);
    x[ix(W + 1, 0, this.config)] =
      0.5 * (x[ix(W, 0, this.config)] + x[ix(W + 1, 1, this.config)]);
    x[ix(W + 1, H + 1, this.config)] =
      0.5 * (x[ix(W, H + 1, this.config)] + x[ix(W + 1, H, this.config)]);
  }

  private setBoundariesPeriodic(x: Float32Array) {
    const W = this.config.W;
    const H = this.config.H;

    // Connect horizontal edges
    for (let i = 1; i <= W; i++) {
      x[ix(i, 0, this.config)] = x[ix(i, H, this.config)]; // Bottom to top
      x[ix(i, H + 1, this.config)] = x[ix(i, 1, this.config)]; // Top to bottom
    }

    // Connect vertical edges
    for (let j = 1; j <= H; j++) {
      x[ix(0, j, this.config)] = x[ix(W, j, this.config)]; // Left to right
      x[ix(W + 1, j, this.config)] = x[ix(1, j, this.config)]; // Right to left
    }

    // Connect corners
    x[ix(0, 0, this.config)] = x[ix(W, H, this.config)];
    x[ix(0, H + 1, this.config)] = x[ix(W, 1, this.config)];
    x[ix(W + 1, 0, this.config)] = x[ix(1, H, this.config)];
    x[ix(W + 1, H + 1, this.config)] = x[ix(1, 1, this.config)];
  }

  private setBoundaries(b: ArrayType, x: Float32Array) {
    switch (this.config.boundaryConditions) {
      case BoundaryConditions.BOX:
        this.setBoundariesBox(b, x);
        break;
      case BoundaryConditions.PERIODIC:
        this.setBoundariesPeriodic(x);
        break;
    }
  }

  private linSolve(
    b: ArrayType,
    x: Float32Array,
    x0: Float32Array,
    a: number,
    c: number
  ) {
    for (let k = 0; k < this.config.numIterations; k++) {
      forEachCell(this.config, (i, j) => {
        x[ix(i, j, this.config)] =
          (x0[ix(i, j, this.config)] +
            a *
              (x[ix(i - 1, j, this.config)] +
                x[ix(i + 1, j, this.config)] +
                x[ix(i, j - 1, this.config)] +
                x[ix(i, j + 1, this.config)])) /
          c;
      });
      this.setBoundaries(b, x);
    }
  }

  private diffuse(b: ArrayType, x: Float32Array, x0: Float32Array) {
    let a = this.config.dt * this.config.diff * this.config.W * this.config.H;
    this.linSolve(b, x, x0, a, 1 + 4 * a);
  }

  private advect(
    b: ArrayType,
    d: Float32Array,
    d0: Float32Array,
    u: Float32Array,
    v: Float32Array
  ) {
    let i0: number, j0: number, i1: number, j1: number;
    let x: number,
      y: number,
      s0: number,
      t0: number,
      s1: number,
      t1: number,
      dth;

    dth = this.config.dt * this.config.H;

    forEachCell(this.config, (i, j) => {
      x = i - dth * u[ix(i, j, this.config)];
      y = j - dth * v[ix(i, j, this.config)];
      if (x < 0.5) x = 0.5;
      if (x > this.config.W + 0.5) x = this.config.W + 0.5;
      i0 = Math.floor(x);
      i1 = i0 + 1;
      if (y < 0.5) y = 0.5;
      if (y > this.config.H + 0.5) y = this.config.H + 0.5;
      j0 = Math.floor(y);
      j1 = j0 + 1;
      s1 = x - i0;
      s0 = 1 - s1;
      t1 = y - j0;
      t0 = 1 - t1;
      d[ix(i, j, this.config)] =
        s0 *
          (t0 * d0[ix(i0, j0, this.config)] +
            t1 * d0[ix(i0, j1, this.config)]) +
        s1 *
          (t0 * d0[ix(i1, j0, this.config)] + t1 * d0[ix(i1, j1, this.config)]);
    });
    this.setBoundaries(b, d);
  }

  private project(
    u: Float32Array,
    v: Float32Array,
    p: Float32Array,
    div: Float32Array
  ) {
    const h = 1 / this.config.H;

    forEachCell(this.config, (i, j) => {
      div[ix(i, j, this.config)] =
        -0.5 *
        h *
        (u[ix(i + 1, j, this.config)] -
          u[ix(i - 1, j, this.config)] +
          (v[ix(i, j + 1, this.config)] - v[ix(i, j - 1, this.config)]));
      p[ix(i, j, this.config)] = 0;
    });
    this.setBoundaries(ArrayType.DENS, div);
    this.setBoundaries(ArrayType.DENS, p);

    this.linSolve(ArrayType.DENS, p, div, 1, 4);

    forEachCell(this.config, (i, j) => {
      u[ix(i, j, this.config)] -=
        0.5 *
        this.config.W *
        (p[ix(i + 1, j, this.config)] - p[ix(i - 1, j, this.config)]);
      v[ix(i, j, this.config)] -=
        0.5 *
        this.config.H *
        (p[ix(i, j + 1, this.config)] - p[ix(i, j - 1, this.config)]);
    });
    this.setBoundaries(ArrayType.U, u);
    this.setBoundaries(ArrayType.V, v);
  }

  private densStep(x: Float32Array, x0: Float32Array) {
    this.addSource(x, x0);
    this.swap(x0, x);
    this.diffuse(ArrayType.DENS, x, x0);
    this.swap(x0, x);
    this.advect(ArrayType.DENS, x, x0, this.u, this.v);
    x.map((_, i) => (x[i] *= this.config.density_dissipation));
  }

  densSteps() {
    this.densStep(this.r_dens, this.r_dens_prev);
    this.densStep(this.g_dens, this.g_dens_prev);
    this.densStep(this.b_dens, this.b_dens_prev);
  }

  velStep() {
    this.addSource(this.u, this.u_prev);
    this.addSource(this.v, this.v_prev);
    this.swap(this.u_prev, this.u);
    this.diffuse(ArrayType.U, this.u, this.u_prev);
    this.swap(this.v_prev, this.v);
    this.diffuse(ArrayType.V, this.v, this.v_prev);
    this.project(this.u, this.v, this.u_prev, this.v_prev);
    this.swap(this.u_prev, this.u);
    this.swap(this.v_prev, this.v);
    this.advect(ArrayType.U, this.u, this.u_prev, this.u_prev, this.v_prev);
    this.advect(ArrayType.V, this.v, this.v_prev, this.u_prev, this.v_prev);
    this.project(this.u, this.v, this.u_prev, this.v_prev);
  }
}
