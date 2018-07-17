"use strict"

let PI = Math.PI;
let EPS = Math.pow(10, -8);

class FFT {
  constructor(N) {
    this.N = N;
  }

  init() {
    let N = this.N;
    this.valid = N >= 2 && N <= 32
    if (this.valid) {
      this.points = [];
      this.basis = [];

      // FFT : f = matrixinv . x
      // IFFT: x = matrix . f
      this.matrix = [];
      this.matrix_inv = [];

      for (var i = 0; i < N; i++) {
        let base = [];
        let angle = 2.0*PI/N*i;
        base.push(Math.cos(angle));
        base.push(Math.sin(angle));
        this.basis.push(base);
        this.points.push(null);
      }

      for (var j = 0; j < N; j++) {
        let l1 = [];
        let l2 = [];
        for (var i = 0; i < N; i++) {
          let pair = this.basis[(i*j)%N].concat();
          l1.push(pair);
          pair = this.basis[(N*N-i*j)%N].concat();
          l2.push(pair);

        }
        this.matrix.push(l1);
        this.matrix_inv.push(l2);
      }
    }
    this.spectrum = null;
    this.result = null;
  }

  is_valid() {
    return this.valid;
  }

  put(index, x) {
    this.points[index] = x;
  }

  is_ready() {
    for (var i = 0; i < this.N; i++)
      if (this.points[i] == null) return false;
    return true;
  }

  fft() {
    if (!this.is_ready()) return false;
    let N = this.N;
    this.spectrum = []
    for (var i = 0; i < N; i++) {
      let x = [0.0, 0.0];
      for (var j = 0; j < N; j++) {
        for (var k = 0; k < 2; k++) {
          x[k] += this.matrix_inv[i][j][k]*this.points[j]/N;
        }
      }
      this.spectrum.push(x);
    }
    return true;
  }

  ifft() {
    if (this.spectrum == null) return false;
    // ifft

    return true;
  }

  set N (n) {
    this._N = n;
    this.init();
  }

  get N () {
    return this._N;
  } 
}

module.exports = FFT
