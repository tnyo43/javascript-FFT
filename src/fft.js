"use strict"

let PI = Math.PI;
let EPS = Math.pow(10, -8);

class FFT {
  constructor(N) {
    this.N = N;
    this.init();
  }

  init() {
    this.valid = this.N >= 2 && this.N <= 32
    if (this.valid) {
      this.points = [];
      this.basis = [];
      for (var i = 0; i < this.N; i++) {
        let base = [];
        let angle = 2.0*PI/this.N*i;
        base.push(Math.cos(angle));
        base.push(Math.sin(angle));
        this.basis.push(base);
        this.points.push(0);
      }
    }
  }

  is_valid() {
    return this.valid;
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
