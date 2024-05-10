export function ix(i, j, config) {
    return i + (config.W + 2) * j;
}
export function forEachCell(config, action) {
    for (let i = 1; i <= config.W; i++) {
        for (let j = 1; j <= config.H; j++) {
            action(i, j);
        }
    }
}
let lastFPSValues = new Float32Array(60);
let numFPSValues = 0;
export let avgFPS = 0;
export function updateAvgFPS(currFPS) {
    if (numFPSValues < 60) {
        lastFPSValues[numFPSValues++] = currFPS;
    }
    else {
        numFPSValues = 0;
        avgFPS = lastFPSValues.reduce((acc, curr) => acc + curr, 0) / 60;
    }
}
export function clamp01(x) {
    return Math.min(1, Math.max(0, x));
}
