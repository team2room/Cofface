import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/@mediapipe/face_mesh/face_mesh.js
var require_face_mesh = __commonJS({
  "node_modules/@mediapipe/face_mesh/face_mesh.js"(exports) {
    (function() {
      "use strict";
      var v;
      function aa(a) {
        var b = 0;
        return function() {
          return b < a.length ? { done: false, value: a[b++] } : { done: true };
        };
      }
      var ba = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
        if (a == Array.prototype || a == Object.prototype) return a;
        a[b] = c.value;
        return a;
      };
      function ca(a) {
        a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
        for (var b = 0; b < a.length; ++b) {
          var c = a[b];
          if (c && c.Math == Math) return c;
        }
        throw Error("Cannot find global object");
      }
      var G = ca(this);
      function J(a, b) {
        if (b) a: {
          var c = G;
          a = a.split(".");
          for (var d = 0; d < a.length - 1; d++) {
            var e = a[d];
            if (!(e in c)) break a;
            c = c[e];
          }
          a = a[a.length - 1];
          d = c[a];
          b = b(d);
          b != d && null != b && ba(c, a, { configurable: true, writable: true, value: b });
        }
      }
      J("Symbol", function(a) {
        function b(g) {
          if (this instanceof b) throw new TypeError("Symbol is not a constructor");
          return new c(d + (g || "") + "_" + e++, g);
        }
        function c(g, f) {
          this.g = g;
          ba(this, "description", { configurable: true, writable: true, value: f });
        }
        if (a) return a;
        c.prototype.toString = function() {
          return this.g;
        };
        var d = "jscomp_symbol_" + (1e9 * Math.random() >>> 0) + "_", e = 0;
        return b;
      });
      J("Symbol.iterator", function(a) {
        if (a) return a;
        a = Symbol("Symbol.iterator");
        for (var b = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), c = 0; c < b.length; c++) {
          var d = G[b[c]];
          "function" === typeof d && "function" != typeof d.prototype[a] && ba(d.prototype, a, { configurable: true, writable: true, value: function() {
            return da(aa(this));
          } });
        }
        return a;
      });
      function da(a) {
        a = { next: a };
        a[Symbol.iterator] = function() {
          return this;
        };
        return a;
      }
      function K(a) {
        var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
        return b ? b.call(a) : { next: aa(a) };
      }
      function L(a) {
        if (!(a instanceof Array)) {
          a = K(a);
          for (var b, c = []; !(b = a.next()).done; ) c.push(b.value);
          a = c;
        }
        return a;
      }
      var ea = "function" == typeof Object.create ? Object.create : function(a) {
        function b() {
        }
        b.prototype = a;
        return new b();
      }, fa;
      if ("function" == typeof Object.setPrototypeOf) fa = Object.setPrototypeOf;
      else {
        var ha;
        a: {
          var ia = { a: true }, ja = {};
          try {
            ja.__proto__ = ia;
            ha = ja.a;
            break a;
          } catch (a) {
          }
          ha = false;
        }
        fa = ha ? function(a, b) {
          a.__proto__ = b;
          if (a.__proto__ !== b) throw new TypeError(a + " is not extensible");
          return a;
        } : null;
      }
      var ka = fa;
      function M(a, b) {
        a.prototype = ea(b.prototype);
        a.prototype.constructor = a;
        if (ka) ka(a, b);
        else for (var c in b) if ("prototype" != c) if (Object.defineProperties) {
          var d = Object.getOwnPropertyDescriptor(b, c);
          d && Object.defineProperty(a, c, d);
        } else a[c] = b[c];
        a.ea = b.prototype;
      }
      function ma() {
        this.l = false;
        this.i = null;
        this.h = void 0;
        this.g = 1;
        this.s = this.m = 0;
        this.j = null;
      }
      function na(a) {
        if (a.l) throw new TypeError("Generator is already running");
        a.l = true;
      }
      ma.prototype.o = function(a) {
        this.h = a;
      };
      function oa(a, b) {
        a.j = { U: b, V: true };
        a.g = a.m || a.s;
      }
      ma.prototype.return = function(a) {
        this.j = { return: a };
        this.g = this.s;
      };
      function N(a, b, c) {
        a.g = c;
        return { value: b };
      }
      function pa(a) {
        this.g = new ma();
        this.h = a;
      }
      function qa(a, b) {
        na(a.g);
        var c = a.g.i;
        if (c) return ra(a, "return" in c ? c["return"] : function(d) {
          return { value: d, done: true };
        }, b, a.g.return);
        a.g.return(b);
        return sa(a);
      }
      function ra(a, b, c, d) {
        try {
          var e = b.call(a.g.i, c);
          if (!(e instanceof Object)) throw new TypeError("Iterator result " + e + " is not an object");
          if (!e.done) return a.g.l = false, e;
          var g = e.value;
        } catch (f) {
          return a.g.i = null, oa(a.g, f), sa(a);
        }
        a.g.i = null;
        d.call(a.g, g);
        return sa(a);
      }
      function sa(a) {
        for (; a.g.g; ) try {
          var b = a.h(a.g);
          if (b) return a.g.l = false, { value: b.value, done: false };
        } catch (c) {
          a.g.h = void 0, oa(a.g, c);
        }
        a.g.l = false;
        if (a.g.j) {
          b = a.g.j;
          a.g.j = null;
          if (b.V) throw b.U;
          return { value: b.return, done: true };
        }
        return { value: void 0, done: true };
      }
      function ta(a) {
        this.next = function(b) {
          na(a.g);
          a.g.i ? b = ra(a, a.g.i.next, b, a.g.o) : (a.g.o(b), b = sa(a));
          return b;
        };
        this.throw = function(b) {
          na(a.g);
          a.g.i ? b = ra(a, a.g.i["throw"], b, a.g.o) : (oa(a.g, b), b = sa(a));
          return b;
        };
        this.return = function(b) {
          return qa(a, b);
        };
        this[Symbol.iterator] = function() {
          return this;
        };
      }
      function O(a, b) {
        b = new ta(new pa(b));
        ka && a.prototype && ka(b, a.prototype);
        return b;
      }
      function ua(a, b) {
        a instanceof String && (a += "");
        var c = 0, d = false, e = { next: function() {
          if (!d && c < a.length) {
            var g = c++;
            return { value: b(g, a[g]), done: false };
          }
          d = true;
          return { done: true, value: void 0 };
        } };
        e[Symbol.iterator] = function() {
          return e;
        };
        return e;
      }
      var va = "function" == typeof Object.assign ? Object.assign : function(a, b) {
        for (var c = 1; c < arguments.length; c++) {
          var d = arguments[c];
          if (d) for (var e in d) Object.prototype.hasOwnProperty.call(d, e) && (a[e] = d[e]);
        }
        return a;
      };
      J("Object.assign", function(a) {
        return a || va;
      });
      J("Promise", function(a) {
        function b(f) {
          this.h = 0;
          this.i = void 0;
          this.g = [];
          this.o = false;
          var h = this.j();
          try {
            f(h.resolve, h.reject);
          } catch (k) {
            h.reject(k);
          }
        }
        function c() {
          this.g = null;
        }
        function d(f) {
          return f instanceof b ? f : new b(function(h) {
            h(f);
          });
        }
        if (a) return a;
        c.prototype.h = function(f) {
          if (null == this.g) {
            this.g = [];
            var h = this;
            this.i(function() {
              h.l();
            });
          }
          this.g.push(f);
        };
        var e = G.setTimeout;
        c.prototype.i = function(f) {
          e(f, 0);
        };
        c.prototype.l = function() {
          for (; this.g && this.g.length; ) {
            var f = this.g;
            this.g = [];
            for (var h = 0; h < f.length; ++h) {
              var k = f[h];
              f[h] = null;
              try {
                k();
              } catch (l) {
                this.j(l);
              }
            }
          }
          this.g = null;
        };
        c.prototype.j = function(f) {
          this.i(function() {
            throw f;
          });
        };
        b.prototype.j = function() {
          function f(l) {
            return function(n) {
              k || (k = true, l.call(h, n));
            };
          }
          var h = this, k = false;
          return { resolve: f(this.C), reject: f(this.l) };
        };
        b.prototype.C = function(f) {
          if (f === this) this.l(new TypeError("A Promise cannot resolve to itself"));
          else if (f instanceof b) this.F(f);
          else {
            a: switch (typeof f) {
              case "object":
                var h = null != f;
                break a;
              case "function":
                h = true;
                break a;
              default:
                h = false;
            }
            h ? this.u(f) : this.m(f);
          }
        };
        b.prototype.u = function(f) {
          var h = void 0;
          try {
            h = f.then;
          } catch (k) {
            this.l(k);
            return;
          }
          "function" == typeof h ? this.G(h, f) : this.m(f);
        };
        b.prototype.l = function(f) {
          this.s(2, f);
        };
        b.prototype.m = function(f) {
          this.s(1, f);
        };
        b.prototype.s = function(f, h) {
          if (0 != this.h) throw Error("Cannot settle(" + f + ", " + h + "): Promise already settled in state" + this.h);
          this.h = f;
          this.i = h;
          2 === this.h && this.D();
          this.A();
        };
        b.prototype.D = function() {
          var f = this;
          e(function() {
            if (f.B()) {
              var h = G.console;
              "undefined" !== typeof h && h.error(f.i);
            }
          }, 1);
        };
        b.prototype.B = function() {
          if (this.o) return false;
          var f = G.CustomEvent, h = G.Event, k = G.dispatchEvent;
          if ("undefined" === typeof k) return true;
          "function" === typeof f ? f = new f("unhandledrejection", { cancelable: true }) : "function" === typeof h ? f = new h("unhandledrejection", { cancelable: true }) : (f = G.document.createEvent("CustomEvent"), f.initCustomEvent("unhandledrejection", false, true, f));
          f.promise = this;
          f.reason = this.i;
          return k(f);
        };
        b.prototype.A = function() {
          if (null != this.g) {
            for (var f = 0; f < this.g.length; ++f) g.h(this.g[f]);
            this.g = null;
          }
        };
        var g = new c();
        b.prototype.F = function(f) {
          var h = this.j();
          f.J(h.resolve, h.reject);
        };
        b.prototype.G = function(f, h) {
          var k = this.j();
          try {
            f.call(h, k.resolve, k.reject);
          } catch (l) {
            k.reject(l);
          }
        };
        b.prototype.then = function(f, h) {
          function k(w, r) {
            return "function" == typeof w ? function(y) {
              try {
                l(w(y));
              } catch (m) {
                n(m);
              }
            } : r;
          }
          var l, n, u = new b(function(w, r) {
            l = w;
            n = r;
          });
          this.J(k(f, l), k(h, n));
          return u;
        };
        b.prototype.catch = function(f) {
          return this.then(void 0, f);
        };
        b.prototype.J = function(f, h) {
          function k() {
            switch (l.h) {
              case 1:
                f(l.i);
                break;
              case 2:
                h(l.i);
                break;
              default:
                throw Error("Unexpected state: " + l.h);
            }
          }
          var l = this;
          null == this.g ? g.h(k) : this.g.push(k);
          this.o = true;
        };
        b.resolve = d;
        b.reject = function(f) {
          return new b(function(h, k) {
            k(f);
          });
        };
        b.race = function(f) {
          return new b(function(h, k) {
            for (var l = K(f), n = l.next(); !n.done; n = l.next()) d(n.value).J(h, k);
          });
        };
        b.all = function(f) {
          var h = K(f), k = h.next();
          return k.done ? d([]) : new b(function(l, n) {
            function u(y) {
              return function(m) {
                w[y] = m;
                r--;
                0 == r && l(w);
              };
            }
            var w = [], r = 0;
            do
              w.push(void 0), r++, d(k.value).J(u(w.length - 1), n), k = h.next();
            while (!k.done);
          });
        };
        return b;
      });
      J("Object.is", function(a) {
        return a ? a : function(b, c) {
          return b === c ? 0 !== b || 1 / b === 1 / c : b !== b && c !== c;
        };
      });
      J("Array.prototype.includes", function(a) {
        return a ? a : function(b, c) {
          var d = this;
          d instanceof String && (d = String(d));
          var e = d.length;
          c = c || 0;
          for (0 > c && (c = Math.max(c + e, 0)); c < e; c++) {
            var g = d[c];
            if (g === b || Object.is(g, b)) return true;
          }
          return false;
        };
      });
      J("String.prototype.includes", function(a) {
        return a ? a : function(b, c) {
          if (null == this) throw new TypeError("The 'this' value for String.prototype.includes must not be null or undefined");
          if (b instanceof RegExp) throw new TypeError("First argument to String.prototype.includes must not be a regular expression");
          return -1 !== this.indexOf(b, c || 0);
        };
      });
      J("Array.prototype.keys", function(a) {
        return a ? a : function() {
          return ua(this, function(b) {
            return b;
          });
        };
      });
      var wa = this || self;
      function P(a, b) {
        a = a.split(".");
        var c = wa;
        a[0] in c || "undefined" == typeof c.execScript || c.execScript("var " + a[0]);
        for (var d; a.length && (d = a.shift()); ) a.length || void 0 === b ? c[d] && c[d] !== Object.prototype[d] ? c = c[d] : c = c[d] = {} : c[d] = b;
      }
      ;
      function xa(a, b) {
        b = String.fromCharCode.apply(null, b);
        return null == a ? b : a + b;
      }
      var ya, za = "undefined" !== typeof TextDecoder, Aa, Ba = "undefined" !== typeof TextEncoder;
      function Ca(a) {
        if (Ba) a = (Aa || (Aa = new TextEncoder())).encode(a);
        else {
          var b = void 0;
          b = void 0 === b ? false : b;
          for (var c = 0, d = new Uint8Array(3 * a.length), e = 0; e < a.length; e++) {
            var g = a.charCodeAt(e);
            if (128 > g) d[c++] = g;
            else {
              if (2048 > g) d[c++] = g >> 6 | 192;
              else {
                if (55296 <= g && 57343 >= g) {
                  if (56319 >= g && e < a.length) {
                    var f = a.charCodeAt(++e);
                    if (56320 <= f && 57343 >= f) {
                      g = 1024 * (g - 55296) + f - 56320 + 65536;
                      d[c++] = g >> 18 | 240;
                      d[c++] = g >> 12 & 63 | 128;
                      d[c++] = g >> 6 & 63 | 128;
                      d[c++] = g & 63 | 128;
                      continue;
                    } else e--;
                  }
                  if (b) throw Error("Found an unpaired surrogate");
                  g = 65533;
                }
                d[c++] = g >> 12 | 224;
                d[c++] = g >> 6 & 63 | 128;
              }
              d[c++] = g & 63 | 128;
            }
          }
          a = d.subarray(0, c);
        }
        return a;
      }
      ;
      var Da = {}, Ea = null;
      function Fa(a, b) {
        void 0 === b && (b = 0);
        Ga();
        b = Da[b];
        for (var c = Array(Math.floor(a.length / 3)), d = b[64] || "", e = 0, g = 0; e < a.length - 2; e += 3) {
          var f = a[e], h = a[e + 1], k = a[e + 2], l = b[f >> 2];
          f = b[(f & 3) << 4 | h >> 4];
          h = b[(h & 15) << 2 | k >> 6];
          k = b[k & 63];
          c[g++] = l + f + h + k;
        }
        l = 0;
        k = d;
        switch (a.length - e) {
          case 2:
            l = a[e + 1], k = b[(l & 15) << 2] || d;
          case 1:
            a = a[e], c[g] = b[a >> 2] + b[(a & 3) << 4 | l >> 4] + k + d;
        }
        return c.join("");
      }
      function Ha(a) {
        var b = a.length, c = 3 * b / 4;
        c % 3 ? c = Math.floor(c) : -1 != "=.".indexOf(a[b - 1]) && (c = -1 != "=.".indexOf(a[b - 2]) ? c - 2 : c - 1);
        var d = new Uint8Array(c), e = 0;
        Ia(a, function(g) {
          d[e++] = g;
        });
        return d.subarray(0, e);
      }
      function Ia(a, b) {
        function c(k) {
          for (; d < a.length; ) {
            var l = a.charAt(d++), n = Ea[l];
            if (null != n) return n;
            if (!/^[\s\xa0]*$/.test(l)) throw Error("Unknown base64 encoding at char: " + l);
          }
          return k;
        }
        Ga();
        for (var d = 0; ; ) {
          var e = c(-1), g = c(0), f = c(64), h = c(64);
          if (64 === h && -1 === e) break;
          b(e << 2 | g >> 4);
          64 != f && (b(g << 4 & 240 | f >> 2), 64 != h && b(f << 6 & 192 | h));
        }
      }
      function Ga() {
        if (!Ea) {
          Ea = {};
          for (var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""), b = ["+/=", "+/", "-_=", "-_.", "-_"], c = 0; 5 > c; c++) {
            var d = a.concat(b[c].split(""));
            Da[c] = d;
            for (var e = 0; e < d.length; e++) {
              var g = d[e];
              void 0 === Ea[g] && (Ea[g] = e);
            }
          }
        }
      }
      ;
      var Ja = "function" === typeof Uint8Array.prototype.slice, Ka;
      function La(a, b, c) {
        return b === c ? Ka || (Ka = new Uint8Array(0)) : Ja ? a.slice(b, c) : new Uint8Array(a.subarray(b, c));
      }
      var Q = 0, R = 0;
      function Ma(a, b) {
        b = void 0 === b ? {} : b;
        b = void 0 === b.v ? false : b.v;
        this.h = null;
        this.g = this.j = this.l = 0;
        this.m = false;
        this.v = b;
        a && Na(this, a);
      }
      function Na(a, b) {
        b = b.constructor === Uint8Array ? b : b.constructor === ArrayBuffer ? new Uint8Array(b) : b.constructor === Array ? new Uint8Array(b) : b.constructor === String ? Ha(b) : b instanceof Uint8Array ? new Uint8Array(b.buffer, b.byteOffset, b.byteLength) : new Uint8Array(0);
        a.h = b;
        a.l = 0;
        a.j = a.h.length;
        a.g = a.l;
      }
      Ma.prototype.reset = function() {
        this.g = this.l;
      };
      function Oa(a) {
        for (var b = 128, c = 0, d = 0, e = 0; 4 > e && 128 <= b; e++) b = a.h[a.g++], c |= (b & 127) << 7 * e;
        128 <= b && (b = a.h[a.g++], c |= (b & 127) << 28, d |= (b & 127) >> 4);
        if (128 <= b) for (e = 0; 5 > e && 128 <= b; e++) b = a.h[a.g++], d |= (b & 127) << 7 * e + 3;
        if (128 > b) {
          a = c >>> 0;
          b = d >>> 0;
          if (d = b & 2147483648) a = ~a + 1 >>> 0, b = ~b >>> 0, 0 == a && (b = b + 1 >>> 0);
          a = 4294967296 * b + (a >>> 0);
          return d ? -a : a;
        }
        a.m = true;
      }
      Ma.prototype.i = function() {
        var a = this.h, b = a[this.g], c = b & 127;
        if (128 > b) return this.g += 1, c;
        b = a[this.g + 1];
        c |= (b & 127) << 7;
        if (128 > b) return this.g += 2, c;
        b = a[this.g + 2];
        c |= (b & 127) << 14;
        if (128 > b) return this.g += 3, c;
        b = a[this.g + 3];
        c |= (b & 127) << 21;
        if (128 > b) return this.g += 4, c;
        b = a[this.g + 4];
        c |= (b & 15) << 28;
        if (128 > b) return this.g += 5, c >>> 0;
        this.g += 5;
        128 <= a[this.g++] && 128 <= a[this.g++] && 128 <= a[this.g++] && 128 <= a[this.g++] && this.g++;
        return c;
      };
      Ma.prototype.o = function() {
        var a = this.h[this.g], b = this.h[this.g + 1];
        var c = this.h[this.g + 2];
        var d = this.h[this.g + 3];
        this.g += 4;
        c = (a << 0 | b << 8 | c << 16 | d << 24) >>> 0;
        a = 2 * (c >> 31) + 1;
        b = c >>> 23 & 255;
        c &= 8388607;
        return 255 == b ? c ? NaN : Infinity * a : 0 == b ? a * Math.pow(2, -149) * c : a * Math.pow(2, b - 150) * (c + Math.pow(2, 23));
      };
      var Pa = [];
      function Qa() {
        this.g = new Uint8Array(64);
        this.h = 0;
      }
      Qa.prototype.push = function(a) {
        if (!(this.h + 1 < this.g.length)) {
          var b = this.g;
          this.g = new Uint8Array(Math.ceil(1 + 2 * this.g.length));
          this.g.set(b);
        }
        this.g[this.h++] = a;
      };
      Qa.prototype.length = function() {
        return this.h;
      };
      Qa.prototype.end = function() {
        var a = this.g, b = this.h;
        this.h = 0;
        return La(a, 0, b);
      };
      function Ra(a, b) {
        for (; 127 < b; ) a.push(b & 127 | 128), b >>>= 7;
        a.push(b);
      }
      ;
      function Sa(a) {
        var b = {}, c = void 0 === b.N ? false : b.N;
        this.o = { v: void 0 === b.v ? false : b.v };
        this.N = c;
        b = this.o;
        Pa.length ? (c = Pa.pop(), b && (c.v = b.v), a && Na(c, a), a = c) : a = new Ma(a, b);
        this.g = a;
        this.m = this.g.g;
        this.h = this.i = this.l = -1;
        this.j = false;
      }
      Sa.prototype.reset = function() {
        this.g.reset();
        this.h = this.l = -1;
      };
      function S(a) {
        var b = a.g;
        (b = b.g == b.j) || (b = a.j) || (b = a.g, b = b.m || 0 > b.g || b.g > b.j);
        if (b) return false;
        a.m = a.g.g;
        b = a.g.i();
        var c = b & 7;
        if (0 != c && 5 != c && 1 != c && 2 != c && 3 != c && 4 != c) return a.j = true, false;
        a.i = b;
        a.l = b >>> 3;
        a.h = c;
        return true;
      }
      function Ta(a) {
        switch (a.h) {
          case 0:
            if (0 != a.h) Ta(a);
            else {
              for (a = a.g; a.h[a.g] & 128; ) a.g++;
              a.g++;
            }
            break;
          case 1:
            1 != a.h ? Ta(a) : (a = a.g, a.g += 8);
            break;
          case 2:
            if (2 != a.h) Ta(a);
            else {
              var b = a.g.i();
              a = a.g;
              a.g += b;
            }
            break;
          case 5:
            5 != a.h ? Ta(a) : (a = a.g, a.g += 4);
            break;
          case 3:
            b = a.l;
            do {
              if (!S(a)) {
                a.j = true;
                break;
              }
              if (4 == a.h) {
                a.l != b && (a.j = true);
                break;
              }
              Ta(a);
            } while (1);
            break;
          default:
            a.j = true;
        }
      }
      function Ua(a, b, c) {
        var d = a.g.j, e = a.g.i(), g = a.g.g + e;
        a.g.j = g;
        c(b, a);
        c = g - a.g.g;
        if (0 !== c) throw Error("Message parsing ended unexpectedly. Expected to read " + e + " bytes, instead read " + (e - c) + " bytes, either the data ended unexpectedly or the message misreported its own length");
        a.g.g = g;
        a.g.j = d;
        return b;
      }
      function T(a) {
        return a.g.o();
      }
      function Va(a) {
        var b = a.g.i();
        a = a.g;
        var c = a.g;
        a.g += b;
        a = a.h;
        var d;
        if (za) (d = ya) || (d = ya = new TextDecoder("utf-8", { fatal: false })), d = d.decode(a.subarray(c, c + b));
        else {
          b = c + b;
          for (var e = [], g = null, f, h, k; c < b; ) f = a[c++], 128 > f ? e.push(f) : 224 > f ? c >= b ? e.push(65533) : (h = a[c++], 194 > f || 128 !== (h & 192) ? (c--, e.push(65533)) : e.push((f & 31) << 6 | h & 63)) : 240 > f ? c >= b - 1 ? e.push(65533) : (h = a[c++], 128 !== (h & 192) || 224 === f && 160 > h || 237 === f && 160 <= h || 128 !== ((d = a[c++]) & 192) ? (c--, e.push(65533)) : e.push((f & 15) << 12 | (h & 63) << 6 | d & 63)) : 244 >= f ? c >= b - 2 ? e.push(65533) : (h = a[c++], 128 !== (h & 192) || 0 !== (f << 28) + (h - 144) >> 30 || 128 !== ((d = a[c++]) & 192) || 128 !== ((k = a[c++]) & 192) ? (c--, e.push(65533)) : (f = (f & 7) << 18 | (h & 63) << 12 | (d & 63) << 6 | k & 63, f -= 65536, e.push((f >> 10 & 1023) + 55296, (f & 1023) + 56320))) : e.push(65533), 8192 <= e.length && (g = xa(g, e), e.length = 0);
          d = xa(g, e);
        }
        return d;
      }
      function Wa(a, b, c) {
        var d = a.g.i();
        for (d = a.g.g + d; a.g.g < d; ) c.push(b.call(a.g));
      }
      function Xa(a, b) {
        2 == a.h ? Wa(a, Ma.prototype.o, b) : b.push(T(a));
      }
      ;
      function Ya() {
        this.h = [];
        this.i = 0;
        this.g = new Qa();
      }
      function Za(a, b) {
        0 !== b.length && (a.h.push(b), a.i += b.length);
      }
      function $a(a) {
        var b = a.i + a.g.length();
        if (0 === b) return new Uint8Array(0);
        b = new Uint8Array(b);
        for (var c = a.h, d = c.length, e = 0, g = 0; g < d; g++) {
          var f = c[g];
          0 !== f.length && (b.set(f, e), e += f.length);
        }
        c = a.g;
        d = c.h;
        0 !== d && (b.set(c.g.subarray(0, d), e), c.h = 0);
        a.h = [b];
        return b;
      }
      function U(a, b, c) {
        if (null != c) {
          Ra(a.g, 8 * b + 5);
          a = a.g;
          var d = c;
          d = (c = 0 > d ? 1 : 0) ? -d : d;
          0 === d ? 0 < 1 / d ? Q = R = 0 : (R = 0, Q = 2147483648) : isNaN(d) ? (R = 0, Q = 2147483647) : 34028234663852886e22 < d ? (R = 0, Q = (c << 31 | 2139095040) >>> 0) : 11754943508222875e-54 > d ? (d = Math.round(d / Math.pow(2, -149)), R = 0, Q = (c << 31 | d) >>> 0) : (b = Math.floor(Math.log(d) / Math.LN2), d *= Math.pow(2, -b), d = Math.round(8388608 * d), 16777216 <= d && ++b, R = 0, Q = (c << 31 | b + 127 << 23 | d & 8388607) >>> 0);
          c = Q;
          a.push(c >>> 0 & 255);
          a.push(c >>> 8 & 255);
          a.push(c >>> 16 & 255);
          a.push(c >>> 24 & 255);
        }
      }
      ;
      var ab = "function" === typeof Uint8Array;
      function bb(a, b, c) {
        if (null != a) return "object" === typeof a ? ab && a instanceof Uint8Array ? c(a) : cb(a, b, c) : b(a);
      }
      function cb(a, b, c) {
        if (Array.isArray(a)) {
          for (var d = Array(a.length), e = 0; e < a.length; e++) d[e] = bb(a[e], b, c);
          Array.isArray(a) && a.W && db(d);
          return d;
        }
        d = {};
        for (e in a) d[e] = bb(a[e], b, c);
        return d;
      }
      function eb(a) {
        return "number" === typeof a ? isFinite(a) ? a : String(a) : a;
      }
      var fb = { W: { value: true, configurable: true } };
      function db(a) {
        Array.isArray(a) && !Object.isFrozen(a) && Object.defineProperties(a, fb);
        return a;
      }
      ;
      var gb;
      function V(a, b, c) {
        var d = gb;
        gb = null;
        a || (a = d);
        d = this.constructor.ca;
        a || (a = d ? [d] : []);
        this.j = d ? 0 : -1;
        this.m = this.g = null;
        this.h = a;
        a: {
          d = this.h.length;
          a = d - 1;
          if (d && (d = this.h[a], !(null === d || "object" != typeof d || Array.isArray(d) || ab && d instanceof Uint8Array))) {
            this.l = a - this.j;
            this.i = d;
            break a;
          }
          void 0 !== b && -1 < b ? (this.l = Math.max(b, a + 1 - this.j), this.i = null) : this.l = Number.MAX_VALUE;
        }
        if (c) for (b = 0; b < c.length; b++) a = c[b], a < this.l ? (a += this.j, (d = this.h[a]) ? db(d) : this.h[a] = hb) : (ib(this), (d = this.i[a]) ? db(d) : this.i[a] = hb);
      }
      var hb = Object.freeze(db([]));
      function ib(a) {
        var b = a.l + a.j;
        a.h[b] || (a.i = a.h[b] = {});
      }
      function W(a, b, c) {
        return -1 === b ? null : (void 0 === c ? 0 : c) || b >= a.l ? a.i ? a.i[b] : void 0 : a.h[b + a.j];
      }
      function jb(a, b) {
        var c = void 0 === c ? false : c;
        var d = W(a, b, c);
        null == d && (d = hb);
        d === hb && (d = db([]), X(a, b, d, c));
        return d;
      }
      function kb(a) {
        var b = jb(a, 3);
        a.m || (a.m = {});
        if (!a.m[3]) {
          for (var c = 0; c < b.length; c++) b[c] = +b[c];
          a.m[3] = true;
        }
        return b;
      }
      function lb(a, b, c) {
        a = W(a, b);
        return null == a ? c : a;
      }
      function Y(a, b, c) {
        a = W(a, b);
        a = null == a ? a : +a;
        return null == a ? void 0 === c ? 0 : c : a;
      }
      function X(a, b, c, d) {
        (void 0 === d ? 0 : d) || b >= a.l ? (ib(a), a.i[b] = c) : a.h[b + a.j] = c;
      }
      function mb(a, b, c) {
        if (-1 === c) return null;
        a.g || (a.g = {});
        if (!a.g[c]) {
          var d = W(a, c, false);
          d && (a.g[c] = new b(d));
        }
        return a.g[c];
      }
      function nb(a, b) {
        a.g || (a.g = {});
        var c = a.g[1];
        if (!c) {
          var d = jb(a, 1);
          c = [];
          for (var e = 0; e < d.length; e++) c[e] = new b(d[e]);
          a.g[1] = c;
        }
        return c;
      }
      function ob(a, b, c) {
        var d = void 0 === d ? false : d;
        a.g || (a.g = {});
        var e = c ? pb(c, false) : c;
        a.g[b] = c;
        X(a, b, e, d);
      }
      function qb(a, b, c, d) {
        var e = nb(a, c);
        b = b ? b : new c();
        a = jb(a, 1);
        void 0 != d ? (e.splice(d, 0, b), a.splice(d, 0, pb(b, false))) : (e.push(b), a.push(pb(b, false)));
      }
      V.prototype.toJSON = function() {
        var a = pb(this, false);
        return cb(a, eb, Fa);
      };
      function pb(a, b) {
        if (a.g) for (var c in a.g) {
          var d = a.g[c];
          if (Array.isArray(d)) for (var e = 0; e < d.length; e++) d[e] && pb(d[e], b);
          else d && pb(d, b);
        }
        return a.h;
      }
      V.prototype.toString = function() {
        return pb(this, false).toString();
      };
      function rb(a, b) {
        if (a = a.o) {
          Za(b, b.g.end());
          for (var c = 0; c < a.length; c++) Za(b, a[c]);
        }
      }
      function sb(a, b) {
        if (4 == b.h) return false;
        var c = b.m;
        Ta(b);
        b.N || (b = La(b.g.h, c, b.g.g), (c = a.o) ? c.push(b) : a.o = [b]);
        return true;
      }
      ;
      function tb(a) {
        V.call(this, a, -1, ub);
      }
      M(tb, V);
      tb.prototype.getRows = function() {
        return W(this, 1);
      };
      tb.prototype.getCols = function() {
        return W(this, 2);
      };
      tb.prototype.getPackedDataList = function() {
        return kb(this);
      };
      tb.prototype.getLayout = function() {
        return lb(this, 4, 0);
      };
      function vb(a, b) {
        for (; S(b); ) switch (b.i) {
          case 8:
            var c = b.g.i();
            X(a, 1, c);
            break;
          case 16:
            c = b.g.i();
            X(a, 2, c);
            break;
          case 29:
          case 26:
            Xa(b, a.getPackedDataList());
            break;
          case 32:
            c = Oa(b.g);
            X(a, 4, c);
            break;
          default:
            if (!sb(a, b)) return a;
        }
        return a;
      }
      var ub = [3];
      function Z(a, b) {
        var c = void 0;
        return new (c || (c = Promise))(function(d, e) {
          function g(k) {
            try {
              h(b.next(k));
            } catch (l) {
              e(l);
            }
          }
          function f(k) {
            try {
              h(b["throw"](k));
            } catch (l) {
              e(l);
            }
          }
          function h(k) {
            k.done ? d(k.value) : new c(function(l) {
              l(k.value);
            }).then(g, f);
          }
          h((b = b.apply(a, void 0)).next());
        });
      }
      ;
      function wb(a) {
        V.call(this, a);
      }
      M(wb, V);
      function xb(a, b) {
        for (; S(b); ) switch (b.i) {
          case 8:
            var c = b.g.i();
            X(a, 1, c);
            break;
          case 21:
            c = T(b);
            X(a, 2, c);
            break;
          case 26:
            c = Va(b);
            X(a, 3, c);
            break;
          case 34:
            c = Va(b);
            X(a, 4, c);
            break;
          default:
            if (!sb(a, b)) return a;
        }
        return a;
      }
      ;
      function yb(a) {
        V.call(this, a, -1, zb);
      }
      M(yb, V);
      yb.prototype.addClassification = function(a, b) {
        qb(this, a, wb, b);
        return this;
      };
      var zb = [1];
      function Ab(a) {
        V.call(this, a);
      }
      M(Ab, V);
      function Bb(a, b) {
        for (; S(b); ) switch (b.i) {
          case 13:
            var c = T(b);
            X(a, 1, c);
            break;
          case 21:
            c = T(b);
            X(a, 2, c);
            break;
          case 29:
            c = T(b);
            X(a, 3, c);
            break;
          case 37:
            c = T(b);
            X(a, 4, c);
            break;
          case 45:
            c = T(b);
            X(a, 5, c);
            break;
          default:
            if (!sb(a, b)) return a;
        }
        return a;
      }
      ;
      function Cb(a) {
        V.call(this, a, -1, Db);
      }
      M(Cb, V);
      function Eb(a) {
        a: {
          var b = new Cb();
          for (a = new Sa(a); S(a); ) switch (a.i) {
            case 10:
              var c = Ua(a, new Ab(), Bb);
              qb(b, c, Ab, void 0);
              break;
            default:
              if (!sb(b, a)) break a;
          }
        }
        return b;
      }
      var Db = [1];
      function Fb(a) {
        V.call(this, a);
      }
      M(Fb, V);
      function Gb(a) {
        V.call(this, a, -1, Hb);
      }
      M(Gb, V);
      Gb.prototype.getVertexType = function() {
        return lb(this, 1, 0);
      };
      Gb.prototype.getPrimitiveType = function() {
        return lb(this, 2, 0);
      };
      Gb.prototype.getVertexBufferList = function() {
        return kb(this);
      };
      Gb.prototype.getIndexBufferList = function() {
        return jb(this, 4);
      };
      function Ib(a, b) {
        for (; S(b); ) switch (b.i) {
          case 8:
            var c = Oa(b.g);
            X(a, 1, c);
            break;
          case 16:
            c = Oa(b.g);
            X(a, 2, c);
            break;
          case 29:
          case 26:
            Xa(b, a.getVertexBufferList());
            break;
          case 32:
          case 34:
            c = b;
            var d = a.getIndexBufferList();
            2 == c.h ? Wa(c, Ma.prototype.i, d) : d.push(c.g.i());
            break;
          default:
            if (!sb(a, b)) return a;
        }
        return a;
      }
      var Hb = [3, 4];
      function Jb(a) {
        V.call(this, a);
      }
      M(Jb, V);
      Jb.prototype.getMesh = function() {
        return mb(this, Gb, 1);
      };
      Jb.prototype.getPoseTransformMatrix = function() {
        return mb(this, tb, 2);
      };
      function Kb(a) {
        a: {
          var b = new Jb();
          for (a = new Sa(a); S(a); ) switch (a.i) {
            case 10:
              var c = Ua(a, new Gb(), Ib);
              ob(b, 1, c);
              break;
            case 18:
              c = Ua(a, new tb(), vb);
              ob(b, 2, c);
              break;
            default:
              if (!sb(b, a)) break a;
          }
        }
        return b;
      }
      ;
      function Lb(a, b, c) {
        c = a.createShader(0 === c ? a.VERTEX_SHADER : a.FRAGMENT_SHADER);
        a.shaderSource(c, b);
        a.compileShader(c);
        if (!a.getShaderParameter(c, a.COMPILE_STATUS)) throw Error("Could not compile WebGL shader.\n\n" + a.getShaderInfoLog(c));
        return c;
      }
      ;
      function Mb(a) {
        return nb(a, wb).map(function(b) {
          return { index: lb(b, 1, 0), Y: Y(b, 2), label: null != W(b, 3) ? lb(b, 3, "") : void 0, displayName: null != W(b, 4) ? lb(b, 4, "") : void 0 };
        });
      }
      ;
      function Nb(a) {
        return { x: Y(a, 1), y: Y(a, 2), z: Y(a, 3), visibility: null != W(a, 4) ? Y(a, 4) : void 0 };
      }
      ;
      function Ob(a, b) {
        this.h = a;
        this.g = b;
        this.l = 0;
      }
      function Pb(a, b, c) {
        Qb(a, b);
        if ("function" === typeof a.g.canvas.transferToImageBitmap) return Promise.resolve(a.g.canvas.transferToImageBitmap());
        if (c) return Promise.resolve(a.g.canvas);
        if ("function" === typeof createImageBitmap) return createImageBitmap(a.g.canvas);
        void 0 === a.i && (a.i = document.createElement("canvas"));
        return new Promise(function(d) {
          a.i.height = a.g.canvas.height;
          a.i.width = a.g.canvas.width;
          a.i.getContext("2d", {}).drawImage(a.g.canvas, 0, 0, a.g.canvas.width, a.g.canvas.height);
          d(a.i);
        });
      }
      function Qb(a, b) {
        var c = a.g;
        if (void 0 === a.m) {
          var d = Lb(c, "\n  attribute vec2 aVertex;\n  attribute vec2 aTex;\n  varying vec2 vTex;\n  void main(void) {\n    gl_Position = vec4(aVertex, 0.0, 1.0);\n    vTex = aTex;\n  }", 0), e = Lb(c, "\n  precision mediump float;\n  varying vec2 vTex;\n  uniform sampler2D sampler0;\n  void main(){\n    gl_FragColor = texture2D(sampler0, vTex);\n  }", 1), g = c.createProgram();
          c.attachShader(g, d);
          c.attachShader(g, e);
          c.linkProgram(g);
          if (!c.getProgramParameter(g, c.LINK_STATUS)) throw Error("Could not compile WebGL program.\n\n" + c.getProgramInfoLog(g));
          d = a.m = g;
          c.useProgram(d);
          e = c.getUniformLocation(d, "sampler0");
          a.j = { I: c.getAttribLocation(d, "aVertex"), H: c.getAttribLocation(d, "aTex"), da: e };
          a.s = c.createBuffer();
          c.bindBuffer(c.ARRAY_BUFFER, a.s);
          c.enableVertexAttribArray(a.j.I);
          c.vertexAttribPointer(a.j.I, 2, c.FLOAT, false, 0, 0);
          c.bufferData(c.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), c.STATIC_DRAW);
          c.bindBuffer(c.ARRAY_BUFFER, null);
          a.o = c.createBuffer();
          c.bindBuffer(c.ARRAY_BUFFER, a.o);
          c.enableVertexAttribArray(a.j.H);
          c.vertexAttribPointer(
            a.j.H,
            2,
            c.FLOAT,
            false,
            0,
            0
          );
          c.bufferData(c.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]), c.STATIC_DRAW);
          c.bindBuffer(c.ARRAY_BUFFER, null);
          c.uniform1i(e, 0);
        }
        d = a.j;
        c.useProgram(a.m);
        c.canvas.width = b.width;
        c.canvas.height = b.height;
        c.viewport(0, 0, b.width, b.height);
        c.activeTexture(c.TEXTURE0);
        a.h.bindTexture2d(b.glName);
        c.enableVertexAttribArray(d.I);
        c.bindBuffer(c.ARRAY_BUFFER, a.s);
        c.vertexAttribPointer(d.I, 2, c.FLOAT, false, 0, 0);
        c.enableVertexAttribArray(d.H);
        c.bindBuffer(c.ARRAY_BUFFER, a.o);
        c.vertexAttribPointer(
          d.H,
          2,
          c.FLOAT,
          false,
          0,
          0
        );
        c.bindFramebuffer(c.DRAW_FRAMEBUFFER ? c.DRAW_FRAMEBUFFER : c.FRAMEBUFFER, null);
        c.clearColor(0, 0, 0, 0);
        c.clear(c.COLOR_BUFFER_BIT);
        c.colorMask(true, true, true, true);
        c.drawArrays(c.TRIANGLE_FAN, 0, 4);
        c.disableVertexAttribArray(d.I);
        c.disableVertexAttribArray(d.H);
        c.bindBuffer(c.ARRAY_BUFFER, null);
        a.h.bindTexture2d(0);
      }
      function Rb(a) {
        this.g = a;
      }
      ;
      var Sb = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 9, 1, 7, 0, 65, 0, 253, 15, 26, 11]);
      function Tb(a, b) {
        return b + a;
      }
      function Ub(a, b) {
        window[a] = b;
      }
      function Vb(a) {
        var b = document.createElement("script");
        b.setAttribute("src", a);
        b.setAttribute("crossorigin", "anonymous");
        return new Promise(function(c) {
          b.addEventListener("load", function() {
            c();
          }, false);
          b.addEventListener("error", function() {
            c();
          }, false);
          document.body.appendChild(b);
        });
      }
      function Wb() {
        return Z(this, function b() {
          return O(b, function(c) {
            switch (c.g) {
              case 1:
                return c.m = 2, N(c, WebAssembly.instantiate(Sb), 4);
              case 4:
                c.g = 3;
                c.m = 0;
                break;
              case 2:
                return c.m = 0, c.j = null, c.return(false);
              case 3:
                return c.return(true);
            }
          });
        });
      }
      function Xb(a) {
        this.g = a;
        this.listeners = {};
        this.j = {};
        this.F = {};
        this.m = {};
        this.s = {};
        this.G = this.o = this.R = true;
        this.C = Promise.resolve();
        this.P = "";
        this.B = {};
        this.locateFile = a && a.locateFile || Tb;
        if ("object" === typeof window) var b = window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/";
        else if ("undefined" !== typeof location) b = location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/";
        else throw Error("solutions can only be loaded on a web page or in a web worker");
        this.S = b;
        if (a.options) {
          b = K(Object.keys(a.options));
          for (var c = b.next(); !c.done; c = b.next()) {
            c = c.value;
            var d = a.options[c].default;
            void 0 !== d && (this.j[c] = "function" === typeof d ? d() : d);
          }
        }
      }
      v = Xb.prototype;
      v.close = function() {
        this.i && this.i.delete();
        return Promise.resolve();
      };
      function Yb(a, b) {
        return void 0 === a.g.files ? [] : "function" === typeof a.g.files ? a.g.files(b) : a.g.files;
      }
      function Zb(a) {
        return Z(a, function c() {
          var d = this, e, g, f, h, k, l, n, u, w, r, y;
          return O(c, function(m) {
            switch (m.g) {
              case 1:
                e = d;
                if (!d.R) return m.return();
                g = Yb(d, d.j);
                return N(m, Wb(), 2);
              case 2:
                f = m.h;
                if ("object" === typeof window) return Ub("createMediapipeSolutionsWasm", { locateFile: d.locateFile }), Ub("createMediapipeSolutionsPackedAssets", { locateFile: d.locateFile }), l = g.filter(function(t) {
                  return void 0 !== t.data;
                }), n = g.filter(function(t) {
                  return void 0 === t.data;
                }), u = Promise.all(l.map(function(t) {
                  var x = $b(e, t.url);
                  if (void 0 !== t.path) {
                    var z = t.path;
                    x = x.then(function(E) {
                      e.overrideFile(z, E);
                      return Promise.resolve(E);
                    });
                  }
                  return x;
                })), w = Promise.all(n.map(function(t) {
                  return void 0 === t.simd || t.simd && f || !t.simd && !f ? Vb(e.locateFile(t.url, e.S)) : Promise.resolve();
                })).then(function() {
                  return Z(e, function x() {
                    var z, E, F = this;
                    return O(x, function(I) {
                      if (1 == I.g) return z = window.createMediapipeSolutionsWasm, E = window.createMediapipeSolutionsPackedAssets, N(I, z(E), 2);
                      F.h = I.h;
                      I.g = 0;
                    });
                  });
                }), r = function() {
                  return Z(e, function x() {
                    var z = this;
                    return O(x, function(E) {
                      z.g.graph && z.g.graph.url ? E = N(E, $b(z, z.g.graph.url), 0) : (E.g = 0, E = void 0);
                      return E;
                    });
                  });
                }(), N(m, Promise.all([w, u, r]), 7);
                if ("function" !== typeof importScripts) throw Error("solutions can only be loaded on a web page or in a web worker");
                h = g.filter(function(t) {
                  return void 0 === t.simd || t.simd && f || !t.simd && !f;
                }).map(function(t) {
                  return e.locateFile(t.url, e.S);
                });
                importScripts.apply(null, L(h));
                return N(m, createMediapipeSolutionsWasm(Module), 6);
              case 6:
                d.h = m.h;
                d.l = new OffscreenCanvas(1, 1);
                d.h.canvas = d.l;
                k = d.h.GL.createContext(
                  d.l,
                  { antialias: false, alpha: false, ba: "undefined" !== typeof WebGL2RenderingContext ? 2 : 1 }
                );
                d.h.GL.makeContextCurrent(k);
                m.g = 4;
                break;
              case 7:
                d.l = document.createElement("canvas");
                y = d.l.getContext("webgl2", {});
                if (!y && (y = d.l.getContext("webgl", {}), !y)) return alert("Failed to create WebGL canvas context when passing video frame."), m.return();
                d.D = y;
                d.h.canvas = d.l;
                d.h.createContext(d.l, true, true, {});
              case 4:
                d.i = new d.h.SolutionWasm(), d.R = false, m.g = 0;
            }
          });
        });
      }
      function ac(a) {
        return Z(a, function c() {
          var d = this, e, g, f, h, k, l, n, u;
          return O(c, function(w) {
            if (1 == w.g) {
              if (d.g.graph && d.g.graph.url && d.P === d.g.graph.url) return w.return();
              d.o = true;
              if (!d.g.graph || !d.g.graph.url) {
                w.g = 2;
                return;
              }
              d.P = d.g.graph.url;
              return N(w, $b(d, d.g.graph.url), 3);
            }
            2 != w.g && (e = w.h, d.i.loadGraph(e));
            g = K(Object.keys(d.B));
            for (f = g.next(); !f.done; f = g.next()) h = f.value, d.i.overrideFile(h, d.B[h]);
            d.B = {};
            if (d.g.listeners) for (k = K(d.g.listeners), l = k.next(); !l.done; l = k.next()) n = l.value, bc(d, n);
            u = d.j;
            d.j = {};
            d.setOptions(u);
            w.g = 0;
          });
        });
      }
      v.reset = function() {
        return Z(this, function b() {
          var c = this;
          return O(b, function(d) {
            c.i && (c.i.reset(), c.m = {}, c.s = {});
            d.g = 0;
          });
        });
      };
      v.setOptions = function(a, b) {
        var c = this;
        if (b = b || this.g.options) {
          for (var d = [], e = [], g = {}, f = K(Object.keys(a)), h = f.next(); !h.done; g = { K: g.K, L: g.L }, h = f.next()) {
            var k = h.value;
            k in this.j && this.j[k] === a[k] || (this.j[k] = a[k], h = b[k], void 0 !== h && (h.onChange && (g.K = h.onChange, g.L = a[k], d.push(/* @__PURE__ */ function(l) {
              return function() {
                return Z(c, function u() {
                  var w, r = this;
                  return O(u, function(y) {
                    if (1 == y.g) return N(y, l.K(l.L), 2);
                    w = y.h;
                    true === w && (r.o = true);
                    y.g = 0;
                  });
                });
              };
            }(g))), h.graphOptionXref && (k = { valueNumber: 1 === h.type ? a[k] : 0, valueBoolean: 0 === h.type ? a[k] : false, valueString: 2 === h.type ? a[k] : "" }, h = Object.assign(Object.assign(Object.assign({}, { calculatorName: "", calculatorIndex: 0 }), h.graphOptionXref), k), e.push(h))));
          }
          if (0 !== d.length || 0 !== e.length) this.o = true, this.A = (void 0 === this.A ? [] : this.A).concat(e), this.u = (void 0 === this.u ? [] : this.u).concat(d);
        }
      };
      function cc(a) {
        return Z(a, function c() {
          var d = this, e, g, f, h, k, l, n;
          return O(c, function(u) {
            switch (u.g) {
              case 1:
                if (!d.o) return u.return();
                if (!d.u) {
                  u.g = 2;
                  break;
                }
                e = K(d.u);
                g = e.next();
              case 3:
                if (g.done) {
                  u.g = 5;
                  break;
                }
                f = g.value;
                return N(u, f(), 4);
              case 4:
                g = e.next();
                u.g = 3;
                break;
              case 5:
                d.u = void 0;
              case 2:
                if (d.A) {
                  h = new d.h.GraphOptionChangeRequestList();
                  k = K(d.A);
                  for (l = k.next(); !l.done; l = k.next()) n = l.value, h.push_back(n);
                  d.i.changeOptions(h);
                  h.delete();
                  d.A = void 0;
                }
                d.o = false;
                u.g = 0;
            }
          });
        });
      }
      v.initialize = function() {
        return Z(this, function b() {
          var c = this;
          return O(b, function(d) {
            return 1 == d.g ? N(d, Zb(c), 2) : 3 != d.g ? N(d, ac(c), 3) : N(d, cc(c), 0);
          });
        });
      };
      function $b(a, b) {
        return Z(a, function d() {
          var e = this, g, f;
          return O(d, function(h) {
            if (b in e.F) return h.return(e.F[b]);
            g = e.locateFile(b, "");
            f = fetch(g).then(function(k) {
              return k.arrayBuffer();
            });
            e.F[b] = f;
            return h.return(f);
          });
        });
      }
      v.overrideFile = function(a, b) {
        this.i ? this.i.overrideFile(a, b) : this.B[a] = b;
      };
      v.clearOverriddenFiles = function() {
        this.B = {};
        this.i && this.i.clearOverriddenFiles();
      };
      v.send = function(a, b) {
        return Z(this, function d() {
          var e = this, g, f, h, k, l, n, u, w, r;
          return O(d, function(y) {
            switch (y.g) {
              case 1:
                if (!e.g.inputs) return y.return();
                g = 1e3 * (void 0 === b || null === b ? performance.now() : b);
                return N(y, e.C, 2);
              case 2:
                return N(y, e.initialize(), 3);
              case 3:
                f = new e.h.PacketDataList();
                h = K(Object.keys(a));
                for (k = h.next(); !k.done; k = h.next()) if (l = k.value, n = e.g.inputs[l]) {
                  a: {
                    var m = e;
                    var t = a[l];
                    switch (n.type) {
                      case "video":
                        var x = m.m[n.stream];
                        x || (x = new Ob(m.h, m.D), m.m[n.stream] = x);
                        m = x;
                        0 === m.l && (m.l = m.h.createTexture());
                        if ("undefined" !== typeof HTMLVideoElement && t instanceof HTMLVideoElement) {
                          var z = t.videoWidth;
                          x = t.videoHeight;
                        } else "undefined" !== typeof HTMLImageElement && t instanceof HTMLImageElement ? (z = t.naturalWidth, x = t.naturalHeight) : (z = t.width, x = t.height);
                        x = { glName: m.l, width: z, height: x };
                        z = m.g;
                        z.canvas.width = x.width;
                        z.canvas.height = x.height;
                        z.activeTexture(z.TEXTURE0);
                        m.h.bindTexture2d(m.l);
                        z.texImage2D(z.TEXTURE_2D, 0, z.RGBA, z.RGBA, z.UNSIGNED_BYTE, t);
                        m.h.bindTexture2d(0);
                        m = x;
                        break a;
                      case "detections":
                        x = m.m[n.stream];
                        x || (x = new Rb(m.h), m.m[n.stream] = x);
                        m = x;
                        m.data || (m.data = new m.g.DetectionListData());
                        m.data.reset(t.length);
                        for (x = 0; x < t.length; ++x) {
                          z = t[x];
                          var E = m.data, F = E.setBoundingBox, I = x;
                          var H = z.T;
                          var p = new Fb();
                          X(p, 1, H.Z);
                          X(p, 2, H.$);
                          X(p, 3, H.height);
                          X(p, 4, H.width);
                          X(p, 5, H.rotation);
                          X(p, 6, H.X);
                          var A = H = new Ya();
                          U(A, 1, W(p, 1));
                          U(A, 2, W(p, 2));
                          U(A, 3, W(p, 3));
                          U(A, 4, W(p, 4));
                          U(A, 5, W(p, 5));
                          var C = W(p, 6);
                          if (null != C && null != C) {
                            Ra(A.g, 48);
                            var q = A.g, B = C;
                            C = 0 > B;
                            B = Math.abs(B);
                            var D = B >>> 0;
                            B = Math.floor((B - D) / 4294967296);
                            B >>>= 0;
                            C && (B = ~B >>> 0, D = (~D >>> 0) + 1, 4294967295 < D && (D = 0, B++, 4294967295 < B && (B = 0)));
                            Q = D;
                            R = B;
                            C = Q;
                            for (D = R; 0 < D || 127 < C; ) q.push(C & 127 | 128), C = (C >>> 7 | D << 25) >>> 0, D >>>= 7;
                            q.push(C);
                          }
                          rb(p, A);
                          H = $a(H);
                          F.call(E, I, H);
                          if (z.O) for (E = 0; E < z.O.length; ++E) p = z.O[E], A = p.visibility ? true : false, F = m.data, I = F.addNormalizedLandmark, H = x, p = Object.assign(Object.assign({}, p), { visibility: A ? p.visibility : 0 }), A = new Ab(), X(A, 1, p.x), X(A, 2, p.y), X(A, 3, p.z), p.visibility && X(A, 4, p.visibility), q = p = new Ya(), U(q, 1, W(A, 1)), U(q, 2, W(A, 2)), U(q, 3, W(A, 3)), U(q, 4, W(A, 4)), U(q, 5, W(A, 5)), rb(A, q), p = $a(p), I.call(F, H, p);
                          if (z.M) for (E = 0; E < z.M.length; ++E) {
                            F = m.data;
                            I = F.addClassification;
                            H = x;
                            p = z.M[E];
                            A = new wb();
                            X(A, 2, p.Y);
                            p.index && X(A, 1, p.index);
                            p.label && X(A, 3, p.label);
                            p.displayName && X(A, 4, p.displayName);
                            q = p = new Ya();
                            D = W(A, 1);
                            if (null != D && null != D) if (Ra(q.g, 8), C = q.g, 0 <= D) Ra(C, D);
                            else {
                              for (B = 0; 9 > B; B++) C.push(D & 127 | 128), D >>= 7;
                              C.push(1);
                            }
                            U(q, 2, W(A, 2));
                            C = W(A, 3);
                            null != C && (C = Ca(C), Ra(q.g, 26), Ra(q.g, C.length), Za(q, q.g.end()), Za(q, C));
                            C = W(A, 4);
                            null != C && (C = Ca(C), Ra(q.g, 34), Ra(q.g, C.length), Za(q, q.g.end()), Za(q, C));
                            rb(A, q);
                            p = $a(p);
                            I.call(F, H, p);
                          }
                        }
                        m = m.data;
                        break a;
                      default:
                        m = {};
                    }
                  }
                  u = m;
                  w = n.stream;
                  switch (n.type) {
                    case "video":
                      f.pushTexture2d(Object.assign(Object.assign({}, u), { stream: w, timestamp: g }));
                      break;
                    case "detections":
                      r = u;
                      r.stream = w;
                      r.timestamp = g;
                      f.pushDetectionList(r);
                      break;
                    default:
                      throw Error("Unknown input config type: '" + n.type + "'");
                  }
                }
                e.i.send(f);
                return N(y, e.C, 4);
              case 4:
                f.delete(), y.g = 0;
            }
          });
        });
      };
      function dc(a, b, c) {
        return Z(a, function e() {
          var g, f, h, k, l, n, u = this, w, r, y, m, t, x, z, E;
          return O(e, function(F) {
            switch (F.g) {
              case 1:
                if (!c) return F.return(b);
                g = {};
                f = 0;
                h = K(Object.keys(c));
                for (k = h.next(); !k.done; k = h.next()) l = k.value, n = c[l], "string" !== typeof n && "texture" === n.type && void 0 !== b[n.stream] && ++f;
                1 < f && (u.G = false);
                w = K(Object.keys(c));
                k = w.next();
              case 2:
                if (k.done) {
                  F.g = 4;
                  break;
                }
                r = k.value;
                y = c[r];
                if ("string" === typeof y) return z = g, E = r, N(F, ec(u, r, b[y]), 14);
                m = b[y.stream];
                if ("detection_list" === y.type) {
                  if (m) {
                    var I = m.getRectList();
                    for (var H = m.getLandmarksList(), p = m.getClassificationsList(), A = [], C = 0; C < I.size(); ++C) {
                      var q = I.get(C);
                      a: {
                        var B = new Fb();
                        for (q = new Sa(q); S(q); ) switch (q.i) {
                          case 13:
                            var D = T(q);
                            X(B, 1, D);
                            break;
                          case 21:
                            D = T(q);
                            X(B, 2, D);
                            break;
                          case 29:
                            D = T(q);
                            X(B, 3, D);
                            break;
                          case 37:
                            D = T(q);
                            X(B, 4, D);
                            break;
                          case 45:
                            D = T(q);
                            X(B, 5, D);
                            break;
                          case 48:
                            D = Oa(q.g);
                            X(B, 6, D);
                            break;
                          default:
                            if (!sb(B, q)) break a;
                        }
                      }
                      B = { Z: Y(B, 1), $: Y(B, 2), height: Y(B, 3), width: Y(B, 4), rotation: Y(B, 5, 0), X: lb(B, 6, 0) };
                      q = nb(Eb(H.get(C)), Ab).map(Nb);
                      var la = p.get(C);
                      a: for (D = new yb(), la = new Sa(la); S(la); ) switch (la.i) {
                        case 10:
                          D.addClassification(Ua(la, new wb(), xb));
                          break;
                        default:
                          if (!sb(D, la)) break a;
                      }
                      B = { T: B, O: q, M: Mb(D) };
                      A.push(B);
                    }
                    I = A;
                  } else I = [];
                  g[r] = I;
                  F.g = 7;
                  break;
                }
                if ("proto_list" === y.type) {
                  if (m) {
                    I = Array(m.size());
                    for (H = 0; H < m.size(); H++) I[H] = m.get(H);
                    m.delete();
                  } else I = [];
                  g[r] = I;
                  F.g = 7;
                  break;
                }
                if (void 0 === m) {
                  F.g = 3;
                  break;
                }
                if ("float_list" === y.type) {
                  g[r] = m;
                  F.g = 7;
                  break;
                }
                if ("proto" === y.type) {
                  g[r] = m;
                  F.g = 7;
                  break;
                }
                if ("texture" !== y.type) throw Error("Unknown output config type: '" + y.type + "'");
                t = u.s[r];
                t || (t = new Ob(u.h, u.D), u.s[r] = t);
                return N(F, Pb(t, m, u.G), 13);
              case 13:
                x = F.h, g[r] = x;
              case 7:
                y.transform && g[r] && (g[r] = y.transform(g[r]));
                F.g = 3;
                break;
              case 14:
                z[E] = F.h;
              case 3:
                k = w.next();
                F.g = 2;
                break;
              case 4:
                return F.return(g);
            }
          });
        });
      }
      function ec(a, b, c) {
        return Z(a, function e() {
          var g = this, f;
          return O(e, function(h) {
            return "number" === typeof c || c instanceof Uint8Array || c instanceof g.h.Uint8BlobList ? h.return(c) : c instanceof g.h.Texture2dDataOut ? (f = g.s[b], f || (f = new Ob(g.h, g.D), g.s[b] = f), h.return(Pb(f, c, g.G))) : h.return(void 0);
          });
        });
      }
      function bc(a, b) {
        for (var c = b.name || "$", d = [].concat(L(b.wants)), e = new a.h.StringList(), g = K(b.wants), f = g.next(); !f.done; f = g.next()) e.push_back(f.value);
        g = a.h.PacketListener.implement({ onResults: function(h) {
          for (var k = {}, l = 0; l < b.wants.length; ++l) k[d[l]] = h.get(l);
          var n = a.listeners[c];
          n && (a.C = dc(a, k, b.outs).then(function(u) {
            u = n(u);
            for (var w = 0; w < b.wants.length; ++w) {
              var r = k[d[w]];
              "object" === typeof r && r.hasOwnProperty && r.hasOwnProperty("delete") && r.delete();
            }
            u && (a.C = u);
          }));
        } });
        a.i.attachMultiListener(e, g);
        e.delete();
      }
      v.onResults = function(a, b) {
        this.listeners[b || "$"] = a;
      };
      P("Solution", Xb);
      P("OptionType", { BOOL: 0, NUMBER: 1, aa: 2, 0: "BOOL", 1: "NUMBER", 2: "STRING" });
      function fc(a) {
        a = Kb(a);
        var b = a.getMesh();
        if (!b) return a;
        var c = new Float32Array(b.getVertexBufferList());
        b.getVertexBufferList = function() {
          return c;
        };
        var d = new Uint32Array(b.getIndexBufferList());
        b.getIndexBufferList = function() {
          return d;
        };
        return a;
      }
      ;
      var gc = { files: [{ url: "face_mesh_solution_packed_assets_loader.js" }, { simd: true, url: "face_mesh_solution_simd_wasm_bin.js" }, { simd: false, url: "face_mesh_solution_wasm_bin.js" }], graph: { url: "face_mesh.binarypb" }, listeners: [{ wants: ["multi_face_geometry", "image_transformed", "multi_face_landmarks"], outs: { image: "image_transformed", multiFaceGeometry: { type: "proto_list", stream: "multi_face_geometry", transform: function(a) {
        return a.map(fc);
      } }, multiFaceLandmarks: { type: "proto_list", stream: "multi_face_landmarks", transform: function(a) {
        return a.map(function(b) {
          return nb(
            Eb(b),
            Ab
          ).map(Nb);
        });
      } } } }], inputs: { image: { type: "video", stream: "input_frames_gpu" } }, options: { useCpuInference: { type: 0, graphOptionXref: { calculatorType: "InferenceCalculator", fieldName: "use_cpu_inference" }, default: "iPad Simulator;iPhone Simulator;iPod Simulator;iPad;iPhone;iPod".split(";").includes(navigator.platform) || navigator.userAgent.includes("Mac") && "ontouchend" in document }, enableFaceGeometry: { type: 0, graphOptionXref: {
        calculatorName: "EnableFaceGeometryConstant",
        calculatorType: "ConstantSidePacketCalculator",
        fieldName: "bool_value"
      } }, selfieMode: { type: 0, graphOptionXref: { calculatorType: "GlScalerCalculator", calculatorIndex: 1, fieldName: "flip_horizontal" } }, maxNumFaces: { type: 1, graphOptionXref: { calculatorType: "ConstantSidePacketCalculator", calculatorName: "ConstantSidePacketCalculatorNumFaces", fieldName: "int_value" } }, refineLandmarks: { type: 0, graphOptionXref: { calculatorType: "ConstantSidePacketCalculator", calculatorName: "ConstantSidePacketCalculatorRefineLandmarks", fieldName: "bool_value" } }, minDetectionConfidence: {
        type: 1,
        graphOptionXref: { calculatorType: "TensorsToDetectionsCalculator", calculatorName: "facelandmarkfrontgpu__facedetectionshortrangegpu__facedetectionshortrangecommon__TensorsToDetectionsCalculator", fieldName: "min_score_thresh" }
      }, minTrackingConfidence: { type: 1, graphOptionXref: { calculatorType: "ThresholdingCalculator", calculatorName: "facelandmarkfrontgpu__facelandmarkgpu__ThresholdingCalculator", fieldName: "threshold" } }, cameraNear: { type: 1, graphOptionXref: {
        calculatorType: "FaceGeometryEnvGeneratorCalculator",
        fieldName: "near"
      } }, cameraFar: { type: 1, graphOptionXref: { calculatorType: "FaceGeometryEnvGeneratorCalculator", fieldName: "far" } }, cameraVerticalFovDegrees: { type: 1, graphOptionXref: { calculatorType: "FaceGeometryEnvGeneratorCalculator", fieldName: "vertical_fov_degrees" } } } };
      var hc = [[61, 146], [146, 91], [91, 181], [181, 84], [84, 17], [17, 314], [314, 405], [405, 321], [321, 375], [375, 291], [61, 185], [185, 40], [40, 39], [39, 37], [37, 0], [0, 267], [267, 269], [269, 270], [270, 409], [409, 291], [78, 95], [95, 88], [88, 178], [178, 87], [87, 14], [14, 317], [317, 402], [402, 318], [318, 324], [324, 308], [78, 191], [191, 80], [80, 81], [81, 82], [82, 13], [13, 312], [312, 311], [311, 310], [310, 415], [415, 308]], ic = [[263, 249], [249, 390], [390, 373], [373, 374], [374, 380], [380, 381], [381, 382], [382, 362], [263, 466], [466, 388], [388, 387], [387, 386], [
        386,
        385
      ], [385, 384], [384, 398], [398, 362]], jc = [[276, 283], [283, 282], [282, 295], [295, 285], [300, 293], [293, 334], [334, 296], [296, 336]], kc = [[33, 7], [7, 163], [163, 144], [144, 145], [145, 153], [153, 154], [154, 155], [155, 133], [33, 246], [246, 161], [161, 160], [160, 159], [159, 158], [158, 157], [157, 173], [173, 133]], lc = [[46, 53], [53, 52], [52, 65], [65, 55], [70, 63], [63, 105], [105, 66], [66, 107]], mc = [
        [10, 338],
        [338, 297],
        [297, 332],
        [332, 284],
        [284, 251],
        [251, 389],
        [389, 356],
        [356, 454],
        [454, 323],
        [323, 361],
        [361, 288],
        [288, 397],
        [397, 365],
        [365, 379],
        [379, 378],
        [378, 400],
        [400, 377],
        [377, 152],
        [152, 148],
        [148, 176],
        [176, 149],
        [149, 150],
        [150, 136],
        [136, 172],
        [172, 58],
        [58, 132],
        [132, 93],
        [93, 234],
        [234, 127],
        [127, 162],
        [162, 21],
        [21, 54],
        [54, 103],
        [103, 67],
        [67, 109],
        [109, 10]
      ], nc = [].concat(L(hc), L(ic), L(jc), L(kc), L(lc), L(mc));
      function oc(a) {
        a = a || {};
        a = Object.assign(Object.assign({}, gc), a);
        this.g = new Xb(a);
      }
      v = oc.prototype;
      v.close = function() {
        this.g.close();
        return Promise.resolve();
      };
      v.onResults = function(a) {
        this.g.onResults(a);
      };
      v.initialize = function() {
        return Z(this, function b() {
          var c = this;
          return O(b, function(d) {
            return N(d, c.g.initialize(), 0);
          });
        });
      };
      v.reset = function() {
        this.g.reset();
      };
      v.send = function(a) {
        return Z(this, function c() {
          var d = this;
          return O(c, function(e) {
            return N(e, d.g.send(a), 0);
          });
        });
      };
      v.setOptions = function(a) {
        this.g.setOptions(a);
      };
      P("FACE_GEOMETRY", { Layout: { COLUMN_MAJOR: 0, ROW_MAJOR: 1, 0: "COLUMN_MAJOR", 1: "ROW_MAJOR" }, PrimitiveType: { TRIANGLE: 0, 0: "TRIANGLE" }, VertexType: { VERTEX_PT: 0, 0: "VERTEX_PT" }, DEFAULT_CAMERA_PARAMS: { verticalFovDegrees: 63, near: 1, far: 1e4 } });
      P("FaceMesh", oc);
      P("FACEMESH_LIPS", hc);
      P("FACEMESH_LEFT_EYE", ic);
      P("FACEMESH_LEFT_EYEBROW", jc);
      P("FACEMESH_LEFT_IRIS", [[474, 475], [475, 476], [476, 477], [477, 474]]);
      P("FACEMESH_RIGHT_EYE", kc);
      P("FACEMESH_RIGHT_EYEBROW", lc);
      P("FACEMESH_RIGHT_IRIS", [[469, 470], [470, 471], [471, 472], [472, 469]]);
      P("FACEMESH_FACE_OVAL", mc);
      P("FACEMESH_CONTOURS", nc);
      P("FACEMESH_TESSELATION", [
        [127, 34],
        [34, 139],
        [139, 127],
        [11, 0],
        [0, 37],
        [37, 11],
        [232, 231],
        [231, 120],
        [120, 232],
        [72, 37],
        [37, 39],
        [39, 72],
        [128, 121],
        [121, 47],
        [47, 128],
        [232, 121],
        [121, 128],
        [128, 232],
        [104, 69],
        [69, 67],
        [67, 104],
        [175, 171],
        [171, 148],
        [148, 175],
        [118, 50],
        [50, 101],
        [101, 118],
        [73, 39],
        [39, 40],
        [40, 73],
        [9, 151],
        [151, 108],
        [108, 9],
        [48, 115],
        [115, 131],
        [131, 48],
        [194, 204],
        [204, 211],
        [211, 194],
        [74, 40],
        [40, 185],
        [185, 74],
        [80, 42],
        [42, 183],
        [183, 80],
        [40, 92],
        [92, 186],
        [186, 40],
        [230, 229],
        [229, 118],
        [118, 230],
        [202, 212],
        [
          212,
          214
        ],
        [214, 202],
        [83, 18],
        [18, 17],
        [17, 83],
        [76, 61],
        [61, 146],
        [146, 76],
        [160, 29],
        [29, 30],
        [30, 160],
        [56, 157],
        [157, 173],
        [173, 56],
        [106, 204],
        [204, 194],
        [194, 106],
        [135, 214],
        [214, 192],
        [192, 135],
        [203, 165],
        [165, 98],
        [98, 203],
        [21, 71],
        [71, 68],
        [68, 21],
        [51, 45],
        [45, 4],
        [4, 51],
        [144, 24],
        [24, 23],
        [23, 144],
        [77, 146],
        [146, 91],
        [91, 77],
        [205, 50],
        [50, 187],
        [187, 205],
        [201, 200],
        [200, 18],
        [18, 201],
        [91, 106],
        [106, 182],
        [182, 91],
        [90, 91],
        [91, 181],
        [181, 90],
        [85, 84],
        [84, 17],
        [17, 85],
        [206, 203],
        [203, 36],
        [36, 206],
        [148, 171],
        [171, 140],
        [140, 148],
        [
          92,
          40
        ],
        [40, 39],
        [39, 92],
        [193, 189],
        [189, 244],
        [244, 193],
        [159, 158],
        [158, 28],
        [28, 159],
        [247, 246],
        [246, 161],
        [161, 247],
        [236, 3],
        [3, 196],
        [196, 236],
        [54, 68],
        [68, 104],
        [104, 54],
        [193, 168],
        [168, 8],
        [8, 193],
        [117, 228],
        [228, 31],
        [31, 117],
        [189, 193],
        [193, 55],
        [55, 189],
        [98, 97],
        [97, 99],
        [99, 98],
        [126, 47],
        [47, 100],
        [100, 126],
        [166, 79],
        [79, 218],
        [218, 166],
        [155, 154],
        [154, 26],
        [26, 155],
        [209, 49],
        [49, 131],
        [131, 209],
        [135, 136],
        [136, 150],
        [150, 135],
        [47, 126],
        [126, 217],
        [217, 47],
        [223, 52],
        [52, 53],
        [53, 223],
        [45, 51],
        [51, 134],
        [134, 45],
        [211, 170],
        [
          170,
          140
        ],
        [140, 211],
        [67, 69],
        [69, 108],
        [108, 67],
        [43, 106],
        [106, 91],
        [91, 43],
        [230, 119],
        [119, 120],
        [120, 230],
        [226, 130],
        [130, 247],
        [247, 226],
        [63, 53],
        [53, 52],
        [52, 63],
        [238, 20],
        [20, 242],
        [242, 238],
        [46, 70],
        [70, 156],
        [156, 46],
        [78, 62],
        [62, 96],
        [96, 78],
        [46, 53],
        [53, 63],
        [63, 46],
        [143, 34],
        [34, 227],
        [227, 143],
        [123, 117],
        [117, 111],
        [111, 123],
        [44, 125],
        [125, 19],
        [19, 44],
        [236, 134],
        [134, 51],
        [51, 236],
        [216, 206],
        [206, 205],
        [205, 216],
        [154, 153],
        [153, 22],
        [22, 154],
        [39, 37],
        [37, 167],
        [167, 39],
        [200, 201],
        [201, 208],
        [208, 200],
        [36, 142],
        [142, 100],
        [
          100,
          36
        ],
        [57, 212],
        [212, 202],
        [202, 57],
        [20, 60],
        [60, 99],
        [99, 20],
        [28, 158],
        [158, 157],
        [157, 28],
        [35, 226],
        [226, 113],
        [113, 35],
        [160, 159],
        [159, 27],
        [27, 160],
        [204, 202],
        [202, 210],
        [210, 204],
        [113, 225],
        [225, 46],
        [46, 113],
        [43, 202],
        [202, 204],
        [204, 43],
        [62, 76],
        [76, 77],
        [77, 62],
        [137, 123],
        [123, 116],
        [116, 137],
        [41, 38],
        [38, 72],
        [72, 41],
        [203, 129],
        [129, 142],
        [142, 203],
        [64, 98],
        [98, 240],
        [240, 64],
        [49, 102],
        [102, 64],
        [64, 49],
        [41, 73],
        [73, 74],
        [74, 41],
        [212, 216],
        [216, 207],
        [207, 212],
        [42, 74],
        [74, 184],
        [184, 42],
        [169, 170],
        [170, 211],
        [211, 169],
        [
          170,
          149
        ],
        [149, 176],
        [176, 170],
        [105, 66],
        [66, 69],
        [69, 105],
        [122, 6],
        [6, 168],
        [168, 122],
        [123, 147],
        [147, 187],
        [187, 123],
        [96, 77],
        [77, 90],
        [90, 96],
        [65, 55],
        [55, 107],
        [107, 65],
        [89, 90],
        [90, 180],
        [180, 89],
        [101, 100],
        [100, 120],
        [120, 101],
        [63, 105],
        [105, 104],
        [104, 63],
        [93, 137],
        [137, 227],
        [227, 93],
        [15, 86],
        [86, 85],
        [85, 15],
        [129, 102],
        [102, 49],
        [49, 129],
        [14, 87],
        [87, 86],
        [86, 14],
        [55, 8],
        [8, 9],
        [9, 55],
        [100, 47],
        [47, 121],
        [121, 100],
        [145, 23],
        [23, 22],
        [22, 145],
        [88, 89],
        [89, 179],
        [179, 88],
        [6, 122],
        [122, 196],
        [196, 6],
        [88, 95],
        [95, 96],
        [96, 88],
        [138, 172],
        [172, 136],
        [136, 138],
        [215, 58],
        [58, 172],
        [172, 215],
        [115, 48],
        [48, 219],
        [219, 115],
        [42, 80],
        [80, 81],
        [81, 42],
        [195, 3],
        [3, 51],
        [51, 195],
        [43, 146],
        [146, 61],
        [61, 43],
        [171, 175],
        [175, 199],
        [199, 171],
        [81, 82],
        [82, 38],
        [38, 81],
        [53, 46],
        [46, 225],
        [225, 53],
        [144, 163],
        [163, 110],
        [110, 144],
        [52, 65],
        [65, 66],
        [66, 52],
        [229, 228],
        [228, 117],
        [117, 229],
        [34, 127],
        [127, 234],
        [234, 34],
        [107, 108],
        [108, 69],
        [69, 107],
        [109, 108],
        [108, 151],
        [151, 109],
        [48, 64],
        [64, 235],
        [235, 48],
        [62, 78],
        [78, 191],
        [191, 62],
        [129, 209],
        [209, 126],
        [126, 129],
        [111, 35],
        [35, 143],
        [
          143,
          111
        ],
        [117, 123],
        [123, 50],
        [50, 117],
        [222, 65],
        [65, 52],
        [52, 222],
        [19, 125],
        [125, 141],
        [141, 19],
        [221, 55],
        [55, 65],
        [65, 221],
        [3, 195],
        [195, 197],
        [197, 3],
        [25, 7],
        [7, 33],
        [33, 25],
        [220, 237],
        [237, 44],
        [44, 220],
        [70, 71],
        [71, 139],
        [139, 70],
        [122, 193],
        [193, 245],
        [245, 122],
        [247, 130],
        [130, 33],
        [33, 247],
        [71, 21],
        [21, 162],
        [162, 71],
        [170, 169],
        [169, 150],
        [150, 170],
        [188, 174],
        [174, 196],
        [196, 188],
        [216, 186],
        [186, 92],
        [92, 216],
        [2, 97],
        [97, 167],
        [167, 2],
        [141, 125],
        [125, 241],
        [241, 141],
        [164, 167],
        [167, 37],
        [37, 164],
        [72, 38],
        [38, 12],
        [12, 72],
        [38, 82],
        [82, 13],
        [13, 38],
        [63, 68],
        [68, 71],
        [71, 63],
        [226, 35],
        [35, 111],
        [111, 226],
        [101, 50],
        [50, 205],
        [205, 101],
        [206, 92],
        [92, 165],
        [165, 206],
        [209, 198],
        [198, 217],
        [217, 209],
        [165, 167],
        [167, 97],
        [97, 165],
        [220, 115],
        [115, 218],
        [218, 220],
        [133, 112],
        [112, 243],
        [243, 133],
        [239, 238],
        [238, 241],
        [241, 239],
        [214, 135],
        [135, 169],
        [169, 214],
        [190, 173],
        [173, 133],
        [133, 190],
        [171, 208],
        [208, 32],
        [32, 171],
        [125, 44],
        [44, 237],
        [237, 125],
        [86, 87],
        [87, 178],
        [178, 86],
        [85, 86],
        [86, 179],
        [179, 85],
        [84, 85],
        [85, 180],
        [180, 84],
        [83, 84],
        [84, 181],
        [181, 83],
        [201, 83],
        [83, 182],
        [182, 201],
        [137, 93],
        [93, 132],
        [132, 137],
        [76, 62],
        [62, 183],
        [183, 76],
        [61, 76],
        [76, 184],
        [184, 61],
        [57, 61],
        [61, 185],
        [185, 57],
        [212, 57],
        [57, 186],
        [186, 212],
        [214, 207],
        [207, 187],
        [187, 214],
        [34, 143],
        [143, 156],
        [156, 34],
        [79, 239],
        [239, 237],
        [237, 79],
        [123, 137],
        [137, 177],
        [177, 123],
        [44, 1],
        [1, 4],
        [4, 44],
        [201, 194],
        [194, 32],
        [32, 201],
        [64, 102],
        [102, 129],
        [129, 64],
        [213, 215],
        [215, 138],
        [138, 213],
        [59, 166],
        [166, 219],
        [219, 59],
        [242, 99],
        [99, 97],
        [97, 242],
        [2, 94],
        [94, 141],
        [141, 2],
        [75, 59],
        [59, 235],
        [235, 75],
        [24, 110],
        [110, 228],
        [
          228,
          24
        ],
        [25, 130],
        [130, 226],
        [226, 25],
        [23, 24],
        [24, 229],
        [229, 23],
        [22, 23],
        [23, 230],
        [230, 22],
        [26, 22],
        [22, 231],
        [231, 26],
        [112, 26],
        [26, 232],
        [232, 112],
        [189, 190],
        [190, 243],
        [243, 189],
        [221, 56],
        [56, 190],
        [190, 221],
        [28, 56],
        [56, 221],
        [221, 28],
        [27, 28],
        [28, 222],
        [222, 27],
        [29, 27],
        [27, 223],
        [223, 29],
        [30, 29],
        [29, 224],
        [224, 30],
        [247, 30],
        [30, 225],
        [225, 247],
        [238, 79],
        [79, 20],
        [20, 238],
        [166, 59],
        [59, 75],
        [75, 166],
        [60, 75],
        [75, 240],
        [240, 60],
        [147, 177],
        [177, 215],
        [215, 147],
        [20, 79],
        [79, 166],
        [166, 20],
        [187, 147],
        [147, 213],
        [213, 187],
        [112, 233],
        [233, 244],
        [244, 112],
        [233, 128],
        [128, 245],
        [245, 233],
        [128, 114],
        [114, 188],
        [188, 128],
        [114, 217],
        [217, 174],
        [174, 114],
        [131, 115],
        [115, 220],
        [220, 131],
        [217, 198],
        [198, 236],
        [236, 217],
        [198, 131],
        [131, 134],
        [134, 198],
        [177, 132],
        [132, 58],
        [58, 177],
        [143, 35],
        [35, 124],
        [124, 143],
        [110, 163],
        [163, 7],
        [7, 110],
        [228, 110],
        [110, 25],
        [25, 228],
        [356, 389],
        [389, 368],
        [368, 356],
        [11, 302],
        [302, 267],
        [267, 11],
        [452, 350],
        [350, 349],
        [349, 452],
        [302, 303],
        [303, 269],
        [269, 302],
        [357, 343],
        [343, 277],
        [277, 357],
        [452, 453],
        [453, 357],
        [357, 452],
        [333, 332],
        [
          332,
          297
        ],
        [297, 333],
        [175, 152],
        [152, 377],
        [377, 175],
        [347, 348],
        [348, 330],
        [330, 347],
        [303, 304],
        [304, 270],
        [270, 303],
        [9, 336],
        [336, 337],
        [337, 9],
        [278, 279],
        [279, 360],
        [360, 278],
        [418, 262],
        [262, 431],
        [431, 418],
        [304, 408],
        [408, 409],
        [409, 304],
        [310, 415],
        [415, 407],
        [407, 310],
        [270, 409],
        [409, 410],
        [410, 270],
        [450, 348],
        [348, 347],
        [347, 450],
        [422, 430],
        [430, 434],
        [434, 422],
        [313, 314],
        [314, 17],
        [17, 313],
        [306, 307],
        [307, 375],
        [375, 306],
        [387, 388],
        [388, 260],
        [260, 387],
        [286, 414],
        [414, 398],
        [398, 286],
        [335, 406],
        [406, 418],
        [418, 335],
        [364, 367],
        [
          367,
          416
        ],
        [416, 364],
        [423, 358],
        [358, 327],
        [327, 423],
        [251, 284],
        [284, 298],
        [298, 251],
        [281, 5],
        [5, 4],
        [4, 281],
        [373, 374],
        [374, 253],
        [253, 373],
        [307, 320],
        [320, 321],
        [321, 307],
        [425, 427],
        [427, 411],
        [411, 425],
        [421, 313],
        [313, 18],
        [18, 421],
        [321, 405],
        [405, 406],
        [406, 321],
        [320, 404],
        [404, 405],
        [405, 320],
        [315, 16],
        [16, 17],
        [17, 315],
        [426, 425],
        [425, 266],
        [266, 426],
        [377, 400],
        [400, 369],
        [369, 377],
        [322, 391],
        [391, 269],
        [269, 322],
        [417, 465],
        [465, 464],
        [464, 417],
        [386, 257],
        [257, 258],
        [258, 386],
        [466, 260],
        [260, 388],
        [388, 466],
        [456, 399],
        [399, 419],
        [419, 456],
        [284, 332],
        [332, 333],
        [333, 284],
        [417, 285],
        [285, 8],
        [8, 417],
        [346, 340],
        [340, 261],
        [261, 346],
        [413, 441],
        [441, 285],
        [285, 413],
        [327, 460],
        [460, 328],
        [328, 327],
        [355, 371],
        [371, 329],
        [329, 355],
        [392, 439],
        [439, 438],
        [438, 392],
        [382, 341],
        [341, 256],
        [256, 382],
        [429, 420],
        [420, 360],
        [360, 429],
        [364, 394],
        [394, 379],
        [379, 364],
        [277, 343],
        [343, 437],
        [437, 277],
        [443, 444],
        [444, 283],
        [283, 443],
        [275, 440],
        [440, 363],
        [363, 275],
        [431, 262],
        [262, 369],
        [369, 431],
        [297, 338],
        [338, 337],
        [337, 297],
        [273, 375],
        [375, 321],
        [321, 273],
        [450, 451],
        [
          451,
          349
        ],
        [349, 450],
        [446, 342],
        [342, 467],
        [467, 446],
        [293, 334],
        [334, 282],
        [282, 293],
        [458, 461],
        [461, 462],
        [462, 458],
        [276, 353],
        [353, 383],
        [383, 276],
        [308, 324],
        [324, 325],
        [325, 308],
        [276, 300],
        [300, 293],
        [293, 276],
        [372, 345],
        [345, 447],
        [447, 372],
        [352, 345],
        [345, 340],
        [340, 352],
        [274, 1],
        [1, 19],
        [19, 274],
        [456, 248],
        [248, 281],
        [281, 456],
        [436, 427],
        [427, 425],
        [425, 436],
        [381, 256],
        [256, 252],
        [252, 381],
        [269, 391],
        [391, 393],
        [393, 269],
        [200, 199],
        [199, 428],
        [428, 200],
        [266, 330],
        [330, 329],
        [329, 266],
        [287, 273],
        [273, 422],
        [422, 287],
        [250, 462],
        [
          462,
          328
        ],
        [328, 250],
        [258, 286],
        [286, 384],
        [384, 258],
        [265, 353],
        [353, 342],
        [342, 265],
        [387, 259],
        [259, 257],
        [257, 387],
        [424, 431],
        [431, 430],
        [430, 424],
        [342, 353],
        [353, 276],
        [276, 342],
        [273, 335],
        [335, 424],
        [424, 273],
        [292, 325],
        [325, 307],
        [307, 292],
        [366, 447],
        [447, 345],
        [345, 366],
        [271, 303],
        [303, 302],
        [302, 271],
        [423, 266],
        [266, 371],
        [371, 423],
        [294, 455],
        [455, 460],
        [460, 294],
        [279, 278],
        [278, 294],
        [294, 279],
        [271, 272],
        [272, 304],
        [304, 271],
        [432, 434],
        [434, 427],
        [427, 432],
        [272, 407],
        [407, 408],
        [408, 272],
        [394, 430],
        [430, 431],
        [431, 394],
        [395, 369],
        [369, 400],
        [400, 395],
        [334, 333],
        [333, 299],
        [299, 334],
        [351, 417],
        [417, 168],
        [168, 351],
        [352, 280],
        [280, 411],
        [411, 352],
        [325, 319],
        [319, 320],
        [320, 325],
        [295, 296],
        [296, 336],
        [336, 295],
        [319, 403],
        [403, 404],
        [404, 319],
        [330, 348],
        [348, 349],
        [349, 330],
        [293, 298],
        [298, 333],
        [333, 293],
        [323, 454],
        [454, 447],
        [447, 323],
        [15, 16],
        [16, 315],
        [315, 15],
        [358, 429],
        [429, 279],
        [279, 358],
        [14, 15],
        [15, 316],
        [316, 14],
        [285, 336],
        [336, 9],
        [9, 285],
        [329, 349],
        [349, 350],
        [350, 329],
        [374, 380],
        [380, 252],
        [252, 374],
        [318, 402],
        [402, 403],
        [403, 318],
        [6, 197],
        [
          197,
          419
        ],
        [419, 6],
        [318, 319],
        [319, 325],
        [325, 318],
        [367, 364],
        [364, 365],
        [365, 367],
        [435, 367],
        [367, 397],
        [397, 435],
        [344, 438],
        [438, 439],
        [439, 344],
        [272, 271],
        [271, 311],
        [311, 272],
        [195, 5],
        [5, 281],
        [281, 195],
        [273, 287],
        [287, 291],
        [291, 273],
        [396, 428],
        [428, 199],
        [199, 396],
        [311, 271],
        [271, 268],
        [268, 311],
        [283, 444],
        [444, 445],
        [445, 283],
        [373, 254],
        [254, 339],
        [339, 373],
        [282, 334],
        [334, 296],
        [296, 282],
        [449, 347],
        [347, 346],
        [346, 449],
        [264, 447],
        [447, 454],
        [454, 264],
        [336, 296],
        [296, 299],
        [299, 336],
        [338, 10],
        [10, 151],
        [151, 338],
        [278, 439],
        [
          439,
          455
        ],
        [455, 278],
        [292, 407],
        [407, 415],
        [415, 292],
        [358, 371],
        [371, 355],
        [355, 358],
        [340, 345],
        [345, 372],
        [372, 340],
        [346, 347],
        [347, 280],
        [280, 346],
        [442, 443],
        [443, 282],
        [282, 442],
        [19, 94],
        [94, 370],
        [370, 19],
        [441, 442],
        [442, 295],
        [295, 441],
        [248, 419],
        [419, 197],
        [197, 248],
        [263, 255],
        [255, 359],
        [359, 263],
        [440, 275],
        [275, 274],
        [274, 440],
        [300, 383],
        [383, 368],
        [368, 300],
        [351, 412],
        [412, 465],
        [465, 351],
        [263, 467],
        [467, 466],
        [466, 263],
        [301, 368],
        [368, 389],
        [389, 301],
        [395, 378],
        [378, 379],
        [379, 395],
        [412, 351],
        [351, 419],
        [419, 412],
        [436, 426],
        [426, 322],
        [322, 436],
        [2, 164],
        [164, 393],
        [393, 2],
        [370, 462],
        [462, 461],
        [461, 370],
        [164, 0],
        [0, 267],
        [267, 164],
        [302, 11],
        [11, 12],
        [12, 302],
        [268, 12],
        [12, 13],
        [13, 268],
        [293, 300],
        [300, 301],
        [301, 293],
        [446, 261],
        [261, 340],
        [340, 446],
        [330, 266],
        [266, 425],
        [425, 330],
        [426, 423],
        [423, 391],
        [391, 426],
        [429, 355],
        [355, 437],
        [437, 429],
        [391, 327],
        [327, 326],
        [326, 391],
        [440, 457],
        [457, 438],
        [438, 440],
        [341, 382],
        [382, 362],
        [362, 341],
        [459, 457],
        [457, 461],
        [461, 459],
        [434, 430],
        [430, 394],
        [394, 434],
        [414, 463],
        [463, 362],
        [362, 414],
        [396, 369],
        [369, 262],
        [262, 396],
        [354, 461],
        [461, 457],
        [457, 354],
        [316, 403],
        [403, 402],
        [402, 316],
        [315, 404],
        [404, 403],
        [403, 315],
        [314, 405],
        [405, 404],
        [404, 314],
        [313, 406],
        [406, 405],
        [405, 313],
        [421, 418],
        [418, 406],
        [406, 421],
        [366, 401],
        [401, 361],
        [361, 366],
        [306, 408],
        [408, 407],
        [407, 306],
        [291, 409],
        [409, 408],
        [408, 291],
        [287, 410],
        [410, 409],
        [409, 287],
        [432, 436],
        [436, 410],
        [410, 432],
        [434, 416],
        [416, 411],
        [411, 434],
        [264, 368],
        [368, 383],
        [383, 264],
        [309, 438],
        [438, 457],
        [457, 309],
        [352, 376],
        [376, 401],
        [401, 352],
        [274, 275],
        [275, 4],
        [4, 274],
        [421, 428],
        [
          428,
          262
        ],
        [262, 421],
        [294, 327],
        [327, 358],
        [358, 294],
        [433, 416],
        [416, 367],
        [367, 433],
        [289, 455],
        [455, 439],
        [439, 289],
        [462, 370],
        [370, 326],
        [326, 462],
        [2, 326],
        [326, 370],
        [370, 2],
        [305, 460],
        [460, 455],
        [455, 305],
        [254, 449],
        [449, 448],
        [448, 254],
        [255, 261],
        [261, 446],
        [446, 255],
        [253, 450],
        [450, 449],
        [449, 253],
        [252, 451],
        [451, 450],
        [450, 252],
        [256, 452],
        [452, 451],
        [451, 256],
        [341, 453],
        [453, 452],
        [452, 341],
        [413, 464],
        [464, 463],
        [463, 413],
        [441, 413],
        [413, 414],
        [414, 441],
        [258, 442],
        [442, 441],
        [441, 258],
        [257, 443],
        [443, 442],
        [442, 257],
        [259, 444],
        [444, 443],
        [443, 259],
        [260, 445],
        [445, 444],
        [444, 260],
        [467, 342],
        [342, 445],
        [445, 467],
        [459, 458],
        [458, 250],
        [250, 459],
        [289, 392],
        [392, 290],
        [290, 289],
        [290, 328],
        [328, 460],
        [460, 290],
        [376, 433],
        [433, 435],
        [435, 376],
        [250, 290],
        [290, 392],
        [392, 250],
        [411, 416],
        [416, 433],
        [433, 411],
        [341, 463],
        [463, 464],
        [464, 341],
        [453, 464],
        [464, 465],
        [465, 453],
        [357, 465],
        [465, 412],
        [412, 357],
        [343, 412],
        [412, 399],
        [399, 343],
        [360, 363],
        [363, 440],
        [440, 360],
        [437, 399],
        [399, 456],
        [456, 437],
        [420, 456],
        [456, 363],
        [363, 420],
        [401, 435],
        [435, 288],
        [288, 401],
        [
          372,
          383
        ],
        [383, 353],
        [353, 372],
        [339, 255],
        [255, 249],
        [249, 339],
        [448, 261],
        [261, 255],
        [255, 448],
        [133, 243],
        [243, 190],
        [190, 133],
        [133, 155],
        [155, 112],
        [112, 133],
        [33, 246],
        [246, 247],
        [247, 33],
        [33, 130],
        [130, 25],
        [25, 33],
        [398, 384],
        [384, 286],
        [286, 398],
        [362, 398],
        [398, 414],
        [414, 362],
        [362, 463],
        [463, 341],
        [341, 362],
        [263, 359],
        [359, 467],
        [467, 263],
        [263, 249],
        [249, 255],
        [255, 263],
        [466, 467],
        [467, 260],
        [260, 466],
        [75, 60],
        [60, 166],
        [166, 75],
        [238, 239],
        [239, 79],
        [79, 238],
        [162, 127],
        [127, 139],
        [139, 162],
        [72, 11],
        [11, 37],
        [37, 72],
        [121, 232],
        [
          232,
          120
        ],
        [120, 121],
        [73, 72],
        [72, 39],
        [39, 73],
        [114, 128],
        [128, 47],
        [47, 114],
        [233, 232],
        [232, 128],
        [128, 233],
        [103, 104],
        [104, 67],
        [67, 103],
        [152, 175],
        [175, 148],
        [148, 152],
        [119, 118],
        [118, 101],
        [101, 119],
        [74, 73],
        [73, 40],
        [40, 74],
        [107, 9],
        [9, 108],
        [108, 107],
        [49, 48],
        [48, 131],
        [131, 49],
        [32, 194],
        [194, 211],
        [211, 32],
        [184, 74],
        [74, 185],
        [185, 184],
        [191, 80],
        [80, 183],
        [183, 191],
        [185, 40],
        [40, 186],
        [186, 185],
        [119, 230],
        [230, 118],
        [118, 119],
        [210, 202],
        [202, 214],
        [214, 210],
        [84, 83],
        [83, 17],
        [17, 84],
        [77, 76],
        [76, 146],
        [146, 77],
        [161, 160],
        [160, 30],
        [30, 161],
        [190, 56],
        [56, 173],
        [173, 190],
        [182, 106],
        [106, 194],
        [194, 182],
        [138, 135],
        [135, 192],
        [192, 138],
        [129, 203],
        [203, 98],
        [98, 129],
        [54, 21],
        [21, 68],
        [68, 54],
        [5, 51],
        [51, 4],
        [4, 5],
        [145, 144],
        [144, 23],
        [23, 145],
        [90, 77],
        [77, 91],
        [91, 90],
        [207, 205],
        [205, 187],
        [187, 207],
        [83, 201],
        [201, 18],
        [18, 83],
        [181, 91],
        [91, 182],
        [182, 181],
        [180, 90],
        [90, 181],
        [181, 180],
        [16, 85],
        [85, 17],
        [17, 16],
        [205, 206],
        [206, 36],
        [36, 205],
        [176, 148],
        [148, 140],
        [140, 176],
        [165, 92],
        [92, 39],
        [39, 165],
        [245, 193],
        [193, 244],
        [244, 245],
        [27, 159],
        [159, 28],
        [28, 27],
        [
          30,
          247
        ],
        [247, 161],
        [161, 30],
        [174, 236],
        [236, 196],
        [196, 174],
        [103, 54],
        [54, 104],
        [104, 103],
        [55, 193],
        [193, 8],
        [8, 55],
        [111, 117],
        [117, 31],
        [31, 111],
        [221, 189],
        [189, 55],
        [55, 221],
        [240, 98],
        [98, 99],
        [99, 240],
        [142, 126],
        [126, 100],
        [100, 142],
        [219, 166],
        [166, 218],
        [218, 219],
        [112, 155],
        [155, 26],
        [26, 112],
        [198, 209],
        [209, 131],
        [131, 198],
        [169, 135],
        [135, 150],
        [150, 169],
        [114, 47],
        [47, 217],
        [217, 114],
        [224, 223],
        [223, 53],
        [53, 224],
        [220, 45],
        [45, 134],
        [134, 220],
        [32, 211],
        [211, 140],
        [140, 32],
        [109, 67],
        [67, 108],
        [108, 109],
        [146, 43],
        [43, 91],
        [91, 146],
        [231, 230],
        [230, 120],
        [120, 231],
        [113, 226],
        [226, 247],
        [247, 113],
        [105, 63],
        [63, 52],
        [52, 105],
        [241, 238],
        [238, 242],
        [242, 241],
        [124, 46],
        [46, 156],
        [156, 124],
        [95, 78],
        [78, 96],
        [96, 95],
        [70, 46],
        [46, 63],
        [63, 70],
        [116, 143],
        [143, 227],
        [227, 116],
        [116, 123],
        [123, 111],
        [111, 116],
        [1, 44],
        [44, 19],
        [19, 1],
        [3, 236],
        [236, 51],
        [51, 3],
        [207, 216],
        [216, 205],
        [205, 207],
        [26, 154],
        [154, 22],
        [22, 26],
        [165, 39],
        [39, 167],
        [167, 165],
        [199, 200],
        [200, 208],
        [208, 199],
        [101, 36],
        [36, 100],
        [100, 101],
        [43, 57],
        [57, 202],
        [202, 43],
        [242, 20],
        [20, 99],
        [99, 242],
        [56, 28],
        [
          28,
          157
        ],
        [157, 56],
        [124, 35],
        [35, 113],
        [113, 124],
        [29, 160],
        [160, 27],
        [27, 29],
        [211, 204],
        [204, 210],
        [210, 211],
        [124, 113],
        [113, 46],
        [46, 124],
        [106, 43],
        [43, 204],
        [204, 106],
        [96, 62],
        [62, 77],
        [77, 96],
        [227, 137],
        [137, 116],
        [116, 227],
        [73, 41],
        [41, 72],
        [72, 73],
        [36, 203],
        [203, 142],
        [142, 36],
        [235, 64],
        [64, 240],
        [240, 235],
        [48, 49],
        [49, 64],
        [64, 48],
        [42, 41],
        [41, 74],
        [74, 42],
        [214, 212],
        [212, 207],
        [207, 214],
        [183, 42],
        [42, 184],
        [184, 183],
        [210, 169],
        [169, 211],
        [211, 210],
        [140, 170],
        [170, 176],
        [176, 140],
        [104, 105],
        [105, 69],
        [69, 104],
        [193, 122],
        [122, 168],
        [168, 193],
        [50, 123],
        [123, 187],
        [187, 50],
        [89, 96],
        [96, 90],
        [90, 89],
        [66, 65],
        [65, 107],
        [107, 66],
        [179, 89],
        [89, 180],
        [180, 179],
        [119, 101],
        [101, 120],
        [120, 119],
        [68, 63],
        [63, 104],
        [104, 68],
        [234, 93],
        [93, 227],
        [227, 234],
        [16, 15],
        [15, 85],
        [85, 16],
        [209, 129],
        [129, 49],
        [49, 209],
        [15, 14],
        [14, 86],
        [86, 15],
        [107, 55],
        [55, 9],
        [9, 107],
        [120, 100],
        [100, 121],
        [121, 120],
        [153, 145],
        [145, 22],
        [22, 153],
        [178, 88],
        [88, 179],
        [179, 178],
        [197, 6],
        [6, 196],
        [196, 197],
        [89, 88],
        [88, 96],
        [96, 89],
        [135, 138],
        [138, 136],
        [136, 135],
        [138, 215],
        [215, 172],
        [172, 138],
        [
          218,
          115
        ],
        [115, 219],
        [219, 218],
        [41, 42],
        [42, 81],
        [81, 41],
        [5, 195],
        [195, 51],
        [51, 5],
        [57, 43],
        [43, 61],
        [61, 57],
        [208, 171],
        [171, 199],
        [199, 208],
        [41, 81],
        [81, 38],
        [38, 41],
        [224, 53],
        [53, 225],
        [225, 224],
        [24, 144],
        [144, 110],
        [110, 24],
        [105, 52],
        [52, 66],
        [66, 105],
        [118, 229],
        [229, 117],
        [117, 118],
        [227, 34],
        [34, 234],
        [234, 227],
        [66, 107],
        [107, 69],
        [69, 66],
        [10, 109],
        [109, 151],
        [151, 10],
        [219, 48],
        [48, 235],
        [235, 219],
        [183, 62],
        [62, 191],
        [191, 183],
        [142, 129],
        [129, 126],
        [126, 142],
        [116, 111],
        [111, 143],
        [143, 116],
        [118, 117],
        [117, 50],
        [50, 118],
        [223, 222],
        [
          222,
          52
        ],
        [52, 223],
        [94, 19],
        [19, 141],
        [141, 94],
        [222, 221],
        [221, 65],
        [65, 222],
        [196, 3],
        [3, 197],
        [197, 196],
        [45, 220],
        [220, 44],
        [44, 45],
        [156, 70],
        [70, 139],
        [139, 156],
        [188, 122],
        [122, 245],
        [245, 188],
        [139, 71],
        [71, 162],
        [162, 139],
        [149, 170],
        [170, 150],
        [150, 149],
        [122, 188],
        [188, 196],
        [196, 122],
        [206, 216],
        [216, 92],
        [92, 206],
        [164, 2],
        [2, 167],
        [167, 164],
        [242, 141],
        [141, 241],
        [241, 242],
        [0, 164],
        [164, 37],
        [37, 0],
        [11, 72],
        [72, 12],
        [12, 11],
        [12, 38],
        [38, 13],
        [13, 12],
        [70, 63],
        [63, 71],
        [71, 70],
        [31, 226],
        [226, 111],
        [111, 31],
        [36, 101],
        [101, 205],
        [205, 36],
        [203, 206],
        [206, 165],
        [165, 203],
        [126, 209],
        [209, 217],
        [217, 126],
        [98, 165],
        [165, 97],
        [97, 98],
        [237, 220],
        [220, 218],
        [218, 237],
        [237, 239],
        [239, 241],
        [241, 237],
        [210, 214],
        [214, 169],
        [169, 210],
        [140, 171],
        [171, 32],
        [32, 140],
        [241, 125],
        [125, 237],
        [237, 241],
        [179, 86],
        [86, 178],
        [178, 179],
        [180, 85],
        [85, 179],
        [179, 180],
        [181, 84],
        [84, 180],
        [180, 181],
        [182, 83],
        [83, 181],
        [181, 182],
        [194, 201],
        [201, 182],
        [182, 194],
        [177, 137],
        [137, 132],
        [132, 177],
        [184, 76],
        [76, 183],
        [183, 184],
        [185, 61],
        [61, 184],
        [184, 185],
        [186, 57],
        [57, 185],
        [185, 186],
        [216, 212],
        [
          212,
          186
        ],
        [186, 216],
        [192, 214],
        [214, 187],
        [187, 192],
        [139, 34],
        [34, 156],
        [156, 139],
        [218, 79],
        [79, 237],
        [237, 218],
        [147, 123],
        [123, 177],
        [177, 147],
        [45, 44],
        [44, 4],
        [4, 45],
        [208, 201],
        [201, 32],
        [32, 208],
        [98, 64],
        [64, 129],
        [129, 98],
        [192, 213],
        [213, 138],
        [138, 192],
        [235, 59],
        [59, 219],
        [219, 235],
        [141, 242],
        [242, 97],
        [97, 141],
        [97, 2],
        [2, 141],
        [141, 97],
        [240, 75],
        [75, 235],
        [235, 240],
        [229, 24],
        [24, 228],
        [228, 229],
        [31, 25],
        [25, 226],
        [226, 31],
        [230, 23],
        [23, 229],
        [229, 230],
        [231, 22],
        [22, 230],
        [230, 231],
        [232, 26],
        [26, 231],
        [231, 232],
        [233, 112],
        [112, 232],
        [232, 233],
        [244, 189],
        [189, 243],
        [243, 244],
        [189, 221],
        [221, 190],
        [190, 189],
        [222, 28],
        [28, 221],
        [221, 222],
        [223, 27],
        [27, 222],
        [222, 223],
        [224, 29],
        [29, 223],
        [223, 224],
        [225, 30],
        [30, 224],
        [224, 225],
        [113, 247],
        [247, 225],
        [225, 113],
        [99, 60],
        [60, 240],
        [240, 99],
        [213, 147],
        [147, 215],
        [215, 213],
        [60, 20],
        [20, 166],
        [166, 60],
        [192, 187],
        [187, 213],
        [213, 192],
        [243, 112],
        [112, 244],
        [244, 243],
        [244, 233],
        [233, 245],
        [245, 244],
        [245, 128],
        [128, 188],
        [188, 245],
        [188, 114],
        [114, 174],
        [174, 188],
        [134, 131],
        [131, 220],
        [220, 134],
        [174, 217],
        [217, 236],
        [236, 174],
        [236, 198],
        [198, 134],
        [134, 236],
        [215, 177],
        [177, 58],
        [58, 215],
        [156, 143],
        [143, 124],
        [124, 156],
        [25, 110],
        [110, 7],
        [7, 25],
        [31, 228],
        [228, 25],
        [25, 31],
        [264, 356],
        [356, 368],
        [368, 264],
        [0, 11],
        [11, 267],
        [267, 0],
        [451, 452],
        [452, 349],
        [349, 451],
        [267, 302],
        [302, 269],
        [269, 267],
        [350, 357],
        [357, 277],
        [277, 350],
        [350, 452],
        [452, 357],
        [357, 350],
        [299, 333],
        [333, 297],
        [297, 299],
        [396, 175],
        [175, 377],
        [377, 396],
        [280, 347],
        [347, 330],
        [330, 280],
        [269, 303],
        [303, 270],
        [270, 269],
        [151, 9],
        [9, 337],
        [337, 151],
        [344, 278],
        [278, 360],
        [360, 344],
        [424, 418],
        [
          418,
          431
        ],
        [431, 424],
        [270, 304],
        [304, 409],
        [409, 270],
        [272, 310],
        [310, 407],
        [407, 272],
        [322, 270],
        [270, 410],
        [410, 322],
        [449, 450],
        [450, 347],
        [347, 449],
        [432, 422],
        [422, 434],
        [434, 432],
        [18, 313],
        [313, 17],
        [17, 18],
        [291, 306],
        [306, 375],
        [375, 291],
        [259, 387],
        [387, 260],
        [260, 259],
        [424, 335],
        [335, 418],
        [418, 424],
        [434, 364],
        [364, 416],
        [416, 434],
        [391, 423],
        [423, 327],
        [327, 391],
        [301, 251],
        [251, 298],
        [298, 301],
        [275, 281],
        [281, 4],
        [4, 275],
        [254, 373],
        [373, 253],
        [253, 254],
        [375, 307],
        [307, 321],
        [321, 375],
        [280, 425],
        [425, 411],
        [411, 280],
        [200, 421],
        [
          421,
          18
        ],
        [18, 200],
        [335, 321],
        [321, 406],
        [406, 335],
        [321, 320],
        [320, 405],
        [405, 321],
        [314, 315],
        [315, 17],
        [17, 314],
        [423, 426],
        [426, 266],
        [266, 423],
        [396, 377],
        [377, 369],
        [369, 396],
        [270, 322],
        [322, 269],
        [269, 270],
        [413, 417],
        [417, 464],
        [464, 413],
        [385, 386],
        [386, 258],
        [258, 385],
        [248, 456],
        [456, 419],
        [419, 248],
        [298, 284],
        [284, 333],
        [333, 298],
        [168, 417],
        [417, 8],
        [8, 168],
        [448, 346],
        [346, 261],
        [261, 448],
        [417, 413],
        [413, 285],
        [285, 417],
        [326, 327],
        [327, 328],
        [328, 326],
        [277, 355],
        [355, 329],
        [329, 277],
        [309, 392],
        [392, 438],
        [438, 309],
        [381, 382],
        [
          382,
          256
        ],
        [256, 381],
        [279, 429],
        [429, 360],
        [360, 279],
        [365, 364],
        [364, 379],
        [379, 365],
        [355, 277],
        [277, 437],
        [437, 355],
        [282, 443],
        [443, 283],
        [283, 282],
        [281, 275],
        [275, 363],
        [363, 281],
        [395, 431],
        [431, 369],
        [369, 395],
        [299, 297],
        [297, 337],
        [337, 299],
        [335, 273],
        [273, 321],
        [321, 335],
        [348, 450],
        [450, 349],
        [349, 348],
        [359, 446],
        [446, 467],
        [467, 359],
        [283, 293],
        [293, 282],
        [282, 283],
        [250, 458],
        [458, 462],
        [462, 250],
        [300, 276],
        [276, 383],
        [383, 300],
        [292, 308],
        [308, 325],
        [325, 292],
        [283, 276],
        [276, 293],
        [293, 283],
        [264, 372],
        [372, 447],
        [447, 264],
        [346, 352],
        [352, 340],
        [340, 346],
        [354, 274],
        [274, 19],
        [19, 354],
        [363, 456],
        [456, 281],
        [281, 363],
        [426, 436],
        [436, 425],
        [425, 426],
        [380, 381],
        [381, 252],
        [252, 380],
        [267, 269],
        [269, 393],
        [393, 267],
        [421, 200],
        [200, 428],
        [428, 421],
        [371, 266],
        [266, 329],
        [329, 371],
        [432, 287],
        [287, 422],
        [422, 432],
        [290, 250],
        [250, 328],
        [328, 290],
        [385, 258],
        [258, 384],
        [384, 385],
        [446, 265],
        [265, 342],
        [342, 446],
        [386, 387],
        [387, 257],
        [257, 386],
        [422, 424],
        [424, 430],
        [430, 422],
        [445, 342],
        [342, 276],
        [276, 445],
        [422, 273],
        [273, 424],
        [424, 422],
        [306, 292],
        [292, 307],
        [307, 306],
        [
          352,
          366
        ],
        [366, 345],
        [345, 352],
        [268, 271],
        [271, 302],
        [302, 268],
        [358, 423],
        [423, 371],
        [371, 358],
        [327, 294],
        [294, 460],
        [460, 327],
        [331, 279],
        [279, 294],
        [294, 331],
        [303, 271],
        [271, 304],
        [304, 303],
        [436, 432],
        [432, 427],
        [427, 436],
        [304, 272],
        [272, 408],
        [408, 304],
        [395, 394],
        [394, 431],
        [431, 395],
        [378, 395],
        [395, 400],
        [400, 378],
        [296, 334],
        [334, 299],
        [299, 296],
        [6, 351],
        [351, 168],
        [168, 6],
        [376, 352],
        [352, 411],
        [411, 376],
        [307, 325],
        [325, 320],
        [320, 307],
        [285, 295],
        [295, 336],
        [336, 285],
        [320, 319],
        [319, 404],
        [404, 320],
        [329, 330],
        [330, 349],
        [349, 329],
        [334, 293],
        [293, 333],
        [333, 334],
        [366, 323],
        [323, 447],
        [447, 366],
        [316, 15],
        [15, 315],
        [315, 316],
        [331, 358],
        [358, 279],
        [279, 331],
        [317, 14],
        [14, 316],
        [316, 317],
        [8, 285],
        [285, 9],
        [9, 8],
        [277, 329],
        [329, 350],
        [350, 277],
        [253, 374],
        [374, 252],
        [252, 253],
        [319, 318],
        [318, 403],
        [403, 319],
        [351, 6],
        [6, 419],
        [419, 351],
        [324, 318],
        [318, 325],
        [325, 324],
        [397, 367],
        [367, 365],
        [365, 397],
        [288, 435],
        [435, 397],
        [397, 288],
        [278, 344],
        [344, 439],
        [439, 278],
        [310, 272],
        [272, 311],
        [311, 310],
        [248, 195],
        [195, 281],
        [281, 248],
        [375, 273],
        [273, 291],
        [291, 375],
        [175, 396],
        [396, 199],
        [199, 175],
        [312, 311],
        [311, 268],
        [268, 312],
        [276, 283],
        [283, 445],
        [445, 276],
        [390, 373],
        [373, 339],
        [339, 390],
        [295, 282],
        [282, 296],
        [296, 295],
        [448, 449],
        [449, 346],
        [346, 448],
        [356, 264],
        [264, 454],
        [454, 356],
        [337, 336],
        [336, 299],
        [299, 337],
        [337, 338],
        [338, 151],
        [151, 337],
        [294, 278],
        [278, 455],
        [455, 294],
        [308, 292],
        [292, 415],
        [415, 308],
        [429, 358],
        [358, 355],
        [355, 429],
        [265, 340],
        [340, 372],
        [372, 265],
        [352, 346],
        [346, 280],
        [280, 352],
        [295, 442],
        [442, 282],
        [282, 295],
        [354, 19],
        [19, 370],
        [370, 354],
        [285, 441],
        [441, 295],
        [295, 285],
        [
          195,
          248
        ],
        [248, 197],
        [197, 195],
        [457, 440],
        [440, 274],
        [274, 457],
        [301, 300],
        [300, 368],
        [368, 301],
        [417, 351],
        [351, 465],
        [465, 417],
        [251, 301],
        [301, 389],
        [389, 251],
        [394, 395],
        [395, 379],
        [379, 394],
        [399, 412],
        [412, 419],
        [419, 399],
        [410, 436],
        [436, 322],
        [322, 410],
        [326, 2],
        [2, 393],
        [393, 326],
        [354, 370],
        [370, 461],
        [461, 354],
        [393, 164],
        [164, 267],
        [267, 393],
        [268, 302],
        [302, 12],
        [12, 268],
        [312, 268],
        [268, 13],
        [13, 312],
        [298, 293],
        [293, 301],
        [301, 298],
        [265, 446],
        [446, 340],
        [340, 265],
        [280, 330],
        [330, 425],
        [425, 280],
        [322, 426],
        [426, 391],
        [391, 322],
        [
          420,
          429
        ],
        [429, 437],
        [437, 420],
        [393, 391],
        [391, 326],
        [326, 393],
        [344, 440],
        [440, 438],
        [438, 344],
        [458, 459],
        [459, 461],
        [461, 458],
        [364, 434],
        [434, 394],
        [394, 364],
        [428, 396],
        [396, 262],
        [262, 428],
        [274, 354],
        [354, 457],
        [457, 274],
        [317, 316],
        [316, 402],
        [402, 317],
        [316, 315],
        [315, 403],
        [403, 316],
        [315, 314],
        [314, 404],
        [404, 315],
        [314, 313],
        [313, 405],
        [405, 314],
        [313, 421],
        [421, 406],
        [406, 313],
        [323, 366],
        [366, 361],
        [361, 323],
        [292, 306],
        [306, 407],
        [407, 292],
        [306, 291],
        [291, 408],
        [408, 306],
        [291, 287],
        [287, 409],
        [409, 291],
        [287, 432],
        [432, 410],
        [410, 287],
        [427, 434],
        [434, 411],
        [411, 427],
        [372, 264],
        [264, 383],
        [383, 372],
        [459, 309],
        [309, 457],
        [457, 459],
        [366, 352],
        [352, 401],
        [401, 366],
        [1, 274],
        [274, 4],
        [4, 1],
        [418, 421],
        [421, 262],
        [262, 418],
        [331, 294],
        [294, 358],
        [358, 331],
        [435, 433],
        [433, 367],
        [367, 435],
        [392, 289],
        [289, 439],
        [439, 392],
        [328, 462],
        [462, 326],
        [326, 328],
        [94, 2],
        [2, 370],
        [370, 94],
        [289, 305],
        [305, 455],
        [455, 289],
        [339, 254],
        [254, 448],
        [448, 339],
        [359, 255],
        [255, 446],
        [446, 359],
        [254, 253],
        [253, 449],
        [449, 254],
        [253, 252],
        [252, 450],
        [450, 253],
        [252, 256],
        [256, 451],
        [451, 252],
        [
          256,
          341
        ],
        [341, 452],
        [452, 256],
        [414, 413],
        [413, 463],
        [463, 414],
        [286, 441],
        [441, 414],
        [414, 286],
        [286, 258],
        [258, 441],
        [441, 286],
        [258, 257],
        [257, 442],
        [442, 258],
        [257, 259],
        [259, 443],
        [443, 257],
        [259, 260],
        [260, 444],
        [444, 259],
        [260, 467],
        [467, 445],
        [445, 260],
        [309, 459],
        [459, 250],
        [250, 309],
        [305, 289],
        [289, 290],
        [290, 305],
        [305, 290],
        [290, 460],
        [460, 305],
        [401, 376],
        [376, 435],
        [435, 401],
        [309, 250],
        [250, 392],
        [392, 309],
        [376, 411],
        [411, 433],
        [433, 376],
        [453, 341],
        [341, 464],
        [464, 453],
        [357, 453],
        [453, 465],
        [465, 357],
        [343, 357],
        [357, 412],
        [412, 343],
        [437, 343],
        [343, 399],
        [399, 437],
        [344, 360],
        [360, 440],
        [440, 344],
        [420, 437],
        [437, 456],
        [456, 420],
        [360, 420],
        [420, 363],
        [363, 360],
        [361, 401],
        [401, 288],
        [288, 361],
        [265, 372],
        [372, 353],
        [353, 265],
        [390, 339],
        [339, 249],
        [249, 390],
        [339, 448],
        [448, 255],
        [255, 339]
      ]);
      P("matrixDataToMatrix", function(a) {
        for (var b = a.getCols(), c = a.getRows(), d = a.getPackedDataList(), e = [], g = 0; g < c; g++) e.push(Array(b));
        for (g = 0; g < c; g++) for (var f = 0; f < b; f++) {
          var h = 1 === a.getLayout() ? g * b + f : f * c + g;
          e[g][f] = d[h];
        }
        return e;
      });
      P("VERSION", "0.4.1633559619");
    }).call(exports);
  }
});
export default require_face_mesh();
//# sourceMappingURL=@mediapipe_face_mesh.js.map
