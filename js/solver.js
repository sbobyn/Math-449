import { BoundaryConditions } from "./config.js";
import { ix, forEachCell } from "./utils.js";
var ArrayType;
(function (ArrayType) {
    ArrayType[ArrayType["DENS"] = 0] = "DENS";
    ArrayType[ArrayType["U"] = 1] = "U";
    ArrayType[ArrayType["V"] = 2] = "V";
})(ArrayType || (ArrayType = {}));
export class FluidSolver {
    constructor(config) {
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
        this.obstacle = new Float32Array(config.size());
        this.config = config;
    }
    setObstacle(obstacle) {
        this.obstacle.fill(0);
        for (let i = 0; i < this.config.W; i++) {
            for (let j = 0; j < this.config.H; j++) {
                const d2 = Math.pow((i - obstacle.x), 2) + Math.pow((j - obstacle.y), 2);
                if (d2 < Math.pow((obstacle.radius + 1), 2))
                    this.obstacle[ix(i, j, this.config)] = 1;
            }
        }
    }
    swap(x0, x) {
        this.tmp.set(x0);
        x0.set(x);
        x.set(this.tmp);
    }
    addSource(x, s) {
        for (let i = 0; i < this.config.size(); i++)
            x[i] += this.config.dt * s[i];
    }
    // Dirichlet for density (b == 0)
    // Neumann for vertical velocity (b ArrayType.I)
    // Neumann for horizontal velocity (b == ArrayType.V)
    setBoundariesBox(type, x) {
        const W = this.config.W;
        const H = this.config.H;
        // horizontal bnds
        for (let i = 1; i <= W; i++) {
            x[ix(i, 0, this.config)] =
                type == ArrayType.V
                    ? -x[ix(i, 1, this.config)]
                    : x[ix(i, 1, this.config)];
            x[ix(i, H + 1, this.config)] =
                type == ArrayType.V
                    ? -x[ix(i, H, this.config)]
                    : x[ix(i, H, this.config)];
        }
        // vertical bnds
        for (let j = 1; j <= H; j++) {
            x[ix(0, j, this.config)] =
                type == ArrayType.U
                    ? -x[ix(1, j, this.config)]
                    : x[ix(1, j, this.config)];
            x[ix(W + 1, j, this.config)] =
                type == ArrayType.U
                    ? -x[ix(W, j, this.config)]
                    : x[ix(W, j, this.config)];
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
    setBoundariesPeriodic(x) {
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
    setBoundariesWindTunnel(b, x) {
        const W = this.config.W;
        const H = this.config.H;
        // box BCs for top and bottom bounds
        for (let i = 1; i <= W; i++) {
            x[ix(i, 0, this.config)] =
                b == ArrayType.V ? -x[ix(i, 1, this.config)] : x[ix(i, 1, this.config)];
            x[ix(i, H + 1, this.config)] =
                b == ArrayType.V ? -x[ix(i, H, this.config)] : x[ix(i, H, this.config)];
        }
        // inflow BCs
        if (b == ArrayType.U) {
            for (let j = 1; j <= H; j++) {
                x[ix(0, j, this.config)] = this.config.inflowVelocity;
            }
        }
        // outflow BCs
        for (let i = 1; i <= W; i++) {
            x[ix(i, H + 1, this.config)] = x[ix(i, H, this.config)];
        }
    }
    setBoundariesObstacle(x) {
        for (let i = 0; i < this.config.W; i++) {
            for (let j = 0; j < this.config.H; j++) {
                if (this.obstacle[ix(i, j, this.config)] == 1) {
                    x[ix(i, j, this.config)] = 0;
                }
            }
        }
    }
    setBoundaries(b, x) {
        switch (this.config.boundaryConditions) {
            case BoundaryConditions.BOX:
                this.setBoundariesBox(b, x);
                break;
            case BoundaryConditions.PERIODIC:
                this.setBoundariesPeriodic(x);
                break;
            case BoundaryConditions.WINDTUNNEL:
                this.setBoundariesWindTunnel(b, x);
                this.setBoundariesObstacle(x);
                break;
        }
    }
    linSolve(b, x, x0, a, c) {
        for (let k = 0; k < this.config.numIterations; k++) {
            forEachCell(this.config, (i, j) => {
                if (!(this.obstacle[ix(i, j, this.config)] == 1)) {
                    x[ix(i, j, this.config)] =
                        (x0[ix(i, j, this.config)] +
                            a *
                                (x[ix(i - 1, j, this.config)] +
                                    x[ix(i + 1, j, this.config)] +
                                    x[ix(i, j - 1, this.config)] +
                                    x[ix(i, j + 1, this.config)])) /
                            c;
                }
            });
            this.setBoundaries(b, x);
        }
    }
    diffuse(b, x, x0) {
        let a = this.config.dt * this.config.diff * this.config.W * this.config.H;
        this.linSolve(b, x, x0, a, 1 + 4 * a);
    }
    advect(b, d, d0, u, v) {
        let i0, j0, i1, j1;
        let x, y, s0, t0, s1, t1, dth;
        dth = this.config.dt * this.config.H;
        forEachCell(this.config, (i, j) => {
            x = i - dth * u[ix(i, j, this.config)];
            y = j - dth * v[ix(i, j, this.config)];
            if (x < 0.5)
                x = 0.5;
            if (x > this.config.W + 0.5)
                x = this.config.W + 0.5;
            i0 = Math.floor(x);
            i1 = i0 + 1;
            if (y < 0.5)
                y = 0.5;
            if (y > this.config.H + 0.5)
                y = this.config.H + 0.5;
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
    project(u, v, p, div) {
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
    densStep(x, x0) {
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
