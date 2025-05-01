import Matrix from "./Matrix.js";

export default class Simulator {
  constructor(wavefunction, hamiltonian, dt) {
    console.log("creating time evolution operator");
    this.hamiltonian = hamiltonian;
    this.timeEvolutionOperator = new Matrix(
      hamiltonian.xsize,
      hamiltonian.ysize,
      null
    );
    this.timeEvolutionOperator.matrix = hamiltonian.exp(math.complex(0, -1 * dt), 20).matrix;
    console.log("creating the inverse time evolution operator");
    this.inverseTimeEvolutionOperator = this.timeEvolutionOperator.inv();
    console.log("Finishing init: ");
    console.log(this.timeEvolutionOperator);
    // console.log(this.timeEvolutionOperator.toString())
    this.startWavefunction = wavefunction;
    this.wavefunction = wavefunction;
    this.time = 0; // time index, so the real time is t*dt
    this.dt = dt;
    // console.log(this.wavefunction)

    this.states = {};
  }

  // step forward in time, and return resulting wave function
  step() {
    this.wavefunction = this.wavefunction.matrixProduct(
      this.timeEvolutionOperator
    );
    this.time += 1;

    return [this.wavefunction, this.time * this.dt];
  }

  // steps back in time
  back() {
    if (this.time > 0) {
      this.wavefunction = this.wavefunction.matrixProduct(
        this.inverseTimeEvolutionOperator
      );
      this.time -= 1;

      return [this.wavefunction, this.time * this.dt];
    } else {
      // console.log("wrong time")
      return [false, this.time * this.dt];
    }
  }

  // restarts the simulation
  restart() {
    this.wavefunction = this.startWavefunction;
    this.time = 0;
  }
}
