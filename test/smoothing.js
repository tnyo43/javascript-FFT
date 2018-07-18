"use strict"
var assert = require("assert");
var Smoothing = require("../src/smoothing.js");

const PI = Math.PI;
const EPS = Math.pow(10, -8);

let almost_zero = (x) => {
  return Math.abs(x) < EPS;
}

let almost = (x, actual) => {
  return Math.abs(x-actual) < EPS;
}

describe("Smoothing", function() {
  describe("初期化", function() {
    describe("先の後の方と、後の先の方が被る", function() {
      let N = 0;
      let smoothing = null;

      beforeEach(() => {
        N = 32;
        smoothing = new Smoothing(N);
      });

      it("FFTの点が32点なら8点被る", function() {
        let N_POINT = N*2-N/4|0;
        let points = [];

        for (var i = 0; i < N_POINT; i++) smoothing.put(i);
        let fst = smoothing.ffts[0];
        let snd = smoothing.ffts[1];
        for (var i = 0; i < N/4|0; i++) {
          assert.equal(fst[N-N/4|0+i], snd[i]);
        }
      });
      it("宣言したときのFFTは1つだけ", function() {
        assert.equal(smoothing.ffts.length, 1);
      });
      it("FFTの最後の要素とlatest_fftは同一", function() {
        // 宣言したときは配列の唯一の要素
        assert.ok(smoothing.ffts[0] === smoothing.latest_fft);

        for (var i = 0; i < N * 10; i++) smoothing.put(i%10);
        let l = smoothing.ffts.length;

        // 常に最後の要素と同一で、それ以外とは異なる
        assert.ok(smoothing.ffts[l-1] === smoothing.latest_fft);
        assert.ok(smoothing.ffts[l-2] !== smoothing.latest_fft);
      });
    });
  });
  describe("FFT", function() {
    it("入力後、最後のFFT以外は実行可能", function() {  
      let N = 32;
      let smoothing = new Smoothing(N);

      for (var i = 0; i < N; i++) {
        smoothing.put(1);
      }

      for (var i = 0; i < smoothing.ffts.length-1; i++) {
        assert.ok(smoothing.ffts[i].is_ready());
      }
    });
    describe("入力全体をFFTして出力する", function() {
      let N = 0;
      let smoothing = null;

      beforeEach(() => {
        N = 32;
        smoothing = new Smoothing(N);
        for (var i = 0; i < 100; i++) {
          smoothing.put(Math.sin(2*PI*i/N));
        }
      });

      it("sin波を入力すると最初のFFTがsin波を出力する", function() {
        for (var i = 0; i < N; i++) {
          assert.ok(almost(smoothing.get(), Math.sin(2*PI*i/N)));
        }
      });
      it("sin波を入力すると全体でsin波を出力する", function() {
        for (var i = 0; i < 100; i++) {
          if (!smoothing.ffts[0].is_ready()) break
          assert.ok(almost(smoothing.get(), Math.sin(2*PI*i/N)));
        }
      });
      it("FFTの被ったところは内分点をとる", function() {
        for (var i = 0; i < N-N/4|0; i++) {
          smoothing.get();
        }
        for (var i = 0; i < N/4|0; i++) {
          let x = smoothing.ffts[0].ifft(i/N+3/4);
          let y = smoothing.ffts[1].ifft(i/N);
          assert.equal(smoothing.get(), (x*(-i+N/4|0)+y*i)/(N/4|0));
        }
      });
    });
    describe("他の関数入力", function() {
      let N = 0;
      let smoothing = null;

      beforeEach(() => {
        N = 32;
        smoothing = new Smoothing(N);
      });

      it("ボックス関数", function() {
        for (var i = 0; i < 10; i++)
          for (var j = 0; j < 10; j++)
            smoothing.put(i%2==0?0:1);

        var i = 0;
        while(smoothing.is_ready()) {
          let x = smoothing.get()
          assert.ok(almost(x, (i++/10|0)%2==0?0:1));
        }
      });
      it("のこぎり波", function() {
        for (var i = 0; i < 10; i++)
          for (var j = 0; j < 10; j++)
            smoothing.put(j);

        var i = 0;
        while(smoothing.is_ready()) {
          let x = smoothing.get();
          assert.ok(Math.abs(x-i++%10) <= 0.6)
        }
      });
    });
  });
  describe("ローパス", function() {
    let N = 0;
    let smoothing = null;

    beforeEach(() => {
      N = 32;
      smoothing = new Smoothing(N);
    });
    it("ローパスを設定する", function() {
      for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
          let x = 0;
          if (i%2 == 0) x = 1;
          smoothing.put(x);
        }  
      }
      assert.equal(smoothing.pass, N);
      smoothing.low_pass(5);
      assert.equal(smoothing.pass, 5);
    });
    describe("ローパスされる", function() {
      let N = 0;
      let smoothing = null;

      beforeEach(() => {
        N = 32;
        smoothing = new Smoothing(N);
      });

      it("高周波成分はなくなる", function() {
        let f = (angle) => {
          return Math.sin(5*angle);
        }

        for (var i = 0; i < 100; i++) {
          smoothing.put(f(2*PI*i/N));
        }

        smoothing.low_pass(4);
        i = 0;
        while (smoothing.is_ready()) {
          let x = smoothing.get();
          assert.ok(almost_zero(x));
        }
      });
      it("合成波は高周波成分のみなくなる", function() {
        let k1 = [1,3,5,7,9],  l1 = [1,3,5];
        let k2 = [2,4,6,8,10], l2 = [2,4];

        let f = (angle) => {
          let r = 0;
          for (var i = 0; i < k1.length; i++) r += Math.cos(angle*k1[i]);
          for (var i = 0; i < k2.length; i++) r += Math.sin(angle*k2[i]);
          return r;
        }
        let g = (angle) => {
          let r = 0;
          for (var i = 0; i < l1.length; i++) r += Math.cos(angle*l1[i]);
          for (var i = 0; i < l2.length; i++) r += Math.sin(angle*l2[i]);
          return r;
        }
        for (var i = 0; i < 100; i++)
          smoothing.put(f(2*PI*i/N));

        smoothing.low_pass(6);
        i = 0;
        while(smoothing.is_ready()) {
          let x = smoothing.get();
          assert.ok(almost(x, g(2*PI*i++/N)));
        }
      });
    });
    describe("他の関数入力", function() {
      let N = 0;
      let smoothing = null;

      beforeEach(() => {
        N = 32;
        smoothing = new Smoothing(N);
      });

      it("ボックス関数", function() {
        for (var i = 0; i < 10; i++)
          for (var j = 0; j < 10; j++)
            smoothing.put(i%2==0?0:1);

        smoothing.low_pass(5)
        var i = 0;
        while(smoothing.is_ready()) {
          let x = smoothing.get()
          // console.log(x);
          assert.equal((x-0.5>0) ^ ((i++/10|0)%2==0), 1)
        }
      });
      it("のこぎり波", function() {
        for (var i = 0; i < 10; i++)
          for (var j = 0; j < 10; j++)
            smoothing.put(j);

        smoothing.low_pass(5);
        var i = 0;
        while(smoothing.is_ready()) {
          let x = smoothing.get();
          // console.log(i++, x);
        }
      });
    });
  });
});

