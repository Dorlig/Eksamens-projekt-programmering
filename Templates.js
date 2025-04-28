import math from "./simulation.js";

export function gaussianWavepacket(x, x0, sigma0, p0) {
  const A = (2 * Math.PI * sigma0 ** 2) ** -0.25;
  return math.multiply(
    A,
    math.exp(
      math.add(
        math.complex(0, p0 * x),
        math.complex(-1 * ((x - x0) / (2 * sigma0)) ** 2)
      )
    )
  );
}
