import {
  __commonJS
} from "./chunk-DC5AMYBS.js";

// node_modules/@mediapipe/drawing_utils/drawing_utils.js
var require_drawing_utils = __commonJS({
  "node_modules/@mediapipe/drawing_utils/drawing_utils.js"(exports) {
    (function() {
      "use strict";
      function h(a) {
        var c = 0;
        return function() {
          return c < a.length ? { done: false, value: a[c++] } : { done: true };
        };
      }
      var l = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, c, b) {
        if (a == Array.prototype || a == Object.prototype) return a;
        a[c] = b.value;
        return a;
      };
      function m(a) {
        a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global];
        for (var c = 0; c < a.length; ++c) {
          var b = a[c];
          if (b && b.Math == Math) return b;
        }
        throw Error("Cannot find global object");
      }
      var n = m(this);
      function p(a, c) {
        if (c) a: {
          var b = n;
          a = a.split(".");
          for (var d = 0; d < a.length - 1; d++) {
            var e = a[d];
            if (!(e in b)) break a;
            b = b[e];
          }
          a = a[a.length - 1];
          d = b[a];
          c = c(d);
          c != d && null != c && l(b, a, { configurable: true, writable: true, value: c });
        }
      }
      function q(a) {
        var c = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
        return c ? c.call(a) : { next: h(a) };
      }
      var r = "function" == typeof Object.assign ? Object.assign : function(a, c) {
        for (var b = 1; b < arguments.length; b++) {
          var d = arguments[b];
          if (d) for (var e in d) Object.prototype.hasOwnProperty.call(d, e) && (a[e] = d[e]);
        }
        return a;
      };
      p("Object.assign", function(a) {
        return a || r;
      });
      p("Array.prototype.fill", function(a) {
        return a ? a : function(c, b, d) {
          var e = this.length || 0;
          0 > b && (b = Math.max(0, e + b));
          if (null == d || d > e) d = e;
          d = Number(d);
          0 > d && (d = Math.max(0, e + d));
          for (b = Number(b || 0); b < d; b++) this[b] = c;
          return this;
        };
      });
      function t(a) {
        return a ? a : Array.prototype.fill;
      }
      p("Int8Array.prototype.fill", t);
      p("Uint8Array.prototype.fill", t);
      p("Uint8ClampedArray.prototype.fill", t);
      p("Int16Array.prototype.fill", t);
      p("Uint16Array.prototype.fill", t);
      p("Int32Array.prototype.fill", t);
      p("Uint32Array.prototype.fill", t);
      p("Float32Array.prototype.fill", t);
      p("Float64Array.prototype.fill", t);
      var u = this || self;
      function v(a, c) {
        a = a.split(".");
        var b = u;
        a[0] in b || "undefined" == typeof b.execScript || b.execScript("var " + a[0]);
        for (var d; a.length && (d = a.shift()); ) a.length || void 0 === c ? b[d] && b[d] !== Object.prototype[d] ? b = b[d] : b = b[d] = {} : b[d] = c;
      }
      ;
      var w = { color: "white", lineWidth: 4, radius: 6, visibilityMin: 0.5 };
      function x(a) {
        a = a || {};
        return Object.assign({}, w, { fillColor: a.color }, a);
      }
      function y(a, c) {
        return a instanceof Function ? a(c) : a;
      }
      function z(a, c, b) {
        return Math.max(Math.min(c, b), Math.min(Math.max(c, b), a));
      }
      v("clamp", z);
      v("drawLandmarks", function(a, c, b) {
        if (c) {
          b = x(b);
          a.save();
          var d = a.canvas, e = 0;
          c = q(c);
          for (var f = c.next(); !f.done; f = c.next()) if (f = f.value, void 0 !== f && (void 0 === f.visibility || f.visibility > b.visibilityMin)) {
            a.fillStyle = y(b.fillColor, { index: e, from: f });
            a.strokeStyle = y(b.color, { index: e, from: f });
            a.lineWidth = y(b.lineWidth, { index: e, from: f });
            var g = new Path2D();
            g.arc(f.x * d.width, f.y * d.height, y(b.radius, { index: e, from: f }), 0, 2 * Math.PI);
            a.fill(g);
            a.stroke(g);
            ++e;
          }
          a.restore();
        }
      });
      v("drawConnectors", function(a, c, b, d) {
        if (c && b) {
          d = x(d);
          a.save();
          var e = a.canvas, f = 0;
          b = q(b);
          for (var g = b.next(); !g.done; g = b.next()) {
            var k = g.value;
            a.beginPath();
            g = c[k[0]];
            k = c[k[1]];
            g && k && (void 0 === g.visibility || g.visibility > d.visibilityMin) && (void 0 === k.visibility || k.visibility > d.visibilityMin) && (a.strokeStyle = y(d.color, { index: f, from: g, to: k }), a.lineWidth = y(d.lineWidth, { index: f, from: g, to: k }), a.moveTo(g.x * e.width, g.y * e.height), a.lineTo(k.x * e.width, k.y * e.height));
            ++f;
            a.stroke();
          }
          a.restore();
        }
      });
      v("drawRectangle", function(a, c, b) {
        b = x(b);
        a.save();
        var d = a.canvas;
        a.beginPath();
        a.lineWidth = y(b.lineWidth, {});
        a.strokeStyle = y(b.color, {});
        a.fillStyle = y(b.fillColor, {});
        a.translate(c.xCenter * d.width, c.yCenter * d.height);
        a.rotate(c.rotation * Math.PI / 180);
        a.rect(-c.width / 2 * d.width, -c.height / 2 * d.height, c.width * d.width, c.height * d.height);
        a.translate(-c.xCenter * d.width, -c.yCenter * d.height);
        a.stroke();
        a.fill();
        a.restore();
      });
      v("lerp", function(a, c, b, d, e) {
        return z(d * (1 - (a - c) / (b - c)) + e * (1 - (b - a) / (b - c)), d, e);
      });
    }).call(exports);
  }
});
export default require_drawing_utils();
//# sourceMappingURL=@mediapipe_drawing_utils.js.map
