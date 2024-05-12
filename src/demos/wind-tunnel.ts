import { BoundaryConditions, SimulationConfig } from "../config.js";
import { Obstacle } from "../obstacle.js";
import {
  clearCanvas,
  drawFPS,
  drawObstacle,
  draw_density,
  initRenderSettings,
} from "../render-utils.js";
import { FluidSolver } from "../solver.js";
import { avgFPS, ix, updateAvgFPS } from "../utils.js";

const numIterSlider = document.getElementById(
  "numIterations"
) as HTMLInputElement;
const numIterSpan = document.getElementById(
  "numIterationsValue"
) as HTMLSpanElement;

numIterSlider.oninput = function () {
  simconfig.numIterations = parseInt(numIterSlider.value);
  numIterSpan.textContent = numIterSlider.value;
};

// global vars
let prevTime: number;
let simconfig: SimulationConfig;
let solver: FluidSolver;
const canvas = <HTMLCanvasElement>document.getElementById("canvas");
let obstacle: Obstacle;

let isDragging = false;
let lastX: number;
let lastY: number;

function updateObstacle(dx: number, dy: number) {
  obstacle.move(dx, dy);
  solver.setObstacle(obstacle);
}

canvas.addEventListener("mousedown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) / 8;
  const y = (e.clientY - rect.top) / 8;
  if (obstacle.contains(x, y)) {
    isDragging = true;
    lastX = x;
    lastY = y;
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / 8;
    const y = (e.clientY - rect.top) / 8;
    const dx = x - lastX;
    const dy = y - lastY;
    updateObstacle(dx, dy);
    lastX = x;
    lastY = y;
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseout", () => {
  isDragging = false;
});

canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault(); // Prevents default touch behavior like scrolling
    const touch = e.touches[0]; // Get the first touch
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / 8;
    const y = (touch.clientY - rect.top) / 8;
    if (obstacle.contains(x, y)) {
      isDragging = true;
      lastX = x;
      lastY = y;
    }
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    if (isDragging) {
      e.preventDefault();
      const touch = e.touches[0]; // Get the first touch
      const rect = canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / 8;
      const y = (touch.clientY - rect.top) / 8;
      const dx = x - lastX;
      const dy = y - lastY;
      updateObstacle(dx, dy);
      lastX = x;
      lastY = y;
    }
  },
  { passive: false }
);

canvas.addEventListener("touchend", () => {
  isDragging = false;
});

canvas.addEventListener("touchcancel", () => {
  isDragging = false;
});

function draw() {
  clearCanvas();
  draw_density();
  drawObstacle(obstacle);
  drawFPS(avgFPS);
}

function setInflow() {
  // set velocity inflow
  for (let i = 1; i < simconfig.H - 1; i++) {
    solver.u_prev[ix(0, i, simconfig)] = simconfig.inflowVelocity;
  }
  // set inflow density
  const start = 12;
  for (let i = start; i < simconfig.H - start - 1; i++) {
    solver.r_dens_prev[ix(0, i, simconfig)] = simconfig.source;
    i += 2;
    solver.g_dens_prev[ix(0, i, simconfig)] = simconfig.source;
    i += 2;
    solver.b_dens_prev[ix(0, i, simconfig)] = simconfig.source;
    i += 4;
  }
}

function step() {
  solver.u_prev.fill(0);
  solver.v_prev.fill(0);
  solver.r_dens_prev.fill(0);
  solver.g_dens_prev.fill(0);
  solver.b_dens_prev.fill(0);

  setInflow();

  solver.velStep();
  solver.densSteps();
}

function run(now: number) {
  const deltaTime = (now - prevTime) / 1000;
  prevTime = now;
  updateAvgFPS(1 / deltaTime);
  step();
  draw();
  requestAnimationFrame(run);
}

export function main() {
  prevTime = performance.now();

  // init simulator
  simconfig = new SimulationConfig(128, 64);
  simconfig.boundaryConditions = BoundaryConditions.WINDTUNNEL;
  simconfig.density_dissipation = 1.0;
  simconfig.inflowVelocity = 0.004;
  simconfig.source = 3.0;

  // call input handlers to init values
  numIterSlider.dispatchEvent(new Event("input"));

  obstacle = new Obstacle(16, 32, 4);
  solver = new FluidSolver(simconfig);
  solver.setObstacle(obstacle);

  // init canvas
  initRenderSettings(canvas, solver);

  // begin sim
  run(performance.now());
}
