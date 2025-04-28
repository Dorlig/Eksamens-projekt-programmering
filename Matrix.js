import Vector from "./Vector.js";
import math from "./simulation.js";

export default class Matrix {
  // Create a array of column vectors
  constructor(xsize, ysize, columnVectors) {
    this.xsize = xsize;
    this.ysize = ysize;

    if (columnVectors !== null) {
      this.matrix = columnVectors;
    } else {
      this.matrix = [];
      for (let x = 0; x < xsize; x++) {
        this.matrix.push(
          new Vector(ysize, new Array(ysize).fill(math.complex(0)))
        );
      }
    }
  }

  // Returns the sum of this matrix and other matrix
  add(other) {
    if (other.xsize !== this.xsize || other.ysize !== this.ysize)
      throw new Error("Size of vectors does not match");

    const newColumnVectors = [];

    for (let i = 0; i < this.xsize; i++) {
      newColumnVectors.push(this.matrix[i].add(other.matrix[i]));
      // console.log(i)
    }

    return new Matrix(this.xsize, this.ysize, newColumnVectors);
  }

  // return ith column vector
  getColumnVector(i) {
    return this.matrix[i];
  }

  // return ith row vector
  getRowVector(i) {
    const vectorElements = [];

    for (let j = 0; j < this.xsize; j++)
      vectorElements.push(this.matrix[j].elements[i]);

    return new Vector(this.xsize, vectorElements);
  }

  // Returns the product of this matrix and other matrix on the left (other * this not this*other)
  product(other) {
    if (other.xsize !== this.ysize)
      throw new Error("size of two matrices does not match");

    const newColumnVectors = [];

    for (let x = 0; x < this.xsize; x++) {
      newColumnVectors.push(this.getColumnVector(x).matrixProduct(other));
    }

    return new Matrix(this.xsize, other.ysize, newColumnVectors);
  }

  // Takes array and initializes the matrix with the array down the diagonal
  initializeWithDiagonal(array) {
    if (array.length % 2 === 0) throw new Error("array length must be odd");

    for (let i = 0; i < Math.max(this.xsize, this.ysize); i++) {
      for (
        let j = -1 * Math.floor(array.length / 2);
        j < Math.ceil(array.length / 2);
        j++
      ) {
        if (j + i > -1 && j + i < this.xsize && i > -1 && i < this.ysize) {
          this.matrix[j + i].elements[i] =
            array[j + Math.floor(array.length / 2)];
        }
      }
    }
  }

  // Scale the matrix by scalar
  scale(k) {
    const newColumnVectors = [];

    for (let i = 0; i < this.xsize; i++) {
      newColumnVectors.push(this.getColumnVector(i).scale(k));
    }

    return new Matrix(this.xsize, this.ysize, newColumnVectors);
  }

  //Returns e^(kM), where M is this matrix
  exp(k) {
    console.log("scaling");
    const scaledMatrix = this.scale(k);

    const rowVetors = [];

    for (let i = 0; i < scaledMatrix.ysize; i++) {
      rowVetors.push(scaledMatrix.getRowVector(i).elements);
    }

    console.log("computing expoential");
    const expRowVectors = math.expm(rowVetors)["_data"];

    console.log("returning output");
    const newColumnVectors = [];
    for (let x = 0; x < this.xsize; x++) {
      const newVectorElements = [];
      for (let y = 0; y < this.ysize; y++) {
        newVectorElements.push(expRowVectors[y][x]);
      }
      newColumnVectors.push(new Vector(this.ysize, newVectorElements));
    }

    return new Matrix(this.xsize, this.ysize, newColumnVectors);
  }

  //Returns the inverse, M^-1, where M is this matrix
  inv() {
    const rowVetors = [];

    for (let i = 0; i < this.ysize; i++) {
      rowVetors.push(this.getRowVector(i).elements);
    }

    const expRowVectors = math.inv(rowVetors);
    console.log(expRowVectors);

    const newColumnVectors = [];
    for (let x = 0; x < this.xsize; x++) {
      const newVectorElements = [];
      for (let y = 0; y < this.ysize; y++) {
        newVectorElements.push(expRowVectors[y][x]);
      }
      newColumnVectors.push(new Vector(this.ysize, newVectorElements));
    }

    return new Matrix(this.xsize, this.ysize, newColumnVectors);
  }

//   // Quick exponential
//   expQuick(k, n) {
//     const scaledMatrix = this.scale(k);
//     let totalConstant = 1;

//     let resultMatrix = new Matrix(this.xsize, this.ysize, null);
//     resultMatrix.initializeWithDiagonal([1]);

//     let progMatrix = this.scale(k);

//     for (let i = 1; i < n; i++) {
//       totalConstant *= i;
//       // console.log(totalConstant)
//       // console.log(progMatrix.scale(1/totalConstant).toString())
//       resultMatrix = resultMatrix.add(progMatrix.scale(1 / totalConstant));
//       // console.log(resultMatrix.toString())

//       // console.log(progMatrix.toString())

//       progMatrix = progMatrix.product(scaledMatrix);

//       for (let x = 0; x < this.xsize; x++) {
//         for (let y = 0; y < this.ysize; y++) {
//           if (progMatrix.matrix[x].index(y) < 10 ** -8) {
//             progMatrix.matrix[x].elements[y] = 0;
//           }
//         }
//       }
//     }

//     return resultMatrix;
//   }

  // Turns the matrix to a string (IMPROVE!!!, translate over diagonal)
  toString() {
    let result = "";
    for (let i = 0; i < this.ysize; i++) {
      result += this.getRowVector(i) + "\n";
    }

    return result;
  }

  // Initializes the matrix as a Hamiltonian operator
  InitializeAsHamiltonian(potential, dx) {
    this.initializeWithDiagonal([1, -2, 1]);
    this.scale(-1 / (2 * dx ** 2));
    if (potential != null) {
      const potentialMatrix = new Matrix(this.xsize, this.ysize, null);
      for (let i = 0; i < this.xsize; i++) {
        potentialMatrix.matrix[i].elements[i] = potential.index(i);
      }

      this.matrix = this.add(potentialMatrix).matrix;
    }
  }
}
