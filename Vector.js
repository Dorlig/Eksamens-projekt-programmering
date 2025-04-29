import math from "./simulation.js";

export default class Vector {
  // Construct vector as array using properties
  constructor(size, elements) {
    if (elements !== null) {
      this.elements = elements;
    } else {
      this.elements = [];
      for (let i = 0; i < size; i++) {
        this.elements.push(math.complex(0));
      }
    }
    this.size = size;
  }

  // Returns the sum of this vector and other vector as new vector
  add(other) {
    if (other.size !== this.size)
      throw new Error("Size of vectors does not match");

    const newVectorElements = [];

    for (let i = 0; i < this.size; i++) {
      newVectorElements.push(math.add(this.elements[i], other.elements[i]));
    }

    return new Vector(this.size, newVectorElements);
  }

  // Return new vector giving the probability distribution
  probabilityDensity() {
    return new Vector(
      this.size,
      this.elements.map((v) => math.multiply(math.conj(v), v))
    );
  }

  // Returns the dot product of this vector and other vector
  dotProduct(other) {
    if (other.size !== this.size)
      throw new Error("Size of vectors does not match");

    let result = math.complex(0);
    for (let i = 0; i < this.size; i++) {
      result = math.add(
        result,
        math.multiply(this.elements[i], other.elements[i])
      );
    }

    return result;
  }

  // Scales the vector by number
  scale(k) {
    return new Vector(
      this.size,
      this.elements.map((v) => math.multiply(k, v))
    );
  }

  // returns the result of multiplying the vector by a matrix M
  matrixProduct(M) {
    if (M.xsize !== this.size)
      throw new Error("Size of vector and matrix does not match");

    const newVectorElements = [];

    for (let i = 0; i < M.ysize; i++) {
      newVectorElements.push(this.dotProduct(M.getRowVector(i)));
    }

    return new Vector(newVectorElements.length, newVectorElements);
  }

  // Returns the ith element in the vector
  index(i) {
    return this.elements[i];
  }

  // Initialize the vector with linearly spaced values
  initializeLinearVector(start, step) {
    for (let i = 0; i < this.size; i++) {
      this.elements[i] = math.add(start, math.multiply(i, step));
    }
  }

  // Takes a function and uses it to initialize the corresponding vector
  initializeVectorElementsFromFunction(func, start, step) {
    for (let i = 0; i < this.size; i++) {
      // console.log(math.add(start, math.multiply(i, step)))
      this.elements[i] = func(math.add(start, math.multiply(i, step)));
    }
  }

  // returns the vector elements as a string
  toString() {
    return this.elements.toString();
  }
}
