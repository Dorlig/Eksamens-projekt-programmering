import Simulator from "./Simulator.js";
import Vector from "./Vector.js";
import { gaussianWavepacket } from "./Templates.js";
import Chart from "./Chart.js";
import Matrix from "./Matrix.js";

export default math;

// Information abut state of simulation
let simulation_loaded = false;
let simulation_running = false;
let simulation_dir = 1;
let latest_interval = null;
let simulation_speed = 100;
let repeat_time =
  parseFloat(document.getElementById("sim-max-time").value) || 10;
let repeat_type = 0; // 0 for loop, 1 for once, 2 for continue

// Global information about simulation
const N = parseFloat(sessionStorage.getItem("N")) || 100;
const dx = parseFloat(sessionStorage.getItem("dx")) / 10 || 1 / (N / 100);
const dt = parseFloat(sessionStorage.getItem("dt")) / 100 || 0.1;

console.log(N, dx, dt);

const axisStart = (-1 / 2) * N * dx;
const axisEnd = axisStart + (N - 1) * dx;
const axisWidth = axisEnd - axisStart;

// Initialization for drawing
const canvas = document.getElementById("sim-canvas");
const chart = new Chart(canvas, N, dx, axisStart);
const canvasContainer = document.querySelector(".sim-canvas-container");
canvasContainer.setAttribute("data-before", `t=0`);

// Initialization for simulation
const potential = new Vector(N, null);
const wavefunction = new Vector(N, null);

// Current simulation state information
let simulationWavefunction = wavefunction;
let simulationPotential = new Vector(N, null);
let hamiltonian = null;
let simulator = null;

// Parameters for this specific simulation
let sigma0 = parseFloat(
    document.getElementById("wavefunction-width").defaultValue
);
let x0 = parseFloat(
    document.getElementById("wavefunction-position").defaultValue
);
let p0 =
  parseFloat(document.getElementById("wavefunction-velocity").defaultValue) /
  -10;

let width = parseFloat(document.getElementById("potential-width").defaultValue);
let displacement = parseFloat(
  document.getElementById("potential-position").defaultValue
);
let energy = parseFloat(
  document.getElementById("potential-energy").defaultValue
);

// Loads simulation and starts simulation from current info
function load_simulation() {
  simulationPotential.elements = potential.elements.slice();
  hamiltonian = new Matrix(N, N, null);
  hamiltonian.InitializeAsHamiltonian(potential, dx);
  simulator = new Simulator(wavefunction, hamiltonian, dt);
}

// Starts and returns an interval that runs the simulation
function start_simulation(dir, speed) {
  return setInterval(() => {
    let t;

    if (dir == 1) {
      [simulationWavefunction, t] = simulator.step();
    } else if (dir == -1) {
      let temp;
      [temp, t] = simulator.back();
      if (temp != false) {
        simulationWavefunction = temp;
      }
    }

    // console.log(newWavefunction.probabilityDensity())
    canvasContainer.setAttribute("data-before", `t=${Math.round(t*100)/100}`);
    console.log(t, (repeat_time));
    if (t >= (repeat_time)) {
      switch (repeat_type) {
        case 0:
          simulator.restart();
          canvasContainer.setAttribute("data-before", `t=0`);
          break;
        case 1:
          simulator.restart();
          clearInterval(latest_interval);
          simulation_running = false;
          break;
        default:
          break;
      }
    }

    draw_simulation(simulationPotential);
  }, speed);
}

function draw_simulation(pot) {
  const pointsProbability = simulationWavefunction
    .probabilityDensity()
    .elements.map((v) => v.re);
  const pointsPotential = pot.scale(1 / 20).elements;
  const pointsReal = simulationWavefunction.elements.map((v) => v.re);

  // console.log(pointsProbability)
  // console.log(pot)
  // console.log(pointsPotential)
  // console.log(pointsReal)

  chart.clear();
  chart.draw(pointsPotential, "red", 2);
  chart.draw(pointsReal, "blue", 2);
  chart.draw(pointsProbability, "black", 3);
}

// Update starting preview from information and draw to canvas
function update_info() {
  wavefunction.initializeVectorElementsFromFunction(
    (x) => {
      return gaussianWavepacket(x, x0, sigma0, p0);
    },
    axisStart,
    dx
  );

  let potential_function = (x) => 0;

  switch (document.getElementById("sim-potential").value) {
    case "constant":
      potential_function = (x) => {
        return energy;
      };
      break;
    case "step":
      potential_function = (x) => {
        return x < 0 ? 0 : energy;
      };
      break;
    case "well":
      potential_function = (x) => {
        return x < -width || x > width ? energy : 0;
      };
      break;
    case "barrier":
      potential_function = (x) => {
        return x < -width || x > width ? 0 : energy;
      };
      break;
    case "harmonic":
      potential_function = (x) => {
        return ((x / width) ** 2 / 2) * energy;
      };
      break;
    default:
      break;
  }

  potential.initializeVectorElementsFromFunction(
    potential_function,
    axisStart - displacement,
    dx
  );

  if (simulation_loaded) {
    draw_simulation(simulationPotential);
  } else {
    draw_simulation(potential);
  }
}

// Handle updates to time information
document.getElementById("sim-max-time").addEventListener("input", (e) => {
  repeat_time = parseFloat(e.target.value) || parseFloat(e.target.defaultValue);
});
document.getElementById("sim-time-boundary").addEventListener("input", () => {
  switch (document.getElementById("sim-time-boundary").value) {
    case "loop":
      repeat_type = 0;
      break;
    case "once":
      repeat_type = 1;
      break;
    case "continue":
      repeat_type = 2;
      break;
    default:
      break;
  }
});

// Handle buttons for playing information
document.getElementById("sim-start-btn").addEventListener("click", () => {
  if (!simulation_loaded) {
    load_simulation();
    latest_interval = start_simulation(1, simulation_speed);
    simulation_loaded = true;
    simulation_dir = 1;
    simulation_running = true;
    document.getElementById("sim-start-btn").innerText = "Stop Simulation";
  } else {
    clearInterval(latest_interval);
    simulation_loaded = false;
    simulation_running = false;
    document.getElementById("sim-start-btn").innerText = "Start Simulation";
    update_info();
    latest_interval = null;
  }
});
document.getElementById("sim-restart-btn").addEventListener("click", () => {
  simulator.restart();
  simulationWavefunction = wavefunction;
  canvasContainer.setAttribute("data-before", `t=0`);
  update_info();
});

document.getElementById("playing-pause-btn").addEventListener("click", () => {
  if (!simulation_running) return;
  clearInterval(latest_interval);
  simulation_running = false;
});

document.getElementById("playing-back-btn").addEventListener("click", () => {
  if (!simulation_loaded) return;
  if (simulation_dir == 1 || !simulation_running) {
    clearInterval(latest_interval);
    simulation_dir = -1;
    latest_interval = start_simulation(simulation_dir, simulation_speed);
    simulation_running = true;
  }
});
document.getElementById("playing-forward-btn").addEventListener("click", () => {
  if (!simulation_loaded) return;
  if (simulation_dir == -1 || !simulation_running) {
    clearInterval(latest_interval);
    simulation_dir = 1;
    latest_interval = start_simulation(simulation_dir, simulation_speed);
    simulation_running = true;
  }
});

document
  .getElementById("playing-step-back-btn")
  .addEventListener("click", () => {
    if (!simulation_loaded) return;
    simulationWavefunction = simulator.back()[0];

    draw_simulation(simulationPotential);
  });
document
  .getElementById("playing-step-forward-btn")
  .addEventListener("click", () => {
    if (!simulation_loaded) return;
    simulationWavefunction = simulator.step()[0];

    draw_simulation(simulationPotential);
  });

document
  .getElementById("playing-speed-down-btn")
  .addEventListener("click", () => {
    simulation_speed *= 1.5;
    if (!simulation_loaded) return;
    if (simulation_running) {
      clearInterval(latest_interval);
      latest_interval = start_simulation(simulation_dir, simulation_speed);
      simulation_running = true;
    }
  });
document
  .getElementById("playing-speed-up-btn")
  .addEventListener("click", () => {
    simulation_speed /= 1.5;
    if (!simulation_loaded) return;
    if (simulation_running) {
      clearInterval(latest_interval);
      latest_interval = start_simulation(simulation_dir, simulation_speed);
      simulation_running = true;
    }
  });


// Handle updating wavefunction information
document.getElementById("wavefunction-width").addEventListener("input", (e) => {
  sigma0 = parseFloat(e.target.value) || parseFloat(e.target.defaultValue);
  // console.log(sigma0)
  update_info();
});
document
  .getElementById("wavefunction-position")
  .addEventListener("input", (e) => {
    x0 = parseFloat(e.target.value) || parseFloat(e.target.defaultValue);
    console.log(x0);
    update_info();
  });
document
  .getElementById("wavefunction-velocity")
  .addEventListener("input", (e) => {
    p0 =
      (parseFloat(e.target.value) || parseFloat(e.target.defaultValue)) / -10;
    // console.log(sigma0)
    update_info();
  });

// Handle updating potential information
document.getElementById("sim-potential").addEventListener("input", () => {
  update_info();
});

document.getElementById("potential-width").addEventListener("input", (e) => {
  width = parseFloat(e.target.value) || parseFloat(e.target.defaultValue);
  // console.log(sigma0)
  update_info();
});
document.getElementById("potential-position").addEventListener("input", (e) => {
  displacement =
    parseFloat(e.target.value) || parseFloat(e.target.defaultValue);
  console.log(displacement);
  // console.log(sigma0)
  update_info();
});
document.getElementById("potential-energy").addEventListener("input", (e) => {
  energy = parseFloat(e.target.value) || parseFloat(e.target.defaultValue);
  // console.log(sigma0)
  update_info();
});

const elements = document.getElementsByTagName("input");

for (let i = 0; i < elements.length; i++) {
  elements[i].addEventListener("input", (e) => {
    // console.log(e)
    const min = parseFloat(e.target.min);
    const max = parseFloat(e.target.max);
    const val = e.target.value;

    if (parseFloat(val) < min) {
      e.target.value = min;
      e.target.dispatchEvent(new Event("input"));
    }
    if (parseFloat(val) > max) {
      e.target.value = max;
      e.target.dispatchEvent(new Event("input"));
    }
  });
}

update_info();
simulationPotential.initializeVectorElementsFromFunction(
  (x) => 1,
  axisStart - displacement,
  dx
);
