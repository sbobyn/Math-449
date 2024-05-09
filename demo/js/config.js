export var BoundaryConditions;
(function (BoundaryConditions) {
    BoundaryConditions[BoundaryConditions["BOX"] = 0] = "BOX";
    BoundaryConditions[BoundaryConditions["PERIODIC"] = 1] = "PERIODIC";
})(BoundaryConditions || (BoundaryConditions = {}));
// Simulation Parameters
export class SimulationConfig {
    constructor(W = 64, H = 64, dt = 1 / 10.0, diff = 0.0001, visc = 0.0, force = 5.0, source = 100.0, density_dissipation = 0.99) {
        this.numIterations = 20;
        this.boundaryConditions = BoundaryConditions.BOX;
        this.W = W;
        this.H = H;
        this.dt = dt;
        this.diff = diff;
        this.visc = visc;
        this.force = force;
        this.source = source;
        this.density_dissipation = density_dissipation;
    }
    size() {
        return (this.W + 2) * (this.H + 2);
    }
}
export const defaultConfig = new SimulationConfig();
