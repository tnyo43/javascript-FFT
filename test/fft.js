"use strict"
var FFT = require("../src/fft.js")

let PI = Math.PI;
let EPS = Math.pow(10, -8);

let almost_zero = (x) => {
  return Math.abs(x) < EPS;
}

let almost = (x, actual) => {
  return Math.abs(x-actual) < EPS;
}

var assert = require('assert');
describe("初期化", function() {
  describe("指定した長さの配列を生成", function() {
    it("2を与えると長さ2の配列を生成", function() {
      let fft = new FFT(2);
      assert.equal(fft.points.length, 2);
    });
    it("最大長32を与えると長さ32の配列を生成", function() {
      let fft = new FFT(32);
      assert.equal(fft.points.length, 32);
    });
  });
  describe("サンプル点の数は2から32まで", function() {
    let ns = [1, 2, 32, 33];
    let judge = [false, true, true, false];
    for (var i = 0; i < 4; i++) {
      let fft = new FFT(ns[i]);
      assert.equal(fft.is_valid(), judge[i]);
    }
  });

  describe("基底関数を生成", function() {
    describe("基底の0番目はcos関数", function() {
      it("2個のときの和は0", function() {
        let n = 2;
        let fft = new FFT(n);
        assert.equal(almost(fft.basis[0][0], 1), true);
        let sum = 0.0;
        for (var i = 0; i < n; i++) {
          sum += fft.basis[i][0];
        }
        assert.equal(almost_zero(sum), true);
      });
      it("32個のときの和も0", function() {
        let n = 32;
        let fft = new FFT(n);
        assert.equal(almost(fft.basis[0][0], 1), true);
        let sum = 0.0;
        for (var i = 0; i < n; i++) {
          sum += fft.basis[i][0];
        }
        assert.equal(almost_zero(sum), true);
      });
    });
    describe("基底の1番目はsin関数", function() {
      it("2個のときの和は0", function() {
        let n = 2;
        let fft = new FFT(n);
        assert.equal(almost(fft.basis[0][1], 0), true);
        let sum = 0.0;
        for (var i = 0; i < n; i++) {
          sum += fft.basis[i][1];
        }
        assert.equal(almost_zero(sum), true);
      });
      it("32個のときの和も0", function() {
        let n = 32;
        let fft = new FFT(n);
        assert.equal(almost(fft.basis[0][1], 0), true);
        let sum = 0.0;
        for (var i = 0; i < n; i++) {
          sum += fft.basis[i][1];
        }
        assert.equal(almost_zero(sum), true);
      });
    });
    it("基底のノルムは1", function() {
      let n = 2;
      while (n <= 32){
        let fft = new FFT(n);
        for (var i = 0; i < n; i++) {
          let val = Math.pow(fft.basis[i][0], 2);
          val    += Math.pow(fft.basis[i][1], 2);
          assert.equal(almost(val, 1), true);
        }
        n *= 2;
      }
    });
  });
});
