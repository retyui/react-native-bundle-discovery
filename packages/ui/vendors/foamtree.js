/**
 * Carrot Search FoamTree HTML5 (demo variant)
 * v3.5.1, bugfix/3.5.x/26b14206, build FOAMTREE-SOFTWARE5-DIST-6, Apr 14, 2023
 *
 * Carrot Search confidential.
 * Copyright 2002-2023, Carrot Search s.c, All Rights Reserved.
 */
/* eslint-disable */
(function () {
  var ea = (function () {
    var a = window.navigator.userAgent;
    try {
      window.localStorage.setItem("ftap5caavc", "ftap5caavc");
      window.localStorage.removeItem("ftap5caavc");
      var q = !0;
    } catch (l) {
      q = !1;
    }
    return {
      Te: function () {
        return /webkit/i.test(a);
      },
      Nh: function () {
        return /Mac/.test(a);
      },
      Re: function () {
        return /iPad|iPod|iPhone/.test(a);
      },
      Mh: function () {
        return /Android/.test(a);
      },
      Ih: function () {
        return (
          "ontouchstart" in window ||
          (!!window.DocumentTouch && document instanceof window.DocumentTouch)
        );
      },
      Hh: function () {
        return q;
      },
      Gh: function () {
        var l = document.createElement("canvas");
        return !(!l.getContext || !l.getContext("2d"));
      },
      md: function (l, g) {
        return [].forEach && ea.Gh() ? l && l() : g && g();
      },
    };
  })();
  var ka = (function () {
    function a() {
      return (
        (window.performance &&
          (window.performance.now ||
            window.performance.mozNow ||
            window.performance.msNow ||
            window.performance.oNow ||
            window.performance.webkitNow)) ||
        Date.now
      );
    }
    var q = a();
    return {
      create: function () {
        return {
          now: (function () {
            var l = a();
            return function () {
              return l.call(window.performance);
            };
          })(),
        };
      },
      now: function () {
        return q.call(window.performance);
      },
    };
  })();
  function na() {
    function a() {
      if (!d) throw "AF0";
      var m = ka.now();
      0 !== p && (l.sd = m - p);
      p = m;
      e = e.filter(function (h) {
        return null !== h;
      });
      l.frames++;
      for (var c = 0; c < e.length; c++) {
        var b = e[c];
        null !== b &&
          (!0 === b.ee.call(b.context)
            ? (e[c] = null)
            : P.zc(b.repeat) &&
              ((b.repeat = b.repeat - 1), 0 >= b.repeat && (e[c] = null)));
      }
      e = e.filter(function (h) {
        return null !== h;
      });
      d = !1;
      q();
      m = ka.now() - m;
      0 !== m && (l.rd = m);
      l.totalTime += m;
      l.ve = (1e3 * l.frames) / l.totalTime;
      0 === e.length ? (p = 0) : (p = ka.now());
    }
    function q() {
      0 < e.length && !d && ((d = !0), g(a));
    }
    var l = (this.Xf = { frames: 0, totalTime: 0, rd: 0, sd: 0, ve: 0 });
    pa = l;
    var g = (function () {
        return ea.Re()
          ? function (m) {
              window.setTimeout(m, 0);
            }
          : window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.oRequestAnimationFrame ||
              window.msRequestAnimationFrame ||
              (function () {
                var m = ka.create();
                return function (c) {
                  var b = 0;
                  window.setTimeout(
                    function () {
                      var h = m.now();
                      c();
                      b = m.now() - h;
                    },
                    16 > b ? 16 - b : 0,
                  );
                };
              })();
      })(),
      e = [],
      d = !1,
      p = 0;
    this.repeat = function (m, c, b) {
      this.cancel(m);
      e.push({ ee: m, context: b, repeat: c });
      q();
    };
    this.once = function (m, c) {
      this.repeat(m, 1, c);
    };
    this.cancel = function (m) {
      for (var c = 0; c < e.length; c++) {
        var b = e[c];
        null !== b && b.ee === m && (e[c] = null);
      }
    };
    this.i = function () {
      e = [];
    };
  }
  var pa;
  var ra = ea.md(function () {
    function a() {
      this.buffer = [];
      this.ma = 0;
      this.current = P.extend({}, p);
    }
    function q(m) {
      return function () {
        var c,
          b = this.buffer,
          h = this.ma;
        b[h++] = "call";
        b[h++] = m;
        b[h++] = arguments.length;
        for (c = 0; c < arguments.length; c++) b[h++] = arguments[c];
        this.ma = h;
      };
    }
    function l(m) {
      return function () {
        return e[m].apply(e, arguments);
      };
    }
    var g = document.createElement("canvas");
    g.width = 1;
    g.height = 1;
    var e = g.getContext("2d");
    g = ["font"];
    var d =
        "fillStyle globalAlpha globalCompositeOperation lineCap lineDashOffset lineJoin lineWidth miterLimit shadowBlur shadowColor shadowOffsetX shadowOffsetY strokeStyle textAlign textBaseline".split(
          " ",
        ),
      p = {};
    d.concat(g).forEach(function (m) {
      p[m] = e[m];
    });
    a.prototype.clear = function () {
      this.ma = 0;
    };
    a.prototype.Ga = function () {
      return 0 === this.ma;
    };
    a.prototype.Na = function (m) {
      function c(h, f, u) {
        for (var t = 0, n = h.ma, k = h.buffer; t < u; ) k[n++] = f[t++];
        h.ma = n;
      }
      function b(h, f, u, t) {
        for (var n = 0; n < u; )
          switch (f[n++]) {
            case "set":
              h[f[n++]] = f[n++];
              break;
            case "setGlobalAlpha":
              h[f[n++]] = f[n++] * t;
              break;
            case "call":
              var k = f[n++];
              switch (f[n++]) {
                case 0:
                  h[k]();
                  break;
                case 1:
                  h[k](f[n++]);
                  break;
                case 2:
                  h[k](f[n++], f[n++]);
                  break;
                case 3:
                  h[k](f[n++], f[n++], f[n++]);
                  break;
                case 4:
                  h[k](f[n++], f[n++], f[n++], f[n++]);
                  break;
                case 5:
                  h[k](f[n++], f[n++], f[n++], f[n++], f[n++]);
                  break;
                case 6:
                  h[k](f[n++], f[n++], f[n++], f[n++], f[n++], f[n++]);
                  break;
                case 7:
                  h[k](f[n++], f[n++], f[n++], f[n++], f[n++], f[n++], f[n++]);
                  break;
                case 8:
                  h[k](
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                  );
                  break;
                case 9:
                  h[k](
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                    f[n++],
                  );
                  break;
                default:
                  throw "CB0";
              }
          }
      }
      m instanceof ra
        ? c(m, this.buffer, this.ma)
        : b(m, this.buffer, this.ma, P.I(m.globalAlpha, 1));
    };
    a.prototype.replay = a.prototype.Na;
    a.prototype.i = function () {
      return new a();
    };
    a.prototype.scratch = a.prototype.i;
    "arc arcTo beginPath bezierCurveTo clearRect clip closePath drawImage fill fillRect fillText lineTo moveTo putImageData quadraticCurveTo rect rotate scale setLineDash setTransform stroke strokeRect strokeText transform translate"
      .split(" ")
      .forEach(function (m) {
        a.prototype[m] = q(m);
      });
    [
      "measureText",
      "createLinearGradient",
      "createRadialGradient",
      "createPattern",
      "getLineDash",
    ].forEach(function (m) {
      a.prototype[m] = l(m);
    });
    ["save", "restore"].forEach(function (m) {
      var c = l(m),
        b = q(m);
      a.prototype[m] = (function (h, f) {
        return function () {
          h.apply(this, arguments);
          f.apply(this, arguments);
        };
      })(b, c);
    });
    g.forEach(function (m) {
      Object.defineProperty(a.prototype, m, {
        set: function (c) {
          e[m] = c;
          this.current[m] = c;
          var b = this.buffer;
          b[this.ma++] = "set";
          b[this.ma++] = m;
          b[this.ma++] = c;
        },
        get: function () {
          return this.current[m];
        },
      });
    });
    d.forEach(function (m) {
      Object.defineProperty(a.prototype, m, {
        set: function (c) {
          this.current[m] = c;
          var b = this.buffer;
          b[this.ma++] = "globalAlpha" === m ? "setGlobalAlpha" : "set";
          b[this.ma++] = m;
          b[this.ma++] = c;
        },
        get: function () {
          return this.current[m];
        },
      });
    });
    a.prototype.roundRect = function (m, c, b, h, f) {
      this.beginPath();
      this.moveTo(m + f, c);
      this.lineTo(m + b - f, c);
      this.quadraticCurveTo(m + b, c, m + b, c + f);
      this.lineTo(m + b, c + h - f);
      this.quadraticCurveTo(m + b, c + h, m + b - f, c + h);
      this.lineTo(m + f, c + h);
      this.quadraticCurveTo(m, c + h, m, c + h - f);
      this.lineTo(m, c + f);
      this.quadraticCurveTo(m, c, m + f, c);
      this.closePath();
    };
    a.prototype.fillPolygonWithText = function (m, c, b, h, f) {
      f || (f = {});
      var u = {
          hb: P.I(f.maxFontSize, ta.ya.hb),
          Gc: P.I(f.minFontSize, ta.ya.Gc),
          lineHeight: P.I(f.lineHeight, ta.ya.lineHeight),
          cb: P.I(f.horizontalPadding, ta.ya.cb),
          Ua: P.I(f.verticalPadding, ta.ya.Ua),
          ib: P.I(f.maxTotalTextHeight, ta.ya.ib),
          fontFamily: P.I(f.fontFamily, ta.ya.fontFamily),
          fontStyle: P.I(f.fontStyle, ta.ya.fontStyle),
          fontVariant: P.I(f.fontVariant, ta.ya.fontVariant),
          fontWeight: P.I(f.fontWeight, ta.ya.fontWeight),
          verticalAlign: P.I(f.verticalAlign, ta.ya.verticalAlign),
        },
        t = f.cache;
      if (t && P.has(f, "area")) {
        t.Qc || (t.Qc = new ra());
        var n = f.area,
          k = P.I(f.cacheInvalidationThreshold, 0.05);
        m = ta.de(
          u,
          this,
          h,
          m,
          wa.F(m, {}),
          { x: c, y: b },
          f.allowForcedSplit || !1,
          f.allowEllipsis || !1,
          t,
          n,
          k,
          f.invalidateCache,
        );
      } else
        m = ta.se(
          u,
          this,
          h,
          m,
          wa.F(m, {}),
          { x: c, y: b },
          f.allowForcedSplit || !1,
          f.allowEllipsis || !1,
        );
      return m.ka
        ? {
            fit: !0,
            lineCount: m.bc,
            fontSize: m.fontSize,
            box: { x: m.box.x, y: m.box.y, w: m.box.w, h: m.box.o },
            ellipsis: m.Ub,
          }
        : { fit: !1 };
    };
    return a;
  });
  var xa = ea.md(function () {
    function a(b) {
      this.S = b;
      this.canvas = b.canvas;
      this.i = [];
      this.zb = [void 0];
      this.vc = ["#SIZE#px sans-serif"];
      this.td = [0];
      this.ud = [1];
      this.Rd = [0];
      this.Sd = [0];
      this.Td = [0];
      this.yd = [10];
      this.Xb = [10];
      this.Hb = [
        this.zb,
        this.vc,
        this.Xb,
        this.td,
        this.ud,
        this.Rd,
        this.yd,
        this.Sd,
        this.Td,
      ];
      this.da = [1, 0, 0, 1, 0, 0];
    }
    function q(b) {
      var h = b.S,
        f = b.Hb[0].length - 1;
      b.zb[f] && (h.setLineDash(b.zb[f]), (h.lineDashOffset = b.td[f]));
      h.miterLimit = b.yd[f];
      h.lineWidth = b.ud[f];
      h.shadowBlur = b.Rd[f];
      h.shadowOffsetX = b.Sd[f];
      h.shadowOffsetY = b.Td[f];
      h.font = b.vc[f].replace("#SIZE#", b.Xb[f].toString());
    }
    function l(b) {
      return function () {
        return this.S[b].apply(this.S, arguments);
      };
    }
    function g(b) {
      return function (h, f) {
        var u = this.da;
        return this.S[b].call(this.S, d(h, f, u), p(h, f, u));
      };
    }
    function e(b) {
      return function (h, f, u, t) {
        var n = this.da;
        return this.S[b].call(
          this.S,
          d(h, f, n),
          p(h, f, n),
          u * n[0],
          t * n[3],
        );
      };
    }
    function d(b, h, f) {
      return b * f[0] + h * f[2] + f[4];
    }
    function p(b, h, f) {
      return b * f[1] + h * f[3] + f[5];
    }
    function m(b, h) {
      for (var f = 0; f < b.length; f++) b[f] *= h[0];
      return b;
    }
    a.prototype.save = function () {
      this.i.push(this.da.slice(0));
      for (var b = 0; b < this.Hb.length; b++) {
        var h = this.Hb[b];
        h.push(h[h.length - 1]);
      }
      this.S.save();
    };
    a.prototype.restore = function () {
      this.da = this.i.pop();
      for (var b = 0; b < this.Hb.length; b++) this.Hb[b].pop();
      this.S.restore();
      q(this);
    };
    a.prototype.scale = function (b, h) {
      var f = this.da;
      f[0] *= b;
      f[1] *= b;
      f[2] *= h;
      f[3] *= h;
      b = this.da;
      h = this.Hb;
      f = h[0].length - 1;
      var u = this.zb[f];
      u && m(u, b);
      for (u = 2; u < h.length; u++) {
        var t = h[u];
        t[f] *= b[0];
      }
      q(this);
    };
    a.prototype.translate = function (b, h) {
      var f = this.da;
      f[4] += f[0] * b + f[2] * h;
      f[5] += f[1] * b + f[3] * h;
    };
    ["moveTo", "lineTo"].forEach(function (b) {
      a.prototype[b] = g(b);
    });
    ["clearRect", "fillRect", "strokeRect", "rect"].forEach(function (b) {
      a.prototype[b] = e(b);
    });
    "fill stroke beginPath closePath clip createImageData createPattern getImageData putImageData getLineDash setLineDash"
      .split(" ")
      .forEach(function (b) {
        a.prototype[b] = l(b);
      });
    [
      {
        p: "lineDashOffset",
        a: function (b) {
          return b.td;
        },
      },
      {
        p: "lineWidth",
        a: function (b) {
          return b.ud;
        },
      },
      {
        p: "miterLimit",
        a: function (b) {
          return b.yd;
        },
      },
      {
        p: "shadowBlur",
        a: function (b) {
          return b.Rd;
        },
      },
      {
        p: "shadowOffsetX",
        a: function (b) {
          return b.Sd;
        },
      },
      {
        p: "shadowOffsetY",
        a: function (b) {
          return b.Td;
        },
      },
    ].forEach(function (b) {
      Object.defineProperty(a.prototype, b.p, {
        set: function (h) {
          var f = b.a(this);
          h *= this.da[0];
          f[f.length - 1] = h;
          this.S[b.p] = h;
        },
      });
    });
    var c = /(\d+(?:\.\d+)?)px/;
    Object.defineProperty(a.prototype, "font", {
      set: function (b) {
        var h = c.exec(b);
        if (1 < h.length) {
          var f = this.Xb.length - 1;
          this.Xb[f] = parseFloat(h[1]);
          this.vc[f] = b.replace(c, "#SIZE#px");
          b = this.S;
          f = this.vc[f].replace(
            "#SIZE#",
            (this.Xb[f] * this.da[0]).toString(),
          );
          b.font = f;
        }
      },
    });
    "fillStyle globalAlpha globalCompositeOperation lineCap lineJoin shadowColor strokeStyle textAlign textBaseline"
      .split(" ")
      .forEach(function (b) {
        Object.defineProperty(a.prototype, b, {
          set: function (h) {
            this.S[b] = h;
          },
        });
      });
    a.prototype.arc = function (b, h, f, u, t, n) {
      var k = this.da;
      this.S.arc(d(b, h, k), p(b, h, k), f * k[0], u, t, n);
    };
    a.prototype.arcTo = function (b, h, f, u, t) {
      var n = this.da;
      this.S.arc(d(b, h, n), p(b, h, n), d(f, u, n), p(f, u, n), t * n[0]);
    };
    a.prototype.bezierCurveTo = function (b, h, f, u, t, n) {
      var k = this.da;
      this.S.bezierCurveTo(
        d(b, h, k),
        p(b, h, k),
        d(f, u, k),
        p(f, u, k),
        d(t, n, k),
        p(t, n, k),
      );
    };
    a.prototype.drawImage = function (b, h, f, u, t, n, k, r, y) {
      function v(E, D, G, O) {
        z.push(d(E, D, w));
        z.push(p(E, D, w));
        G = P.V(G) ? b.width : G;
        O = P.V(O) ? b.height : O;
        z.push(G * w[0]);
        z.push(O * w[3]);
      }
      var w = this.da,
        z = [b];
      P.V(n) ? v(h, f, u, t) : v(n, k, r, y);
      this.S.drawImage.apply(this.S, z);
    };
    a.prototype.quadraticCurveTo = function (b, h, f, u) {
      var t = this.da;
      this.S.quadraticCurveTo(d(b, h, t), p(b, h, t), d(f, u, t), p(f, u, t));
    };
    a.prototype.fillText = function (b, h, f, u) {
      var t = this.da;
      this.S.fillText(b, d(h, f, t), p(h, f, t), P.zc(u) ? u * t[0] : 1e20);
    };
    a.prototype.setLineDash = function (b) {
      b = m(b.slice(0), this.da);
      this.zb[this.zb.length - 1] = b;
      this.S.setLineDash(b);
    };
    return a;
  });
  var Aa = (function () {
    var a = !ea.Te() || ea.Re() || ea.Mh() ? 1 : 7;
    return {
      estimate: function () {
        function q(k) {
          k.beginPath();
          ya.Ud(k, m);
        }
        var l = document.createElement("canvas");
        l.width = 800;
        l.height = 600;
        var g = l.getContext("2d"),
          e = l.width;
        l = l.height;
        var d,
          p = 0,
          m = [{ x: 0, y: 100 }];
        for (d = 1; 6 >= d; d++)
          (p = (2 * d * Math.PI) / 6),
            m.push({ x: 100 * Math.sin(p), y: 100 * Math.cos(p) });
        d = {
          polygonPlainFill: [
            q,
            function (k) {
              k.fillStyle = "rgb(255, 0, 0)";
              k.fill();
            },
          ],
          polygonPlainStroke: [
            q,
            function (k) {
              k.strokeStyle = "rgb(128, 0, 0)";
              k.lineWidth = 2;
              k.closePath();
              k.stroke();
            },
          ],
          polygonGradientFill: [
            q,
            function (k) {
              var r = k.createRadialGradient(0, 0, 10, 0, 0, 60);
              r.addColorStop(0, "rgb(255, 0, 0)");
              r.addColorStop(1, "rgb(255, 255, 0)");
              k.fillStyle = r;
              k.fill();
            },
          ],
          polygonGradientStroke: [
            q,
            function (k) {
              var r = k.createLinearGradient(-100, -100, 100, 100);
              r.addColorStop(0, "rgb(224, 0, 0)");
              r.addColorStop(1, "rgb(32, 0, 0)");
              k.strokeStyle = r;
              k.lineWidth = 2;
              k.closePath();
              k.stroke();
            },
          ],
          polygonExposureShadow: [
            q,
            function (k) {
              k.shadowBlur = 50;
              k.shadowColor = "rgba(0, 0, 0, 1)";
              k.fillStyle = "rgba(0, 0, 0, 1)";
              k.globalCompositeOperation = "source-over";
              k.fill();
              k.shadowBlur = 0;
              k.shadowColor = "transparent";
              k.globalCompositeOperation = "destination-out";
              k.fill();
            },
          ],
          labelPlainFill: [
            function (k) {
              k.fillStyle = "#000";
              k.font = "24px sans-serif";
              k.textAlign = "center";
            },
            function (k) {
              k.fillText("Some text", 0, -16);
              k.fillText("for testing purposes", 0, 16);
            },
          ],
        };
        p = 100 / Object.keys(d).length;
        var c = ka.now(),
          b = {},
          h;
        for (h in d) {
          var f = d[h],
            u = ka.now(),
            t = 0;
          do {
            g.save();
            g.translate(Math.random() * e, Math.random() * l);
            var n = 3 * Math.random() + 0.5;
            g.scale(n, n);
            for (n = 0; n < f.length; n++) f[n](g);
            g.restore();
            t++;
            n = ka.now();
          } while (n - u < p);
          b[h] = (a * (n - u)) / t;
        }
        b.total = ka.now() - c;
        return b;
      },
    };
  })();
  var ya = {
    Ud: function (a, q) {
      var l = q[0];
      a.moveTo(l.x, l.y);
      for (var g = q.length - 1; 0 < g; g--) (l = q[g]), a.lineTo(l.x, l.y);
    },
    Wi: function (a, q, l, g) {
      var e,
        d = [],
        p = 0,
        m = q.length;
      for (e = 0; e < m; e++) {
        var c = q[e];
        var b = q[(e + 1) % m];
        c = wa.i(c, b);
        c = Math.sqrt(c);
        d.push(c);
        p += c;
      }
      l = g * (l + (0.5 * g * p) / m);
      p = {};
      var h = {},
        f = {},
        u = 0;
      for (e = 0; e < m; e++) {
        c = q[e];
        b = q[(e + 1) % m];
        g = q[(e + 2) % m];
        var t = d[(e + 1) % m];
        t = Math.min(0.5, l / t);
        wa.ga(1 - t, b, g, h);
        wa.ga(t, b, g, f);
        u++;
        0 == e &&
          (wa.ga(Math.min(0.5, l / d[0]), c, b, p), u++, a.moveTo(p.x, p.y));
        a.quadraticCurveTo(b.x, b.y, h.x, h.y);
        a.lineTo(f.x, f.y);
      }
      return !0;
    },
  };
  function Ba(a) {
    function q() {
      return "embedded" === e.getAttribute("data-foamtree");
    }
    function l(n) {
      f[n] && (f[n].style.opacity = t * u[n]);
    }
    function g(n) {
      n.width = Math.round(p * n.B);
      n.height = Math.round(m * n.B);
    }
    var e,
      d,
      p,
      m,
      c,
      b,
      h = [],
      f = {},
      u = {},
      t = 0;
    this.M = function (n) {
      e = n;
      (0 !== e.clientWidth && 0 !== e.clientHeight) ||
        Ca.i(
          "element has zero dimensions: " +
            e.clientWidth +
            " x " +
            e.clientHeight +
            ".",
        );
      e.innerHTML = "";
      p = e.clientWidth;
      m = e.clientHeight;
      c = 0 !== p ? p : void 0;
      b = 0 !== m ? m : void 0;
      q() && Ca.i("visualization already embedded in the element.");
      e.setAttribute("data-foamtree", "embedded");
      d = document.createElement("div");
      d.style.width = "100%";
      d.style.height = "100%";
      d.style.position = "relative";
      e.appendChild(d);
      a.j.D("stage:initialized", this, d, p, m);
    };
    this.Za = function () {
      q() &&
        (e.removeAttribute("data-foamtree"),
        (h = []),
        (f = {}),
        e.removeChild(d),
        a.j.D("stage:disposed", this, d));
    };
    this.u = function () {
      p = e.clientWidth;
      m = e.clientHeight;
      if (0 !== p && 0 !== m && (p !== c || m !== b)) {
        for (var n = h.length - 1; 0 <= n; n--) g(h[n]);
        a.j.D("stage:resized", c, b, p, m);
        c = p;
        b = m;
      }
    };
    this.Ki = function (n, k) {
      n.B = k;
      g(n);
    };
    this.dc = function (n, k, r) {
      var y = document.createElement("canvas");
      y.setAttribute(
        "style",
        "position: absolute; top: 0; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none;",
      );
      y.B = k;
      g(y);
      h.push(y);
      f[n] = y;
      u[n] = 1;
      l(n);
      r || d.appendChild(y);
      a.j.D("stage:newLayer", n, y);
      return y;
    };
    this.$b = function (n, k) {
      P.V(k) || ((u[n] = k), l(n));
      return u[n];
    };
    this.i = function (n) {
      P.V(n) ||
        ((t = n),
        P.Aa(f, function (k, r) {
          l(r);
        }));
      return t;
    };
  }
  function Da(a) {
    function q(w, z, E) {
      v = !0;
      u.x = 0;
      u.y = 0;
      t.x = 0;
      t.y = 0;
      e = h;
      d.x = f.x;
      d.y = f.y;
      z();
      p *= w;
      E ? (m = p / e) : (m = w);
      m = Math.max(0.25 / e, m);
      return !0;
    }
    function l(w, z) {
      z.x = w.x / h + f.x;
      z.y = w.y / h + f.y;
      return z;
    }
    function g(w, z, E, D, G, O, H, B, M) {
      var Q = (w - E) * (O - B) - (z - D) * (G - H);
      if (1e-5 > Math.abs(Q)) return !1;
      M.x = ((w * D - z * E) * (G - H) - (w - E) * (G * B - O * H)) / Q;
      M.y = ((w * D - z * E) * (O - B) - (z - D) * (G * B - O * H)) / Q;
      return !0;
    }
    var e = 1,
      d = { x: 0, y: 0 },
      p = 1,
      m = 1,
      c = 1,
      b = { x: 0, y: 0 },
      h = 1,
      f = { x: 0, y: 0 },
      u = { x: 0, y: 0 },
      t = { x: 0, y: 0 },
      n,
      k,
      r = { x: 0, y: 0, w: 0, o: 0 },
      y = { x: 0, y: 0, w: 0, o: 0, scale: 1 },
      v = !0;
    a.j.subscribe("stage:initialized", function (w, z, E, D) {
      n = E;
      k = D;
      r.x = 0;
      r.y = 0;
      r.w = E;
      r.o = D;
      y.x = 0;
      y.y = 0;
      y.w = E;
      y.o = D;
      y.scale = 1;
    });
    a.j.subscribe("stage:resized", function (w, z, E, D) {
      function G(M) {
        M.x *= H;
        M.y *= B;
      }
      function O(M) {
        G(M);
        M.w *= H;
        M.o *= B;
      }
      n = E;
      k = D;
      var H = E / w,
        B = D / z;
      G(d);
      G(f);
      G(b);
      G(u);
      G(t);
      O(r);
      O(y);
    });
    this.Nb = function (w, z) {
      return q(
        z,
        function () {
          l(w, b);
        },
        !0,
      );
    };
    this.ga = function (w, z) {
      if (1 === Math.round(1e4 * z) / 1e4) {
        z = r.x - f.x;
        var E = r.y - f.y;
        q(1, function () {}, !0);
        return this.i(-z, -E);
      }
      return q(
        z,
        function () {
          for (var D = !1; !D; ) {
            D = Math.random();
            var G = Math.random(),
              O = Math.random(),
              H = Math.random();
            D = g(
              w.x + D * w.w,
              w.y + G * w.o,
              r.x + D * r.w,
              r.y + G * r.o,
              w.x + O * w.w,
              w.y + H * w.o,
              r.x + O * r.w,
              r.y + H * r.o,
              b,
            );
          }
        },
        !0,
      );
    };
    this.ic = function (w, z) {
      var E = w.w / w.o;
      var D = n / k;
      if (E < D) {
        var G = w.o * D;
        var O = w.o;
        E = w.x - 0.5 * (G - w.w);
        D = w.y;
      } else
        E > D
          ? ((G = w.w),
            (O = (w.w * k) / n),
            (E = w.x),
            (D = w.y - 0.5 * (O - w.o)))
          : ((E = w.x), (D = w.y), (G = w.w), (O = w.o));
      E -= G * z;
      D -= O * z;
      G *= 1 + 2 * z;
      if (g(E, D, f.x, f.y, E + G, D, f.x + n / h, f.y, b))
        return q(n / h / G, P.qa, !1);
      v = !1;
      return this.i(h * (f.x - E), h * (f.y - D));
    };
    this.i = function (w, z) {
      w = Math.round(1e4 * w) / 1e4;
      z = Math.round(1e4 * z) / 1e4;
      t.x += w / h;
      t.y += z / h;
      return 0 !== w || 0 !== z;
    };
    this.reset = function (w) {
      w && this.content(0, 0, n, k);
      return this.ga(
        { x: r.x + f.x, y: r.y + f.y, w: r.w / h, o: r.o / h },
        c / p,
      );
    };
    this.Fb = function (w) {
      c = Math.min(1, Math.round(1e4 * (w || p)) / 1e4);
    };
    this.u = function () {
      return f.x < r.x
        ? (r.x - f.x) * h
        : f.x + n / h > r.x + r.w
          ? -(f.x + n / h - r.x - r.w) * h
          : 0;
    };
    this.H = function () {
      return f.y < r.y
        ? (r.y - f.y) * h
        : f.y + k / h > r.y + r.o
          ? -(f.y + k / h - r.y - r.o) * h
          : 0;
    };
    this.update = function (w) {
      var z = Math.abs(Math.log(m));
      6 > z ? (z = 2) : ((z /= 4), (z += 3 * z * (1 < m ? w : 1 - w)));
      z = 1 < m ? Math.pow(w, z) : 1 - Math.pow(1 - w, z);
      z = (v ? z : 1) * (m - 1) + 1;
      h = e * z;
      f.x = b.x - (b.x - d.x) / z;
      f.y = b.y - (b.y - d.y) / z;
      f.x -= u.x * (1 - w) + t.x * w;
      f.y -= u.y * (1 - w) + t.y * w;
      1 === w && ((u.x = t.x), (u.y = t.y));
      y.x = f.x;
      y.y = f.y;
      y.w = n / h;
      y.o = k / h;
      y.scale = h;
    };
    this.T = function (w) {
      w.x = y.x;
      w.y = y.y;
      w.scale = y.scale;
      return w;
    };
    this.absolute = function (w, z) {
      return l(w, z || {});
    };
    this.Uc = function (w, z) {
      z = z || {};
      z.x = (w.x - f.x) * h;
      z.y = (w.y - f.y) * h;
      return z;
    };
    this.pc = function (w) {
      return this.scale() < c / w;
    };
    this.zd = function () {
      return P.od(h, 1);
    };
    this.scale = function () {
      return Math.round(1e4 * h) / 1e4;
    };
    this.content = function (w, z, E, D) {
      r.x = w;
      r.y = z;
      r.w = E;
      r.o = D;
    };
    this.rc = function (w, z) {
      var E;
      for (E = w.length - 1; 0 <= E; E--) {
        var D = w[E];
        D.save();
        D.scale(h, h);
        D.translate(-f.x, -f.y);
      }
      z(y);
      for (E = w.length - 1; 0 <= E; E--) (D = w[E]), D.restore();
    };
  }
  var Ea = new (function () {
    function a(l) {
      if ("hsl" == l.model || "hsla" == l.model) return l;
      var g = (l.r /= 255),
        e = (l.g /= 255),
        d = (l.b /= 255),
        p = Math.max(g, e, d),
        m = Math.min(g, e, d),
        c = (p + m) / 2;
      if (p == m) var b = (m = 0);
      else {
        var h = p - m;
        m = 0.5 < c ? h / (2 - p - m) : h / (p + m);
        switch (p) {
          case g:
            b = (e - d) / h + (e < d ? 6 : 0);
            break;
          case e:
            b = (d - g) / h + 2;
            break;
          case d:
            b = (g - e) / h + 4;
        }
        b /= 6;
      }
      l.h = 360 * b;
      l.s = 100 * m;
      l.l = 100 * c;
      l.model = "hsl";
      return l;
    }
    var q = { h: 0, s: 0, l: 0, a: 1, model: "hsla" };
    this.u = function (l) {
      return P.Ac(l) ? a(Ea.ga(l)) : P.wb(l) ? a(l) : q;
    };
    this.ga = function (l) {
      var g;
      return (g =
        /rgba\(\s*([^,\s]+)\s*,\s*([^,\s]+)\s*,\s*([^,\s]+)\s*,\s*([^,\s]+)\s*\)/.exec(
          l,
        )) && 5 == g.length
        ? {
            r: parseFloat(g[1]),
            g: parseFloat(g[2]),
            b: parseFloat(g[3]),
            a: parseFloat(g[4]),
            model: "rgba",
          }
        : (g =
              /hsla\(\s*([^,\s]+)\s*,\s*([^,%\s]+)%\s*,\s*([^,\s%]+)%\s*,\s*([^,\s]+)\s*\)/.exec(
                l,
              )) && 5 == g.length
          ? {
              h: parseFloat(g[1]),
              s: parseFloat(g[2]),
              l: parseFloat(g[3]),
              a: parseFloat(g[4]),
              model: "hsla",
            }
          : (g = /rgb\(\s*([^,\s]+)\s*,\s*([^,\s]+)\s*,\s*([^,\s]+)\s*\)/.exec(
                l,
              )) && 4 == g.length
            ? {
                r: parseFloat(g[1]),
                g: parseFloat(g[2]),
                b: parseFloat(g[3]),
                a: 1,
                model: "rgb",
              }
            : (g =
                  /hsl\(\s*([^,\s]+)\s*,\s*([^,\s%]+)%\s*,\s*([^,\s%]+)%\s*\)/.exec(
                    l,
                  )) && 4 == g.length
              ? {
                  h: parseFloat(g[1]),
                  s: parseFloat(g[2]),
                  l: parseFloat(g[3]),
                  a: 1,
                  model: "hsl",
                }
              : (g = /#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/.exec(
                    l,
                  )) && 4 == g.length
                ? {
                    r: parseInt(g[1], 16),
                    g: parseInt(g[2], 16),
                    b: parseInt(g[3], 16),
                    a: 1,
                    model: "rgb",
                  }
                : (g = /#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/.exec(l)) &&
                    4 == g.length
                  ? {
                      r: 17 * parseInt(g[1], 16),
                      g: 17 * parseInt(g[2], 16),
                      b: 17 * parseInt(g[3], 16),
                      a: 1,
                      model: "rgb",
                    }
                  : q;
    };
    this.T = function (l) {
      function g(b, h, f) {
        0 > f && (f += 1);
        1 < f && --f;
        return f < 1 / 6
          ? b + 6 * (h - b) * f
          : 0.5 > f
            ? h
            : f < 2 / 3
              ? b + (h - b) * (2 / 3 - f) * 6
              : b;
      }
      function e(b, h, f) {
        return Math.sqrt(b * b * 0.241 + h * h * 0.691 + f * f * 0.068) / 255;
      }
      if ("rgb" == l.model || "rgba" == l.model) return e(l.r, l.g, l.b);
      var d = l.l / 100;
      var p = l.s / 100;
      var m = l.h / 360;
      if (0 == l.Cj) d = l = m = d;
      else {
        p = 0.5 > d ? d * (1 + p) : d + p - d * p;
        var c = 2 * d - p;
        d = g(c, p, m + 1 / 3);
        l = g(c, p, m);
        m = g(c, p, m - 1 / 3);
      }
      return e(255 * d, 255 * l, 255 * m);
    };
    this.wa = function (l) {
      if (P.Ac(l)) return l;
      if (P.wb(l))
        switch (l.model) {
          case "hsla":
            return Ea.sa(l);
          case "hsl":
            return Ea.H(l);
          case "rgba":
            return Ea.ua(l);
          case "rgb":
            return Ea.ta(l);
          default:
            return "#000";
        }
      else return "#000";
    };
    this.ua = function (l) {
      return (
        "rgba(" +
        ((0.5 + l.r) | 0) +
        "," +
        ((0.5 + l.g) | 0) +
        "," +
        ((0.5 + l.b) | 0) +
        "," +
        l.a +
        ")"
      );
    };
    this.ta = function (l) {
      return (
        "rgba(" +
        ((0.5 + l.r) | 0) +
        "," +
        ((0.5 + l.g) | 0) +
        "," +
        ((0.5 + l.b) | 0) +
        ")"
      );
    };
    this.sa = function (l) {
      return (
        "hsla(" +
        ((0.5 + l.h) | 0) +
        "," +
        ((0.5 + l.s) | 0) +
        "%," +
        ((0.5 + l.l) | 0) +
        "%," +
        l.a +
        ")"
      );
    };
    this.H = function (l) {
      return (
        "hsl(" +
        ((0.5 + l.h) | 0) +
        "," +
        ((0.5 + l.s) | 0) +
        "%," +
        ((0.5 + l.l) | 0) +
        "%)"
      );
    };
    this.i = function (l, g, e) {
      return (
        "hsl(" +
        ((0.5 + l) | 0) +
        "," +
        ((0.5 + g) | 0) +
        "%," +
        ((0.5 + e) | 0) +
        "%)"
      );
    };
  })();
  function Fa() {
    var a = !1,
      q,
      l = [],
      g = this,
      e = new (function () {
        this.then = function (d) {
          d && (a ? d.apply(g, q) : l.push(d));
          return this;
        };
        this.Gg = function (d) {
          g = d;
          return { then: this.then };
        };
      })();
    this.resolve = function () {
      q = arguments;
      for (var d = 0; d < l.length; d++) l[d].apply(g, q);
      a = !0;
      return this;
    };
    this.promise = function () {
      return e;
    };
  }
  function Ga(a) {
    var q = new Fa(),
      l = a.length;
    if (0 < a.length)
      for (var g = a.length - 1; 0 <= g; g--)
        a[g].then(function () {
          0 === --l && q.resolve();
        });
    else q.resolve();
    return q.promise();
  }
  function Ha(a) {
    var q = 0;
    this.i = function () {
      q++;
    };
    this.u = function () {
      q--;
      0 === q && a();
    };
    this.clear = function () {
      q = 0;
    };
    this.initial = function () {
      return 0 === q;
    };
  }
  var Ia = {
    pe: function (a, q, l, g) {
      g = g || {};
      try {
        var e = a.getBoundingClientRect();
      } catch (p) {
        if (!Ia.Kh) {
          Ia.Kh = !0;
          window.console.log("getBoundingClientRect() failed.");
          window.console.log("Element", a);
          e = window.console;
          for (var d = e.log; null !== a.parentElement; ) a = a.parentElement;
          d.call(e, "Attached to DOM", a === document.body.parentElement);
        }
        e = { left: 0, top: 0 };
      }
      g.x = q - e.left;
      g.y = l - e.top;
      return g;
    },
  };
  function Ja() {
    var a = window.__el,
      q = {};
    this.addEventListener = function (l, g, e) {
      var d = q[l];
      d || ((d = []), (q[l] = d));
      d.push(g);
      a.addEventListener(l, g, e);
    };
    this.i = function () {
      P.Aa(q, function (l, g) {
        for (var e = l.length - 1; 0 <= e; e--) a.removeEventListener(g, l[e]);
      });
    };
  }
  function Ka(a) {
    function q(H) {
      return function (B) {
        l(B) && H.apply(this, arguments);
      };
    }
    function l(H) {
      for (H = H.target; H; ) {
        if (H === a) return !0;
        H = H.parentElement;
      }
      return !1;
    }
    function g(H, B, M) {
      M = M || {};
      e(H, M);
      for (var Q = 0; Q < B.length; Q++) B[Q].call(H.target, M);
      e(H, M);
      ((void 0 === M.Db && M.ci) || "prevent" === M.Db) && H.preventDefault();
      return M;
    }
    function e(H, B) {
      Ia.pe(a, H.clientX, H.clientY, B);
      B.altKey = H.altKey;
      B.metaKey = H.metaKey;
      B.ctrlKey = H.ctrlKey;
      B.shiftKey = H.shiftKey;
      B.lb = 3 === H.which;
      return B;
    }
    var d = new Ja(),
      p = [],
      m = [],
      c = [],
      b = [],
      h = [],
      f = [],
      u = [],
      t = [],
      n = [],
      k = [],
      r = [];
    this.i = function (H) {
      p.push(H);
    };
    this.u = function (H) {
      h.push(H);
    };
    this.sa = function (H) {
      m.push(H);
    };
    this.wa = function (H) {
      c.push(H);
    };
    this.Ka = function (H) {
      b.push(H);
    };
    this.ua = function (H) {
      r.push(H);
    };
    this.ta = function (H) {
      f.push(H);
    };
    this.Ja = function (H) {
      u.push(H);
    };
    this.ga = function (H) {
      t.push(H);
    };
    this.H = function (H) {
      n.push(H);
    };
    this.T = function (H) {
      k.push(H);
    };
    this.Za = function () {
      d.i();
    };
    var y,
      v,
      w,
      z,
      E = { x: 0, y: 0 },
      D = { x: 0, y: 0 },
      G = !1,
      O = !1;
    d.addEventListener(
      "mousedown",
      q(function (H) {
        if (H.target !== a) {
          var B = g(H, c);
          D.x = B.x;
          D.y = B.y;
          E.x = B.x;
          E.y = B.y;
          G = !0;
          g(H, t);
          v = !1;
          y = window.setTimeout(function () {
            100 > wa.i(E, B) && (window.clearTimeout(z), g(H, m), (v = !0));
          }, 400);
        }
      }),
    );
    d.addEventListener("mouseup", function (H) {
      var B = g(H, b);
      G &&
        (O && g(H, k),
        window.clearTimeout(y),
        v ||
          O ||
          !l(H) ||
          ((B = { x: B.x, y: B.y }),
          w && 100 > wa.i(B, w) ? g(H, h) : g(H, p),
          (w = B),
          (z = window.setTimeout(function () {
            w = null;
          }, 350))),
        (O = G = !1));
    });
    d.addEventListener("mousemove", function (H) {
      var B = e(H, {});
      l(H) && g(H, f, { type: "move" });
      E.x = B.x;
      E.y = B.y;
      G && !O && 100 < wa.i(D, E) && (O = !0);
      O && g(H, n, B);
    });
    d.addEventListener(
      "mouseout",
      q(function (H) {
        g(H, u, { type: "out" });
      }),
    );
    d.addEventListener(
      "wheel",
      q(
        (function () {
          return function (H) {
            if ("deltaY" in H) var B = H.deltaY;
            else
              (B = 0),
                "detail" in H && (B = H.detail),
                "wheelDelta" in H && (B = -H.wheelDelta / 120),
                "wheelDeltaY" in H && (B = -H.wheelDeltaY / 120),
                "axis" in H && H.axis === H.HORIZONTAL_AXIS && (B = 0),
                (B *= 10);
            B && H.deltaMode && (B = 1 === H.deltaMode ? 67 * B : 800 * B);
            g(H, r, { ed: -B / 200, ci: !0 });
          };
        })(),
      ),
      { passive: !1 },
    );
    d.addEventListener(
      "contextmenu",
      q(function (H) {
        H.preventDefault();
      }),
    );
  }
  var La = (function () {
    function a(e) {
      return function (d) {
        return Math.pow(d, e);
      };
    }
    function q(e) {
      return function (d) {
        return 1 - Math.pow(1 - d, e);
      };
    }
    function l(e) {
      return function (d) {
        return 1 > (d *= 2)
          ? 0.5 * Math.pow(d, e)
          : 1 - 0.5 * Math.abs(Math.pow(2 - d, e));
      };
    }
    function g(e) {
      return function (d) {
        for (var p = 0; p < e.length; p++) d = (0, e[p])(d);
        return d;
      };
    }
    return {
      ia: function (e) {
        switch (e) {
          case "linear":
            return La.Ab;
          case "bounce":
            return La.ug;
          case "squareIn":
            return La.Uf;
          case "squareOut":
            return La.Gb;
          case "squareInOut":
            return La.Vf;
          case "cubicIn":
            return La.xg;
          case "cubicOut":
            return La.fe;
          case "cubicInOut":
            return La.yg;
          case "quadIn":
            return La.vi;
          case "quadOut":
            return La.xi;
          case "quadInOut":
            return La.wi;
          default:
            return La.Ab;
        }
      },
      Ab: function (e) {
        return e;
      },
      ug: g([
        l(2),
        function (e) {
          return 0 === e
            ? 0
            : 1 === e
              ? 1
              : e *
                (e * (e * (e * (25.9425 * e - 85.88) + 105.78) - 58.69) +
                  13.8475);
        },
      ]),
      Uf: a(2),
      Gb: q(2),
      Vf: l(2),
      xg: a(3),
      fe: q(3),
      yg: l(3),
      vi: a(2),
      xi: q(2),
      wi: l(2),
      rj: g,
    };
  })();
  var P = {
    V: function (a) {
      return void 0 === a;
    },
    Se: function (a) {
      return null === a;
    },
    zc: function (a) {
      return "[object Number]" === Object.prototype.toString.call(a);
    },
    Ac: function (a) {
      return "[object String]" === Object.prototype.toString.call(a);
    },
    Qe: function (a) {
      return "function" === typeof a;
    },
    wb: function (a) {
      return a === Object(a);
    },
    od: function (a, q) {
      return 1e-6 > a - q && -1e-6 < a - q;
    },
    Oe: function (a) {
      return P.V(a) || P.Se(a) || (P.Ac(a) && !/\S/.test(a));
    },
    has: function (a, q) {
      return a && a.hasOwnProperty(q);
    },
    bb: function (a, q) {
      if (a)
        for (var l = q.length - 1; 0 <= l; l--)
          if (a.hasOwnProperty(q[l])) return !0;
      return !1;
    },
    extend: function (a) {
      P.Cg(Array.prototype.slice.call(arguments, 1), function (q) {
        if (q) for (var l in q) q.hasOwnProperty(l) && (a[l] = q[l]);
      });
      return a;
    },
    Aj: function (a, q) {
      return a.map(function (l) {
        return l[q];
      }, []);
    },
    Cg: function (a, q, l) {
      null != a && (a.forEach ? a.forEach(q, l) : P.Aa(a, q, l));
    },
    Aa: function (a, q, l) {
      for (var g in a)
        if (a.hasOwnProperty(g) && !1 === q.call(l, a[g], g, a)) break;
    },
    I: function () {
      for (var a = 0; a < arguments.length; a++) {
        var q = arguments[a];
        if (!(P.V(q) || (P.zc(q) && isNaN(q)) || (P.Ac(q) && P.Oe(q))))
          return q;
      }
    },
    Jf: function (a, q) {
      q = a.indexOf(q);
      0 <= q && a.splice(q, 1);
    },
    zg: function (a, q, l) {
      var g;
      return function () {
        var e = this,
          d = arguments,
          p = l && !g;
        clearTimeout(g);
        g = setTimeout(function () {
          g = null;
          l || a.apply(e, d);
        }, q);
        p && a.apply(e, d);
      };
    },
    defer: function (a) {
      setTimeout(a, 1);
    },
    yj: function (a) {
      return a;
    },
    qa: function () {},
  };
  var Ma = {
    Jh: function (a, q, l) {
      return ea.Hh()
        ? function () {
            var g = q + ":" + JSON.stringify(arguments),
              e = window.localStorage.getItem(g);
            e && (e = JSON.parse(e));
            if (e && Date.now() - e.t < l) return e.v;
            e = a.apply(this, arguments);
            window.localStorage.setItem(
              g,
              JSON.stringify({ v: e, t: Date.now() }),
            );
            return e;
          }
        : a;
    },
  };
  var Na = {
    A: function (a, q) {
      function l() {
        var g = [];
        if (Array.isArray(a))
          for (var e = 0; e < a.length; e++) {
            var d = a[e];
            d && g.push(d.apply(q, arguments));
          }
        else a && g.push(a.apply(q, arguments));
        return g;
      }
      l.empty = function () {
        return 0 === a.length && !P.Qe(a);
      };
      return l;
    },
  };
  function Oa() {
    var a = {};
    this.subscribe = function (q, l) {
      var g = a[q];
      g || ((g = []), (a[q] = g));
      g.push(l);
    };
    this.D = function (q, l) {
      var g = a[q];
      if (g)
        for (
          var e = Array.prototype.slice.call(arguments, 1), d = 0;
          d < g.length;
          d++
        )
          g[d].apply(this, e);
    };
  }
  var Pa = {
    Qf: function (a) {
      for (var q = "", l = 0; l < a.length; l++)
        q += String.fromCharCode(a.charCodeAt(l) ^ 1);
      return q;
    },
  };
  function Qa(a) {
    function q(b, h, f) {
      var u = this,
        t,
        n = 0;
      this.id = p++;
      this.name = f ? f : "{unnamed on " + b + "}";
      this.target = function () {
        return b;
      };
      this.xb = function () {
        return -1 != c.indexOf(u);
      };
      this.start = function () {
        if (!u.xb()) {
          if (-1 == c.indexOf(u)) {
            var k = m.now();
            !0 === u.bf(k) && ((c = c.slice()), c.push(u));
          }
          0 < c.length && a.repeat(g);
        }
        return this;
      };
      this.stop = function () {
        for (d(u); t < h.length; t++) {
          var k = h[t];
          k.Xa && k.gb.call();
        }
        return this;
      };
      this.bf = function (k) {
        n++;
        if (0 !== h.length) {
          if (P.V(t)) {
            t = 0;
            var r = h[t];
            r.before && r.before.call(r, k, n, u);
          } else r = h[t];
          for (; t < h.length; ) {
            if (r.gb && r.gb.call(r, k, n, u)) return !0;
            r.after && r.after.call(r, k, n, u);
            P.V(t) && (t = -1);
            ++t < h.length &&
              ((r = h[t]), r.before && r.before.call(r, k, n, u));
          }
        }
        return !1;
      };
    }
    function l(b) {
      return P.V(b)
        ? c.slice()
        : c.filter(function (h) {
            return h.target() === b;
          });
    }
    function g() {
      e();
      0 == c.length && a.cancel(g);
    }
    function e() {
      var b = m.now();
      c.forEach(function (h) {
        !0 !== h.bf(b) && d(h);
      });
    }
    function d(b) {
      c = c.filter(function (h) {
        return h !== b;
      });
    }
    var p = 0,
      m = ka.create(),
      c = [];
    this.i = function () {
      for (var b = c.length - 1; 0 <= b; b--) c[b].stop();
      c = [];
    };
    this.K = (function () {
      function b() {}
      function h(k) {
        function r(D) {
          return P.Qe(D) ? D.call(void 0) : D;
        }
        var y = k.target,
          v = k.duration,
          w = k.ba,
          z,
          E;
        this.before = function () {
          z = {};
          for (var D in k.P)
            y.hasOwnProperty(D) &&
              (z[D] = {
                start: P.V(k.P[D].start) ? y[D] : r(k.P[D].start),
                end: P.V(k.P[D].end) ? y[D] : r(k.P[D].end),
                easing: P.V(k.P[D].easing) ? La.Ab : k.P[D].easing,
              });
          E = m.now();
        };
        this.gb = function () {
          var D = m.now() - E;
          D = 0 === v ? 1 : Math.min(v, D) / v;
          for (var G in z) {
            var O = z[G];
            y[G] = O.start + (O.end - O.start) * O.easing(D);
          }
          w && w.call(y, D);
          return 1 > D;
        };
      }
      function f(k, r, y) {
        this.Xa = y;
        this.gb = function () {
          k.call(r);
          return !1;
        };
      }
      function u(k) {
        var r;
        this.before = function (y, v) {
          r = v + k;
        };
        this.gb = function (y, v) {
          return v < r;
        };
      }
      function t(k) {
        var r;
        this.before = function (y) {
          r = y + k;
        };
        this.gb = function (y) {
          return y < r;
        };
      }
      function n(k) {
        this.before = function () {
          k.forEach(function (r) {
            r.start();
          });
        };
        this.gb = function () {
          for (var r = 0; r < k.length; r++) if (k[r].xb()) return !0;
          return !1;
        };
      }
      b.A = function (k, r) {
        return new (function () {
          function y(w, z, E, D) {
            return z ? (P.V(E) && (E = k), w.Mb(new f(z, E, D))) : w;
          }
          var v = [];
          this.Mb = function (w) {
            v.push(w);
            return this;
          };
          this.wait = function (w) {
            return this.Mb(new t(w));
          };
          this.Xd = function (w) {
            return this.Mb(new u(w || 1));
          };
          this.call = function (w, z) {
            return y(this, w, z, !1);
          };
          this.Xa = function (w, z) {
            return y(this, w, z, !0);
          };
          this.fa = function (w) {
            P.V(w.target) && (w.target = k);
            return this.Mb(new h(w));
          };
          this.Qa = function (w) {
            return this.Mb(new n(w));
          };
          this.done = function () {
            return new q(k, v, r);
          };
          this.start = function () {
            return this.done().start();
          };
          this.i = function () {
            var w = new Fa();
            this.Xd().call(w.resolve).done();
            return w.promise();
          };
          this.Ta = function () {
            var w = this.i();
            this.start();
            return w;
          };
        })();
      };
      b.jc = function (k) {
        l(k).forEach(function (r) {
          r.stop();
        });
        return b.A(k, void 0);
      };
      return b;
    })();
  }
  var Ra = (function () {
    var a = {
      oe: function (q, l) {
        if (q.m) {
          q = q.m;
          for (var g = 0; g < q.length; g++) l(q[g], g);
        }
      },
      sc: function (q, l) {
        if (q.m) {
          q = q.m;
          for (var g = 0; g < q.length; g++)
            if (!1 === a.sc(q[g], l) || !1 === l(q[g], g)) return !1;
        }
      },
    };
    a.L = a.sc;
    a.tc = function (q, l) {
      if (q.m) {
        q = q.m;
        for (var g = 0; g < q.length; g++)
          if (!1 === l(q[g], g) || !1 === a.tc(q[g], l)) return !1;
      }
    };
    a.za = function (q, l) {
      if (q.m)
        for (var g = q.m, e = 0; e < g.length; e++)
          if (!1 === a.za(g[e], l)) return !1;
      return l(q);
    };
    a.sj = a.za;
    a.fd = function (q, l) {
      !1 !== l(q) && a.tc(q, l);
    };
    a.uc = function (q, l) {
      var g = [];
      a.tc(q, function (e) {
        g.push(e);
      });
      return l ? g.filter(l) : g;
    };
    a.ne = function (q, l) {
      for (q = q.parent; q && !1 !== l(q); ) q = q.parent;
    };
    a.Lh = function (q, l) {
      for (q = q.parent; q && q !== l; ) q = q.parent;
      return !!q;
    };
    return a;
  })();
  var wa = new (function () {
    function a(l, g) {
      var e = l.x - g.x;
      l = l.y - g.y;
      return e * e + l * l;
    }
    function q(l, g, e) {
      for (var d = 0; d < l.length; d++) {
        var p = wa.T(l[d], l[d + 1] || l[0], g, e, !0);
        if (p) return p;
      }
    }
    this.T = function (l, g, e, d, p) {
      var m = l.x;
      l = l.y;
      var c = g.x - m;
      g = g.y - l;
      var b = e.x,
        h = e.y;
      e = d.x - b;
      var f = d.y - h;
      d = c * f - e * g;
      if (
        !(1e-12 >= d && -1e-12 <= d) &&
        ((b -= m),
        (h -= l),
        (e = (b * f - e * h) / d),
        (d = (b * g - c * h) / d),
        0 <= d && (p || 1 >= d) && 0 <= e && 1 >= e)
      )
        return { x: m + c * e, y: l + g * e };
    };
    this.Lb = function (l, g, e, d) {
      var p = l.x;
      l = l.y;
      var m = g.x - p;
      g = g.y - l;
      var c = e.x;
      e = e.y;
      var b = d.x - c;
      d = d.y - e;
      var h = m * d - b * g;
      if (
        !(1e-12 >= h && -1e-12 <= h) &&
        ((d = ((c - p) * d - b * (e - l)) / h), 0 <= d && 1 >= d)
      )
        return { x: p + m * d, y: l + g * d };
    };
    this.wa = function (l, g, e) {
      var d = wa.u(g, {}),
        p = wa.u(e, {}),
        m = p.x - d.x,
        c = p.y - d.y,
        b = [];
      for (p = 0; p < e.length; p++) {
        var h = e[p];
        b.push({ x: h.x - m, y: h.y - c });
      }
      e = [];
      h = [];
      for (p = 0; p < l.length; p++) {
        var f = l[p],
          u = q(g, d, f);
        u ? (e.push(u), h.push(q(b, d, f))) : (e.push(null), h.push(null));
      }
      for (p = 0; p < l.length; p++)
        if (((u = e[p]), (f = h[p]), u && f)) {
          g = l[p];
          b = d;
          var t = u.x - d.x;
          u = u.y - d.y;
          u = Math.sqrt(t * t + u * u);
          if (1e-12 < u) {
            t = g.x - d.x;
            var n = g.y - d.y;
            u = Math.sqrt(t * t + n * n) / u;
            g.x = b.x + u * (f.x - b.x);
            g.y = b.y + u * (f.y - b.y);
          } else (g.x = b.x), (g.y = b.y);
        }
      for (p = 0; p < l.length; p++) (h = l[p]), (h.x += m), (h.y += c);
    };
    this.F = function (l, g) {
      if (0 !== l.length) {
        var e, d;
        var p = (e = l[0].x);
        var m = (d = l[0].y);
        for (var c = l.length; 0 < --c; )
          (p = Math.min(p, l[c].x)),
            (e = Math.max(e, l[c].x)),
            (m = Math.min(m, l[c].y)),
            (d = Math.max(d, l[c].y));
        g.x = p;
        g.y = m;
        g.w = e - p;
        g.o = d - m;
        return g;
      }
    };
    this.H = function (l) {
      return [
        { x: l.x, y: l.y },
        { x: l.x + l.w, y: l.y },
        { x: l.x + l.w, y: l.y + l.o },
        { x: l.x, y: l.y + l.o },
      ];
    };
    this.u = function (l, g) {
      for (
        var e = 0, d = 0, p = l.length, m = l[0], c = 0, b = 1;
        b < p - 1;
        b++
      ) {
        var h = l[b],
          f = l[b + 1],
          u = m.y + h.y + f.y,
          t = (h.x - m.x) * (f.y - m.y) - (f.x - m.x) * (h.y - m.y);
        e += t * (m.x + h.x + f.x);
        d += t * u;
        c += t;
      }
      g.x = e / (3 * c);
      g.y = d / (3 * c);
      g.ha = c / 2;
      return g;
    };
    this.Ja = function (l, g) {
      this.u(l, g);
      g.r = Math.sqrt(g.ha / Math.PI);
    };
    this.sa = function (l, g) {
      for (var e = 0; e < l.length; e++) {
        var d = l[e],
          p = l[e + 1] || l[0];
        if (0 > (g.y - d.y) * (p.x - d.x) - (g.x - d.x) * (p.y - d.y))
          return !1;
      }
      return !0;
    };
    this.Vc = function (l, g, e) {
      var d = l.x,
        p = g.x;
      l.x > g.x && ((d = g.x), (p = l.x));
      p > e.x + e.w && (p = e.x + e.w);
      d < e.x && (d = e.x);
      if (d > p) return !1;
      var m = l.y,
        c = g.y,
        b = g.x - l.x;
      1e-7 < Math.abs(b) &&
        ((c = (g.y - l.y) / b),
        (l = l.y - c * l.x),
        (m = c * d + l),
        (c = c * p + l));
      m > c && ((d = c), (c = m), (m = d));
      c > e.y + e.o && (c = e.y + e.o);
      m < e.y && (m = e.y);
      return m <= c;
    };
    this.Ka = function (l, g, e, d, p) {
      var m;
      function c(n, k, r) {
        if (g.x === f.x && g.y === f.y) return r;
        var y = q(l, g, f),
          v = Math.sqrt(a(y, g) / (n * n + k * k));
        return v < b
          ? ((b = v),
            (m = y.x),
            (h = y.y),
            0 !== k
              ? Math.abs(h - g.y) / Math.abs(k)
              : Math.abs(m - g.x) / Math.abs(n))
          : r;
      }
      d = P.I(d, 0.5);
      p = P.I(p, 0.5);
      e = P.I(e, 1);
      var b = Number.MAX_VALUE;
      var h = (m = 0);
      var f = { x: 0, y: 0 },
        u = d * e;
      e = (1 - d) * e;
      d = 1 - p;
      f.x = g.x - u;
      f.y = g.y - p;
      var t = c(u, p, t);
      f.x = g.x + e;
      f.y = g.y - p;
      t = c(e, p, t);
      f.x = g.x - u;
      f.y = g.y + d;
      t = c(u, d, t);
      f.x = g.x + e;
      f.y = g.y + d;
      return (t = c(e, d, t));
    };
    this.pb = function (l, g) {
      function e(b, h, f) {
        var u = h.x,
          t = f.x;
        h = h.y;
        f = f.y;
        var n = t - u,
          k = f - h;
        return (
          Math.abs(k * b.x - n * b.y - u * f + t * h) / Math.sqrt(n * n + k * k)
        );
      }
      for (var d = l.length, p = e(g, l[d - 1], l[0]), m = 0; m < d - 1; m++) {
        var c = e(g, l[m], l[m + 1]);
        c < p && (p = c);
      }
      return p;
    };
    this.ua = function (l, g, e) {
      var d;
      e = { x: g.x + Math.cos(e), y: g.y - Math.sin(e) };
      var p = [],
        m = [],
        c = l.length;
      for (d = 0; d < c; d++) {
        var b = wa.Lb(l[d], l[(d + 1) % c], g, e);
        if (b && (p.push(b), 2 == m.push(d))) break;
      }
      if (2 == p.length) {
        b = p[0];
        p = p[1];
        var h = m[0];
        m = m[1];
        var f = [p, b];
        for (d = h + 1; d <= m; d++) f.push(l[d]);
        for (d = [b, p]; m != h; ) (m = (m + 1) % c), d.push(l[m]);
        l = [f, d];
        c = e.x - g.x;
        d = p.x - b.x;
        0 === c && ((c = e.y - g.y), (d = p.y - b.y));
        (0 > c ? -1 : 0 < c ? 1 : 0) !== (0 > d ? -1 : 0 < d ? 1 : 0) &&
          l.reverse();
        return l;
      }
    };
    this.ga = function (l, g, e, d) {
      d.x = l * (g.x - e.x) + e.x;
      d.y = l * (g.y - e.y) + e.y;
      return d;
    };
    this.i = a;
    this.ta = function (l, g, e) {
      if (P.zc(g)) var d = (2 * Math.PI * g) / 360;
      else
        switch (((d = wa.F(l, {})), g)) {
          case "random":
            d = Math.random() * Math.PI * 2;
            break;
          case "top":
            d = Math.atan2(-d.o, 0);
            break;
          case "bottom":
            d = Math.atan2(d.o, 0);
            break;
          case "left":
            d = Math.atan2(0, -d.w);
            break;
          case "right":
            d = Math.atan2(0, d.w);
            break;
          case "topleft":
            d = Math.atan2(-d.o, -d.w);
            break;
          case "topright":
            d = Math.atan2(-d.o, d.w);
            break;
          case "bottomleft":
            d = Math.atan2(d.o, -d.w);
            break;
          default:
            d = Math.atan2(d.o, d.w);
        }
      g = wa.u(l, {});
      l = q(l, g, { x: g.x + Math.cos(d), y: g.y + Math.sin(d) });
      return wa.ga(e, l, g, {});
    };
    return this;
  })();
  var Sa = new (function () {
    function a(d, p) {
      this.face = d;
      this.Rc = p;
      this.ec = this.Lc = null;
    }
    function q(d, p, m) {
      this.la = [d, p, m];
      this.J = Array(3);
      var c = p.y - d.y,
        b = m.z - d.z,
        h = p.x - d.x;
      p = p.z - d.z;
      var f = m.x - d.x;
      d = m.y - d.y;
      this.Ha = { x: c * b - p * d, y: p * f - h * b, z: h * d - c * f };
      this.Ya = [];
      this.ad = this.visible = !1;
    }
    this.i = function (d) {
      function p(aa, C, U) {
        var ha = aa.la[0],
          ba = aa.Ha,
          ja = ba.x,
          N = ba.y;
        ba = ba.z;
        var S = Array(b);
        C = C.Ya;
        var ca = C.length;
        for (c = 0; c < ca; c++) {
          var I = C[c].Rc;
          S[I.index] = !0;
          0 > ja * (I.x - ha.x) + N * (I.y - ha.y) + ba * (I.z - ha.z) &&
            a.add(aa, I);
        }
        C = U.Ya;
        ca = C.length;
        for (c = 0; c < ca; c++)
          (I = C[c].Rc),
            !0 !== S[I.index] &&
              0 > ja * (I.x - ha.x) + N * (I.y - ha.y) + ba * (I.z - ha.z) &&
              a.add(aa, I);
      }
      var m,
        c,
        b = d.length;
      for (m = 0; m < b; m++) (d[m].index = m), (d[m].Pb = null);
      var h = [],
        f;
      if (
        0 <
        (f = (function () {
          function aa(T, R, V, fa) {
            var x = { x: R.x - T.x, y: R.y - T.y, z: R.z - T.z };
            var A = { x: V.x - T.x, y: V.y - T.y, z: V.z - T.z };
            var F = x.y * A.z - x.z * A.y;
            var L = x.z * A.x - x.x * A.z;
            x = x.x * A.y - x.y * A.x;
            return F * fa.x + L * fa.y + x * fa.z > F * T.x + L * T.y + x * T.z
              ? new q(T, R, V)
              : new q(V, R, T);
          }
          function C(T, R, V, fa) {
            function x(A, F, L) {
              A = A.la;
              F = A[0] == F ? 0 : A[1] == F ? 1 : 2;
              return A[(F + 1) % 3] != L ? (F + 2) % 3 : F;
            }
            R.J[x(R, V, fa)] = T;
            T.J[x(T, fa, V)] = R;
          }
          if (4 > b) return 0;
          var U = d[0],
            ha = d[1],
            ba = d[2],
            ja = d[3],
            N = aa(U, ha, ba, ja),
            S = aa(U, ba, ja, ha),
            ca = aa(U, ha, ja, ba),
            I = aa(ha, ba, ja, U);
          C(N, S, ba, U);
          C(N, ca, U, ha);
          C(N, I, ha, ba);
          C(S, ca, ja, U);
          C(S, I, ba, ja);
          C(ca, I, ja, ha);
          h.push(N, S, ca, I);
          for (U = 4; U < b; U++)
            for (ha = d[U], ba = 0; 4 > ba; ba++)
              (ja = h[ba]),
                (N = ja.la[0]),
                (S = ja.Ha),
                0 >
                  S.x * (ha.x - N.x) +
                    S.y * (ha.y - N.y) +
                    S.z * (ha.z - N.z) && a.add(ja, ha);
          return 4;
        })())
      ) {
        for (; f < b; ) {
          var u = d[f];
          if (u.Pb) {
            for (m = u.Pb; null !== m; ) (m.face.visible = !0), (m = m.ec);
            m = 0;
            a: for (; m < h.length; m++) {
              var t = h[m];
              if (!1 === t.visible) {
                var n = t.J;
                for (c = 0; 3 > c; c++)
                  if (!0 === n[c].visible) {
                    var k = t;
                    var r = c;
                    break a;
                  }
              }
            }
            t = [];
            n = [];
            var y = k,
              v = r;
            do
              if (
                (t.push(y), n.push(v), (v = (v + 1) % 3), !1 === y.J[v].visible)
              ) {
                do
                  for (m = y.la[v], y = y.J[v], c = 0; 3 > c; c++)
                    y.la[c] == m && (v = c);
                while (!1 === y.J[v].visible && (y !== k || v !== r));
              }
            while (y !== k || v !== r);
            var w = null,
              z = null;
            for (m = 0; m < t.length; m++) {
              y = t[m];
              v = n[m];
              var E = y.J[v],
                D = y.la[(v + 1) % 3],
                G = y.la[v],
                O = D.y - u.y,
                H = G.z - u.z,
                B = D.x - u.x,
                M = D.z - u.z,
                Q = G.x - u.x,
                X = G.y - u.y;
              if (0 < e.length) {
                var Y = e.pop();
                Y.la[0] = u;
                Y.la[1] = D;
                Y.la[2] = G;
                Y.Ha.x = O * H - M * X;
                Y.Ha.y = M * Q - B * H;
                Y.Ha.z = B * X - O * Q;
                Y.Ya.length = 0;
                Y.visible = !1;
                Y.ad = !0;
              } else
                Y = {
                  la: [u, D, G],
                  J: Array(3),
                  Ha: { x: O * H - M * X, y: M * Q - B * H, z: B * X - O * Q },
                  Ya: [],
                  visible: !1,
                };
              h.push(Y);
              y.J[v] = Y;
              Y.J[1] = y;
              null !== z && ((z.J[0] = Y), (Y.J[2] = z));
              z = Y;
              null === w && (w = Y);
              p(Y, y, E);
            }
            z.J[0] = w;
            w.J[2] = z;
            m = [];
            for (c = 0; c < h.length; c++)
              if (((t = h[c]), !0 === t.visible)) {
                n = t.Ya;
                y = n.length;
                for (u = 0; u < y; u++)
                  (v = n[u]),
                    (w = v.Lc),
                    (z = v.ec),
                    null !== w && (w.ec = z),
                    null !== z && (z.Lc = w),
                    null === w && (v.Rc.Pb = z),
                    l.push(v);
                t.ad && e.push(t);
              } else m.push(t);
            h = m;
          }
          f++;
        }
        for (m = 0; m < h.length; m++) (t = h[m]), t.ad && e.push(t);
      }
      return { qe: h };
    };
    a.add = function (d, p) {
      if (0 < l.length) {
        var m = l.pop();
        m.face = d;
        m.Rc = p;
        m.ec = null;
        m.Lc = null;
      } else m = new a(d, p);
      d.Ya.push(m);
      d = p.Pb;
      null !== d && (d.Lc = m);
      m.ec = d;
      p.Pb = m;
    };
    for (var l = Array(2e3), g = 0; g < l.length; g++) l[g] = new a(null, null);
    var e = Array(1e3);
    for (g = 0; g < e.length; g++)
      e[g] = {
        la: Array(3),
        J: Array(3),
        Ha: { x: 0, y: 0, z: 0 },
        Ya: [],
        visible: !1,
      };
  })();
  var Ta = new (function () {
    function a(q, l, g, e, d, p, m, c) {
      var b = (q - g) * (p - c) - (l - e) * (d - m);
      if (!(1e-12 > Math.abs(b)))
        return {
          x: ((q * e - l * g) * (d - m) - (q - g) * (d * c - p * m)) / b,
          y: ((q * e - l * g) * (p - c) - (l - e) * (d * c - p * m)) / b,
        };
    }
    this.i = function (q, l) {
      for (
        var g = q[0], e = g.x, d = g.y, p = g.x, m = g.y, c = q.length - 1;
        0 < c;
        c--
      )
        (g = q[c]),
          (e = Math.min(e, g.x)),
          (d = Math.min(d, g.y)),
          (p = Math.max(p, g.x)),
          (m = Math.max(m, g.y));
      if (!(p - e < 3 * l || m - d < 3 * l)) {
        a: {
          g = !0;
          void 0 == g && (g = !1);
          e = [];
          d = q.length;
          for (p = 0; p <= d; p++) {
            m = q[p % d];
            c = q[(p + 1) % d];
            var b = q[(p + 2) % d];
            var h = c.x - m.x;
            var f = c.y - m.y;
            var u = Math.sqrt(h * h + f * f);
            var t = (l * h) / u,
              n = (l * f) / u;
            h = b.x - c.x;
            f = b.y - c.y;
            u = Math.sqrt(h * h + f * f);
            h = (l * h) / u;
            f = (l * f) / u;
            if (
              (m = a(
                m.x - n,
                m.y + t,
                c.x - n,
                c.y + t,
                c.x - f,
                c.y + h,
                b.x - f,
                b.y + h,
              ))
            )
              if (
                (e.push(m),
                (b = e.length),
                g &&
                  3 <= b &&
                  ((m = e[b - 3]),
                  (c = e[b - 2]),
                  (b = e[b - 1]),
                  0 > (c.x - m.x) * (b.y - m.y) - (b.x - m.x) * (c.y - m.y)))
              ) {
                g = void 0;
                break a;
              }
          }
          e.shift();
          g = 3 > e.length ? void 0 : e;
        }
        if (!g)
          a: {
            e = q.slice(0);
            for (g = 0; g < q.length; g++) {
              p = q[g % q.length];
              c = q[(g + 1) % q.length];
              b = c.x - p.x;
              d = c.y - p.y;
              m = Math.sqrt(b * b + d * d);
              b = (l * b) / m;
              m = (l * d) / m;
              d = p.x - m;
              p = p.y + b;
              m = c.x - m;
              b = c.y + b;
              if (0 != e.length) {
                n = d - m;
                f = p - b;
                t = [];
                h = u = !0;
                for (c = 0; c < e.length; c++) {
                  var k = n * (p - e[c].y) - (d - e[c].x) * f;
                  1e-12 >= k && -1e-12 <= k && (k = 0);
                  t.push(k);
                  0 < k && (u = !1);
                  0 > k && (h = !1);
                }
                if (u) e = [];
                else if (!h) {
                  n = [];
                  for (c = 0; c < e.length; c++)
                    (f = (c + 1) % e.length),
                      (u = t[c]),
                      (h = t[f]),
                      0 <= u && n.push(e[c]),
                      ((0 < u && 0 > h) || (0 > u && 0 < h)) &&
                        n.push(a(e[c].x, e[c].y, e[f].x, e[f].y, d, p, m, b));
                  e = n;
                }
              }
              if (3 > e.length) {
                g = void 0;
                break a;
              }
            }
            g = e;
          }
        return g;
      }
    };
    return this;
  })();
  var Ua = new (function () {
    function a(q) {
      for (var l = q[0].x, g = q[0].y, e = l, d = g, p = 1; p < q.length; p++) {
        var m = q[p];
        l = Math.min(l, m.x);
        g = Math.min(g, m.y);
        e = Math.max(e, m.x);
        d = Math.max(d, m.y);
      }
      q = e - l;
      d -= g;
      return [
        { x: l + 2 * q, y: g + 2 * d, w: 0 },
        { x: l + 2 * q, y: g - 2 * d, w: 0 },
        { x: l - 2 * q, y: g + 2 * d, w: 0 },
      ];
    }
    this.i = function (q, l) {
      function g(n) {
        var k = [n[0]],
          r = n[0][0],
          y = n[0][1],
          v = n.length,
          w = 1;
        a: for (; w < v; w++)
          for (var z = 1; z < v; z++) {
            var E = n[z];
            if (null !== E) {
              if (E[1] === r)
                if ((k.unshift(E), (r = E[0]), (n[z] = null), k.length === v))
                  break a;
                else continue;
              if (
                E[0] === y &&
                (k.push(E), (y = E[1]), (n[z] = null), k.length === v)
              )
                break a;
            }
          }
        k[0][0] != k[v - 1][1] && k.push([k[v - 1][1], k[0][0]]);
        return k;
      }
      function e(n, k, r, y) {
        var v = [],
          w = [],
          z = r.length,
          E,
          D = k.length,
          G = 0,
          O = -1,
          H = -1,
          B,
          M = y;
        for (y = 0; y < z; y++) {
          var Q = (M + 1) % z,
            X = r[M][0],
            Y = r[Q][0];
          if (1e-12 < wa.i(X.ea, Y.ea))
            if (X.jb && Y.jb) {
              var aa = [],
                C = [];
              for (E = 0; E < D; E++) {
                var U = (G + 1) % D;
                if ((B = wa.T(k[G], k[U], X.ea, Y.ea, !1)))
                  if ((C.push(G), 2 === aa.push(B))) break;
                G = U;
              }
              if (2 === aa.length) {
                E = aa[1];
                B = wa.i(X.ea, aa[0]);
                E = wa.i(X.ea, E);
                X = B < E ? 0 : 1;
                B = B < E ? 1 : 0;
                E = C[X];
                -1 === O && (O = E);
                if (-1 !== H)
                  for (; E != H; )
                    (H = (H + 1) % D), v.push(k[H]), w.push(null);
                v.push(aa[X], aa[B]);
                w.push(r[M][2], null);
                H = C[B];
              }
            } else if (X.jb && !Y.jb)
              for (E = 0; E < D; E++) {
                U = (G + 1) % D;
                if ((B = wa.T(k[G], k[U], X.ea, Y.ea, !1))) {
                  if (-1 !== H)
                    for (aa = H; G != aa; )
                      (aa = (aa + 1) % D), v.push(k[aa]), w.push(null);
                  v.push(B);
                  w.push(r[M][2]);
                  -1 === O && (O = G);
                  break;
                }
                G = U;
              }
            else if (!X.jb && Y.jb)
              for (E = 0; E < D; E++) {
                U = (G + 1) % D;
                if ((B = wa.T(k[G], k[U], X.ea, Y.ea, !1))) {
                  v.push(X.ea, B);
                  w.push(r[M][2], null);
                  H = G;
                  break;
                }
                G = U;
              }
            else v.push(X.ea), w.push(r[M][2]);
          M = Q;
        }
        if (0 == v.length) w = v = null;
        else if (-1 !== H)
          for (; O != H; ) (H = (H + 1) % D), v.push(k[H]), w.push(null);
        n.C = v;
        n.J = w;
      }
      if (1 === q.length) (q[0].C = l.slice(0)), (q[0].J = []);
      else {
        var d;
        var p = a(l);
        var m = [];
        for (d = 0; d < p.length; d++) {
          var c = p[d];
          m.push({ x: c.x, y: c.y, z: c.x * c.x + c.y * c.y - c.w });
        }
        for (d = 0; d < q.length; d++)
          (c = q[d]),
            (c.C = null),
            m.push({ x: c.x, y: c.y, z: c.x * c.x + c.y * c.y - c.w });
        var b = Sa.i(m).qe;
        (function () {
          for (d = 0; d < b.length; d++) {
            var n = b[d],
              k = n.la,
              r = k[0],
              y = k[1],
              v = k[2];
            k = r.x;
            var w = r.y;
            r = r.z;
            var z = y.x,
              E = y.y;
            y = y.z;
            var D = v.x,
              G = v.y;
            v = v.z;
            var O = k * (E - G) + z * (G - w) + D * (w - E);
            n.ea = {
              x: -(w * (y - v) + E * (v - r) + G * (r - y)) / O / 2,
              y: -(r * (z - D) + y * (D - k) + v * (k - z)) / O / 2,
            };
          }
        })();
        (function (n) {
          for (d = 0; d < b.length; d++) {
            var k = b[d];
            k.jb = !wa.sa(n, k.ea);
          }
        })(l);
        m = (function (n, k) {
          var r = Array(k.length),
            y;
          for (y = 0; y < r.length; y++) r[y] = [];
          for (y = 0; y < n.length; y++) {
            var v = n[y];
            if (!(0 > v.Ha.z))
              for (var w = v.J, z = 0; z < w.length; z++) {
                var E = w[z];
                if (!(0 > E.Ha.z)) {
                  var D = v.la,
                    G = D[(z + 1) % 3].index;
                  D = D[z].index;
                  2 < G && r[G - 3].push([v, E, 2 < D ? k[D - 3] : null]);
                }
              }
          }
          return r;
        })(b, q);
        for (d = 0; d < q.length; d++)
          if (((c = m[d]), 0 !== c.length)) {
            var h = q[d];
            c = g(c);
            var f = c.length,
              u = -1;
            for (p = 0; p < f; p++) c[p][0].jb && (u = p);
            if (0 <= u) e(h, l, c, u);
            else {
              u = [];
              var t = [];
              for (p = 0; p < f; p++)
                1e-12 < wa.i(c[p][0].ea, c[(p + 1) % f][0].ea) &&
                  (u.push(c[p][0].ea), t.push(c[p][2]));
              h.C = u;
              h.J = t;
            }
            h.C && 3 > h.C.length && ((h.C = null), (h.J = null));
          }
      }
    };
    this.u = function (q, l) {
      var g,
        e = !1,
        d = q.length;
      for (g = 0; g < d; g++) {
        var p = q[g];
        null === p.C && (e = !0);
        p.Yd = p.w;
      }
      if (e) {
        e = a(l);
        var m = [];
        g = q.length;
        for (p = 0; p < e.length; p++) {
          var c = e[p];
          m.push({ x: c.x, y: c.y, z: c.x * c.x + c.y * c.y });
        }
        for (p = 0; p < g; p++)
          (c = q[p]), m.push({ x: c.x, y: c.y, z: c.x * c.x + c.y * c.y });
        c = Sa.i(m).qe;
        e = Array(g);
        for (p = 0; p < g; p++) e[p] = {};
        m = c.length;
        for (p = 0; p < m; p++) {
          var b = c[p];
          if (0 < b.Ha.z) {
            var h = b.la,
              f = h.length;
            for (b = 0; b < f - 1; b++) {
              var u = h[b].index - 3,
                t = h[b + 1].index - 3;
              0 <= u && 0 <= t && ((e[u][t] = !0), (e[t][u] = !0));
            }
            b = h[0].index - 3;
            0 <= t && 0 <= b && ((e[t][b] = !0), (e[b][t] = !0));
          }
        }
        for (p = 0; p < g; p++) {
          b = e[p];
          c = q[p];
          t = Number.MAX_VALUE;
          m = null;
          for (var n in b)
            (b = q[n]), (h = wa.i(c, b)), t > h && ((t = h), (m = b));
          c.zj = m;
          c.$e = Math.sqrt(t);
        }
        for (g = 0; g < d; g++)
          (p = q[g]),
            (n = Math.min(Math.sqrt(p.w), 0.95 * p.$e)),
            (p.w = n * n);
        this.i(q, l);
        for (g = 0; g < d; g++)
          (p = q[g]),
            p.Yd !== p.w &&
              0 < p.kc &&
              ((l = Math.min(p.kc, p.Yd - p.w)), (p.w += l), (p.kc -= l));
      }
    };
  })();
  var Va = new (function () {
    this.H = function (a) {
      a = a.m;
      for (var q = 0, l = a.length, g = 0; g < l; g++) {
        var e = a[g];
        if (e.C) {
          var d = e.x,
            p = e.y;
          wa.u(e.C, e);
          d -= e.x;
          e = p - e.y;
          e = (0 < d ? d : -d) + (0 < e ? e : -e);
          q < e && (q = e);
        }
      }
      return q;
    };
    this.i = function (a, q) {
      var l = a.m;
      switch (q) {
        case "random":
          return a.m[Math.floor(l.length * Math.random())];
        case "topleft":
          a = l[0];
          var g = a.x + a.y;
          for (q = 1; q < l.length; q++) {
            var e = l[q];
            var d = e.x + e.y;
            d < g && ((g = d), (a = e));
          }
          return a;
        case "bottomright":
          a = l[0];
          g = a.x + a.y;
          for (q = 1; q < l.length; q++)
            (e = l[q]), (d = e.x + e.y), d > g && ((g = d), (a = e));
          return a;
        default:
          e = l[0];
          g = d = wa.i(a, e);
          for (q = l.length - 1; 1 <= q; q--) {
            var p = l[q];
            d = wa.i(a, p);
            d < g && ((g = d), (e = p));
          }
          return e;
      }
    };
    this.u = function (a, q, l) {
      var g = a.m;
      if (g[0].J) {
        var e = g.length;
        for (a = 0; a < e; a++) (g[a].Sc = !1), (g[a].Zb = 0);
        e = [];
        var d;
        var p = (d = 0);
        e[d++] = q || g[0];
        for (q = q.Zb = 0; p < d; )
          if (((g = e[p++]), !g.Sc && g.J)) {
            l(g, q++, g.Zb);
            g.Sc = !0;
            var m = g.J,
              c = m.length;
            for (a = 0; a < c; a++) {
              var b = m[a];
              b &&
                !0 !== b.Sc &&
                (0 === b.Zb && (b.Zb = g.Zb + 1), (e[d++] = b));
            }
          }
      } else for (a = 0; a < g.length; a++) l(g[a], a, 1);
    };
  })();
  var ta = (function () {
    function a(n, k, r, y, v, w, z, E) {
      var D = P.extend({}, m, n);
      1 > n.lineHeight && (n.lineHeight = 1);
      n = D.fontFamily;
      var G = D.fontStyle + " " + D.fontVariant + " " + D.fontWeight,
        O = D.hb,
        H = D.Gc,
        B = G + " " + n;
      D.ue = B;
      var M = { ka: !1, bc: 0, fontSize: 0 };
      k.save();
      k.font = G + " 100px " + n;
      k.textBaseline = "middle";
      k.textAlign = "center";
      q(k, D);
      r = r.trim();
      u.text = r;
      e(y, v, w, t);
      if (
        /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(
          r,
        )
      )
        g(u), l(k, u, B), d(D, u, t, H, O, !0, M);
      else if (
        (l(k, u, B),
        d(D, u, t, H, O, !1, M),
        !M.ka && (z && (g(u), l(k, u, B)), E || z))
      )
        E && (M.Ub = !0), d(D, u, t, H, H, !0, M);
      if (M.ka) {
        var Q = "",
          X = 0,
          Y = Number.MAX_VALUE,
          aa = Number.MIN_VALUE;
        p(
          D,
          u,
          M.bc,
          M.fontSize,
          t,
          M.Ub,
          function (C, U) {
            0 < Q.length && " " === U && (Q += " ");
            Q += C;
          },
          function (C, U, ha, ba, ja) {
            "\u00ad" === ba && (Q += "\u2010");
            k.save();
            k.translate(w.x, U);
            C = M.fontSize / 100;
            k.scale(C, C);
            k.fillText(Q, 0, 0);
            k.restore();
            Q = ha;
            X < ja && (X = ja);
            Y > U && (Y = U);
            aa < U && (aa = U);
          },
        );
        M.box = {
          x: w.x - X / 2,
          y: Y - M.fontSize / 2,
          w: X,
          o: aa - Y + M.fontSize,
        };
        k.restore();
      } else k.clear && k.clear();
      return M;
    }
    function q(n, k) {
      k = k.ue;
      var r = c[k];
      void 0 === r && ((r = {}), (c[k] = r));
      r[" "] = n.measureText(" ").width;
      r["\u2026"] = n.measureText("\u2026").width;
    }
    function l(n, k, r) {
      var y,
        v = k.text.split(/(\n|[ \f\r\t\v\u2028\u2029]+|\u00ad+|\u200b+)/),
        w = [],
        z = [],
        E = v.length >>> 1;
      for (y = 0; y < E; y++) w.push(v[2 * y]), z.push(v[2 * y + 1]);
      2 * y < v.length && (w.push(v[2 * y]), z.push(void 0));
      r = c[r];
      for (y = 0; y < w.length; y++)
        (v = w[y]),
          (E = r[v]),
          void 0 === E && ((E = n.measureText(v).width), (r[v] = E));
      k.Tc = w;
      k.Rf = z;
    }
    function g(n) {
      for (
        var k = n.text.split(/\s+/),
          r = [],
          y = {
            ".": !0,
            ",": !0,
            ";": !0,
            "?": !0,
            "!": !0,
            ":": !0,
            "\u3002": !0,
          },
          v = 0;
        v < k.length;
        v++
      ) {
        var w = k[v];
        if (3 < w.length) {
          var z = "";
          z += w.charAt(0);
          z += w.charAt(1);
          for (var E = 2; E < w.length - 2; E++) {
            var D = w.charAt(E);
            y[D] || (z += "\u200b");
            z += D;
          }
          z += "\u200b";
          z += w.charAt(w.length - 2);
          z += w.charAt(w.length - 1);
          r.push(z);
        } else r.push(w);
      }
      n.text = r.join(" ");
    }
    function e(n, k, r, y) {
      for (var v, w, z = 0; z < n.length; z++)
        n[z].y === k.y && (void 0 === v ? (v = z) : (w = z));
      void 0 === w && (w = v);
      v !== w && n[w].x < n[v].x && ((z = v), (v = w), (w = z));
      y.C = n;
      y.F = k;
      y.cd = r;
      y.Ye = v;
      y.Ze = w;
    }
    function d(n, k, r, y, v, w, z) {
      var E = n.lineHeight,
        D = Math.max(n.Ua, 0.001),
        G = n.ib,
        O = k.Tc,
        H = r.cd,
        B = r.F,
        M = void 0,
        Q = void 0;
      switch (n.verticalAlign) {
        case "top":
          H = B.y + B.o - H.y;
          break;
        case "bottom":
          H = H.y - B.y;
          break;
        default:
          H = 2 * Math.min(H.y - B.y, B.y + B.o - H.y);
      }
      G = Math.min(H, G * r.F.o);
      if (0 >= G) z.ka = !1;
      else {
        H = y;
        v = Math.min(v, G);
        B = Math.min(1, G / Math.max(20, k.Tc.length));
        do {
          var X = (H + v) / 2,
            Y = Math.min(
              O.length,
              Math.floor((G + X * (E - 1 - 2 * D)) / (X * E)),
            ),
            aa = void 0;
          if (0 < Y) {
            var C = 1,
              U = Y;
            do {
              var ha = Math.floor((C + U) / 2);
              if (p(n, k, ha, X, r, w && X === y && ha === Y, null, null)) {
                if (((U = M = aa = ha), C === U)) break;
              } else if (((C = ha + 1), C > U)) break;
            } while (1);
          }
          void 0 !== aa ? (H = Q = X) : (v = X);
        } while (v - H > B);
        void 0 === Q
          ? ((z.ka = !1), (z.fontSize = 0))
          : ((z.ka = !0), (z.fontSize = Q), (z.bc = M), (z.Ub = w && X === H));
        return z;
      }
    }
    function p(n, k, r, y, v, w, z, E) {
      var D = n.cb,
        G = y * (n.lineHeight - 1),
        O = Math.max(n.Ua, 0.001),
        H = c[n.ue],
        B = k.Tc;
      k = k.Rf;
      var M = v.C,
        Q = v.cd,
        X = v.Ye,
        Y = v.Ze;
      switch (n.verticalAlign) {
        case "top":
          v = Q.y + y / 2 + y * O;
          var aa = 1;
          break;
        case "bottom":
          v = Q.y - (y * r + G * (r - 1)) + y / 2 - y * O;
          aa = -1;
          break;
        default:
          (v = Q.y - ((y * (r - 1)) / 2 + (G * (r - 1)) / 2)), (aa = 1);
      }
      n = v;
      for (O = 0; O < r; O++)
        (b[2 * O] = v - y / 2),
          (b[2 * O + 1] = v + y / 2),
          (v += aa * y),
          (v += aa * G);
      for (; h.length < b.length; ) h.push(Array(2));
      O = b;
      v = 2 * r;
      aa = h;
      var C = M.length,
        U = X;
      X = (X - 1 + C) % C;
      var ha = Y;
      Y = (Y + 1) % C;
      for (var ba = 0; ba < v; ) {
        for (var ja = O[ba], N = M[X]; N.y < ja; )
          (U = X), (X = (X - 1 + C) % C), (N = M[X]);
        for (var S = M[Y]; S.y < ja; ) (ha = Y), (Y = (Y + 1) % C), (S = M[Y]);
        var ca = M[U],
          I = M[ha];
        S = I.x + ((S.x - I.x) * (ja - I.y)) / (S.y - I.y);
        aa[ba][0] = ca.x + ((N.x - ca.x) * (ja - ca.y)) / (N.y - ca.y);
        aa[ba][1] = S;
        ba++;
      }
      for (O = 0; O < r; O++)
        (M = 2 * O),
          (v = Q.x),
          (aa = v - h[M][0]),
          (C = h[M][1] - v),
          (aa = aa < C ? aa : C),
          (C = v - h[M + 1][0]),
          (M = h[M + 1][1] - v),
          (M = C < M ? C : M),
          (f[O] = 2 * (aa < M ? aa : M) - D * y);
      U = (H[" "] * y) / 100;
      aa = (H["\u2026"] * y) / 100;
      D = 0;
      X = f[D];
      Q = 0;
      M = void 0;
      for (O = 0; O < B.length; O++) {
        v = B[O];
        ha = k[O];
        C = (H[v] * y) / 100;
        if (Q + C < X && B.length - O >= r - D && "\n" != M)
          (Q += C), " " === ha && (Q += U), z && z(v, M);
        else {
          if (C > X && (D !== r - 1 || !w)) return !1;
          if (D + 1 >= r) {
            if (w) {
              r = X - Q - aa;
              if (r > aa || C > aa)
                (r = Math.floor((v.length * r) / C)),
                  0 < r && z && z(v.substring(0, r), M);
              z && z("\u2026", void 0);
              E && E(D, n, v, M, Q);
              return !0;
            }
            return !1;
          }
          D++;
          E && E(D, n, v, M, Q);
          n += y;
          n += G;
          X = f[D];
          Q = C;
          " " === ha && (Q += U);
          if (C > X && (D !== r || !w)) return !1;
        }
        M = ha;
      }
      E && E(D, n, void 0, void 0, Q);
      return !0;
    }
    var m = {
        hb: 72,
        Gc: 0,
        lineHeight: 1.05,
        cb: 1,
        Ua: 0.5,
        ib: 0.9,
        fontFamily: "sans-serif",
        fontStyle: "normal",
        fontWeight: "normal",
        fontVariant: "normal",
        verticalAlign: "center",
      },
      c = {},
      b = [],
      h = [],
      f = [],
      u = { text: "", Tc: void 0, Rf: void 0 },
      t = { C: void 0, F: void 0, cd: void 0, Ye: 0, Ze: 0 };
    return {
      se: a,
      de: function (n, k, r, y, v, w, z, E, D, G, O, H) {
        var B = 0,
          M = 0;
        r = r.toString().trim();
        if (!H && D.result && r === D.Yf && Math.abs(G - D.Zd) / G <= O) {
          var Q = D.result;
          Q.ka &&
            ((B = w.x - D.fg),
            (M = w.y - D.gg),
            (O = D.Qc),
            k.save(),
            k.translate(B, M),
            O.Na(k),
            k.restore());
        }
        Q ||
          ((O = D.Qc),
          O.clear(),
          (Q = a(n, O, r, y, v, w, z, E)),
          Q.ka && O.Na(k),
          (D.Zd = G),
          (D.fg = w.x),
          (D.gg = w.y),
          (D.result = Q),
          (D.Yf = r));
        return Q.ka
          ? {
              ka: !0,
              bc: Q.bc,
              fontSize: Q.fontSize,
              box: { x: Q.box.x + B, y: Q.box.y + M, w: Q.box.w, o: Q.box.o },
              Ub: Q.Ub,
            }
          : { ka: !1 };
      },
      bi: function () {
        return {
          Zd: 0,
          fg: 0,
          gg: 0,
          result: void 0,
          Qc: new ra(),
          Yf: void 0,
        };
      },
      ya: m,
    };
  })();
  var Wa = new (function () {
    function a(g, e) {
      return function (d, p, m, c) {
        function b(r, y, v, w, z) {
          if (0 != r.length) {
            var E = r.shift(),
              D = l(E);
            if (e(w, z)) {
              var G = y;
              var O = D / w;
              do {
                D = E.shift();
                var H = D.lc;
                var B = H / O;
                H = D;
                var M = v,
                  Q = O;
                H.x = G + B / 2;
                H.y = M + Q / 2;
                m && h(D, G, v, B, O);
                G += B;
              } while (0 < E.length);
              return b(r, y, v + O, w, z - O);
            }
            G = v;
            B = D / z;
            do
              (D = E.shift()),
                (H = D.lc),
                (O = H / B),
                (H = D),
                (M = G),
                (Q = O),
                (H.x = y + B / 2),
                (H.y = M + Q / 2),
                m && h(D, y, G, B, O),
                (G += O);
            while (0 < E.length);
            return b(r, y + B, v, w - B, z);
          }
        }
        function h(r, y, v, w, z) {
          r.C = [
            { x: y, y: v },
            { x: y + w, y: v },
            { x: y + w, y: v + z },
            { x: y, y: v + z },
          ];
        }
        var f = p.x,
          u = p.y,
          t = p.w;
        p = p.o;
        if (0 != d.length)
          if (1 == d.length)
            (d[0].x = f + t / 2),
              (d[0].y = u + p / 2),
              (d[0].nd = 0),
              m && h(d[0], f, u, t, p);
          else {
            d = d.slice(0);
            for (var n = 0, k = 0; k < d.length; k++) n += d[k].weight;
            n = (t * p) / n;
            for (k = 0; k < d.length; k++) d[k].lc = d[k].weight * n;
            c = g(d, t, p, [[d.shift()]], c);
            b(c, f, u, t, p);
          }
      };
    }
    function q(g, e, d, p) {
      function m(f) {
        return Math.max(Math.pow((h * f) / b, d), Math.pow(b / (h * f), p));
      }
      var c = l(g),
        b = c * c,
        h = e * e;
      e = m(g[0].lc);
      for (c = 1; c < g.length; c++) e = Math.max(e, m(g[c].lc));
      return e;
    }
    function l(g) {
      for (var e = 0, d = 0; d < g.length; d++) e += g[d].lc;
      return e;
    }
    this.u = a(
      function (g, e, d, p, m) {
        m = Math.pow(2, m);
        for (var c = 1 / m, b = e < d; 0 < g.length; ) {
          var h = p[p.length - 1],
            f = g.shift(),
            u = b ? e : d,
            t = b ? m : c,
            n = b ? c : m,
            k = q(h, u, t, n);
          h.push(f);
          u = q(h, u, t, n);
          k < u &&
            (h.pop(),
            p.push([f]),
            b ? (d -= l(h) / e) : (e -= l(h) / d),
            (b = e < d));
        }
        return p;
      },
      function (g, e) {
        return g < e;
      },
    );
    this.i = a(
      function (g, e, d, p, m) {
        function c(t) {
          if (1 < p.length) {
            for (
              var n = p[p.length - 1], k = p[p.length - 2].slice(0), r = 0;
              r < n.length;
              r++
            )
              k.push(n[r]);
            q(k, e, b, h) < t && p.splice(-2, 2, k);
          }
        }
        for (var b = Math.pow(2, m), h = 1 / b; 0 < g.length; ) {
          d = p[p.length - 1];
          m = q(d, e, b, h);
          if (0 == g.length) return;
          var f = g.shift();
          d.push(f);
          var u = q(d, e, b, h);
          m < u && (d.pop(), c(m), p.push([f]));
        }
        c(q(p[p.length - 1], e, b, h));
        return p;
      },
      function () {
        return !0;
      },
    );
  })();
  function Xa(a) {
    var q = {},
      l = a.Cd,
      g;
    a.j.subscribe("model:loaded", function (e) {
      g = e;
    });
    this.M = function () {
      a.j.D("api:initialized", this);
    };
    this.nc = function (e, d, p, m) {
      this.Xc(q, d);
      this.Yc(q, d);
      this.Wc(q, d, !1);
      m && m(q);
      e(l, q, p);
    };
    this.bd = function (e, d, p, m, c, b, h) {
      if (e) {
        for (e = d.length - 1; 0 <= e; e--) {
          var f = d[e],
            u = P.extend({ group: f.group }, c);
          u[p] = m(f);
          b(u);
        }
        0 < d.length &&
          h(
            P.extend(
              {
                groups: Ra.uc(g, m).map(function (t) {
                  return t.group;
                }),
              },
              c,
            ),
          );
      }
    };
    this.Yc = function (e, d) {
      e.selected = d.selected;
      e.hovered = d.ub;
      e.open = d.open;
      e.openness = d.Cb;
      e.exposed = d.U;
      e.exposure = d.ja;
      e.transitionProgress = d.ra;
      e.revealed = !d.aa.Ga();
      e.browseable = d.Ia ? d.R : void 0;
      e.visible = d.Y;
      e.labelDrawn = d.oa && d.oa.ka;
      return e;
    };
    this.Xc = function (e, d) {
      var p = d.parent;
      e.group = d.group;
      e.parent = p && p.group;
      e.weightNormalized = d.dg;
      e.level = d.level - 1;
      e.siblingCount = p && p.m.length;
      e.hasChildren = !d.empty();
      e.index = d.index;
      e.indexByWeight = d.nd;
      e.description = d.description;
      e.attribution = d.attribution;
      return e;
    };
    this.Wc = function (e, d, p) {
      e.polygonCenterX = d.O.x;
      e.polygonCenterY = d.O.y;
      e.polygonArea = d.O.ha;
      e.boxLeft = d.F.x;
      e.boxTop = d.F.y;
      e.boxWidth = d.F.w;
      e.boxHeight = d.F.o;
      if (d.oa && d.oa.ka) {
        var m = d.oa.box;
        e.labelBoxLeft = m.x;
        e.labelBoxTop = m.y;
        e.labelBoxWidth = m.w;
        e.labelBoxHeight = m.o;
        e.labelFontSize = d.oa.fontSize;
      }
      p &&
        d.$ &&
        ((e.polygon = d.$.map(function (c) {
          return { x: c.x, y: c.y };
        })),
        (e.neighbors =
          d.J &&
          d.J.map(function (c) {
            return c && c.group;
          })));
      return e;
    };
  }
  var Ca = new (function () {
    var a = window.console;
    this.i = function (q) {
      throw "FoamTree: " + q;
    };
    this.info = function (q) {
      a.info("FoamTree: " + q);
    };
    this.warn = function (q) {
      a.warn("FoamTree: " + q);
    };
  })();
  function Ya(a) {
    function q(k, r) {
      k.m = [];
      k.Ea = !0;
      var y = e(r),
        v = 0;
      if (
        ("flattened" === a.mb ||
          ("always" === a.Ag && k.group && k.group.description)) &&
        0 < r.length &&
        0 < k.level
      ) {
        var w = r.reduce(function (D, G) {
            return D + P.I(G.weight, 1);
          }, 0),
          z = l(k.group, !1);
        z.description = !0;
        z.weight = w * a.Sb;
        z.index = v++;
        z.parent = k;
        z.level = k.level + 1;
        z.id = z.id + "_d";
        k.m.push(z);
      }
      for (w = 0; w < r.length; w++) {
        var E = r[w];
        z = P.I(E.weight, 1);
        if (0 >= z)
          if (a.Zi) z = 0.9 * y;
          else continue;
        E = l(E, !0);
        E.weight = z;
        E.index = v;
        E.parent = k;
        E.level = k.level + 1;
        k.m.push(E);
        v++;
      }
    }
    function l(k, r) {
      var y = new Za();
      g(k);
      y.id = k.__id;
      y.group = k;
      r && (f[k.__id] = y);
      return y;
    }
    function g(k) {
      P.has(k, "__id") ||
        (Object.defineProperty(k, "__id", {
          enumerable: !1,
          configurable: !1,
          writable: !1,
          value: h,
        }),
        h++);
    }
    function e(k) {
      for (var r = Number.MAX_VALUE, y = 0; y < k.length; y++) {
        var v = k[y].weight;
        0 < v && r > v && (r = v);
      }
      r === Number.MAX_VALUE && (r = 1);
      return r;
    }
    function d(k) {
      if (!k.empty()) {
        k = k.m;
        var r = 0,
          y;
        for (y = k.length - 1; 0 <= y; y--) {
          var v = k[y].weight;
          r < v && (r = v);
        }
        for (y = k.length - 1; 0 <= y; y--) (v = k[y]), (v.dg = v.weight / r);
      }
    }
    function p(k) {
      if (!k.empty()) {
        k = k.m.slice(0).sort(function (y, v) {
          return y.weight < v.weight
            ? 1
            : y.weight > v.weight
              ? -1
              : y.index - v.index;
        });
        for (var r = 0; r < k.length; r++) k[r].nd = r;
      }
    }
    function m() {
      for (
        var k = b.m.reduce(function (v, w) {
            return v + w.weight;
          }, 0),
          r = 0;
        r < b.m.length;
        r++
      ) {
        var y = b.m[r];
        y.attribution && (y.weight = Math.max(0.025, a.tg) * k);
      }
    }
    var c = this,
      b = new Za(),
      h,
      f,
      u,
      t,
      n;
    this.M = function () {
      return b;
    };
    this.T = function (k) {
      var r = k.group.groups,
        y = a.Uh;
      return !k.m && !k.description && r && 0 < r.length && n + r.length <= y
        ? ((n += r.length), q(k, r), d(k), p(k), !0)
        : !1;
    };
    this.load = function (k) {
      function r(v) {
        var w = v.groups;
        if (w)
          for (var z = 0; z < w.length; z++) {
            var E = w[z];
            g(E);
            var D = E.__id;
            f[D] = null;
            t[D] = v;
            D = E.id;
            P.V(D) || (u[D] = E);
            r(E);
          }
      }
      function y(v, w) {
        if (!v) return w;
        w = Math.max(w, v.__id || 0);
        if ((v = v.groups) && 0 < v.length)
          for (var z = v.length - 1; 0 <= z; z--) w = y(v[z], w);
        return w;
      }
      b.group = k;
      b.xa = !1;
      b.R = !1;
      b.Ia = !1;
      b.open = !0;
      b.Cb = 1;
      h = y(k, 0) + 1;
      f = {};
      u = {};
      t = {};
      n = 0;
      k && (g(k), (f[k.__id] = b), P.V(k.id) || (u[k.id] = k), r(k));
      q(b, (k && k.groups) || []);
      (function (v) {
        if (!v.empty()) {
          var w = l({ attribution: !0 });
          w.index = v.m.length;
          w.parent = v;
          w.level = v.level + 1;
          w.attribution = !0;
          v.m.push(w);
        }
      })(b);
      d(b);
      m();
      p(b);
    };
    this.update = function (k) {
      k.forEach(function (r) {
        Ra.za(r, function (y) {
          if (!y.empty()) {
            y = y.m;
            for (
              var v = e(
                  y.map(function (E) {
                    return E.group;
                  }),
                ),
                w = 0;
              w < y.length;
              w++
            ) {
              var z = y[w];
              z.weight = 0 < z.group.weight ? z.group.weight : 0.9 * v;
            }
          }
        });
        d(r);
        r === b && m();
        p(r);
      });
    };
    this.u = function (k) {
      return (function () {
        if (P.V(k) || P.Se(k)) return [];
        if (Array.isArray(k)) return k.map(c.i, c);
        if (P.wb(k)) {
          if (P.has(k, "__id")) return [c.i(k)];
          if (P.has(k, "all")) {
            var r = [];
            Ra.L(b, function (y) {
              r.push(y);
            });
            return r;
          }
          if (P.has(k, "groups")) return c.u(k.groups);
        }
        return [c.i(k)];
      })().filter(function (r) {
        return void 0 !== r;
      });
    };
    this.i = function (k) {
      if (P.wb(k) && P.has(k, "__id")) {
        if (((k = k.__id), P.has(f, k))) {
          if (null === f[k]) {
            for (var r = t[k], y = []; r; ) {
              r = r.__id;
              y.push(r);
              if (f[r]) break;
              r = t[r];
            }
            for (r = y.length - 1; 0 <= r; r--) this.T(f[y[r]]);
          }
          return f[k];
        }
      } else if (P.has(u, k)) return this.i(u[k]);
    };
    this.H = function (k, r, y) {
      return {
        m: c.u(k),
        Ca: P.I(k && k[r], !0),
        Ba: P.I(k && k.keepPrevious, y),
      };
    };
  }
  function $a(a, q, l) {
    var g = {};
    q.Ba &&
      Ra.L(a, function (m) {
        l(m) && (g[m.id] = m);
      });
    a = q.m;
    q = q.Ca;
    for (var e = a.length - 1; 0 <= e; e--) {
      var d = a[e];
      g[d.id] = q ? d : void 0;
    }
    var p = [];
    P.Aa(g, function (m) {
      void 0 !== m && p.push(m);
    });
    return p;
  }
  function ab(a) {
    function q(B, M) {
      B = B.ja;
      M.opacity = 1;
      M.Da = 1;
      M.va = 0 > B ? 1 - (t.Eh / 100) * B : 1;
      M.saturation = 0 > B ? 1 - (t.Fh / 100) * B : 1;
      M.ca = 0 > B ? 1 + 0.5 * B : 1;
    }
    function l(B) {
      B = B.ja;
      return Math.max(0.001, 0 === B ? 1 : 1 + B * (t.Pa - 1));
    }
    function g(B, M) {
      for (
        var Q = B.reduce(function (C, U) {
            C[U.id] = U;
            return C;
          }, {}),
          X = B.length - 1;
        0 <= X;
        X--
      )
        Ra.L(B[X], function (C) {
          Q[C.id] = void 0;
        });
      var Y = [];
      P.Aa(Q, function (C) {
        C &&
          Ra.ne(C, function (U) {
            U.open || Y.push(U);
          });
      });
      var aa = [];
      P.Aa(Q, function (C) {
        C && C.open && aa.push(C);
      });
      B = [];
      0 !== Y.length && B.push(w.Bb({ m: Y, Ca: !0, Ba: !0 }, M, !0));
      return Ga(B);
    }
    function e(B, M, Q, X) {
      var Y = m();
      if (0 === B.length && !Y) return new Fa().resolve().promise();
      var aa = B.reduce(function (ba, ja) {
          ba[ja.id] = !0;
          return ba;
        }, {}),
        C = [];
      B = [];
      if (
        z.reduce(function (ba, ja) {
          return (
            ba ||
            (aa[ja.id] && (!ja.U || 1 !== ja.ja)) ||
            (!aa[ja.id] && !ja.parent.U && (ja.U || -1 !== ja.ja))
          );
        }, !1)
      ) {
        var U = [],
          ha = {};
        z.forEach(function (ba) {
          aa[ba.id] &&
            (ba.U || C.push(ba),
            (ba.U = !0),
            Ra.za(ba, function (ja) {
              U.push(b(ja, 1));
              ha[ja.id] = !0;
            }));
        });
        0 < U.length
          ? (Ra.L(n, function (ba) {
              aa[ba.id] || (ba.U && C.push(ba), (ba.U = !1));
              ha[ba.id] || U.push(b(ba, -1));
            }),
            B.push(v.K.A({}).Qa(U).call(h).Ta()),
            d(aa),
            B.push(p(Y)),
            Q && (y.ic(E, t.Yb, t.Oa, La.ia(t.Wb)), y.Fb()))
          : (B.push(c(Q)),
            M &&
              Ra.L(n, function (ba) {
                ba.U && C.push(ba);
              }));
      }
      return Ga(B).then(function () {
        r.bd(
          M,
          C,
          "exposed",
          function (ba) {
            return ba.U;
          },
          { indirect: X },
          a.options.jf,
          a.options.hf,
        );
      });
    }
    function d(B) {
      z.reduce(
        f(!0, void 0, function (M) {
          return M.U || B[M.id];
        }),
        u(E),
      );
      E.x -= (E.w * (t.Pa - 1)) / 2;
      E.y -= (E.o * (t.Pa - 1)) / 2;
      E.w *= t.Pa;
      E.o *= t.Pa;
    }
    function p(B) {
      if (B || !y.zd())
        return v.K.A(k)
          .fa({
            duration: 0.7 * t.Oa,
            P: {
              x: { end: E.x + E.w / 2, easing: La.ia(t.Wb) },
              y: { end: E.y + E.o / 2, easing: La.ia(t.Wb) },
            },
            ba: function () {
              a.j.D("foamtree:dirty", !0);
            },
          })
          .Ta();
      k.x = E.x + E.w / 2;
      k.y = E.y + E.o / 2;
      return new Fa().resolve().promise();
    }
    function m() {
      return (
        !!z &&
        z.reduce(function (B, M) {
          return B || 0 !== M.ja;
        }, !1)
      );
    }
    function c(B) {
      var M = [],
        Q = [];
      Ra.L(n, function (X) {
        0 !== X.ja &&
          Q.push(
            b(X, 0, function () {
              this.U = !1;
            }),
          );
      });
      M.push(v.K.A({}).Qa(Q).Ta());
      y.content(0, 0, D, G);
      B && (M.push(y.reset(t.Oa, La.ia(t.Wb))), y.Fb());
      return Ga(M);
    }
    function b(B, M, Q) {
      var X = v.K.A(B);
      0 === B.ja &&
        0 !== M &&
        X.call(function () {
          this.mc(O);
          this.qb(q);
        });
      X.fa({
        duration: t.Oa,
        P: { ja: { end: M, easing: La.ia(t.Wb) } },
        ba: function () {
          n.N = !0;
          n.Fa = !0;
          a.j.D("foamtree:dirty", !0);
        },
      });
      0 === M &&
        X.call(function () {
          this.vd();
          this.cc();
          this.Nc(O);
          this.Mc(q);
        });
      return X.call(Q).done();
    }
    function h() {
      var B = n.m.reduce(f(!1, O.transformPoint, void 0), u({})).box,
        M = t.Yb,
        Q = Math.min(B.x, E.x - E.w * M),
        X = Math.min(B.y, E.y - E.o * M);
      y.content(
        Q,
        X,
        Math.max(B.x + B.w, E.x + E.w * (1 + M)) - Q,
        Math.max(B.y + B.o, E.y + E.o * (1 + M)) - X,
      );
    }
    function f(B, M, Q) {
      var X = {};
      return function (Y, aa) {
        if (!Q || Q(aa)) {
          for (
            var C = B ? aa.$ || aa.C : aa.C, U, ha = C.length - 1;
            0 <= ha;
            ha--
          )
            (U = void 0 !== M ? M(aa, C[ha], X) : C[ha]),
              (Y.Hc = Math.min(Y.Hc, U.x)),
              (Y.wd = Math.max(Y.wd, U.x)),
              (Y.Ic = Math.min(Y.Ic, U.y)),
              (Y.xd = Math.max(Y.xd, U.y));
          Y.box.x = Y.Hc;
          Y.box.y = Y.Ic;
          Y.box.w = Y.wd - Y.Hc;
          Y.box.o = Y.xd - Y.Ic;
        }
        return Y;
      };
    }
    function u(B) {
      return {
        Hc: Number.MAX_VALUE,
        wd: Number.MIN_VALUE,
        Ic: Number.MAX_VALUE,
        xd: Number.MIN_VALUE,
        box: B,
      };
    }
    var t = a.options,
      n,
      k,
      r,
      y,
      v,
      w,
      z,
      E,
      D,
      G,
      O = {
        We: function (B, M) {
          M.scale = l(B);
          return !1;
        },
        Ib: function (B, M) {
          B = l(B);
          var Q = k.x,
            X = k.y;
          M.translate(Q, X);
          M.scale(B, B);
          M.translate(-Q, -X);
        },
        Jb: function (B, M, Q) {
          B = l(B);
          var X = k.x,
            Y = k.y;
          Q.x = (M.x - X) / B + X;
          Q.y = (M.y - Y) / B + Y;
        },
        transformPoint: function (B, M, Q) {
          B = l(B);
          var X = k.x,
            Y = k.y;
          Q.x = (M.x - X) * B + X;
          Q.y = (M.y - Y) * B + Y;
          return Q;
        },
      };
    a.j.subscribe("stage:initialized", function (B, M, Q, X) {
      k = { x: Q / 2, y: X / 2 };
      D = Q;
      G = X;
      E = { x: 0, y: 0, w: D, o: G };
    });
    a.j.subscribe("stage:resized", function (B, M, Q, X) {
      k.x *= Q / B;
      k.y *= X / M;
      D = Q;
      G = X;
    });
    a.j.subscribe("api:initialized", function (B) {
      r = B;
    });
    a.j.subscribe("zoom:initialized", function (B) {
      y = B;
    });
    a.j.subscribe("model:loaded", function (B, M) {
      n = B;
      z = M;
    });
    a.j.subscribe("model:childrenAttached", function (B) {
      z = B;
    });
    a.j.subscribe("timeline:initialized", function (B) {
      v = B;
    });
    a.j.subscribe("openclose:initialized", function (B) {
      w = B;
    });
    var H = [
      "groupExposureScale",
      "groupUnexposureScale",
      "groupExposureZoomMargin",
    ];
    a.j.subscribe("options:changed", function (B) {
      P.bb(B, H) && m() && (d({}), y.fj(E, t.Yb), y.Fb());
    });
    this.M = function () {
      a.j.D("expose:initialized", this);
    };
    this.Vb = function (B, M, Q, X) {
      var Y = B.m.reduce(function (U, ha) {
          for (; (ha = ha.parent); ) U[ha.id] = !0;
          return U;
        }, {}),
        aa = $a(n, B, function (U) {
          return U.U && !U.open && !Y[U.id];
        }),
        C = new Fa();
      g(aa, M).then(function () {
        e(
          aa.filter(function (U) {
            return U.C && U.$;
          }),
          M,
          Q,
          X,
        ).then(C.resolve);
      });
      return C.promise();
    };
  }
  function bb(a) {
    function q(c) {
      function b(D, G) {
        var O = Math.min(1, Math.max(0, D.ra));
        G.opacity = O;
        G.va = 1;
        G.saturation = O;
        G.Da = O;
        G.ca = D.yb;
      }
      var h = a.options,
        f = h.Ui,
        u = h.Vi,
        t = h.Ri,
        n = h.Si,
        k = h.Ti,
        r = h.Od,
        y = f + u + t + n + k,
        v = 0 < y ? r / y : 0,
        w = [];
      m.i(h.Nf, h.Mf, h.Of, h.Pf, h.Lf);
      if (0 === v && c.m && c.R) {
        r = c.m;
        for (y = 0; y < r.length; y++) {
          var z = r[y];
          z.ra = 1;
          z.yb = 1;
          z.qb(b);
          z.cc();
          z.Mc(b);
        }
        c.N = !0;
        a.j.D("foamtree:dirty", 0 < v);
        return new Fa().resolve().promise();
      }
      if (c.m && c.R) {
        Va.u(c, Va.i(c, a.options.Qd), function (D, G, O) {
          D.mc(m);
          D.qb(b);
          O = "groups" === a.options.Pd ? O : G;
          G = g.K.A(D)
            .wait(O * v * f)
            .fa({
              duration: v * u,
              P: { ra: { end: 1, easing: La.ia(h.Qi) } },
              ba: function () {
                this.N = !0;
                a.j.D("foamtree:dirty", 0 < v);
              },
            })
            .done();
          O = g.K.A(D)
            .wait(p ? v * (t + O * n) : 0)
            .fa({
              duration: p ? v * k : 0,
              P: { yb: { end: 1, easing: La.Ab } },
              ba: function () {
                this.N = !0;
                a.j.D("foamtree:dirty", 0 < v);
              },
            })
            .done();
          D = g.K.A(D)
            .Qa([G, O])
            .Xd()
            .Xa(function () {
              this.vd();
              this.cc();
              this.Nc(m);
              this.Mc(b);
            })
            .done();
          w.push(D);
        });
        d.i();
        var E = new Fa();
        g.K.A({})
          .Qa(w)
          .call(function () {
            d.u();
            E.resolve();
          })
          .start();
        return E.promise();
      }
      return new Fa().resolve().promise();
    }
    var l,
      g,
      e = [],
      d = new Ha(P.qa);
    a.j.subscribe("stage:initialized", function () {});
    a.j.subscribe("stage:resized", function () {});
    a.j.subscribe("stage:newLayer", function (c, b) {
      e.push(b);
    });
    a.j.subscribe("model:loaded", function (c) {
      l = c;
      d.clear();
    });
    a.j.subscribe("zoom:initialized", function () {});
    a.j.subscribe("timeline:initialized", function (c) {
      g = c;
    });
    var p = !1;
    a.j.subscribe("render:renderers:resolved", function (c) {
      p = c.labelPlainFill || !1;
    });
    var m = new (function () {
      var c = 0,
        b = 0,
        h = 0,
        f = 0,
        u = 0,
        t = 0;
      this.i = function (n, k, r, y, v) {
        c = 1 + k;
        b = 1 - c;
        h = r;
        f = y;
        u = v;
        t = n;
      };
      this.We = function (n, k) {
        k.scale = c + b * n.ra;
        return 0 !== u || 0 !== h || 0 !== f;
      };
      this.Ib = function (n, k) {
        var r = c + b * n.ra,
          y = n.parent,
          v = t * n.x + (1 - t) * y.x,
          w = t * n.y + (1 - t) * y.y;
        k.translate(v, w);
        k.scale(r, r);
        n = 1 - n.ra;
        k.rotate(u * Math.PI * n);
        k.translate(-v, -w);
        k.translate(y.F.w * h * n, y.F.o * f * n);
      };
      this.Jb = function (n, k, r) {
        var y = c + b * n.ra,
          v = t * n.x + (1 - t) * n.parent.x,
          w = t * n.y + (1 - t) * n.parent.y,
          z = 1 - n.ra;
        n = n.parent;
        r.x = (k.x - v) / y + v - n.F.w * h * z;
        r.y = (k.y - w) / y + w - n.F.o * f * z;
      };
      this.transformPoint = function (n, k, r) {
        var y = c + b * n.ra,
          v = t * n.x + (1 - t) * n.parent.x,
          w = t * n.y + (1 - t) * n.parent.y,
          z = 1 - n.ra;
        n = n.parent;
        r.x = (k.x - v) * y + v - n.F.w * h * z;
        r.y = (k.y - w) * y + w - n.F.o * f * z;
      };
    })();
    this.M = function () {};
    this.u = function () {
      function c(O, H) {
        var B = Math.min(1, Math.max(0, O.ra));
        H.opacity = B;
        H.va = 1;
        H.saturation = B;
        H.Da = B;
        H.ca = O.yb;
      }
      function b(O, H) {
        var B = Math.min(1, Math.max(0, O.Hd));
        H.opacity = B;
        H.Da = B;
        H.va = 1;
        H.saturation = 1;
        H.ca = O.yb;
      }
      var h = a.options,
        f = h.Gd,
        u = h.li,
        t = h.mi,
        n = h.ni,
        k = h.hi,
        r = h.ii,
        y = h.ji,
        v = h.di,
        w = h.ei,
        z = h.fi,
        E = k + r + y + v + w + z + u + t + n,
        D = 0 < E ? f / E : 0,
        G = [];
      d.initial()
        ? m.i(h.si, h.pi, h.ti, h.ui, h.oi)
        : m.i(h.Nf, h.Mf, h.Of, h.Pf, h.Lf);
      Va.u(l, Va.i(l, a.options.ri), function (O, H, B) {
        var M = "groups" === a.options.ki ? B : H;
        G.push(
          g.K.A(O)
            .call(function () {
              this.qb(c);
            })
            .wait(p ? D * (k + M * r) : 0)
            .fa({
              duration: p ? D * y : 0,
              P: { yb: { end: 0, easing: La.Ab } },
              ba: function () {
                this.N = !0;
                a.j.D("foamtree:dirty", !0);
              },
            })
            .done(),
        );
        Ra.L(O, function (Q) {
          G.push(
            g.K.A(Q)
              .call(function () {
                this.mc(m);
                this.qb(b);
              })
              .wait(D * (v + w * M))
              .fa({
                duration: D * z,
                P: { Hd: { end: 0, easing: La.Ab } },
                ba: function () {
                  this.N = !0;
                  a.j.D("foamtree:dirty", !0);
                },
              })
              .Xa(function () {
                this.selected = !1;
                this.Nc(m);
              })
              .done(),
          );
        });
        G.push(
          g.K.A(O)
            .call(function () {
              this.mc(m);
            })
            .wait(D * (u + t * M))
            .fa({
              duration: D * n,
              P: { ra: { end: 0, easing: La.ia(h.gi) } },
              ba: function () {
                this.N = !0;
                a.j.D("foamtree:dirty", !0);
              },
            })
            .Xa(function () {
              this.selected = !1;
              this.Nc(m);
            })
            .done(),
        );
      });
      return g.K.A({}).Qa(G).Ta();
    };
    this.i = function (c) {
      return q(c);
    };
  }
  function cb(a) {
    function q(c, b) {
      var h = [];
      Ra.L(p, function (u) {
        if (u.m) {
          var t = P.has(c, u.id);
          u.open !== t &&
            (t ||
              u.U ||
              Ra.L(u, function (n) {
                if (n.U) return h.push(u), !1;
              }));
        }
      });
      if (0 === h.length) return new Fa().resolve().promise();
      var f;
      for (f = h.length - 1; 0 <= f; f--) h[f].open = !1;
      b = d.Vb({ m: h, Ca: !0, Ba: !0 }, b, !0, !0);
      for (f = h.length - 1; 0 <= f; f--) h[f].open = !0;
      return b;
    }
    function l(c, b, h) {
      function f(k, r) {
        k.qb(u);
        var y = e.K.A(k)
          .fa({
            duration: a.options.Kc,
            P: { Cb: { end: r ? 1 : 0, easing: La.fe } },
            ba: function () {
              this.N = !0;
              a.j.D("foamtree:dirty", !0);
            },
          })
          .call(function () {
            this.open = r;
            k.Va = !1;
          })
          .Xa(function () {
            this.cc();
            this.Mc(u);
            delete g[this.id];
          })
          .done();
        return (g[k.id] = y);
      }
      function u(k, r) {
        r.opacity = 1 - k.Cb;
        r.va = 1;
        r.saturation = 1;
        r.ca = 1;
        r.Da = 1;
      }
      var t = [],
        n = [];
      Ra.L(p, function (k) {
        if (k.R && k.X) {
          var r = P.has(c, k.id),
            y = g[k.id];
          if (y && y.xb()) y.stop();
          else if (k.open === r) return;
          k.Va = r;
          r || ((k.open = r), (k.Bd = !1));
          n.push(k);
          t.push(f(k, r));
        }
      });
      return 0 < t.length
        ? (a.j.D("openclose:changing"),
          e.K.A({})
            .Qa(t)
            .Ta()
            .then(function () {
              m.bd(
                b,
                n,
                "open",
                function (k) {
                  return k.open;
                },
                { indirect: h },
                a.options.sf,
                a.options.rf,
              );
            }))
        : new Fa().resolve().promise();
    }
    var g, e, d, p, m;
    a.j.subscribe("api:initialized", function (c) {
      m = c;
    });
    a.j.subscribe("model:loaded", function (c) {
      p = c;
      g = {};
    });
    a.j.subscribe("timeline:initialized", function (c) {
      e = c;
    });
    a.j.subscribe("expose:initialized", function (c) {
      d = c;
    });
    this.M = function () {
      a.j.D("openclose:initialized", this);
    };
    this.Bb = function (c, b, h) {
      if ("flattened" == a.options.mb) return new Fa().resolve().promise();
      c = $a(p, c, function (n) {
        return n.open || n.Va;
      });
      for (var f = new Fa(), u = 0; u < c.length; u++) c[u].Va = !0;
      0 < c.length && a.j.D("foamtree:attachChildren", c);
      var t = c.reduce(function (n, k) {
        n[k.id] = !0;
        return n;
      }, {});
      q(t, b).then(function () {
        l(t, b, h).then(f.resolve);
      });
      return f.promise();
    };
  }
  function db(a) {
    function q(e, d) {
      e = $a(l, e, function (b) {
        return b.selected;
      });
      Ra.L(l, function (b) {
        !0 === b.selected &&
          ((b.selected = !b.selected), (b.N = !b.N), (b.Sa = !b.Sa));
      });
      var p;
      for (p = e.length - 1; 0 <= p; p--) {
        var m = e[p];
        m.selected = !m.selected;
        m.N = !m.N;
        m.Sa = !m.Sa;
      }
      var c = [];
      Ra.L(l, function (b) {
        b.N && c.push(b);
      });
      0 < c.length && a.j.D("foamtree:dirty", !1);
      g.bd(
        d,
        c,
        "selected",
        function (b) {
          return b.selected;
        },
        {},
        a.options.uf,
        a.options.tf,
      );
    }
    var l, g;
    a.j.subscribe("api:initialized", function (e) {
      g = e;
    });
    a.j.subscribe("model:loaded", function (e) {
      l = e;
    });
    this.M = function () {
      a.j.D("select:initialized", this);
    };
    this.select = function (e, d) {
      return q(e, d);
    };
  }
  function eb(a) {
    function q(N) {
      return function (S) {
        N.call(this, {
          x: S.x,
          y: S.y,
          scale: S.scale,
          ed: S.delta,
          ctrlKey: S.ctrlKey,
          metaKey: S.metaKey,
          altKey: S.altKey,
          shiftKey: S.shiftKey,
          lb: S.secondary,
          touches: S.touches,
        });
      };
    }
    function l() {
      function N(S) {
        return function (ca) {
          ca.x *= Y / u.clientWidth;
          ca.y *= aa / u.clientHeight;
          return S(ca);
        };
      }
      "external" !== f.Ne &&
        ("hammerjs" === f.Ne &&
          P.has(window, "Hammer") &&
          (ba.M(u),
          ba.A("tap", N(h.i), !0),
          ba.A("doubletap", N(h.u), !0),
          ba.A("hold", N(h.sa), !0),
          ba.A("touch", N(h.ua), !0),
          ba.A("release", N(h.wa), !1),
          ba.A("dragstart", N(h.ga), !0),
          ba.A("drag", N(h.H), !0),
          ba.A("dragend", N(h.T), !0),
          ba.A("transformstart", N(h.pb), !0),
          ba.A("transform", N(h.transform), !0),
          ba.A("transformend", N(h.Ka), !0)),
        (Q = new Ka(u)),
        (X = new Ja()),
        Q.i(N(h.i)),
        Q.u(N(h.u)),
        Q.sa(N(h.sa)),
        Q.wa(N(h.ua)),
        Q.Ka(N(h.wa)),
        Q.ga(N(h.ga)),
        Q.H(N(h.H)),
        Q.T(N(h.T)),
        Q.ta(N(h.ta)),
        Q.Ja(N(h.ta)),
        Q.ua(N(h.Ja)),
        X.addEventListener("keyup", function (S) {
          var ca = !1,
            I = void 0,
            T = f.yf({
              keyCode: S.keyCode,
              preventDefault: function () {
                ca = !0;
              },
              preventOriginalEventDefault: function () {
                I = "prevent";
              },
              allowOriginalEventDefault: function () {
                I = "allow";
              },
            });
          "prevent" === I && S.preventDefault();
          (ca = ca || 0 <= T.indexOf(!1)) ||
            (27 === S.keyCode && a.j.D("interaction:reset"));
        }));
    }
    function g() {
      t.pc(2) ? a.j.D("interaction:reset") : t.normalize(f.ob, La.ia(f.Kb));
    }
    function e(N) {
      return function () {
        w.empty() || N.apply(this, arguments);
      };
    }
    function d(N, S, ca) {
      var I = {},
        T = {};
      return function (R) {
        switch (N) {
          case "click":
            var V = f.cf;
            break;
          case "doubleclick":
            V = f.df;
            break;
          case "hold":
            V = f.kf;
            break;
          case "hover":
            V = f.lf;
            break;
          case "mousemove":
            V = f.nf;
            break;
          case "mousewheel":
            V = f.qf;
            break;
          case "mousedown":
            V = f.mf;
            break;
          case "mouseup":
            V = f.pf;
            break;
          case "dragstart":
            V = f.gf;
            break;
          case "drag":
            V = f.ef;
            break;
          case "dragend":
            V = f.ff;
            break;
          case "transformstart":
            V = f.xf;
            break;
          case "transform":
            V = f.vf;
            break;
          case "transformend":
            V = f.wf;
        }
        var fa = !1,
          x = !V.empty(),
          A = t.absolute(R, I),
          F = (S || x) && m(A),
          L = (S || x) && c(A);
        x &&
          ((x = F ? F.group : null),
          (A = F ? F.Jb(A, T) : A),
          (R.Db = void 0),
          (V = V({
            type: N,
            group: x,
            topmostClosedGroup: x,
            bottommostOpenGroup: L ? L.group : null,
            x: R.x,
            y: R.y,
            xAbsolute: A.x,
            yAbsolute: A.y,
            scale: P.I(R.scale, 1),
            secondary: R.lb,
            touches: P.I(R.touches, 1),
            delta: P.I(R.ed, 0),
            ctrlKey: R.ctrlKey,
            metaKey: R.metaKey,
            altKey: R.altKey,
            shiftKey: R.shiftKey,
            preventDefault: function () {
              fa = !0;
            },
            preventOriginalEventDefault: function () {
              R.Db = "prevent";
            },
            allowOriginalEventDefault: function () {
              R.Db = "allow";
            },
          })),
          (fa = fa || 0 <= V.indexOf(!1)),
          F && F.attribution && "click" === N && (fa = !1));
        fa || (ca && ca({ dd: F, vg: L }, R));
      };
    }
    function p(N) {
      function S(fa, x) {
        var A = x.m;
        if (A) {
          for (var F = -Number.MAX_VALUE, L, K = 0; K < A.length; K++) {
            var J = A[K];
            !J.description &&
              J.Y &&
              ja(J, fa) &&
              J.scale > F &&
              ((L = J), (F = J.scale));
          }
          var W;
          L && (W = S(fa, L));
          return W || L || x;
        }
        return x;
      }
      for (
        var ca = C.length, I = C[0].scale, T = C[0].scale, R = 0;
        R < ca;
        R++
      ) {
        var V = C[R];
        V = V.scale;
        V < I && (I = V);
        V > T && (T = V);
      }
      if (I !== T)
        for (R = 0; R < ca; R++)
          if (((V = C[R]), V.scale === T && V.Y && ja(V, N))) return S(N, V);
      return S(N, w);
    }
    function m(N, S) {
      if ("flattened" === f.mb) N = p(N);
      else {
        S = S || 0;
        for (var ca = C.length, I = void 0, T = 0; T < ca; T++) {
          var R = C[T];
          R.scale > S &&
            !1 === R.open &&
            R.Y &&
            ja(R, N) &&
            ((I = R), (S = R.scale));
        }
        N = I;
      }
      N && N.description && (N = N.parent);
      return N;
    }
    function c(N) {
      var S = void 0,
        ca = 0;
      Ra.sc(w, function (I) {
        !0 === I.open &&
          I.Y &&
          I.scale > ca &&
          ja(I, N) &&
          ((S = I), (ca = I.scale));
      });
      return S;
    }
    var b = ea.Nh(),
      h = this,
      f = a.options,
      u,
      t,
      n,
      k,
      r,
      y,
      v,
      w,
      z = !1,
      E,
      D,
      G,
      O,
      H,
      B,
      M,
      Q,
      X,
      Y,
      aa;
    a.j.subscribe("stage:initialized", function (N, S, ca, I) {
      u = S;
      Y = ca;
      aa = I;
      l();
    });
    a.j.subscribe("stage:resized", function (N, S, ca, I) {
      Y = ca;
      aa = I;
    });
    a.j.subscribe("stage:disposed", function () {
      Q.Za();
      ba.Za();
      X.i();
    });
    a.j.subscribe("expose:initialized", function (N) {
      k = N;
    });
    a.j.subscribe("zoom:initialized", function (N) {
      t = N;
    });
    a.j.subscribe("openclose:initialized", function (N) {
      r = N;
    });
    a.j.subscribe("select:initialized", function (N) {
      y = N;
    });
    a.j.subscribe("titlebar:initialized", function (N) {
      v = N;
    });
    a.j.subscribe("timeline:initialized", function (N) {
      n = N;
    });
    var C;
    a.j.subscribe("model:loaded", function (N, S) {
      w = N;
      C = S;
    });
    a.j.subscribe("model:childrenAttached", function (N) {
      C = N;
    });
    this.M = function () {};
    this.ua = e(
      d("mousedown", !1, function () {
        t.Zh();
      }),
    );
    this.wa = e(d("mouseup", !1, void 0));
    this.i = e(
      d("click", !0, function (N, S) {
        S.lb ||
          S.shiftKey ||
          !(N = N.dd) ||
          (N.attribution
            ? S.ctrlKey
              ? (document.location.href = Pa.Qf(
                  "iuuqr;..b`ssnurd`sbi/bnl.gn`lusdd",
                ))
              : ((S = La.ia(f.Kb)),
                N.be
                  ? (t.reset(f.ob, S), (N.be = !1))
                  : (t.cg(N, f.Yb, f.ob, S), (N.be = !0)))
            : y.select(
                { m: [N], Ca: !N.selected, Ba: S.metaKey || S.ctrlKey },
                !0,
              ));
      }),
    );
    this.u = e(
      d("doubleclick", !0, function (N, S) {
        var ca = N.dd;
        (ca && ca.attribution) ||
          (S.lb || S.shiftKey
            ? ca &&
              (ca.parent.U && (ca = ca.parent),
              (N = { m: ca.parent !== w ? [ca.parent] : [], Ca: !0, Ba: !1 }),
              y.select(N, !0),
              k.Vb(N, !0, !0, !1))
            : ca &&
              ((N = { m: [ca], Ca: !0, Ba: !1 }),
              (ca.Va = !0),
              a.j.D("foamtree:attachChildren", [ca]),
              k.Vb(N, !0, !0, !1)),
          ca &&
            n.K.A({})
              .wait(f.Oa / 2)
              .call(function () {
                r.Bb(
                  {
                    m: Ra.uc(w, function (I) {
                      return I.Bd && !Ra.Lh(ca, I);
                    }),
                    Ca: !1,
                    Ba: !0,
                  },
                  !0,
                  !0,
                );
                ca.Bd = !0;
                r.Bb({ m: [ca], Ca: !(S.lb || S.shiftKey), Ba: !0 }, !0, !0);
              })
              .start());
      }),
    );
    this.sa = e(
      d("hold", !0, function (N, S) {
        (N = (S = !(S.metaKey || S.ctrlKey || S.shiftKey) && !S.lb)
          ? N.dd
          : N.vg) &&
          N !== w &&
          r.Bb({ m: [N], Ca: S, Ba: !0 }, !0, !1);
      }),
    );
    this.ga = e(
      d("dragstart", !1, function (N, S) {
        E = S.x;
        D = S.y;
        G = Date.now();
        z = !0;
      }),
    );
    this.H = e(
      d("drag", !1, function (N, S) {
        if (z) {
          N = Date.now();
          B = Math.min(1, N - G);
          G = N;
          N = S.x - E;
          var ca = S.y - D;
          t.Xh(N, ca);
          O = N;
          H = ca;
          E = S.x;
          D = S.y;
        }
      }),
    );
    this.T = e(
      d("dragend", !1, function () {
        if (z) {
          z = !1;
          var N = Math.sqrt(O * O + H * H) / B;
          4 <= N ? t.Yh(N, O, H) : t.af();
        }
      }),
    );
    this.pb = e(
      d("transformstart", !1, function (N, S) {
        M = 1;
        E = S.x;
        D = S.y;
      }),
    );
    var U = 1,
      ha = !1;
    this.transform = e(
      d("transform", !1, function (N, S) {
        N = S.scale - 0.01;
        t.qg(S, N / M, S.x - E, S.y - D);
        M = N;
        E = S.x;
        D = S.y;
        U = M;
        ha = ha || 2 < S.touches;
      }),
    );
    this.Ka = e(
      d("transformend", !1, function () {
        ha && 0.8 > U ? a.j.D("interaction:reset") : g();
        ha = !1;
      }),
    );
    this.Ja = e(
      d(
        "mousewheel",
        !1,
        (function () {
          var N = P.zg(function () {
            g();
          }, 300);
          return function (S, ca) {
            S = f.lj;
            1 !== S &&
              ((S = Math.pow(S, ca.ed)),
              b ? (t.rg(ca, S), N()) : t.Nb(ca, S, f.ob, La.ia(f.Kb)).then(g));
          };
        })(),
      ),
    );
    this.ta = e(
      (function () {
        var N = void 0,
          S = {},
          ca = !1,
          I,
          T = d("hover", !1, function () {
            N && ((N.ub = !1), 0 < N.level && (N.N = !0));
            I && ((I.ub = !0), 0 < I.level && (I.N = !0));
            v.update(I);
            a.j.D("foamtree:dirty", !1);
          }),
          R = d("mousemove", !1, void 0);
        return function (V) {
          if ("out" === V.type) (I = void 0), (ca = I !== N);
          else if ((t.absolute(V, S), N && !N.open && ja(N, S))) {
            var fa = m(S, N.scale);
            fa && fa !== N ? ((ca = !0), (I = fa)) : (ca = !1);
          } else (I = m(S)), (ca = I !== N);
          ca && (T(V), (N = I), (ca = !1));
          N && R(V);
        };
      })(),
    );
    this.Lb = {
      click: q(this.i),
      doubleclick: q(this.u),
      hold: q(this.sa),
      mouseup: q(this.wa),
      mousedown: q(this.ua),
      dragstart: q(this.ga),
      drag: q(this.H),
      dragend: q(this.T),
      transformstart: q(this.pb),
      transform: q(this.transform),
      transformend: q(this.Ka),
      hover: q(this.ta),
      mousewheel: q(this.Ja),
    };
    var ba = (function () {
        function N(I, T) {
          return function (R) {
            R = R.gesture;
            var V = R.center;
            V = Ia.pe(u, V.pageX, V.pageY, {});
            V.scale = R.scale;
            V.lb = 1 < R.touches.length;
            V.touches = R.touches.length;
            I.call(u, V);
            ((void 0 === V.Db && T) || "prevent" === V.Db) &&
              R.preventDefault();
          };
        }
        var S,
          ca = {};
        return {
          M: function (I) {
            S = window.Hammer(I, {
              doubletap_interval: 350,
              hold_timeout: 400,
              doubletap_distance: 10,
            });
          },
          A: function (I, T, R) {
            ca[I] = T;
            S.on(I, N(T, R));
          },
          Za: function () {
            S &&
              P.Aa(ca, function (I, T) {
                S.off(T, I);
              });
          },
        };
      })(),
      ja = (function () {
        var N = {};
        return function (S, ca) {
          S.Jb(ca, N);
          return S.$ && wa.sa(S.$, N);
        };
      })();
  }
  function fb(a) {
    function q(e, d, p, m) {
      var c,
        b = 0,
        h = [];
      for (c = 0; c < d.length; c++) {
        var f = Math.sqrt(wa.i(d[c], d[(c + 1) % d.length]));
        h.push(f);
        b += f;
      }
      for (c = 0; c < h.length; c++) h[c] /= b;
      e[0].x = p.x;
      e[0].y = p.y;
      var u = (f = b = 0);
      for (c = 1; c < e.length; c++) {
        var t = e[c],
          n = 0.95 * Math.pow(c / e.length, m);
        for (b += 0.3819; f < b; ) (f += h[u]), (u = (u + 1) % h.length);
        var k = (u - 1 + h.length) % h.length,
          r = 1 - (f - b) / h[k],
          y = d[k].x;
        k = d[k].y;
        var v = d[u].x,
          w = d[u].y;
        y = (y - p.x) * n + p.x;
        k = (k - p.y) * n + p.y;
        v = (v - p.x) * n + p.x;
        w = (w - p.y) * n + p.y;
        t.x = y * (1 - r) + v * r;
        t.y = k * (1 - r) + w * r;
      }
    }
    var l = {
      random: {
        vb: function (e, d) {
          for (var p = 0; p < e.length; p++) {
            var m = e[p];
            m.x = d.x + Math.random() * d.w;
            m.y = d.y + Math.random() * d.o;
          }
        },
        Ob: "box",
      },
      ordered: {
        vb: function (e, d) {
          e = e.slice(0);
          g.ac && e.sort(gb);
          Wa.i(e, d, !1, g.Ld);
        },
        Ob: "box",
      },
      squarified: {
        vb: function (e, d) {
          e = e.slice(0);
          g.ac && e.sort(gb);
          Wa.u(e, d, !1, g.Ld);
        },
        Ob: "box",
      },
      fisheye: {
        vb: function (e, d, p) {
          e = e.slice(0);
          g.ac && e.sort(gb);
          q(e, d, p, 0.25);
        },
        Ob: "polygon",
      },
      blackhole: {
        vb: function (e, d, p) {
          e = e.slice(0);
          g.ac && e.sort(gb).reverse();
          q(e, d, p, 1);
        },
        Ob: "polygon",
      },
    };
    l.order = l.ordered;
    l.treemap = l.squarified;
    var g = a.options;
    this.i = function (e, d, p) {
      if (0 < e.length) {
        p = l[p.relaxationInitializer || p.initializer || g.Li || "random"];
        if ("box" === p.Ob) {
          var m = wa.F(d, {});
          p.vb(e, m);
          wa.wa(e, wa.H(m), d);
        } else p.vb(e, d, wa.u(d, {}));
        for (p = e.length - 1; 0 <= p; p--) {
          m = e[p];
          if (m.description) {
            var c = wa.ta(d, g.qc, g.Bg);
            m.x = c.x;
            m.y = c.y;
          }
          m.attribution &&
            ((c = wa.ta(d, g.$d, g.sg)), (m.x = c.x), (m.y = c.y));
          P.wb(m.group.initialPosition) &&
            ((c = m.group.initialPosition),
            (c = wa.ta(
              d,
              c.position || "bottomright",
              c.distanceFromCenter || 1,
            )),
            (m.x = c.x),
            (m.y = c.y));
        }
      }
    };
  }
  function hb(a) {
    var q,
      l = a.options,
      g = new ib(a, this),
      e = new jb(a, this),
      d = { relaxed: g, ordered: e, squarified: e },
      p = d[a.options.Dc] || g;
    this.kg = 5e-5;
    a.j.subscribe("model:loaded", function (m) {
      q = m;
    });
    a.j.subscribe("options:changed", function (m) {
      m.layout && P.has(d, l.Dc) && (p = d[l.Dc]);
    });
    this.step = function (m, c, b, h) {
      return p.step(m, c, b, h);
    };
    this.complete = function (m) {
      p.complete(m);
    };
    this.Pe = function (m) {
      return m === q
        ? !0
        : 2 * Math.sqrt(m.O.ha / (Math.PI * m.m.length)) >=
            Math.max(l.Ce, 5e-5);
    };
    this.gd = function (m, c) {
      var b = Math.pow(l.La, m.level),
        h = l.$a * b;
      b *= l.jd;
      m = m.m;
      for (var f = m.length - 1; 0 <= f; f--) {
        var u = m[f];
        p.ce(u, b);
        var t = u;
        t.$ = 0 < h ? Ta.i(t.C, h) : t.C;
        t.$ && (wa.F(t.$, t.F), wa.Ja(t.$, t.O));
        u.m && c.push(u);
      }
    };
    this.fc = function (m) {
      p.fc(m);
    };
    this.Eb = function (m) {
      p.Eb(m);
    };
  }
  function ib(a, q) {
    function l(n) {
      if (n.m) {
        n = n.m;
        for (var k = 0; k < n.length; k++) {
          var r = n[k];
          r.kc = r.hc * f.qh;
        }
      }
    }
    function g(n, k) {
      q.Pe(n) &&
        (n.G ||
          ((n.G = Ta.i(n.C, f.jd * Math.pow(f.La, n.level - 1))),
          n.G && n.m[0] && n.m[0].description && "stab" == f.Tb && m(n)),
        n.G && (b.Eb(n), u.i(e(n), n.G, n.group), (n.R = !0), k(n)),
        l(n));
    }
    function e(n) {
      return "stab" === f.Tb && 0 < n.m.length && n.m[0].description
        ? n.m.slice(1)
        : n.m;
    }
    function d(n) {
      var k = e(n);
      Ua.i(k, n.G);
      Ua.u(k, n.G);
      return Va.H(n) * Math.sqrt(h.O.ha / n.O.ha);
    }
    function p(n) {
      return n < f.If || 1e-4 > n;
    }
    function m(n) {
      var k = f.Sb / (1 + f.Sb),
        r = wa.F(n.G, {}),
        y = { x: r.x, y: 0 },
        v = r.y,
        w = r.o,
        z = f.ie * Math.pow(f.La, n.level - 1),
        E = w * f.he,
        D = f.qc;
      "bottom" == D || (0 <= D && 180 > D)
        ? ((D = Math.PI), (v += w), (w = -1))
        : ((D = 0), (w = 1));
      var G = n.G,
        O = D,
        H = 0,
        B = 1,
        M = wa.u(G, {}),
        Q = M.ha;
      k *= Q;
      for (var X = 0; H < B && 20 > X++; ) {
        var Y = (H + B) / 2;
        y.y = r.y + r.o * Y;
        var aa = wa.ua(G, y, O);
        wa.u(aa[0], M);
        var C = M.ha - k;
        if (0.01 >= Math.abs(C) / Q) break;
        else 0 < (0 == O ? 1 : -1) * C ? (B = Y) : (H = Y);
      }
      wa.F(aa[0], r);
      if (r.o < z || r.o > E)
        (y.y = r.o < z ? v + w * Math.min(z, E) : v + w * E),
          (aa = wa.ua(n.G, y, D));
      n.m[0].C = aa[0];
      n.G = aa[1];
    }
    function c(n) {
      n !== h &&
        2 * Math.sqrt(n.O.ha / (Math.PI * n.m.length)) <
          Math.max(0.85 * f.Ce, q.kg) &&
        ((n.R = !1), (n.xa = !1), (n.Ia = !0), (n.G = null));
    }
    var b = this,
      h,
      f = a.options,
      u = new fb(a),
      t = 0;
    a.j.subscribe("model:loaded", function (n) {
      h = n;
      t = 0;
    });
    this.step = function (n, k, r, y) {
      function v(G) {
        G.R && G.xa
          ? c(G)
          : G.Ia &&
            G.C &&
            g(G, function () {
              var H = e(G);
              Ua.i(H, G.G);
              Ua.u(H, G.G);
              n(G);
            });
        if (!G.G || !G.R) return 0;
        if ((G.parent && G.parent.Z) || G.Ea) {
          var O = d(G);
          y && y(G);
          G.Ea = !p(O) && !r;
          G.Z = !0;
        } else O = 0;
        q.gd(G, E);
        return O;
      }
      function w(G, O, H) {
        t < G && (t = G);
        var B = f.If;
        f.Ad(O ? 1 : 1 - (G - B) / (t - B || 1), O, H);
        O && (t = 0);
      }
      for (var z = 0, E = [h]; 0 < E.length; ) z = Math.max(z, v(E.shift()));
      var D = p(z);
      k && w(z, D, r);
      return D;
    };
    this.complete = function (n) {
      for (var k = [h]; 0 < k.length; ) {
        var r = k.shift();
        !r.R && r.Ia && r.C && g(r, n);
        if (r.G) {
          if ((r.parent && r.parent.Z) || r.Ea) {
            for (var y = 1e-4 > r.O.ha, v = 0; !(p(d(r)) || (y && 32 < v++)); );
            r.Z = !0;
            r.Ea = !1;
          }
          q.gd(r, k);
        }
      }
    };
    this.fc = function (n) {
      Ra.L(n, l);
    };
    this.ce = function (n, k) {
      if (n.R) {
        var r = n.G;
        r && (n.Fd = r);
        n.G = Ta.i(n.C, k);
        n.G && n.m[0] && n.m[0].description && "stab" == f.Tb && m(n);
        r && !n.G && (n.Z = !0);
        n.G && n.Fd && wa.wa(e(n), n.Fd, n.G);
      }
    };
    this.Eb = function (n) {
      for (var k = e(n), r = n.ha, y, v = (y = 0); v < k.length; v++)
        y += k[v].weight;
      n.Gj = y;
      for (n = 0; n < k.length; n++)
        (v = k[n]),
          (v.Wf = v.w),
          (v.hc = (r / Math.PI) * (0 < y ? v.weight / y : 1 / k.length));
    };
  }
  function jb(a, q) {
    function l(b, h) {
      if (q.Pe(b)) {
        if (!b.G || (b.parent && b.parent.Z)) {
          var f = m.jd * Math.pow(m.La, b.level - 1);
          b.G = wa.H(e(wa.F(b.C, {}), f));
        }
        b.G && ((b.R = !0), h(b));
      } else
        (b.R = !1),
          Ra.za(b, function (u) {
            u.G = null;
          });
    }
    function g(b) {
      function h(t) {
        function n() {
          r.C = wa.H(y);
          r.x = y.x + y.w / 2;
          r.y = y.y + y.o / 2;
        }
        var k = m.Sb / (1 + m.Sb),
          r = t.m[0],
          y = wa.F(t.G, {}),
          v = y.o;
        k = Math.min(
          Math.max(v * k, m.ie * Math.pow(m.La, t.level - 1)),
          v * m.he,
        );
        var w = m.qc;
        "bottom" == w || (0 <= w && 180 > w)
          ? ((y.o = v - k), (t.G = wa.H(y)), (y.y += v - k), (y.o = k), n())
          : ((y.o = k), n(), (y.y += k), (y.o = v - k), (t.G = wa.H(y)));
      }
      if ("stab" == m.Tb && 0 < b.m.length && b.m[0].description) {
        var f = b.m.slice(1);
        h(b);
      } else f = b.m;
      m.ac && f.sort(gb);
      "floating" == m.Tb &&
        d(f, m.qc, function (t) {
          return t.description;
        });
      d(f, m.$d, function (t) {
        return t.attribution;
      });
      var u = wa.F(b.G, {});
      (c[m.Dc] || Wa.i)(f, u, !0, m.Ld);
      b.Ea = !1;
      b.Z = !0;
      b.N = !0;
      b.Fa = !0;
    }
    function e(b, h) {
      var f = 2 * h;
      b.x += h;
      b.y += h;
      b.w -= f;
      b.o -= f;
      return b;
    }
    function d(b, h, f) {
      for (var u = 0; u < b.length; u++) {
        var t = b[u];
        if (f(t)) {
          b.splice(u, 1);
          "topleft" == h || (135 <= h && 315 > h) ? b.unshift(t) : b.push(t);
          break;
        }
      }
    }
    var p,
      m = a.options,
      c = { squarified: Wa.u, ordered: Wa.i };
    a.j.subscribe("model:loaded", function (b) {
      p = b;
    });
    this.step = function (b, h, f) {
      this.complete(b);
      h && m.Ad(1, !0, f);
      return !0;
    };
    this.complete = function (b) {
      for (var h = [p]; 0 < h.length; ) {
        var f = h.shift();
        (!f.R || (f.parent && f.parent.Z)) && f.Ia && f.C && l(f, b);
        f.G && (((f.parent && f.parent.Z) || f.Ea) && g(f), q.gd(f, h));
      }
    };
    this.Eb = this.fc = this.ce = P.qa;
  }
  var kb = new (function () {
    this.Hg = function (a, q) {
      var l = a.globalAlpha;
      a.fillStyle = "dark" === q ? "white" : "#1d3557";
      a.globalAlpha = 1 * l;
      a.save();
      a.transform(0.94115, 0, 0, 0.94247, -78.54, -58);
      a.beginPath();
      a.moveTo(86.47, 533.3);
      a.bezierCurveTo(83.52, 531.5, 83.45, 530.6, 83.45, 488.3);
      a.bezierCurveTo(83.45, 444.6, 83.35, 445.7, 87.34, 443.7);
      a.bezierCurveTo(88.39, 443.1, 90.5, 442.5, 92.02, 442.4);
      a.bezierCurveTo(93.54, 442.2, 113, 441.7, 135.3, 441.4);
      a.bezierCurveTo(177.9, 440.7, 179.3, 440.7, 182.7, 443.4);
      a.bezierCurveTo(185.9, 445.9, 185.6, 445, 206.2, 510.7);
      a.bezierCurveTo(207.8, 515.8, 209.5, 521.3, 210.1, 522.9);
      a.bezierCurveTo(211.7, 528, 211.9, 531.3, 210.6, 532.7);
      a.bezierCurveTo(209.5, 534, 208.4, 534, 148.5, 534);
      a.bezierCurveTo(106.4, 533.9, 87.3, 533.7, 86.47, 533.2);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.8 * l;
      a.beginPath();
      a.moveTo(237.3, 533.3);
      a.bezierCurveTo(234.8, 532.5, 233.1, 530.9, 231.7, 528.1);
      a.bezierCurveTo(231, 526.8, 224.6, 507, 217.4, 484.1);
      a.bezierCurveTo(203.1, 438.8, 202.6, 436.7, 205, 431.4);
      a.bezierCurveTo(206.3, 428.5, 239.2, 383.2, 242.9, 379.3);
      a.bezierCurveTo(245, 377, 246.9, 376.7, 249.7, 378.2);
      a.bezierCurveTo(250.6, 378.7, 263.1, 390.8, 277.3, 405.2);
      a.bezierCurveTo(301.1, 429.2, 303.4, 431.6, 305.1, 435.5);
      a.bezierCurveTo(306.7, 439, 306.9, 440.4, 306.9, 445.2);
      a.bezierCurveTo(306.8, 455.3, 302.2, 526.4, 301.5, 528.9);
      a.bezierCurveTo(300.2, 533.7, 301, 533.6, 268.3, 533.7);
      a.bezierCurveTo(252.2, 533.8, 238.3, 533.6, 237.3, 533.3);
      a.closePath();
      a.fill();
      a.beginPath();
      a.globalAlpha = 0.05 * l;
      a.moveTo(329, 533.3);
      a.bezierCurveTo(326.2, 532.5, 323.1, 528.8, 322.6, 525.8);
      a.bezierCurveTo(322, 521.6, 327.2, 446.1, 328.4, 442.2);
      a.bezierCurveTo(330.6, 434.9, 332.8, 432.8, 368.5, 402.4);
      a.bezierCurveTo(387, 386.7, 403.9, 372.8, 406, 371.4);
      a.bezierCurveTo(413.1, 366.7, 416, 366.2, 436.5, 365.7);
      a.bezierCurveTo(456.8, 365.2, 463.6, 365.6, 470.2, 367.6);
      a.bezierCurveTo(476.2, 369.5, 546.1, 402.8, 549.1, 405.3);
      a.bezierCurveTo(550.4, 406.3, 552.2, 408.7, 553.2, 410.5);
      a.lineTo(555, 413.9);
      a.lineTo(555.2, 459.5);
      a.bezierCurveTo(555.3, 484.6, 555.2, 505.8, 555, 506.5);
      a.bezierCurveTo(554.4, 509.1, 548.1, 517.9, 543.8, 522.2);
      a.bezierCurveTo(537.7, 528.3, 534.2, 530.5, 527.8, 532.4);
      a.lineTo(522.3, 534);
      a.lineTo(426.6, 533.9);
      a.bezierCurveTo(371.1, 533.9, 330.1, 533.6, 328.9, 533.3);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.8 * l;
      a.beginPath();
      a.moveTo(87.66, 423);
      a.bezierCurveTo(86.23, 422.4, 85.02, 422, 84.97, 422);
      a.bezierCurveTo(84.91, 422, 84.55, 421.1, 84.16, 419.9);
      a.bezierCurveTo(83.67, 418.6, 83.45, 404.7, 83.45, 375.9);
      a.bezierCurveTo(83.45, 328.4, 83.27, 330.3, 88.12, 328.1);
      a.bezierCurveTo(90.22, 327.2, 101.7, 325.6, 135.4, 321.7);
      a.bezierCurveTo(159.9, 318.8, 181.1, 316.5, 182.5, 316.5);
      a.bezierCurveTo(183.9, 316.5, 187, 317.3, 189.4, 318.2);
      a.bezierCurveTo(193.5, 319.8, 194.7, 320.8, 210.1, 336.2);
      a.bezierCurveTo(226.6, 352.7, 229.1, 355.7, 229.1, 360);
      a.bezierCurveTo(229.1, 363, 226.8, 366.5, 212.9, 385.4);
      a.bezierCurveTo(187.3, 420.2, 189.3, 417.7, 183.4, 420.5);
      a.lineTo(179.5, 422.3);
      a.lineTo(155.3, 422.7);
      a.bezierCurveTo(89.91, 424, 90.39, 423.9, 87.65, 423);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.6 * l;
      a.beginPath();
      a.moveTo(314.6, 415);
      a.bezierCurveTo(311.4, 413.4, 213.2, 314.6, 210.9, 310.7);
      a.bezierCurveTo(208.9, 307.2, 208.5, 303.4, 209.9, 300);
      a.bezierCurveTo(211.2, 297, 241.3, 257, 244.2, 254.4);
      a.bezierCurveTo(247.3, 251.7, 252.9, 249.7, 257.4, 249.7);
      a.bezierCurveTo(261.1, 249.7, 344.7, 255.2, 350.8, 255.8);
      a.bezierCurveTo(358.5, 256.6, 363.1, 259.5, 366, 265.1);
      a.bezierCurveTo(368.7, 270.5, 394.3, 343.7, 394.7, 347.2);
      a.bezierCurveTo(395.1, 351.6, 393.6, 356.1, 390.5, 359.5);
      a.bezierCurveTo(389.1, 361, 375.7, 372.6, 360.5, 385.4);
      a.bezierCurveTo(326.7, 414, 327, 413.7, 324.5, 415);
      a.bezierCurveTo(321.8, 416.4, 317.4, 416.3, 314.6, 414.9);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.4 * l;
      a.beginPath();
      a.moveTo(547.9, 383.4);
      a.bezierCurveTo(547.1, 383.2, 533, 376.6, 516.5, 368.7);
      a.bezierCurveTo(497.2, 359.5, 485.7, 353.7, 484.3, 352.4);
      a.bezierCurveTo(481.6, 349.8, 480.2, 346.5, 480.2, 342.5);
      a.bezierCurveTo(480.2, 339.2, 499.2, 237, 500.4, 233.9);
      a.bezierCurveTo(502.2, 229.1, 506.2, 225.8, 511.3, 224.9);
      a.bezierCurveTo(516.2, 224, 545.8, 222.2, 548.2, 222.6);
      a.bezierCurveTo(551.5, 223.2, 553.7, 224.7, 555.1, 227.3);
      a.bezierCurveTo(556.2, 229.3, 556.3, 234, 556.5, 301.9);
      a.bezierCurveTo(556.6, 341.8, 556.5, 375.7, 556.3, 377.2);
      a.bezierCurveTo(555.6, 381.8, 552, 384.4, 547.8, 383.4);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.4 * l;
      a.beginPath();
      a.moveTo(418.7, 347);
      a.bezierCurveTo(416, 346.1, 413.6, 344.3, 412.3, 342.1);
      a.bezierCurveTo(411.6, 341, 404.4, 321.3, 396.3, 298.3);
      a.bezierCurveTo(382, 258.1, 381.5, 256.4, 381.5, 251.7);
      a.bezierCurveTo(381.5, 248.2, 381.8, 246.2, 382.7, 244.7);
      a.bezierCurveTo(383.4, 243.4, 389.5, 233.9, 396.5, 223.4);
      a.bezierCurveTo(412.6, 199, 411.3, 199.9, 430.6, 198.6);
      a.bezierCurveTo(445, 197.6, 449.5, 197.9, 454.2, 200.4);
      a.bezierCurveTo(460.5, 203.7, 479.6, 217.5, 481.3, 220.1);
      a.bezierCurveTo(484.3, 224.6, 484.3, 224.6, 473.1, 284);
      a.bezierCurveTo(465.3, 325.9, 462.4, 339.9, 461.3, 341.8);
      a.bezierCurveTo(458.7, 346.4, 457.1, 346.7, 437.5, 347.1);
      a.bezierCurveTo(428.1, 347.3, 419.6, 347.3, 418.7, 347);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.05 * l;
      a.beginPath();
      a.moveTo(89.33, 308.2);
      a.bezierCurveTo(88.1, 307.5, 86.5, 306.2, 85.77, 305.2);
      a.bezierCurveTo(84.42, 303.4, 84.42, 303.4, 84.24, 202.6);
      a.bezierCurveTo(84.11, 131.7, 84.27, 100.2, 84.77, 96.34);
      a.bezierCurveTo(85.65, 89.58, 87.91, 84.64, 92.77, 78.81);
      a.bezierCurveTo(96.86, 73.9, 103.2, 68.42, 107.1, 66.53);
      a.bezierCurveTo(108.6, 65.81, 112.8, 64.64, 116.5, 63.92);
      a.bezierCurveTo(122.7, 62.73, 125.4, 62.64, 148.5, 62.81);
      a.lineTo(173.7, 63);
      a.lineTo(177.4, 64.82);
      a.bezierCurveTo(179.5, 65.82, 182.1, 67.75, 183.3, 69.12);
      a.bezierCurveTo(185.6, 71.9, 228.8, 145.1, 231.3, 150.7);
      a.bezierCurveTo(234.5, 157.7, 234.9, 160.8, 234.9, 176.9);
      a.bezierCurveTo(234.8, 201.7, 233.8, 229.6, 232.8, 233.2);
      a.bezierCurveTo(232.3, 235, 231.1, 238.1, 230.2, 240);
      a.bezierCurveTo(228.3, 243.9, 196.9, 286.6, 192.7, 290.9);
      a.bezierCurveTo(189.8, 293.9, 184.3, 297.1, 180.2, 298.2);
      a.bezierCurveTo(177.6, 298.9, 95.84, 309.3, 93.04, 309.3);
      a.bezierCurveTo(92.22, 309.3, 90.55, 308.8, 89.33, 308.1);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.4 * l;
      a.beginPath();
      a.moveTo(305.7, 235.6);
      a.bezierCurveTo(254.5, 232, 256.5, 232.3, 253.9, 227.1);
      a.lineTo(252.4, 224.2);
      a.lineTo(253.1, 196.7);
      a.bezierCurveTo(253.8, 170.5, 253.8, 169.1, 255.2, 166.3);
      a.bezierCurveTo(257.7, 161.2, 256.9, 161.4, 309.3, 151.9);
      a.bezierCurveTo(354.1, 143.8, 356.8, 143.4, 359.7, 144.2);
      a.bezierCurveTo(361.4, 144.6, 363.8, 145.8, 365, 146.8);
      a.bezierCurveTo(367.3, 148.6, 389, 179.6, 391.9, 185.2);
      a.bezierCurveTo(393.8, 188.7, 394.1, 193.5, 392.6, 196.9);
      a.bezierCurveTo(391.5, 199.6, 370.6, 231.4, 368.4, 233.8);
      a.bezierCurveTo(365.4, 237, 362, 238.3, 356.3, 238.5);
      a.bezierCurveTo(353.5, 238.6, 330.7, 237.3, 305.7, 235.5);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.2 * l;
      a.beginPath();
      a.moveTo(497.1, 207.1);
      a.bezierCurveTo(496.2, 206.8, 494.4, 206, 493.2, 205.4);
      a.bezierCurveTo(490, 203.8, 472.7, 191.6, 469.7, 189);
      a.bezierCurveTo(467, 186.6, 465.7, 183.2, 466.2, 180.2);
      a.bezierCurveTo(466.5, 178.1, 482.4, 138.6, 484.9, 133.5);
      a.bezierCurveTo(486.5, 130.3, 488.4, 128.2, 490.9, 126.8);
      a.bezierCurveTo(492.6, 125.9, 496.3, 125.7, 522.2, 125.6);
      a.lineTo(551.5, 125.4);
      a.lineTo(553.7, 127.6);
      a.bezierCurveTo(555.2, 129.1, 556, 130.5, 556.3, 132.6);
      a.bezierCurveTo(556.5, 134.2, 556.6, 149.6, 556.5, 166.9);
      a.bezierCurveTo(556.3, 195.4, 556.2, 198.5, 555.1, 200.4);
      a.bezierCurveTo(553.1, 204.1, 551.7, 204.4, 529.8, 206.1);
      a.bezierCurveTo(509.2, 207.7, 499.9, 207.9, 497, 207.1);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.2 * l;
      a.beginPath();
      a.moveTo(412.5, 180.5);
      a.bezierCurveTo(410.9, 179.7, 408.7, 177.9, 407.5, 176.4);
      a.bezierCurveTo(403.5, 171.3, 380.5, 137.2, 379.2, 134.3);
      a.bezierCurveTo(377.2, 129.6, 377.1, 126.1, 378.9, 116.8);
      a.bezierCurveTo(386.5, 77.56, 388.4, 68.28, 389.5, 66.46);
      a.bezierCurveTo(390.1, 65.34, 391.7, 63.83, 392.9, 63.1);
      a.bezierCurveTo(395.1, 61.84, 396.2, 61.78, 419.4, 61.78);
      a.bezierCurveTo(443.4, 61.78, 443.7, 61.8, 446.5, 63.25);
      a.bezierCurveTo(448, 64.06, 449.9, 65.81, 450.7, 67.14);
      a.bezierCurveTo(452.3, 69.73, 468, 105.5, 470, 111.1);
      a.bezierCurveTo(471.4, 114.9, 471.6, 119.1, 470.5, 122.3);
      a.bezierCurveTo(470.1, 123.5, 465.2, 135.8, 459.7, 149.5);
      a.bezierCurveTo(446.7, 181.4, 448.1, 179.8, 431.5, 181.2);
      a.bezierCurveTo(419, 182.2, 415.7, 182, 412.5, 180.5);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.4 * l;
      a.beginPath();
      a.moveTo(253.6, 142.8);
      a.bezierCurveTo(250.2, 141.8, 246.6, 139.4, 244.7, 136.7);
      a.bezierCurveTo(242.1, 132.9, 207.4, 73.28, 206.2, 70.42);
      a.bezierCurveTo(205.1, 67.89, 205, 67.1, 205.7, 65.54);
      a.bezierCurveTo(207.3, 61.54, 202.3, 61.8, 284.4, 61.59);
      a.bezierCurveTo(325.7, 61.48, 360.8, 61.58, 362.4, 61.81);
      a.bezierCurveTo(366, 62.32, 369.3, 65.36, 369.9, 68.75);
      a.bezierCurveTo(370.4, 71.55, 362.4, 113.9, 360.5, 118.1);
      a.bezierCurveTo(359.1, 121.3, 355, 125, 351.4, 126.4);
      a.bezierCurveTo(348.9, 127.3, 267.1, 142.3, 259.5, 143.2);
      a.bezierCurveTo(257.9, 143.4, 255.2, 143.2, 253.6, 142.7);
      a.closePath();
      a.fill();
      a.globalAlpha = 0.1 * l;
      a.beginPath();
      a.moveTo(493.4, 106.8);
      a.bezierCurveTo(490.3, 106, 488.2, 104.5, 486.5, 101.7);
      a.bezierCurveTo(483.8, 97.43, 471.8, 68.81, 471.8, 66.76);
      a.bezierCurveTo(471.8, 62.64, 470.7, 62.76, 512.1, 62.76);
      a.bezierCurveTo(553.3, 62.76, 552.3, 62.67, 554.4, 66.68);
      a.bezierCurveTo(555.2, 68.34, 555.3, 71.23, 555.2, 85.75);
      a.lineTo(555, 102.8);
      a.lineTo(551.4, 106.4);
      a.lineTo(534.1, 106.8);
      a.bezierCurveTo(510.7, 107.4, 495.9, 107.4, 493.3, 106.8);
      a.closePath();
      a.fill();
      a.restore();
      a.transform(0.15905, 0, 0, 0.15905, -88.65, 443.2);
      a.globalAlpha = 1 * l;
      a.save();
      a.beginPath();
      a.moveTo(557.4, 564.9);
      a.lineTo(557.4, 98);
      a.lineTo(885.8, 98);
      a.lineTo(885.8, 185.1);
      a.lineTo(650.8, 185.1);
      a.lineTo(650.8, 284.7);
      a.lineTo(824.1, 284.7);
      a.lineTo(824.1, 371.6);
      a.lineTo(650.8, 371.6);
      a.lineTo(650.8, 564.9);
      a.lineTo(557.4, 564.9);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(1029, 568);
      a.quadraticCurveTo(961.1, 568, 915.7, 522.5);
      a.quadraticCurveTo(870.2, 476.7, 870.2, 409.2);
      a.quadraticCurveTo(870.2, 341.3, 915.7, 295.9);
      a.quadraticCurveTo(961.1, 250.4, 1029, 250.4);
      a.quadraticCurveTo(1096.8, 250.4, 1142.3, 295.9);
      a.quadraticCurveTo(1187.7, 341.3, 1187.7, 409.2);
      a.quadraticCurveTo(1187.7, 477.1, 1142.3, 522.5);
      a.quadraticCurveTo(1097.3, 568.1, 1029.3, 568.1);
      a.closePath();
      a.moveTo(1028.6, 492.6);
      a.quadraticCurveTo(1064.1, 492.6, 1086.2, 469);
      a.quadraticCurveTo(1108.3, 445, 1108.3, 409.5);
      a.quadraticCurveTo(1108.3, 374, 1086.2, 350);
      a.quadraticCurveTo(1064.1, 326.1, 1028.3, 326.1);
      a.quadraticCurveTo(993.1, 326.1, 971, 350);
      a.quadraticCurveTo(948.9, 374, 948.9, 409.5);
      a.quadraticCurveTo(948.9, 445, 971, 469);
      a.quadraticCurveTo(993.1, 492.6, 1028.6, 492.6);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(1253, 291);
      a.quadraticCurveTo(1312.1, 253.6, 1390, 253.6);
      a.quadraticCurveTo(1446, 253.6, 1478.7, 284.7);
      a.quadraticCurveTo(1511.4, 315.9, 1511.4, 378.1);
      a.lineTo(1511.4, 564.9);
      a.lineTo(1424.2, 564.9);
      a.lineTo(1424.2, 540);
      a.quadraticCurveTo(1386.2, 564.9, 1355.7, 564.9);
      a.quadraticCurveTo(1293.5, 564.9, 1262.3, 538.5);
      a.quadraticCurveTo(1231.2, 512, 1231.2, 465.3);
      a.quadraticCurveTo(1231.2, 421.7, 1260.4, 387.5);
      a.quadraticCurveTo(1290, 353.3, 1355.7, 353.3);
      a.quadraticCurveTo(1385.9, 353.3, 1424.2, 371.9);
      a.lineTo(1424.2, 362.6);
      a.quadraticCurveTo(1423.6, 328.4, 1374.4, 325.2);
      a.quadraticCurveTo(1318.3, 325.2, 1287.2, 343.9);
      a.lineTo(1253, 291);
      a.closePath();
      a.moveTo(1424.2, 471.5);
      a.lineTo(1424.2, 436.3);
      a.quadraticCurveTo(1411.7, 412.3, 1365, 412.3);
      a.quadraticCurveTo(1309, 418.5, 1305.9, 455.9);
      a.quadraticCurveTo(1309, 492.9, 1365, 496);
      a.quadraticCurveTo(1411.7, 496, 1424.2, 471.5);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(1675, 365.7);
      a.lineTo(1675, 564.9);
      a.lineTo(1587.8, 564.9);
      a.lineTo(1587.8, 262.5);
      a.lineTo(1675, 253.2);
      a.lineTo(1675, 280.9);
      a.quadraticCurveTo(1704.2, 253.5, 1749.7, 253.5);
      a.quadraticCurveTo(1808.8, 253.5, 1839.9, 289.3);
      a.quadraticCurveTo(1874.2, 253.5, 1942.6, 253.5);
      a.quadraticCurveTo(2001.8, 253.5, 2032.9, 289.3);
      a.quadraticCurveTo(2064, 325.1, 2064, 371.8);
      a.lineTo(2064, 564.8);
      a.lineTo(1976.9, 564.8);
      a.lineTo(1976.9, 393.6);
      a.quadraticCurveTo(1976.9, 362.5, 1962.9, 345.4);
      a.quadraticCurveTo(1948.8, 328.2, 1917.4, 327.3);
      a.quadraticCurveTo(1891.6, 329.2, 1872.6, 361.6);
      a.quadraticCurveTo(1871, 371.2, 1871, 381.2);
      a.lineTo(1871, 564.9);
      a.lineTo(1783.9, 564.9);
      a.lineTo(1783.9, 393.7);
      a.quadraticCurveTo(1783.9, 362.5, 1769.9, 345.4);
      a.quadraticCurveTo(1755.9, 328.3, 1724.4, 327.4);
      a.quadraticCurveTo(1695.8, 329.2, 1674.9, 365.7);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(2058, 97.96);
      a.lineTo(2058, 185.1);
      a.lineTo(2213.6, 185.1);
      a.lineTo(2213.6, 564.9);
      a.lineTo(2306.9, 564.9);
      a.lineTo(2306.9, 185.1);
      a.lineTo(2462.5, 185.1);
      a.lineTo(2462.5, 97.96);
      a.lineTo(2057.8, 97.96);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(2549, 287.8);
      a.quadraticCurveTo(2582.3, 253.5, 2630.2, 253.5);
      a.quadraticCurveTo(2645.5, 253.5, 2659.2, 256);
      a.lineTo(2645.5, 341.9);
      a.quadraticCurveTo(2630.2, 328.2, 2601.9, 327.3);
      a.quadraticCurveTo(2570.1, 329.5, 2549, 373.4);
      a.lineTo(2549, 564.8);
      a.lineTo(2461.8, 564.8);
      a.lineTo(2461.8, 262.5);
      a.lineTo(2549, 253.1);
      a.lineTo(2549, 287.7);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(2694, 409.2);
      a.quadraticCurveTo(2694, 340.7, 2737.5, 297.1);
      a.quadraticCurveTo(2781.1, 253.5, 2849.6, 253.5);
      a.quadraticCurveTo(2918.1, 253.5, 2958.5, 297.1);
      a.quadraticCurveTo(2999, 340.6, 2999, 409.2);
      a.lineTo(2999, 440.3);
      a.lineTo(2784.2, 440.3);
      a.quadraticCurveTo(2787.3, 465.2, 2806, 479.2);
      a.quadraticCurveTo(2824.7, 493.2, 2849.6, 493.2);
      a.quadraticCurveTo(2893.1, 493.2, 2927.4, 468.3);
      a.lineTo(2977.2, 518.1);
      a.quadraticCurveTo(2943, 564.8, 2849.6, 564.8);
      a.quadraticCurveTo(2781.1, 564.8, 2737.5, 521.2);
      a.quadraticCurveTo(2693.9, 477.6, 2693.9, 409.1);
      a.closePath();
      a.moveTo(2911.9, 378);
      a.quadraticCurveTo(2911.9, 353.1, 2893.2, 339.1);
      a.quadraticCurveTo(2874.5, 325.1, 2849.6, 325.1);
      a.quadraticCurveTo(2824.7, 325.1, 2806, 339.1);
      a.quadraticCurveTo(2787.3, 353.1, 2787.3, 378);
      a.lineTo(2911.8, 378);
      a.closePath();
      a.fill();
      a.beginPath();
      a.moveTo(3052, 409.2);
      a.quadraticCurveTo(3052, 340.7, 3095.5, 297.1);
      a.quadraticCurveTo(3139.1, 253.5, 3207.6, 253.5);
      a.quadraticCurveTo(3276.1, 253.5, 3316.5, 297.1);
      a.quadraticCurveTo(3357, 340.6, 3357, 409.2);
      a.lineTo(3357, 440.3);
      a.lineTo(3142.2, 440.3);
      a.quadraticCurveTo(3145.3, 465.2, 3164, 479.2);
      a.quadraticCurveTo(3182.7, 493.2, 3207.6, 493.2);
      a.quadraticCurveTo(3251.1, 493.2, 3285.4, 468.3);
      a.lineTo(3335.2, 518.1);
      a.quadraticCurveTo(3301, 564.8, 3207.6, 564.8);
      a.quadraticCurveTo(3139.1, 564.8, 3095.5, 521.2);
      a.quadraticCurveTo(3051.9, 477.6, 3051.9, 409.1);
      a.closePath();
      a.moveTo(3269.9, 378);
      a.quadraticCurveTo(3269.9, 353.1, 3251.2, 339.1);
      a.quadraticCurveTo(3232.5, 325.1, 3207.6, 325.1);
      a.quadraticCurveTo(3182.7, 325.1, 3164, 339.1);
      a.quadraticCurveTo(3145.3, 353.1, 3145.3, 378);
      a.lineTo(3269.8, 378);
      a.closePath();
      a.fill();
      a.restore();
    };
  })();
  kb.ke = { width: 445.2, height: 533.5 };
  function lb(a, q) {
    function l(x, A) {
      var F = x.O.r,
        L = F / 15,
        K = (0.5 * F) / 15;
      F /= 5;
      var J = x.O.x;
      x = x.O.y;
      A.fillRect(J - K, x - K, L, L);
      A.fillRect(J - K - F, x - K, L, L);
      A.fillRect(J - K + F, x - K, L, L);
    }
    function g(x, A, F, L) {
      null === x && F.clearRect(0, 0, O, H);
      var K,
        J = Array(T.length);
      for (K = T.length - 1; 0 <= K; K--) J[K] = T[K].na(F, L);
      for (K = T.length - 1; 0 <= K; K--) J[K] && T[K].before(F, L);
      X.rc([F, G], function (W) {
        var Z;
        if (null !== x) {
          F.save();
          F.globalCompositeOperation = "destination-out";
          F.fillStyle = F.strokeStyle = "rgba(255, 255, 255, 1)";
          for (Z = x.length - 1; 0 <= Z; Z--) {
            var ia = x[Z],
              la = ia.C;
            la &&
              (F.save(),
              F.beginPath(),
              ia.Ib(F),
              ya.Ud(F, la),
              F.fill(),
              (ia = C.$a * Math.pow(C.La, ia.level - 1)),
              0 < ia && ((F.lineWidth = ia / 2), F.stroke()),
              F.restore());
          }
          F.restore();
        }
        W = W.scale;
        if (0 !== A.length) {
          Z = {};
          for (la = T.length - 1; 0 <= la; la--) T[la].og(Z);
          for (ia = I.length - 1; 0 <= ia; ia--)
            if (((la = I[ia]), Z[la.id])) {
              var qa = la.Kd;
              for (la = 0; la < A.length; la++) {
                var oa = A[la];
                !oa.parent || (oa.parent.xa && oa.parent.R)
                  ? qa(oa, W)
                  : oa.aa.clear();
              }
            }
        }
        for (Z = T.length - 1; 0 <= Z; Z--) (ia = T[Z]), J[Z] && ia.Nd(A, F, W);
      });
      for (K = T.length - 1; 0 <= K; K--) J[K] && T[K].after(F);
      C.Zc &&
        ((F.canvas.style.opacity = 0.99),
        setTimeout(function () {
          F.canvas.style.opacity = 1;
        }, 1));
    }
    function e(x) {
      k === y
        ? x < 0.9 * u && ((k = r), (w = z), c())
        : x >= u && ((k = y), (w = E), c());
    }
    function d() {
      function x(K, J, W) {
        K.sb = Math.floor(1e3 * K.scale) - W * J;
        0 < K.opacity && !K.open && J++;
        var Z = K.m;
        if (Z) for (var ia = Z.length - 1; 0 <= ia; ia--) K.W && x(Z[ia], J, W);
      }
      var A = null,
        F = null,
        L = null;
      X.rc([], function (K) {
        e(K.scale);
        var J = !1;
        Ra.L(U, function (da) {
          da.W && ((J = da.vd() || J), da.cc(), (da.Ma = M.i(da) || da.Ma));
        });
        J && (U.N = !0);
        var W = "onSurfaceDirty" === C.Ng;
        Ra.fd(U, function (da) {
          da.parent &&
            da.parent.Z &&
            (da.aa.clear(), (da.Ma = !0), W || ((da.oc = !0), da.Qb.clear()));
          W && ((da.oc = !0), da.Qb.clear());
        });
        var Z = K.scale * K.scale;
        Ra.fd(U, function (da) {
          if (da.R) {
            for (var ma = da.m, sa = 0; sa < ma.length; sa++)
              if (5 < ma[sa].O.ha * Z) {
                da.X = !0;
                return;
              }
            da.X = !1;
          }
        });
        f(K);
        L = [];
        Ra.tc(U, function (da) {
          if (da.parent.X && da.Y && da.W) {
            L.push(da);
            for (
              var ma = da.parent;
              ma !== U && (ma.open || 0 === ma.opacity);

            )
              ma = ma.parent;
            ma !== U &&
              0.02 > Math.abs(ma.scale - da.scale) &&
              (da.scale = Math.min(da.scale, ma.scale));
          }
        });
        x(U, 0, "flattened" === C.mb ? -1 : 1);
        L.sort(function (da, ma) {
          return da.sb - ma.sb;
        });
        if (p()) (A = L), (F = null);
        else {
          var ia = {},
            la = {},
            qa = "none" != C.ld && C.$a < C.ab / 2,
            oa = C.$a < C.yc / 2 + C.kd * C.Ee.a;
          Ra.L(U, function (da) {
            if (
              da.W &&
              !da.description &&
              (da.Z || da.N || (da.Fc && da.parent.X && da.Ma))
            ) {
              var ma,
                sa,
                ua = [da],
                va = da.J || da.parent.m;
              if (qa)
                for (ma = 0; ma < va.length; ma++) (sa = va[ma]) && ua.push(sa);
              else if (oa)
                if (!da.selected && da.Sa) {
                  sa = !0;
                  for (ma = 0; ma < va.length; ma++)
                    va[ma] ? ua.push(va[ma]) : (sa = !1);
                  !sa && 1 < da.level && ua.push(da.parent);
                } else
                  for (ma = 0; ma < va.length; ma++)
                    (sa = va[ma]) && sa.selected && ua.push(sa);
              var za;
              for (ma = da.parent; ma != U; )
                ma.selected && (za = ma), (ma = ma.parent);
              za && ua.push(za);
              for (ma = 0; ma < ua.length; ma++) {
                za = ua[ma];
                for (da = za.parent; da && da !== U; )
                  0 < da.opacity && (za = da), (da = da.parent);
                la[za.id] = !0;
                Ra.za(za, function (rb) {
                  ia[rb.id] = !0;
                });
              }
            }
          });
          A = L.filter(function (da) {
            return ia[da.id];
          });
          F = A.filter(function (da) {
            return la[da.id];
          });
        }
      });
      (function () {
        var K = !1;
        C.Hf &&
          Ra.L(U, function (J) {
            if (J.W && 0 !== J.pa.a && 1 !== J.pa.a) return (K = !0), !1;
          });
        K
          ? (Ra.sc(U, function (J) {
              if (J.W && (J.opacity !== J.Jc || J.Fa)) {
                var W = J.m;
                if (W) {
                  for (var Z = 0, ia = W.length - 1; 0 <= ia; ia--)
                    Z = Math.max(Z, W[ia].Ec);
                  J.Ec = Z + J.opacity * J.pa.a;
                } else J.Ec = J.opacity * J.pa.a;
              }
            }),
            Ra.L(U, function (J) {
              if (J.W && (J.opacity !== J.Jc || J.Fa)) {
                for (var W = J.Ec, Z = J; (Z = Z.parent) && Z !== U; )
                  W += Z.opacity * Z.pa.a * C.Ff;
                J.$c = 0 < W ? 1 - Math.pow(1 - J.pa.a, 1 / W) : 0;
                J.Jc = J.opacity;
              }
            }))
          : Ra.L(U, function (J) {
              J.W && ((J.$c = 1), (J.Jc = -1));
            });
      })();
      return { bg: A, ag: F, Y: L };
    }
    function p() {
      var x = U.Z || U.N || "none" == C.Le;
      if (!x && !U.empty()) {
        var A = U.m[0].scale;
        Ra.L(U, function (F) {
          if (F.W && F.Y && F.scale !== A) return (x = !0), !1;
        });
      }
      !x &&
        0 < C.ye &&
        1 != C.Pa &&
        Ra.L(U, function (F) {
          if (F.W && 0 < F.ja) return (x = !0), !1;
        });
      "accurate" == C.Le &&
        ((x = (x = x || 0 === C.$a) || ("none" != C.ld && C.$a < C.ab / 2)),
        !x &&
          C.$a < C.yc / 2 + C.kd * C.Ee.a &&
          Ra.L(U, function (F) {
            if (F.W && ((F.selected && !F.Sa) || (!F.selected && F.Sa)))
              return (x = !0), !1;
          }));
      return x;
    }
    function m() {
      if (C.B !== C.nb) return !0;
      var x =
        "polygonPlainFill polygonPlainStroke polygonGradientFill polygonGradientStroke labelPlainFill contentDecoration".split(
          " ",
        );
      Ra.L(U, function (L) {
        if (L.W && L.U) return x.push("polygonExposureShadow"), !1;
      });
      for (var A = x.length - 1; 0 <= A; A--) {
        var F = x[A];
        if (!!ba[F] !== !!N[F]) return !0;
      }
      return !1;
    }
    function c() {
      function x(J, W, Z, ia, la) {
        function qa(da, ma, sa, ua, va) {
          da[ua] &&
            ((ma -= sa * t[ua]),
            (da[ua] = !1),
            va && ((ma += sa * t[va]), (da[va] = !0)));
          return ma;
        }
        J = P.extend({}, J);
        switch (Z) {
          case "never":
            J.labelPlainFill = !1;
            break;
          case "always":
          case "auto":
            J.labelPlainFill = !0;
        }
        if (C.xc)
          switch (ia) {
            case "never":
              J.contentDecoration = !1;
              break;
            case "always":
            case "auto":
              J.contentDecoration = !0;
          }
        else J.contentDecoration = !1;
        var oa = 0;
        P.Aa(J, function (da, ma) {
          da &&
            (oa += W * t["contentDecoration" === ma ? "labelPlainFill" : ma]);
        });
        J.polygonExposureShadow = A;
        oa += 2 * t.polygonExposureShadow;
        if (
          oa <= la ||
          (oa = qa(J, oa, 2, "polygonExposureShadow")) <= la ||
          (oa = qa(J, oa, W, "polygonGradientFill", "polygonPlainFill")) <=
            la ||
          (oa = qa(J, oa, W, "polygonGradientStroke")) <= la ||
          (oa = qa(J, oa, W, "polygonPlainStroke")) <= la ||
          ("auto" === ia && (oa = qa(J, oa, W, "contentDecoration")) <= la)
        )
          return J;
        "auto" === Z && (oa = qa(J, oa, W, "labelPlainFill"));
        return J;
      }
      var A = k === r,
        F = 0,
        L = 0;
      Ra.oe(U, function (J) {
        var W = 1;
        Ra.L(J, function () {
          W++;
        });
        F += W;
        L = Math.max(L, W);
      });
      var K = {};
      switch (C.Wg) {
        case "plain":
          K.polygonPlainFill = !0;
          break;
        case "gradient":
          (K.polygonPlainFill = !A), (K.polygonGradientFill = A);
      }
      switch (C.ld) {
        case "plain":
          K.polygonPlainStroke = !0;
          break;
        case "gradient":
          (K.polygonPlainStroke = !A), (K.polygonGradientStroke = A);
      }
      ba = x(K, F, C.jj, C.hj, C.ij);
      N = x(K, 2 * L, "always", "always", C.Fg);
      ja = x(K, F, "always", "always", C.Eg);
    }
    function b(x) {
      return function (A, F) {
        return A === k ? !0 === ba[x] : !0 === (F ? N : ja)[x];
      };
    }
    function h(x, A) {
      return function (F, L) {
        return x(F, L) && A(F, L);
      };
    }
    function f(x) {
      U.Y = !0;
      Ra.fd(U, function (A) {
        if (A.W && A.X && A.xa && A.R && (U.N || A.Z || A.Vd)) {
          A.Vd = !1;
          var F = A.m,
            L = { x: 0, y: 0, w: 0, o: 0 },
            K = !!A.G;
          if (1 < O / x.w) {
            var J;
            for (J = F.length - 1; 0 <= J; J--) F[J].Y = !1;
            if (A.Y && K)
              for (J = F.length - 1; 0 <= J; J--)
                if (
                  ((A = F[J]),
                  1 !== A.scale &&
                    (A.Jb(x, L), (L.w = x.w / A.scale), (L.o = x.o / A.scale)),
                  !1 === A.Y && A.C)
                ) {
                  K = A.C;
                  var W = K.length;
                  if (wa.sa(A.C, 1 === A.scale ? x : L)) A.Y = !0;
                  else
                    for (var Z = 0; Z < W; Z++)
                      if (wa.Vc(K[Z], K[(Z + 1) % W], 1 === A.scale ? x : L)) {
                        A.Y = !0;
                        A.J && (A = A.J[Z]) && (F[A.index].Y = !0);
                        break;
                      }
                }
          } else for (J = 0; J < F.length; J++) F[J].Y = K;
        }
      });
    }
    var u = ea.Te() ? 50 : 1e4,
      t,
      n,
      k,
      r,
      y,
      v,
      w,
      z,
      E,
      D,
      G,
      O,
      H,
      B,
      M = new mb(a),
      Q = new nb(a),
      X,
      Y,
      aa,
      C = a.options,
      U,
      ha,
      ba,
      ja,
      N;
    a.j.subscribe("stage:initialized", function (x, A, F, L) {
      B = x;
      O = F;
      H = L;
      n = B.dc("wireframe", C.nb, !1);
      r = n.getContext("2d");
      y = new xa(r);
      v = B.dc("hifi", C.B, !1);
      z = v.getContext("2d");
      E = new xa(z);
      k = r;
      w = z;
      r.B = C.nb;
      y.B = C.nb;
      z.B = C.B;
      E.B = C.B;
      D = B.dc("tmp", Math.max(C.B, C.nb), !0);
      G = D.getContext("2d");
      G.B = 1;
      [r, z, G].forEach(function (K) {
        K.scale(K.B, K.B);
      });
    });
    a.j.subscribe("stage:resized", function (x, A, F, L) {
      O = F;
      H = L;
      [r, z, G].forEach(function (K) {
        K.scale(K.B, K.B);
      });
    });
    a.j.subscribe("model:loaded", function (x) {
      function A(F) {
        var L = 0;
        if (!F.empty()) {
          for (var K = F.m, J = K.length - 1; 0 <= J; J--)
            L = Math.max(L, A(K[J]));
          L += 1;
        }
        return (F.Tf = L);
      }
      U = x;
      ha = !0;
      A(U);
      c();
      a.j.D("render:renderers:resolved", ba, N, ja);
    });
    var S =
        "groupFillType groupStrokeType wireframeDrawMaxDuration wireframeLabelDrawing wireframeContentDecorationDrawing finalCompleteDrawMaxDuration finalIncrementalDrawMaxDuration groupContentDecorator".split(
          " ",
        ),
      ca = [
        "groupLabelLightColor",
        "groupLabelDarkColor",
        "groupLabelColorThreshold",
        "groupUnexposureLabelColorThreshold",
      ];
    a.j.subscribe("options:changed", function (x) {
      function A(L, K, J, W) {
        B.Ki(L, J);
        K.B = J;
        W && K.scale(J, J);
      }
      x.dataObject ||
        (P.bb(x, S) && c(),
        P.bb(x, ca) &&
          Ra.L(U, function (L) {
            L.hd = -1;
          }));
      var F = P.has(x, "pixelRatio");
      x = P.has(x, "wireframePixelRatio");
      if (F || x)
        F && A(v, w, C.B, !0),
          x && A(n, k, C.nb, !0),
          A(D, G, Math.max(C.B, C.nb), !1);
    });
    a.j.subscribe("zoom:initialized", function (x) {
      X = x;
    });
    a.j.subscribe("timeline:initialized", function (x) {
      Y = x;
    });
    a.j.subscribe("api:initialized", function (x) {
      aa = x;
    });
    var I = [
        {
          id: "offsetPolygon",
          Kd: function (x) {
            if (
              (x.selected || (0 < x.opacity && !1 === x.open) || !x.X) &&
              x.aa.Ga()
            ) {
              var A = x.aa;
              A.clear();
              if (x.$) {
                var F = x.$,
                  L = C.Ig;
                0 < L
                  ? ya.Wi(
                      A,
                      F,
                      x.parent.O.r / 32,
                      Math.min(1, L * Math.pow(1 - C.Jg * L, x.Tf)),
                    )
                  : ya.Ud(A, F);
              }
              x.Dd = !0;
            }
          },
        },
        {
          id: "label",
          Kd: function (x) {
            x.Ma && x.Fc && M.u(x);
          },
        },
        {
          id: "custom",
          Kd: function (x, A) {
            if (
              x.$ &&
              ((0 < x.opacity && (!1 === x.open || !0 === x.selected)) ||
                !x.X) &&
              x.oc &&
              a.options.xc &&
              !x.attribution
            ) {
              var F = {};
              aa.Xc(F, x);
              aa.Yc(F, x);
              aa.Wc(F, x, !0);
              F.context = x.Qb;
              F.polygonContext = x.aa;
              F.labelContext = x.Bc;
              F.shapeDirty = x.Dd;
              F.viewportScale = A;
              A = { groupLabelDrawn: !0, groupPolygonDrawn: !0 };
              a.options.Mg(a.Cd, F, A);
              x.Ue = A.groupLabelDrawn;
              x.Ed = A.groupPolygonDrawn;
              x.Dd = !1;
              x.oc = !1;
            }
          },
        },
      ].reverse(),
      T = [
        new (function (x) {
          var A = Array(x.length);
          this.Nd = function (F, L, K) {
            if (0 !== F.length) {
              var J,
                W = [],
                Z = F[0].sb;
              for (J = 0; J < F.length; J++) {
                var ia = F[J];
                ia.sb !== Z && (W.push(J), (Z = ia.sb));
              }
              W.push(J);
              for (var la = (Z = 0); la < W.length; la++) {
                for (var qa = W[la], oa = x.length - 1; 0 <= oa; oa--)
                  if (A[oa]) {
                    var da = x[oa];
                    L.save();
                    for (J = Z; J < qa; J++)
                      (ia = F[J]),
                        L.save(),
                        ia.Ib(L),
                        da.kb.call(da, ia, L, K),
                        L.restore();
                    da.Wa.call(da, L, K);
                    L.restore();
                  }
                Z = qa;
              }
            }
          };
          this.na = function (F, L) {
            for (var K = !1, J = x.length - 1; 0 <= J; J--)
              (A[J] = x[J].na(F, L)), (K |= A[J]);
            return K;
          };
          this.before = function (F, L) {
            for (var K = x.length - 1; 0 <= K; K--)
              if (A[K]) {
                var J = x[K];
                J.before.call(J, F, L);
              }
          };
          this.after = function (F) {
            for (var L = x.length - 1; 0 <= L; L--)
              if (A[L]) {
                var K = x[L];
                K.after.call(K, F);
              }
          };
          this.og = function (F) {
            for (var L = x.length - 1; 0 <= L; L--) {
              var K = x[L];
              if (A[L])
                for (var J = K.Ra.length - 1; 0 <= J; J--) F[K.Ra[J]] = !0;
            }
          };
        })(
          [
            {
              Ra: ["offsetPolygon"],
              na: b("polygonExposureShadow"),
              before: function (x) {
                G.save();
                G.scale(x.B, x.B);
              },
              after: function () {
                G.restore();
              },
              rb: function () {},
              Wa: function (x) {
                this.Sf &&
                  ((this.Sf = !1),
                  x.save(),
                  x.setTransform(1, 0, 0, 1, 0, 0),
                  x.drawImage(
                    D,
                    0,
                    0,
                    x.canvas.width,
                    x.canvas.height,
                    0,
                    0,
                    x.canvas.width,
                    x.canvas.height,
                  ),
                  x.restore(),
                  G.save(),
                  G.setTransform(1, 0, 0, 1, 0, 0),
                  G.clearRect(0, 0, D.width, D.height),
                  G.restore());
              },
              kb: function (x, A, F) {
                if (!((x.open && x.X) || x.aa.Ga())) {
                  var L =
                    C.ye *
                    x.opacity *
                    x.ja *
                    ("flattened" === C.mb
                      ? 1 - x.parent.ja
                      : (1 - x.Cb) * x.parent.Cb) *
                    (1.1 <= C.Pa ? 1 : (C.Pa - 1) / 0.1);
                  0 < L &&
                    (G.save(),
                    G.beginPath(),
                    x.Ib(G),
                    x.aa.Na(G),
                    (G.shadowBlur = F * A.B * L),
                    (G.shadowColor = C.Og),
                    (G.fillStyle = "rgba(0, 0, 0, 1)"),
                    (G.globalCompositeOperation = "source-over"),
                    (G.globalAlpha = x.opacity),
                    G.fill(),
                    (G.shadowBlur = 0),
                    (G.shadowColor = "transparent"),
                    (G.globalCompositeOperation = "destination-out"),
                    G.fill(),
                    G.restore(),
                    (this.Sf = !0));
                }
              },
            },
            {
              Ra: ["offsetPolygon"],
              na: function () {
                return !0;
              },
              before: (function () {
                function x(K) {
                  var J = K.pa,
                    W = K.ub,
                    Z = K.selected,
                    ia = (J.h + (W ? C.$g : 0) + (Z ? C.rh : 0)) % 360,
                    la = A(J.l * K.va + (W ? C.ah : 0) + (Z ? C.sh : 0));
                  J = A(J.s * K.saturation + (W ? C.bh : 0) + (Z ? C.th : 0));
                  K = K.xe;
                  K.h = ia;
                  K.s = J;
                  K.l = la;
                  return K;
                }
                function A(K) {
                  return 100 < K ? 100 : 0 > K ? 0 : K;
                }
                var F = [
                    {
                      type: "fill",
                      na: b("polygonPlainFill"),
                      Pc: function (K, J) {
                        J.fillStyle = Ea.H(x(K));
                      },
                    },
                    {
                      type: "fill",
                      na: b("polygonGradientFill"),
                      Pc: function (K, J) {
                        var W = K.O.r,
                          Z = x(K);
                        W = J.createRadialGradient(
                          K.x,
                          K.y,
                          0,
                          K.x,
                          K.y,
                          W * C.Sg,
                        );
                        var ia = Z.l,
                          la = C.Qg;
                        W.addColorStop(
                          0,
                          Ea.i((Z.h + C.Pg) % 360, A(Z.s + C.Rg), A(ia + la)),
                        );
                        ia = Z.l;
                        la = C.Ug;
                        W.addColorStop(
                          1,
                          Ea.i((Z.h + C.Tg) % 360, A(Z.s + C.Vg), A(ia + la)),
                        );
                        K.aa.Na(J);
                        J.fillStyle = W;
                      },
                    },
                    {
                      type: "stroke",
                      na: h(b("polygonPlainStroke"), function () {
                        return 0 < C.ab;
                      }),
                      Pc: function (K, J) {
                        var W = K.pa,
                          Z = K.ub,
                          ia = K.selected,
                          la =
                            (W.h + C.Ie + (Z ? C.ze : 0) + (ia ? C.Fe : 0)) %
                            360,
                          qa = A(
                            W.s * K.saturation +
                              C.Ke +
                              (Z ? C.Be : 0) +
                              (ia ? C.He : 0),
                          );
                        W = A(
                          W.l * K.va + C.Je + (Z ? C.Ae : 0) + (ia ? C.Ge : 0),
                        );
                        J.strokeStyle = Ea.i(la, qa, W);
                        J.lineWidth = C.ab * Math.pow(C.La, K.level - 1);
                      },
                    },
                    {
                      type: "stroke",
                      na: h(b("polygonGradientStroke"), function () {
                        return 0 < C.ab;
                      }),
                      Pc: function (K, J) {
                        var W = K.O.r * C.zh,
                          Z = K.pa,
                          ia = (Math.PI * C.vh) / 180;
                        W = J.createLinearGradient(
                          K.x + W * Math.cos(ia),
                          K.y + W * Math.sin(ia),
                          K.x + W * Math.cos(ia + Math.PI),
                          K.y + W * Math.sin(ia + Math.PI),
                        );
                        var la = K.ub,
                          qa = K.selected;
                        ia =
                          (Z.h + C.Ie + (la ? C.ze : 0) + (qa ? C.Fe : 0)) %
                          360;
                        var oa = A(
                          Z.s * K.saturation +
                            C.Ke +
                            (la ? C.Be : 0) +
                            (qa ? C.He : 0),
                        );
                        Z = A(
                          Z.l * K.va + C.Je + (la ? C.Ae : 0) + (qa ? C.Ge : 0),
                        );
                        la = C.xh;
                        W.addColorStop(
                          0,
                          Ea.i((ia + C.wh) % 360, A(oa + C.yh), A(Z + la)),
                        );
                        la = C.Bh;
                        W.addColorStop(
                          1,
                          Ea.i((ia + C.Ah) % 360, A(oa + C.Ch), A(Z + la)),
                        );
                        J.strokeStyle = W;
                        J.lineWidth = C.ab * Math.pow(C.La, K.level - 1);
                      },
                    },
                  ],
                  L = Array(F.length);
                return function (K, J) {
                  for (var W = F.length - 1; 0 <= W; W--) L[W] = F[W].na(K, J);
                  this.$i = F;
                  this.wg = L;
                };
              })(),
              after: function () {},
              rb: function () {},
              Wa: function () {},
              kb: function (x, A) {
                if (
                  !(
                    !x.Ed ||
                    ((0 === x.opacity || x.open) && x.X) ||
                    x.aa.Ga() ||
                    (!C.je && x.description)
                  )
                ) {
                  var F = this.$i,
                    L = this.wg;
                  A.beginPath();
                  x.aa.Na(A);
                  for (var K = !1, J = !1, W = F.length - 1; 0 <= W; W--) {
                    var Z = F[W];
                    if (L[W])
                      switch ((Z.Pc(x, A), Z.type)) {
                        case "fill":
                          K = !0;
                          break;
                        case "stroke":
                          J = !0;
                      }
                  }
                  F = (x.X ? x.opacity : 1) * x.pa.a;
                  L = !x.empty();
                  W = C.Hf ? x.$c : 1;
                  K &&
                    ((x =
                      L && x.X && x.R && x.m[0].W
                        ? 1 -
                          (x.m.reduce(function (ia, la) {
                            return ia + la.ra * la.Hd;
                          }, 0) /
                            x.m.length) *
                            (1 - C.Ff)
                        : 1),
                    (A.globalAlpha = F * x * W),
                    ob(A));
                  J &&
                    ((A.globalAlpha = F * (L ? C.$h : 1) * W),
                    A.closePath(),
                    pb(A),
                    A.stroke());
                }
              },
            },
            {
              Ra: ["offsetPolygon"],
              na: function () {
                return 0 < C.yc;
              },
              before: function () {},
              after: function () {},
              rb: function () {},
              Wa: function () {},
              kb: function (x, A, F) {
                if (x.Ed && x.selected && !x.aa.Ga()) {
                  A.globalAlpha = x.Da;
                  A.beginPath();
                  var L = Math.pow(C.La, x.level - 1);
                  A.lineWidth = C.yc * L;
                  A.strokeStyle = C.uh;
                  var K = C.kd;
                  0 < K &&
                    ((A.shadowBlur = K * L * F * A.B), (A.shadowColor = C.De));
                  x.aa.Na(A);
                  A.closePath();
                  A.stroke();
                }
              },
            },
            {
              Ra: [],
              na: function () {
                return !0;
              },
              before: function () {},
              after: function () {},
              rb: function () {},
              Wa: function () {},
              Rh: kb,
              kb: function (x, A) {
                function F(K, J, W) {
                  var Z = wa.Ka(x.$, x.O, K / J);
                  Z = Math.min(
                    Math.min(0.9 * Z, 0.5 * x.F.o) / J,
                    (0.5 * x.F.w) / K,
                  );
                  A.save();
                  A.translate(x.x, x.y);
                  A.globalAlpha = x.opacity * x.ca;
                  A.scale(Z, Z);
                  A.translate(-K / 2, -J / 2);
                  W(A);
                  A.restore();
                }
                var L = this.Rh;
                x.attribution &&
                  !x.aa.Ga() &&
                  F(L.ke.width, L.ke.height, function (K) {
                    L.Hg(K, C.ae);
                  });
              },
            },
            {
              Ra: [],
              na: (function (x, A) {
                return function (F, L) {
                  return x(F, L) || A(F, L);
                };
              })(
                b("labelPlainFill"),
                h(b("contentDecoration"), function () {
                  return C.xc;
                }),
              ),
              before: function () {},
              after: function () {},
              rb: function () {},
              Wa: function () {},
              kb: function (x, A, F) {
                ((0 < x.opacity && 0 < x.ca && !x.open) || !x.X) &&
                  !x.aa.Ga() &&
                  ((x.Cc =
                    x.oa &&
                    x.oa.ka &&
                    C.B * x.oa.fontSize * x.scale * F >= C.oh),
                  "auto" === x.pd
                    ? !C.je && x.description
                      ? (x.fb = x.parent.fb)
                      : ((F = x.xe),
                        (A = F.h + (F.s << 9) + (F.l << 16)),
                        x.hd !== A &&
                          ((F = Ea.T(F)),
                          (x.fb = F > (0 > x.ja ? C.Dh : C.dh) ? C.eh : C.nh),
                          (x.hd = A)))
                    : (x.fb = x.pd));
              },
            },
            {
              Ra: ["custom"],
              na: h(b("contentDecoration"), function () {
                return C.xc;
              }),
              before: function () {},
              after: function () {},
              rb: function () {},
              Wa: function () {},
              kb: function (x, A) {
                !((0 < x.opacity && 0 < x.ca && !x.open) || !x.X) ||
                  x.Qb.Ga() ||
                  x.aa.Ga() ||
                  (x.Cc || void 0 === x.oa
                    ? ((A.globalAlpha =
                        x.ca * (x.X ? x.opacity : 1) * (x.empty() ? 1 : C.Gf)),
                      (A.fillStyle = x.fb),
                      (A.strokeStyle = x.fb),
                      x.Qb.Na(A))
                    : l(x, A));
              },
            },
            {
              Ra: ["label"],
              na: b("labelPlainFill"),
              before: function () {},
              after: function () {},
              rb: function () {},
              Wa: function () {},
              kb: function (x, A, F) {
                x.Ue &&
                  x.Fc &&
                  ((0 < x.opacity && 0 < x.ca && !x.open) || !x.X) &&
                  !x.aa.Ga() &&
                  x.oa &&
                  ((A.fillStyle = x.fb),
                  (A.globalAlpha =
                    x.ca * (x.X ? x.opacity : 1) * (x.empty() ? 1 : C.Gf)),
                  x.Cc ? qb(x, A, F) : l(x, A));
              },
            },
          ].reverse(),
        ),
      ];
    this.M = function () {
      t = Ma.Jh(
        function () {
          return Aa.estimate();
        },
        "CarrotSearchFoamTree",
        12096e5,
      )(sb());
      Q.M();
    };
    this.clear = function () {
      k.clearRect(0, 0, O, H);
      w.clearRect(0, 0, O, H);
    };
    var R = !1,
      V = void 0;
    this.u = function (x) {
      R ? (V = x) : x();
    };
    this.Nd = (function () {
      function x() {
        window.clearTimeout(A);
        R = !0;
        A = setTimeout(
          function () {
            R = !1;
            if (m()) {
              var L = !p();
              g(null, F.Y, w, L);
              P.defer(function () {
                fa.Xi();
                V && (V(), (V = void 0));
              });
            } else V && (V(), (V = void 0));
          },
          Math.max(C.kj, 3 * q.Xf.sd, 3 * q.Xf.rd),
        );
      }
      var A, F;
      return function (L) {
        tb(Q);
        F = d();
        var K = null !== F.ag,
          J = 0 < B.$b("hifi"),
          W = J && (K || !L);
        L = K || ha || !L;
        ha = !1;
        J && !W && fa.Yi();
        g(F.ag, F.bg, W ? w : k, L);
        Ra.za(U, function (Z) {
          Z.Z = !1;
          Z.N = !1;
          Z.Sa = !1;
        });
        W || x();
        C.Bf(K);
      };
    })();
    this.i = function (x) {
      x = x || {};
      tb(Q);
      U.N = !0;
      var A = d(),
        F = C.B;
      try {
        var L = P.I(x.pixelRatio, C.B);
        C.B = L;
        var K = B.dc("export", L, !0),
          J = K.getContext("2d");
        k === y && (J = new xa(J));
        J.scale(L, L);
        var W = P.has(x, "backgroundColor");
        W &&
          (J.save(),
          (J.fillStyle = x.backgroundColor),
          J.fillRect(0, 0, O, H),
          J.restore());
        g(W ? [] : null, A.bg, J, !0);
      } finally {
        C.B = F;
      }
      return K.toDataURL(P.I(x.format, "image/png"), P.I(x.quality, 0.8));
    };
    var fa = (function () {
      function x(L, K, J, W, Z, ia) {
        function la(ma, sa, ua, va) {
          return Y.K.A({ opacity: B.$b(ma) })
            .fa({
              duration: ua,
              P: { opacity: { end: sa, easing: va } },
              ba: function () {
                B.$b(ma, this.opacity);
              },
            })
            .done();
        }
        var qa = P.od(B.$b(L), K),
          oa = P.od(B.$b(W), Z);
        if (!qa || !oa) {
          for (var da = F.length - 1; 0 <= da; da--) F[da].stop();
          F = [];
          qa || F.push(la(L, K, J, La.Gb));
          oa || F.push(la(W, Z, ia, La.Uf));
          return Y.K.A({}).Qa(F).start();
        }
      }
      var A,
        F = [];
      return {
        Yi: function () {
          C.Zc
            ? 1 !== n.style.opacity &&
              ((n.style.visibility = "visible"),
              (v.style.visibility = "hidden"),
              (n.style.opacity = 1),
              (v.style.opacity = 0))
            : (A && A.xb()) || (A = x("wireframe", 1, C.te, "hifi", 0, C.te));
        },
        Xi: function () {
          C.Zc
            ? ((v.style.visibility = "visible"),
              (n.style.visibility = "hidden"),
              (n.style.opacity = 0),
              (v.style.opacity = 1))
            : x("hifi", 1, C.eg, "wireframe", 0, C.eg);
        },
      };
    })();
    tb = function (x) {
      x.apply();
    };
    ob = function (x) {
      x.fill();
    };
    pb = function (x) {
      x.stroke();
    };
    return this;
  }
  var ob, pb, tb;
  function mb(a) {
    function q(c) {
      "undefined" !== typeof c.groupLabelFontFamily &&
        (g.fontFamily = c.groupLabelFontFamily);
      "undefined" !== typeof c.groupLabelFontStyle &&
        (g.fontStyle = c.groupLabelFontStyle);
      "undefined" !== typeof c.groupLabelFontVariant &&
        (g.fontVariant = c.groupLabelFontVariant);
      "undefined" !== typeof c.groupLabelFontWeight &&
        (g.fontWeight = c.groupLabelFontWeight);
      "undefined" !== typeof c.groupLabelLineHeight &&
        (g.lineHeight = c.groupLabelLineHeight);
      "undefined" !== typeof c.groupLabelHorizontalPadding &&
        (g.cb = c.groupLabelHorizontalPadding);
      "undefined" !== typeof c.groupLabelVerticalPadding &&
        (g.Ua = c.groupLabelVerticalPadding);
      "undefined" !== typeof c.groupLabelMaxTotalHeight &&
        (g.ib = c.groupLabelMaxTotalHeight);
      "undefined" !== typeof c.groupLabelMaxFontSize &&
        (g.hb = c.groupLabelMaxFontSize);
    }
    var l = a.options,
      g = {},
      e = {},
      d,
      p = { groupLabel: "" },
      m = {};
    a.j.subscribe("api:initialized", function (c) {
      d = c;
    });
    a.j.subscribe("options:changed", q);
    q(a.Cd);
    this.i = function (c) {
      if (!c.$) return !1;
      var b = c.group.label;
      l.gh &&
        !c.attribution &&
        ((p.labelText = b), d.nc(l.fh, c, p), (b = p.labelText));
      c.Ve = b;
      return c.qd !== b;
    };
    this.u = function (c) {
      var b = c.Ve;
      c.qd = b;
      c.Bc.clear();
      c.oa = void 0;
      if (
        c.$ &&
        !P.Oe(b) &&
        ("flattened" !== l.mb || c.empty() || !c.R || !c.m[0].W)
      ) {
        var h = ta,
          f = h.de;
        if (l.mh) {
          m.fontFamily = g.fontFamily;
          m.fontStyle = g.fontStyle;
          m.fontVariant = g.fontVariant;
          m.fontWeight = g.fontWeight;
          m.lineHeight = g.lineHeight;
          m.horizontalPadding = g.cb;
          m.verticalPadding = g.Ua;
          m.maxTotalTextHeight = g.ib;
          m.maxFontSize = g.hb;
          d.nc(l.lh, c, m);
          e.fontFamily = m.fontFamily;
          e.fontStyle = m.fontStyle;
          e.fontVariant = m.fontVariant;
          e.fontWeight = m.fontWeight;
          e.lineHeight = m.lineHeight;
          e.cb = m.horizontalPadding;
          e.Ua = m.verticalPadding;
          e.ib = m.maxTotalTextHeight;
          e.hb = m.maxFontSize;
          var u = e;
        } else u = g;
        c.oa = f.call(
          h,
          u,
          c.Bc,
          b,
          c.$,
          c.F,
          c.O,
          !1,
          !1,
          c.Oh,
          c.O.ha,
          l.ph,
          c.Ma,
        );
      }
      c.Ma = !1;
    };
    qb = this.H = function (c, b) {
      c.Bc.Na(b);
    };
  }
  var qb;
  function nb(a) {
    function q(b, h) {
      var f = b.m,
        u = f.length,
        t,
        n = m.O.r;
      for (t = 0; t < u; t++) {
        var k = f[t];
        k.tb =
          ((180 * (Math.atan2(k.x - b.x, k.y - b.y) + h)) / Math.PI + 180) /
          360;
        k.wc = Math.min(1, Math.sqrt(wa.i(k, b)) / n);
      }
    }
    function l(b, h) {
      b = b.m;
      var f = b.length;
      if (1 === f || (2 === f && b[0].description)) b[0].tb = 0.5;
      else {
        var u = 0,
          t = Number.MAX_VALUE,
          n = Math.sin(h),
          k = Math.cos(h);
        for (h = 0; h < f; h++) {
          var r = b[h];
          var y = r.x * n + r.y * k;
          u < y && (u = y);
          t > y && (t = y);
          r.tb = y;
          r.wc = 1;
        }
        for (h = 0; h < f; h++) (r = b[h]), (r.tb = (r.tb - t) / (u - t));
      }
    }
    function g(b, h, f, u) {
      h = h[u];
      return h + (f[u] - h) * b;
    }
    var e = { radial: q, linear: l },
      d = a.options,
      p,
      m,
      c = { groupColor: null, labelColor: null };
    a.j.subscribe("model:loaded", function (b) {
      m = b;
    });
    a.j.subscribe("api:initialized", function (b) {
      p = b;
    });
    this.M = function () {};
    this.apply = function () {
      function b(z) {
        if (z.R && z.xa) {
          var E = z.m,
            D;
          if (z.Z || z.Fa || y) {
            0 === z.level
              ? u(z, (d.zi * Math.PI) / 180)
              : t(z, (d.Di * Math.PI) / 180);
            for (D = E.length - 1; 0 <= D; D--) {
              var G = E[D];
              G.Fa = !0;
              var O = G.tb,
                H = G.we;
              if (0 === z.level) {
                var B = g(O, n, k, "h");
                var M = (w + (1 - w) * G.wc) * g(O, n, k, "s");
                var Q =
                  (1 + (0 > G.ja ? v * (G.ja + 1) : v) * (1 - G.wc)) *
                  g(O, n, k, "l");
                var X = g(O, n, k, "a");
              } else
                (Q = z.pa),
                  (B = Q.h),
                  (M = Q.s),
                  (Q = h(Q.l, O, d.Ei, d.Fi)),
                  (X = z.we.a);
              H.h = B;
              H.s = M;
              H.l = Q;
              H.a = X;
              B = G.pa;
              G.attribution
                ? ((B.h = 0),
                  (B.s = 0),
                  (B.l = "light" == d.ae ? 90 : 10),
                  (B.a = 1))
                : ((B.h = H.h), (B.s = H.s), (B.l = H.l), (B.a = H.a));
              y &&
                !G.attribution &&
                ((c.groupColor = B),
                (c.labelColor = "auto"),
                p.nc(r, G, c, function (Y) {
                  Y.ratio = O;
                }),
                (G.pa = Ea.u(c.groupColor)),
                (G.pa.a = P.has(c.groupColor, "a") ? c.groupColor.a : 1),
                "auto" !== c.labelColor && (G.pd = Ea.wa(c.labelColor)));
            }
            z.Fa = !1;
          }
          for (D = E.length - 1; 0 <= D; D--) b(E[D]);
        }
      }
      function h(z, E, D, G) {
        var O = f(z + D * G);
        z = f(z - D * (1 - G));
        return O + E * (z - O);
      }
      function f(z) {
        return 0 > z ? 0 : 100 < z ? 100 : z;
      }
      var u = e[d.yi] || q,
        t = l,
        n = d.Ii,
        k = d.Bi,
        r = d.Kg,
        y = d.Lg,
        v = d.Ci,
        w = d.Gi;
      b(m);
    };
    return this;
  }
  function Za() {
    this.kc =
      this.Yd =
      this.hc =
      this.Wf =
      this.w =
      this.dg =
      this.weight =
      this.y =
      this.x =
      this.id =
        0;
    this.C = this.parent = this.m = null;
    this.F = { x: 0, y: 0, w: 0, o: 0 };
    this.J = null;
    this.qd = this.Ve = void 0;
    this.Sc = !1;
    this.wc = this.tb = 0;
    this.we = { h: 0, s: 0, l: 0, a: 0, model: "hsla" };
    this.pa = { h: 0, s: 0, l: 0, a: 0, model: "hsla" };
    this.xe = { h: 0, s: 0, l: 0, model: "hsl" };
    this.hd = -1;
    this.pd = "auto";
    this.fb = "#000";
    this.Tf = this.level = this.nd = this.index = 0;
    this.attribution = !1;
    this.ha = this.$e = 0;
    this.Y = !1;
    this.$ = null;
    this.O = { x: 0, y: 0, ha: 0, r: 0 };
    this.Fd = this.G = null;
    this.Fc =
      this.W =
      this.Sa =
      this.oc =
      this.Vd =
      this.Dd =
      this.Ma =
      this.Fa =
      this.N =
      this.Z =
      this.Ea =
      this.xa =
      this.R =
      this.Ia =
        !1;
    this.saturation =
      this.va =
      this.Da =
      this.ca =
      this.opacity =
      this.scale =
        1;
    this.ra = 0;
    this.Hd = 1;
    this.Cb = this.ja = this.yb = 0;
    this.description =
      this.selected =
      this.ub =
      this.Bd =
      this.open =
      this.U =
        !1;
    this.sb = 0;
    this.Ue = this.Ed = this.X = !0;
    this.oa = void 0;
    this.Cc = !1;
    this.Bc = new ra();
    this.aa = new ra();
    this.Qb = new ra();
    this.Oh = ta.bi();
    this.Ec = 0;
    this.$c = 1;
    this.Jc = -1;
    this.empty = function () {
      return !this.m || 0 === this.m.length;
    };
    var a = [];
    this.mc = function (e) {
      a.push(e);
    };
    this.Nc = function (e) {
      P.Jf(a, e);
    };
    var q = { scale: 1 };
    this.vd = function () {
      var e = !1;
      this.scale = 1;
      for (var d = 0; d < a.length; d++)
        (e = a[d].We(this, q) || e), (this.scale *= q.scale);
      return e;
    };
    this.Ib = function (e) {
      for (var d = 0; d < a.length; d++) a[d].Ib(this, e);
    };
    this.transformPoint = function (e, d) {
      d.x = e.x;
      d.y = e.y;
      for (e = 0; e < a.length; e++) a[e].transformPoint(this, d, d);
      return d;
    };
    this.Jb = function (e, d) {
      d.x = e.x;
      d.y = e.y;
      for (e = 0; e < a.length; e++) a[e].Jb(this, d, d);
      return d;
    };
    var l = [];
    this.qb = function (e) {
      l.push(e);
    };
    this.Mc = function (e) {
      P.Jf(l, e);
    };
    var g = { opacity: 1, saturation: 1, va: 1, ca: 1, Da: 1 };
    this.cc = function () {
      if (0 !== l.length) {
        this.Da = this.ca = this.va = this.saturation = this.opacity = 1;
        for (var e = l.length - 1; 0 <= e; e--)
          (0, l[e])(this, g),
            (this.opacity *= g.opacity),
            (this.va *= g.va),
            (this.saturation *= g.saturation),
            (this.ca *= g.ca),
            (this.Da *= g.Da);
      }
    };
  }
  function gb(a, q) {
    return q.weight > a.weight
      ? 1
      : q.weight < a.weight
        ? -1
        : a.index - q.index;
  }
  function ub(a) {
    var q = this,
      l,
      g,
      e,
      d,
      p = a.options,
      m,
      c;
    a.j.subscribe("stage:initialized", function (b, h, f, u) {
      e = f;
      d = u;
      l = b.dc("titlebar", p.B, !1);
      g = l.getContext("2d");
      g.B = p.B;
      g.scale(g.B, g.B);
      a.j.D("titlebar:initialized", q);
    });
    a.j.subscribe("stage:resized", function (b, h, f, u) {
      e = f;
      d = u;
      g.scale(g.B, g.B);
    });
    a.j.subscribe("zoom:initialized", function (b) {
      c = b;
    });
    a.j.subscribe("api:initialized", function (b) {
      m = b;
    });
    a.j.subscribe("model:loaded", function () {
      g.clearRect(0, 0, e, d);
    });
    this.update = function (b) {
      g.clearRect(0, 0, e, d);
      if (b) {
        !b.empty() && b.m[0].description && (b = b.m[0]);
        var h = p.ej,
          f = p.dj,
          u = Math.min(d / 2, p.Wd + 2 * h),
          t = u - 2 * h,
          n = e - 2 * f;
        if (!(0 >= t || 0 >= n)) {
          var k = b.Cc ? b.oa.fontSize * b.scale * c.scale() : 0,
            r = {
              titleBarText: b.qd,
              titleBarTextColor: p.$f,
              titleBarBackgroundColor: p.Zf,
              titleBarMaxFontSize: p.Wd,
              titleBarShown: k < p.Vh,
            };
          if (b.attribution)
            var y = Pa.Qf(
              "B`ssnu!Rd`sbi!Gn`lUsdd!whrt`mh{`uhno/!Busm,bmhbj!uid!mnfn!un!fn!un!iuuqr;..b`ssnurd`sbi/bnl.gn`lusdd!gns!lnsd!edu`hmr/",
            );
          else
            m.nc(p.aj, b, r, function (v) {
              v.titleBarWidth = n;
              v.titleBarHeight = t;
              v.labelFontSize = k;
              v.viewportScale = c.scale();
            }),
              (y = r.titleBarText);
          y &&
            0 !== y.length &&
            r.titleBarShown &&
            ((b = c.Uc(b.transformPoint(b, {}), {}).y > d / 2),
            (h = { x: f, y: b ? h : d - u + h, w: n, o: t }),
            (f = wa.H(h)),
            (g.fillStyle = p.Zf),
            g.fillRect(0, b ? 0 : d - u, e, u),
            (g.fillStyle = p.$f),
            ta.se(
              {
                fontFamily: p.bj || p.hh,
                fontStyle: p.Dj || p.ih,
                fontWeight: p.Fj || p.kh,
                fontVariant: p.Ej || p.jh,
                hb: p.Wd,
                Gc: p.cj,
                cb: 0,
                Ua: 0,
                ib: 1,
              },
              g,
              y,
              f,
              h,
              { x: h.x + h.w / 2, y: h.y + h.o / 2 },
              !0,
              !0,
            ).ka || g.clearRect(0, 0, e, d));
        }
      }
    };
  }
  function vb(a) {
    function q(v, w, z) {
      y = !0;
      h && h.stop();
      u && u.stop();
      return p(c.reset(v), w, z).then(function () {
        y = !1;
      });
    }
    function l(v) {
      c.update(v);
      k.N = !0;
      a.j.D("foamtree:dirty", !0);
    }
    function g(v, w) {
      return c.i((0 !== c.u() ? 0.35 : 1) * v, (0 !== c.H() ? 0.35 : 1) * w);
    }
    function e() {
      if (1 === b.ratio) {
        var v = Math.round(1e4 * c.u()) / 1e4;
        0 !== v &&
          ((f.Id = v),
          (h = r.K.jc(f)
            .fa({
              duration: 500,
              P: { x: { start: v, end: 0, easing: La.Gb } },
              ba: function () {
                c.i(f.x - f.Id, 0);
                l(1);
                f.Id = f.x;
              },
            })
            .start()));
      }
    }
    function d() {
      if (1 === b.ratio) {
        var v = Math.round(1e4 * c.H()) / 1e4;
        0 !== v &&
          ((t.Jd = v),
          (u = r.K.jc(t)
            .fa({
              duration: 500,
              P: { y: { start: v, end: 0, easing: La.Gb } },
              ba: function () {
                c.i(0, t.y - t.Jd);
                l(1);
                t.Jd = t.y;
              },
            })
            .start()));
      }
    }
    function p(v, w, z) {
      return v
        ? r.K.jc(b)
            .fa({
              duration: void 0 === w ? 700 : w,
              P: { ratio: { start: 0, end: 1, easing: z || La.Vf } },
              ba: function () {
                l(b.ratio);
              },
            })
            .Ta()
        : new Fa().resolve().promise();
    }
    function m(v) {
      return function () {
        return y ? new Fa().resolve().promise() : v.apply(this, arguments);
      };
    }
    var c = new Da(a),
      b = { ratio: 1 },
      h,
      f = { le: 0, x: 0, Id: 0 },
      u,
      t = { me: 0, y: 0, Jd: 0 },
      n = this,
      k,
      r,
      y = !1;
    a.j.subscribe("model:loaded", function (v) {
      k = v;
      c.reset(!1);
      c.update(1);
    });
    a.j.subscribe("timeline:initialized", function (v) {
      r = v;
    });
    this.M = function () {
      a.j.D("zoom:initialized", this);
    };
    this.reset = function (v, w) {
      c.Fb(1);
      return q(!0, v, w);
    };
    this.normalize = m(function (v, w) {
      c.pc(1) ? q(!1, v, w) : n.af();
    });
    this.af = function () {
      e();
      d();
    };
    this.cg = m(function (v, w, z, E) {
      return n.ic(v.F, w, z, E);
    });
    this.Nb = m(function (v, w, z, E) {
      return p(c.Nb(v, w), z, E);
    });
    this.ic = m(function (v, w, z, E) {
      return p(c.ic(v, w), z, E);
    });
    this.fj = m(function (v, w) {
      c.ic(v, w) && l(1);
    });
    this.Xh = m(function (v, w) {
      1 === b.ratio && g(v, w) && l(1);
    });
    this.rg = m(function (v, w) {
      c.Nb(v, w) && l(1);
    });
    this.qg = m(function (v, w, z, E) {
      v = 0 | c.Nb(v, w);
      (v |= g(z, E)) && l(1);
    });
    this.Yh = m(function (v, w, z) {
      1 === b.ratio &&
        ((h = r.K.jc(f)
          .fa({
            duration: v / 0.03,
            P: { le: { start: w, end: 0, easing: La.Gb } },
            ba: function () {
              c.i(f.le, 0) && l(1);
              e();
            },
          })
          .start()),
        (u = r.K.jc(t)
          .fa({
            duration: v / 0.03,
            P: { me: { start: z, end: 0, easing: La.Gb } },
            ba: function () {
              g(0, t.me) && l(1);
              d();
            },
          })
          .start()));
    });
    this.Zh = function () {
      h && 0 === c.u() && h.stop();
      u && 0 === c.H() && u.stop();
    };
    this.rc = function (v, w) {
      c.rc(v, w);
    };
    this.Fb = function (v) {
      return c.Fb(v);
    };
    this.pc = function (v) {
      return c.pc(v);
    };
    this.zd = function () {
      return c.zd();
    };
    this.absolute = function (v, w) {
      return c.absolute(v, w);
    };
    this.Uc = function (v, w) {
      return c.Uc(v, w);
    };
    this.scale = function () {
      return c.scale();
    };
    this.i = function (v) {
      return c.T(v);
    };
    this.content = function (v, w, z, E) {
      c.content(v, w, z, E);
    };
  }
  function wb(a, q, l) {
    function g(I) {
      var T = [];
      Ra.L(u, function (R) {
        I(R) && T.push(R.group);
      });
      return { groups: T };
    }
    function e(I, T) {
      var R = f.options,
        V = R.Pi,
        fa = R.Oi;
      R = R.Od;
      var x = 0 < V + fa ? R : 0,
        A = [];
      Va.u(I, Va.i(I, f.options.Qd), function (F, L, K) {
        L = "groups" === f.options.Pd ? K : L;
        F.m &&
          ((F = n.K.A(F)
            .wait(x * (fa + V * L))
            .call(T)
            .done()),
          A.push(F));
      });
      return n.K.A({}).Qa(A).Ta();
    }
    function d(I) {
      ca ||
        ((ca = !0),
        t.once(
          function () {
            ca = !1;
            f.j.D("repaint:before");
            E.Nd(this.pg);
          },
          { pg: I },
        ));
    }
    function p(I) {
      function T(A, F) {
        var L = A.W;
        A.W = F <= R;
        A.Fc = F <= V;
        A.W !== L &&
          Ra.ne(A, function (K) {
            K.Vd = !0;
          });
        A.open || A.Va || F++;
        if ((A = A.m)) for (L = 0; L < A.length; L++) T(A[L], F);
      }
      var R = f.options.Xe,
        V = Math.min(f.options.Xe, f.options.Sh);
      if (I)
        for (var fa = 0; fa < I.length; fa++) {
          var x = I[fa];
          T(x, b(x));
        }
      else T(u, 0);
    }
    function m(I, T) {
      var R = [];
      I = c(I, T);
      I.Wh && f.j.D("model:childrenAttached", Ra.uc(u));
      I.Ji &&
        z.complete(function (fa) {
          N.eb(fa);
          R.push(fa);
        });
      for (T = I = 0; T < R.length; T++) {
        var V = R[T];
        V.m && (I += V.m.length);
        V.xa = !0;
        O.i(V);
      }
      return I;
    }
    function c(I, T) {
      function R(L, K) {
        var J = !L.attribution && K - (L.Va ? 1 : 0) < V;
        x = x || J;
        L.Ia = L.Ia || J;
        L.open || L.Va || K++;
        var W = L.m;
        !W && J && ((fa = w.T(L) || fa), (W = L.m), F && (L.Ma = !0));
        if (W) for (L = 0; L < W.length; L++) A.push(W[L], K);
      }
      var V = T || f.options.Th,
        fa = !1,
        x = !1,
        A,
        F = "flattened" === q.mb;
      for (
        I
          ? (A = I.reduce(function (L, K) {
              L.push(K, 1);
              return L;
            }, []))
          : (A = [u, 1]);
        0 < A.length;

      )
        R(A.shift(), A.shift());
      return { Wh: fa, Ji: x };
    }
    function b(I) {
      for (var T = 0; I.parent; ) I.open || I.Va || T++, (I = I.parent);
      return T;
    }
    var h = this,
      f = { j: new Oa(), options: q, Cd: l },
      u,
      t = new na(),
      n = new Qa(t),
      k = ka.create(),
      r = new Ba(f),
      y = new vb(f),
      v = new Xa(f),
      w = new Ya(f.options),
      z = new hb(f),
      E = new lb(f, t),
      D = new eb(f);
    new ub(f);
    var G = new ab(f),
      O = new bb(f),
      H = new cb(f),
      B = new db(f);
    f.j.subscribe("stage:initialized", function (I, T, R, V) {
      C.Me(R, V);
    });
    f.j.subscribe("stage:resized", function (I, T, R, V) {
      C.Ni(I, T, R, V);
    });
    f.j.subscribe("foamtree:attachChildren", m);
    f.j.subscribe("openclose:changing", p);
    f.j.subscribe("interaction:reset", function () {
      S(!0);
    });
    f.j.subscribe("foamtree:dirty", d);
    this.M = function () {
      f.j.D("timeline:initialized", n);
      u = w.M();
      r.M(a);
      v.M();
      E.M();
      D.M();
      G.M();
      O.M();
      y.M();
      H.M();
      B.M();
    };
    this.Za = function () {
      n.i();
      ja.stop();
      t.i();
      r.Za();
    };
    var M =
        "groupLabelFontFamily groupLabelFontStyle groupLabelFontVariant groupLabelFontWeight groupLabelLineHeight groupLabelHorizontalPadding groupLabelVerticalPadding groupLabelDottingThreshold groupLabelMaxTotalHeight groupLabelMinFontSize groupLabelMaxFontSize groupLabelDecorator".split(
          " ",
        ),
      Q =
        "rainbowColorDistribution rainbowLightnessDistribution rainbowColorDistributionAngle rainbowLightnessDistributionAngle rainbowColorModelStartPoint rainbowLightnessCorrection rainbowSaturationCorrection rainbowStartColor rainbowEndColor rainbowHueShift rainbowHueShiftCenter rainbowSaturationShift rainbowSaturationShiftCenter rainbowLightnessShift rainbowLightnessShiftCenter attributionTheme".split(
          " ",
        ),
      X = !1,
      Y = [
        "groupBorderRadius",
        "groupBorderRadiusCorrection",
        "groupBorderWidth",
        "groupInsetWidth",
        "groupBorderWidthScaling",
      ],
      aa = ["maxGroupLevelsDrawn", "maxGroupLabelLevelsDrawn"];
    this.ig = function (I) {
      f.j.D("options:changed", I);
      P.bb(I, M) &&
        Ra.L(u, function (T) {
          T.Ma = !0;
        });
      P.bb(I, Q) && (u.Fa = !0);
      P.bb(I, Y) && (X = !0);
      P.bb(I, aa) && (p(), m());
    };
    this.reload = function () {
      U.reload();
    };
    this.jg = function (I, T) {
      P.defer(function () {
        if (X) C.Ph(I), (X = !1);
        else {
          if (T)
            for (var R = w.u(T), V = R.length - 1; 0 <= V; V--) R[V].N = !0;
          else u.N = !0;
          d(I);
        }
      });
    };
    this.ga = function () {
      r.u();
    };
    this.update = function (I) {
      I = I ? w.u(I) : [u];
      var T = I.reduce(function (R, V) {
        R[V.id] = V;
        return R;
      }, {});
      I = I.filter(function (R) {
        for (R = R.parent; R; ) {
          if (P.has(T, R.id)) return !1;
          R = R.parent;
        }
        return !0;
      });
      w.update(I);
      C.gj(I);
    };
    this.reset = function () {
      return S(!1);
    };
    this.T = E.i;
    this.Ja = (function () {
      var I = {};
      return function (T, R) {
        return (T = w.i(T)) ? v.Wc(I, T, R) : null;
      };
    })();
    this.wa = (function () {
      var I = { x: 0, y: 0 },
        T = { x: 0, y: 0 };
      return function (R, V) {
        return (R = w.i(R))
          ? ((I.x = V.x),
            (I.y = V.y),
            R.transformPoint(I, I),
            y.Uc(I, I),
            (T.x = I.x),
            (T.y = I.y),
            T)
          : null;
      };
    })();
    this.sa = (function () {
      var I = {};
      return function (T) {
        return (T = w.i(T)) ? v.Yc(I, T) : null;
      };
    })();
    this.hg = (function () {
      var I = {};
      return function (T) {
        return (T = w.i(T)) ? v.Xc(I, T) : null;
      };
    })();
    this.ta = (function () {
      var I = {};
      return function () {
        return y.i(I);
      };
    })();
    this.lg = function () {
      this.H({
        groups: g(function (I) {
          return I.group.selected;
        }),
        newState: !0,
        keepPrevious: !1,
      });
      this.u({
        groups: g(function (I) {
          return I.group.open;
        }),
        newState: !0,
        keepPrevious: !1,
      });
      this.i({
        groups: g(function (I) {
          return I.group.exposed;
        }),
        newState: !0,
        keepPrevious: !1,
      });
    };
    this.Ka = function () {
      return g(function (I) {
        return I.U;
      });
    };
    this.i = function (I) {
      return U.submit(function () {
        return G.Vb(w.H(I, "exposed", !1), !1, !0, !1);
      });
    };
    this.pb = function () {
      return g(function (I) {
        return I.open;
      });
    };
    this.u = function (I) {
      return U.submit(function () {
        return H.Bb(w.H(I, "open", !0), !1, !1);
      });
    };
    this.Lb = function () {
      return g(function (I) {
        return I.selected;
      });
    };
    this.H = function (I) {
      return U.submit(function () {
        B.select(w.H(I, "selected", !0), !1);
        return new Fa().resolve().promise();
      });
    };
    this.ng = function (I) {
      return (I = w.i(I))
        ? I === u
          ? y.reset(q.ob, La.ia(q.Kb))
          : y.cg(I, q.Yb, q.ob, La.ia(q.Kb))
        : new Fa().resolve().promise();
    };
    this.ua = function (I, T) {
      return (I = w.u(I)) ? ((T = m(I, T)), p(I), T) : 0;
    };
    this.Vc = function (I) {
      return D.Lb[I];
    };
    this.mg = function () {
      var I = pa;
      return {
        frames: I.frames,
        totalTime: I.totalTime,
        lastFrameTime: I.rd,
        lastInterFrameTime: I.sd,
        fps: I.ve,
      };
    };
    var C = (function () {
        function I(fa, x) {
          var A = fa || R,
            F = x || V;
          R = A;
          V = F;
          (fa = q.Rb && q.Rb.boundary) && 2 < fa.length
            ? (u.C = fa.map(function (L) {
                return { x: A * L.x, y: F * L.y };
              }))
            : (u.C = [
                { x: 0, y: 0 },
                { x: A, y: 0 },
                { x: A, y: F },
                { x: 0, y: F },
              ]);
          T();
        }
        function T() {
          u.Z = !0;
          u.G = u.C;
          u.F = wa.F(u.C, u.F);
          u.O = u;
          wa.Ja(u.C, u.O);
        }
        var R, V;
        return {
          Me: I,
          Ni: function (fa, x, A, F) {
            N.stop();
            var L = A / fa,
              K = F / x;
            Ra.oe(u, function (J) {
              J.x = J.x * L + ((Math.random() - 0.5) * A) / 1e3;
              J.y = J.y * K + ((Math.random() - 0.5) * F) / 1e3;
            });
            I(A, F);
            u.Ea = !0;
            z.step(N.eb, !0, !1, function (J) {
              var W = J.m;
              if (W) {
                z.Eb(J);
                for (var Z = W.length - 1; 0 <= Z; Z--) {
                  var ia = W[Z];
                  ia.w = ia.hc;
                }
                J.Ea = !0;
              }
            })
              ? d(!1)
              : (z.fc(u),
                f.options.Md
                  ? (d(!1), ja.Kf(), ja.Oc())
                  : (z.complete(N.eb), (u.Fa = !0), d(!1)));
          },
          Ph: function (fa) {
            var x = !1;
            u.empty() || (T(), ja.xb() || ((x = z.step(N.eb, !1, !1)), d(fa)));
            return x;
          },
          gj: function (fa) {
            fa.forEach(function (x) {
              Ra.za(x, function (A) {
                A.empty() || z.Eb(A);
              });
              z.fc(x);
              f.options.Md
                ? (ja.Kf(),
                  Ra.za(x, function (A) {
                    A.empty() || N.grow(A);
                  }))
                : (Ra.za(x, function (A) {
                    A.empty() || N.eb(A);
                  }),
                  z.complete(N.eb),
                  (x.Fa = !0),
                  d(!1));
            });
          },
        };
      })(),
      U = (function () {
        function I() {
          0 === q.Gd && y.reset(0);
          f.options.Af(q.Rb);
          C.Me();
          w.load(q.Rb);
          c();
          p();
          f.j.D("model:loaded", u, Ra.uc(u));
          if (!u.empty()) {
            u.open = !0;
            u.Ia = !0;
            if (q.Md) var F = ja.Oc();
            else ja.ai(), (F = V());
            T();
            0 < q.Od ? (E.clear(), r.i(1)) : (F = Ga([F, R(1)]));
          }
          f.options.zf(q.Rb);
          F &&
            (f.options.Df(),
            F.then(function () {
              E.u(function () {
                t.once(f.options.Cf);
              });
            }));
        }
        function T() {
          var F = q.Oa,
            L = q.Kc;
          q.Oa = 0;
          q.Kc = 0;
          h.lg();
          q.Oa = F;
          q.Kc = L;
        }
        function R(F, L) {
          return 0 === q.re || L
            ? (r.i(F), new Fa().resolve().promise())
            : n.K.A({ opacity: r.i() })
                .Xd(2)
                .fa({
                  duration: q.re,
                  P: { opacity: { end: F, easing: La.ia(q.Dg) } },
                  ba: function () {
                    r.i(this.opacity);
                  },
                })
                .Ta();
        }
        function V() {
          Ra.za(u, function (K) {
            K.xa = !1;
          });
          var F = new Fa(),
            L = new Ha(F.resolve);
          L.i();
          u.xa = !0;
          O.i(u).then(L.u);
          e(u, function J() {
            this.R &&
              this.C &&
              ((this.Z = this.xa = !0),
              L.i(),
              O.i(this).then(L.u),
              L.i(),
              e(this, J).then(L.u));
          });
          return F.promise();
        }
        function fa() {
          for (var F = 0; F < A.length; F++) {
            var L = A[F],
              K = L.action();
            P.has(K, "then") ? K.then(L.ge.resolve) : L.ge.resolve();
          }
          A = [];
        }
        var x = !1,
          A = [];
        return {
          reload: function () {
            x ||
              (u.empty()
                ? I()
                : (N.stop(),
                  n.i(),
                  ja.stop(),
                  (x = !0),
                  Ga(0 < q.Gd ? [O.u(), S(!1)] : [R(0)]).then(function () {
                    R(0, !0);
                    x = !1;
                    I();
                    P.defer(fa);
                  })));
          },
          submit: function (F) {
            if (x) {
              var L = new Fa();
              A.push({ action: F, ge: L });
              return L.promise();
            }
            return F();
          },
        };
      })(),
      ha,
      ba = new Ha(function () {
        ha.resolve();
      }),
      ja = (function () {
        function I() {
          V ||
            (ba.initial() && (ha = new Fa()),
            ba.i(),
            T(),
            (V = !0),
            t.repeat(R));
          return ha.promise();
        }
        function T() {
          fa = k.now();
        }
        function R() {
          var x = k.now() - fa > q.Mi;
          x =
            z.step(
              function (A) {
                A.xa = !0;
                N.grow(A);
                ba.i();
                O.i(A).then(ba.u);
                ba.i();
                e(A, function () {
                  this.Ia = !0;
                  I();
                }).then(ba.u);
              },
              !0,
              x,
            ) || x;
          d(!0);
          x && ((V = !1), ba.u());
          return x;
        }
        var V = !1,
          fa;
        return {
          ai: function () {
            z.complete(N.eb);
          },
          Oc: I,
          Kf: T,
          xb: function () {
            return !ba.initial();
          },
          stop: function () {
            t.cancel(R);
            V = !1;
            ba.clear();
          },
        };
      })(),
      N = (function () {
        function I(R) {
          var V = !R.empty();
          R.xa = !0;
          if (V) {
            for (var fa = R.m, x = fa.length - 1; 0 <= x; x--) {
              var A = fa[x];
              A.w = A.hc;
            }
            R.Ea = !0;
          }
          return V;
        }
        var T = [];
        return {
          grow: function (R) {
            var V = f.options,
              fa = V.Yg;
            0 < fa
              ? Va.u(R, Va.i(R, f.options.Qd), function (x, A, F) {
                  A = "groups" === f.options.Pd ? F : A;
                  ba.i();
                  T.push(
                    n.K.A(x)
                      .wait(A * V.Xg * fa)
                      .fa({
                        duration: fa,
                        P: {
                          w: { start: x.Wf, end: x.hc, easing: La.ia(V.Zg) },
                        },
                        ba: function () {
                          this.w = Math.max(0, this.w);
                          this.parent.Ea = !0;
                          ja.Oc();
                        },
                      })
                      .Xa(ba.u)
                      .start(),
                  );
                })
              : I(R) && ja.Oc();
          },
          eb: I,
          stop: function () {
            for (var R = T.length - 1; 0 <= R; R--) T[R].stop();
            T = [];
          },
        };
      })(),
      S = (function () {
        var I = !1;
        return function (T) {
          if (I) return new Fa().resolve().promise();
          I = !0;
          var R = [];
          R.push(y.reset(q.ob, La.ia(q.Kb)));
          var V = new Fa();
          G.Vb({ m: [], Ca: !1, Ba: !1 }, T, !1, !0).then(function () {
            H.Bb({ m: [], Ca: !1, Ba: !1 }, T, !1).then(V.resolve);
          });
          R.push(V.promise());
          return Ga(R).then(function () {
            I = !1;
            T && q.Ef();
          });
        };
      })(),
      ca = !1;
  }
  function sb() {
    return {
      version: "3.5.1",
      build: "bugfix/3.5.x/26b14206",
      brandingAllowed: !1,
    };
  }
  ea.md(
    function () {
      window.CarrotSearchFoamTree = function (a) {
        function q(u, t) {
          if (!m || m.exists(u))
            switch (u) {
              case "selection":
                return h.Lb();
              case "open":
                return h.pb();
              case "exposure":
                return h.Ka();
              case "state":
                return h.sa.apply(this, t);
              case "geometry":
                return h.Ja.apply(this, t);
              case "hierarchy":
                return h.hg.apply(this, t);
              case "containerCoordinates":
                return h.wa.apply(this, t);
              case "imageData":
                return h.T.apply(this, t);
              case "viewport":
                return h.ta();
              case "times":
                return h.mg();
              case "onModelChanged":
              case "onRedraw":
              case "onRolloutStart":
              case "onRolloutComplete":
              case "onRelaxationStep":
              case "onGroupHover":
              case "onGroupOpenOrCloseChanging":
              case "onGroupExposureChanging":
              case "onGroupSelectionChanging":
              case "onGroupSelectionChanged":
              case "onGroupClick":
              case "onGroupDoubleClick":
              case "onGroupHold":
                return (u = c[u]), Array.isArray(u) ? u : [u];
              default:
                return c[u];
            }
        }
        function l(u) {
          function t(y, v) {
            return P.has(n, y) ? (v(n[y]), delete n[y], 1) : 0;
          }
          if (0 === arguments.length) return 0;
          if (1 === arguments.length) var n = P.extend({}, arguments[0]);
          else
            2 === arguments.length &&
              ((n = {}), (n[arguments[0]] = arguments[1]));
          m && m.validate(n, b.Qh);
          var k = 0;
          h &&
            ((k += t("selection", h.H)),
            (k += t("open", h.u)),
            (k += t("exposure", h.i)));
          var r = {};
          P.Aa(n, function (y, v) {
            if (c[v] !== y || P.wb(y)) (r[v] = y), k++;
            c[v] = y;
          });
          0 < k && e(r);
          return k;
        }
        function g(u, t) {
          u = "on" + u.charAt(0).toUpperCase() + u.slice(1);
          var n = c[u];
          c[u] = t(Array.isArray(n) ? n : [n]);
          t = {};
          t[u] = c[u];
          e(t);
        }
        function e(u) {
          (function () {
            function t(n, k) {
              return P.has(u, n) || void 0 === k ? Na.A(c[n], p) : k;
            }
            b.Qh = c.logging;
            b.Rb = c.dataObject;
            b.B = c.pixelRatio;
            b.nb = c.wireframePixelRatio;
            b.mb = c.stacking;
            b.Ag = c.descriptionGroup;
            b.Tb = c.descriptionGroupType;
            b.qc = c.descriptionGroupPosition;
            b.Bg = c.descriptionGroupDistanceFromCenter;
            b.Sb = c.descriptionGroupSize;
            b.ie = c.descriptionGroupMinHeight;
            b.he = c.descriptionGroupMaxHeight;
            b.je = c.descriptionGroupPolygonDrawn;
            b.Dc = c.layout;
            b.ac = c.layoutByWeightOrder;
            b.Zi = c.showZeroWeightGroups;
            b.Ce = c.groupMinDiameter;
            b.Ld = c.rectangleAspectRatioPreference;
            b.Li = c.initializer || c.relaxationInitializer;
            b.Mi = c.relaxationMaxDuration;
            b.Md = c.relaxationVisible;
            b.If = c.relaxationQualityThreshold;
            b.qh = c.groupResizingBudget;
            b.Yg = c.groupGrowingDuration;
            b.Xg = c.groupGrowingDrag;
            b.Zg = c.groupGrowingEasing;
            b.Ig = c.groupBorderRadius;
            b.$a = c.groupBorderWidth;
            b.La = c.groupBorderWidthScaling;
            b.jd = c.groupInsetWidth;
            b.Jg = c.groupBorderRadiusCorrection;
            b.ab = c.groupStrokeWidth;
            b.yc = c.groupSelectionOutlineWidth;
            b.uh = c.groupSelectionOutlineColor;
            b.kd = c.groupSelectionOutlineShadowSize;
            b.De = c.groupSelectionOutlineShadowColor;
            b.rh = c.groupSelectionFillHueShift;
            b.th = c.groupSelectionFillSaturationShift;
            b.sh = c.groupSelectionFillLightnessShift;
            b.Fe = c.groupSelectionStrokeHueShift;
            b.He = c.groupSelectionStrokeSaturationShift;
            b.Ge = c.groupSelectionStrokeLightnessShift;
            b.Wg = c.groupFillType;
            b.Sg = c.groupFillGradientRadius;
            b.Pg = c.groupFillGradientCenterHueShift;
            b.Rg = c.groupFillGradientCenterSaturationShift;
            b.Qg = c.groupFillGradientCenterLightnessShift;
            b.Tg = c.groupFillGradientRimHueShift;
            b.Vg = c.groupFillGradientRimSaturationShift;
            b.Ug = c.groupFillGradientRimLightnessShift;
            b.ld = c.groupStrokeType;
            b.ab = c.groupStrokeWidth;
            b.Ie = c.groupStrokePlainHueShift;
            b.Ke = c.groupStrokePlainSaturationShift;
            b.Je = c.groupStrokePlainLightnessShift;
            b.zh = c.groupStrokeGradientRadius;
            b.vh = c.groupStrokeGradientAngle;
            b.Ah = c.groupStrokeGradientUpperHueShift;
            b.Ch = c.groupStrokeGradientUpperSaturationShift;
            b.Bh = c.groupStrokeGradientUpperLightnessShift;
            b.wh = c.groupStrokeGradientLowerHueShift;
            b.yh = c.groupStrokeGradientLowerSaturationShift;
            b.xh = c.groupStrokeGradientLowerLightnessShift;
            b.$g = c.groupHoverFillHueShift;
            b.bh = c.groupHoverFillSaturationShift;
            b.ah = c.groupHoverFillLightnessShift;
            b.ze = c.groupHoverStrokeHueShift;
            b.Be = c.groupHoverStrokeSaturationShift;
            b.Ae = c.groupHoverStrokeLightnessShift;
            b.Pa = c.groupExposureScale;
            b.Og = c.groupExposureShadowColor;
            b.ye = c.groupExposureShadowSize;
            b.Yb = c.groupExposureZoomMargin;
            b.Eh = c.groupUnexposureLightnessShift;
            b.Fh = c.groupUnexposureSaturationShift;
            b.Dh = c.groupUnexposureLabelColorThreshold;
            b.Oa = c.exposeDuration;
            b.Wb = c.exposeEasing;
            b.Kc = c.openCloseDuration;
            b.Kg = Na.A(c.groupColorDecorator, p);
            b.Lg = c.groupColorDecorator !== P.qa;
            b.fh = Na.A(c.groupLabelDecorator, p);
            b.gh = c.groupLabelDecorator !== P.qa;
            b.lh = Na.A(c.groupLabelLayoutDecorator, p);
            b.mh = c.groupLabelLayoutDecorator !== P.qa;
            b.Mg = Na.A(c.groupContentDecorator, p);
            b.xc = c.groupContentDecorator !== P.qa;
            b.Ng = c.groupContentDecoratorTriggering;
            b.Hi = c.rainbowStartColor;
            b.Ai = c.rainbowEndColor;
            b.yi = c.rainbowColorDistribution;
            b.zi = c.rainbowColorDistributionAngle;
            b.Di = c.rainbowLightnessDistributionAngle;
            b.Ei = c.rainbowLightnessShift;
            b.Fi = c.rainbowLightnessShiftCenter;
            b.Gi = c.rainbowSaturationCorrection;
            b.Ci = c.rainbowLightnessCorrection;
            b.Ff = c.parentFillOpacity;
            b.$h = c.parentStrokeOpacity;
            b.Gf = c.parentLabelOpacity;
            b.Hf = c.parentOpacityBalancing;
            b.ph = c.groupLabelUpdateThreshold;
            b.hh = c.groupLabelFontFamily;
            b.ih = c.groupLabelFontStyle;
            b.jh = c.groupLabelFontVariant;
            b.kh = c.groupLabelFontWeight;
            b.oh = c.groupLabelMinFontSize;
            b.vj = c.groupLabelMaxFontSize;
            b.uj = c.groupLabelLineHeight;
            b.tj = c.groupLabelHorizontalPadding;
            b.xj = c.groupLabelVerticalPadding;
            b.wj = c.groupLabelMaxTotalHeight;
            b.eh = c.groupLabelDarkColor;
            b.nh = c.groupLabelLightColor;
            b.dh = c.groupLabelColorThreshold;
            b.ij = c.wireframeDrawMaxDuration;
            b.jj = c.wireframeLabelDrawing;
            b.hj = c.wireframeContentDecorationDrawing;
            b.eg = c.wireframeToFinalFadeDuration;
            b.kj = c.wireframeToFinalFadeDelay;
            b.Eg = c.finalCompleteDrawMaxDuration;
            b.Fg = c.finalIncrementalDrawMaxDuration;
            b.te = c.finalToWireframeFadeDuration;
            b.Zc = c.androidStockBrowserWorkaround;
            b.Le = c.incrementalDraw;
            b.Uh = c.maxGroups;
            b.Th = c.maxGroupLevelsAttached;
            b.Xe = c.maxGroupLevelsDrawn;
            b.Sh = c.maxGroupLabelLevelsDrawn;
            b.Qd = c.rolloutStartPoint;
            b.Pd = c.rolloutMethod;
            b.Qi = c.rolloutEasing;
            b.Od = c.rolloutDuration;
            b.Mf = c.rolloutScalingStrength;
            b.Of = c.rolloutTranslationXStrength;
            b.Pf = c.rolloutTranslationYStrength;
            b.Lf = c.rolloutRotationStrength;
            b.Nf = c.rolloutTransformationCenter;
            b.Ui = c.rolloutPolygonDrag;
            b.Vi = c.rolloutPolygonDuration;
            b.Ri = c.rolloutLabelDelay;
            b.Si = c.rolloutLabelDrag;
            b.Ti = c.rolloutLabelDuration;
            b.Pi = c.rolloutChildGroupsDrag;
            b.Oi = c.rolloutChildGroupsDelay;
            b.ri = c.pullbackStartPoint;
            b.ki = c.pullbackMethod;
            b.gi = c.pullbackEasing;
            b.Bj = c.pullbackType;
            b.Gd = c.pullbackDuration;
            b.pi = c.pullbackScalingStrength;
            b.ti = c.pullbackTranslationXStrength;
            b.ui = c.pullbackTranslationYStrength;
            b.oi = c.pullbackRotationStrength;
            b.si = c.pullbackTransformationCenter;
            b.li = c.pullbackPolygonDelay;
            b.mi = c.pullbackPolygonDrag;
            b.ni = c.pullbackPolygonDuration;
            b.hi = c.pullbackLabelDelay;
            b.ii = c.pullbackLabelDrag;
            b.ji = c.pullbackLabelDuration;
            b.di = c.pullbackChildGroupsDelay;
            b.ei = c.pullbackChildGroupsDrag;
            b.fi = c.pullbackChildGroupsDuration;
            b.re = c.fadeDuration;
            b.Dg = c.fadeEasing;
            b.lj = c.zoomMouseWheelFactor;
            b.ob = c.zoomMouseWheelDuration;
            b.Kb = c.zoomMouseWheelEasing;
            b.Vh = c.maxLabelSizeForTitleBar;
            b.bj = c.titleBarFontFamily;
            b.Zf = c.titleBarBackgroundColor;
            b.$f = c.titleBarTextColor;
            b.cj = c.titleBarMinFontSize;
            b.Wd = c.titleBarMaxFontSize;
            b.dj = c.titleBarTextPaddingLeftRight;
            b.ej = c.titleBarTextPaddingTopBottom;
            b.aj = c.titleBarDecorator;
            b.pj = c.attributionText;
            b.mj = c.attributionLogo;
            b.oj = c.attributionLogoScale;
            b.qj = c.attributionUrl;
            b.$d = c.attributionPosition;
            b.sg = c.attributionDistanceFromCenter;
            b.tg = c.attributionWeight;
            b.ae = c.attributionTheme;
            b.Ne = c.interactionHandler;
            b.Af = t("onModelChanging", b.Af);
            b.zf = t("onModelChanged", b.zf);
            b.Bf = t("onRedraw", b.Bf);
            b.Df = t("onRolloutStart", b.Df);
            b.Cf = t("onRolloutComplete", b.Cf);
            b.Ad = t("onRelaxationStep", b.Ad);
            b.Ef = t("onViewReset", b.Ef);
            b.sf = t("onGroupOpenOrCloseChanging", b.sf);
            b.rf = t("onGroupOpenOrCloseChanged", b.rf);
            b.jf = t("onGroupExposureChanging", b.jf);
            b.hf = t("onGroupExposureChanged", b.hf);
            b.uf = t("onGroupSelectionChanging", b.uf);
            b.tf = t("onGroupSelectionChanged", b.tf);
            b.lf = t("onGroupHover", b.lf);
            b.nf = t("onGroupMouseMove", b.nf);
            b.cf = t("onGroupClick", b.cf);
            b.df = t("onGroupDoubleClick", b.df);
            b.kf = t("onGroupHold", b.kf);
            b.qf = t("onGroupMouseWheel", b.qf);
            b.pf = t("onGroupMouseUp", b.pf);
            b.mf = t("onGroupMouseDown", b.mf);
            b.gf = t("onGroupDragStart", b.gf);
            b.ef = t("onGroupDrag", b.ef);
            b.ff = t("onGroupDragEnd", b.ff);
            b.xf = t("onGroupTransformStart", b.xf);
            b.vf = t("onGroupTransform", b.vf);
            b.wf = t("onGroupTransformEnd", b.wf);
            b.yf = t("onKeyUp", b.yf);
          })();
          b.Ii = Ea.u(b.Hi);
          b.Bi = Ea.u(b.Ai);
          b.Ee = Ea.u(b.De);
          b.nj = null;
          h && (h.ig(u), P.has(u, "dataObject") && h.reload());
        }
        function d(u) {
          return function () {
            return u.apply(this, arguments).Gg(p);
          };
        }
        var p = this,
          m = window.CarrotSearchFoamTree.asserts,
          c = P.extend({}, window.CarrotSearchFoamTree.defaults),
          b = {};
        l(a);
        (a = c.element || document.getElementById(c.id)) ||
          Ca.i("Element to embed FoamTree in not found.");
        c.element = a;
        var h = new wb(a, b, c);
        h.M();
        var f = {
          get: function (u) {
            return 0 === arguments.length
              ? P.extend({}, c)
              : q(arguments[0], Array.prototype.slice.call(arguments, 1));
          },
          set: l,
          on: function (u, t) {
            g(u, function (n) {
              n.push(t);
              return n;
            });
          },
          off: function (u, t) {
            g(u, function (n) {
              return n.filter(function (k) {
                return k !== t;
              });
            });
          },
          resize: h.ga,
          redraw: h.jg,
          update: h.update,
          attach: h.ua,
          select: d(h.H),
          expose: d(h.i),
          open: d(h.u),
          reset: d(h.reset),
          zoom: d(h.ng),
          trigger: function (u, t) {
            (u = h.Vc(u)) && u(t);
          },
          dispose: function () {
            function u() {
              throw "FoamTree instance disposed";
            }
            h.Za();
            P.Aa(f, function (t, n) {
              "dispose" !== n && (p[n] = u);
            });
          },
        };
        P.Aa(f, function (u, t) {
          p[t] = u;
        });
        h.reload();
      };
      window["CarrotSearchFoamTree.asserts"] &&
        ((window.CarrotSearchFoamTree.asserts =
          window["CarrotSearchFoamTree.asserts"]),
        delete window["CarrotSearchFoamTree.asserts"]);
      window.CarrotSearchFoamTree.supported = !0;
      window.CarrotSearchFoamTree.version = sb;
      window.CarrotSearchFoamTree.defaults = Object.freeze({
        id: void 0,
        element: void 0,
        logging: !1,
        dataObject: void 0,
        pixelRatio: 1,
        wireframePixelRatio: 1,
        layout: "relaxed",
        layoutByWeightOrder: !0,
        showZeroWeightGroups: !0,
        groupMinDiameter: 10,
        rectangleAspectRatioPreference: -1,
        relaxationInitializer: "fisheye",
        relaxationMaxDuration: 3e3,
        relaxationVisible: !1,
        relaxationQualityThreshold: 1,
        stacking: "hierarchical",
        descriptionGroup: "auto",
        descriptionGroupType: "stab",
        descriptionGroupPosition: 225,
        descriptionGroupDistanceFromCenter: 1,
        descriptionGroupSize: 0.125,
        descriptionGroupMinHeight: 35,
        descriptionGroupMaxHeight: 0.5,
        descriptionGroupPolygonDrawn: !1,
        maxGroups: 5e4,
        maxGroupLevelsAttached: 4,
        maxGroupLevelsDrawn: 4,
        maxGroupLabelLevelsDrawn: 3,
        groupGrowingDuration: 0,
        groupGrowingEasing: "bounce",
        groupGrowingDrag: 0,
        groupResizingBudget: 2,
        groupBorderRadius: 0.15,
        groupBorderWidth: 4,
        groupBorderWidthScaling: 0.6,
        groupInsetWidth: 6,
        groupBorderRadiusCorrection: 1,
        groupSelectionOutlineWidth: 5,
        groupSelectionOutlineColor: "#222",
        groupSelectionOutlineShadowSize: 0,
        groupSelectionOutlineShadowColor: "#fff",
        groupSelectionFillHueShift: 0,
        groupSelectionFillSaturationShift: 0,
        groupSelectionFillLightnessShift: 0,
        groupSelectionStrokeHueShift: 0,
        groupSelectionStrokeSaturationShift: 0,
        groupSelectionStrokeLightnessShift: -10,
        groupFillType: "gradient",
        groupFillGradientRadius: 1,
        groupFillGradientCenterHueShift: 0,
        groupFillGradientCenterSaturationShift: 0,
        groupFillGradientCenterLightnessShift: 20,
        groupFillGradientRimHueShift: 0,
        groupFillGradientRimSaturationShift: 0,
        groupFillGradientRimLightnessShift: -5,
        groupStrokeType: "plain",
        groupStrokeWidth: 1.5,
        groupStrokePlainHueShift: 0,
        groupStrokePlainSaturationShift: 0,
        groupStrokePlainLightnessShift: -10,
        groupStrokeGradientRadius: 1,
        groupStrokeGradientAngle: 45,
        groupStrokeGradientUpperHueShift: 0,
        groupStrokeGradientUpperSaturationShift: 0,
        groupStrokeGradientUpperLightnessShift: 20,
        groupStrokeGradientLowerHueShift: 0,
        groupStrokeGradientLowerSaturationShift: 0,
        groupStrokeGradientLowerLightnessShift: -20,
        groupHoverFillHueShift: 0,
        groupHoverFillSaturationShift: 0,
        groupHoverFillLightnessShift: 20,
        groupHoverStrokeHueShift: 0,
        groupHoverStrokeSaturationShift: 0,
        groupHoverStrokeLightnessShift: -10,
        groupExposureScale: 1.15,
        groupExposureShadowColor: "rgba(0, 0, 0, 0.5)",
        groupExposureShadowSize: 50,
        groupExposureZoomMargin: 0.1,
        groupUnexposureLightnessShift: 65,
        groupUnexposureSaturationShift: -65,
        groupUnexposureLabelColorThreshold: 0.35,
        exposeDuration: 700,
        exposeEasing: "squareInOut",
        groupColorDecorator: P.qa,
        groupLabelDecorator: P.qa,
        groupLabelLayoutDecorator: P.qa,
        groupContentDecorator: P.qa,
        groupContentDecoratorTriggering: "onLayoutDirty",
        openCloseDuration: 500,
        rainbowColorDistribution: "radial",
        rainbowColorDistributionAngle: -45,
        rainbowLightnessDistributionAngle: 45,
        rainbowSaturationCorrection: 0.1,
        rainbowLightnessCorrection: 0.4,
        rainbowStartColor: "hsla(0, 100%, 55%, 1)",
        rainbowEndColor: "hsla(359, 100%, 55%, 1)",
        rainbowLightnessShift: 30,
        rainbowLightnessShiftCenter: 0.4,
        parentFillOpacity: 0.7,
        parentStrokeOpacity: 1,
        parentLabelOpacity: 1,
        parentOpacityBalancing: !0,
        wireframeDrawMaxDuration: 15,
        wireframeLabelDrawing: "auto",
        wireframeContentDecorationDrawing: "auto",
        wireframeToFinalFadeDuration: 500,
        wireframeToFinalFadeDelay: 300,
        finalCompleteDrawMaxDuration: 80,
        finalIncrementalDrawMaxDuration: 100,
        finalToWireframeFadeDuration: 200,
        androidStockBrowserWorkaround: !1,
        incrementalDraw: "fast",
        groupLabelFontFamily: "sans-serif",
        groupLabelFontStyle: "normal",
        groupLabelFontWeight: "normal",
        groupLabelFontVariant: "normal",
        groupLabelLineHeight: 1.05,
        groupLabelHorizontalPadding: 1,
        groupLabelVerticalPadding: 1,
        groupLabelMinFontSize: 6,
        groupLabelMaxFontSize: 160,
        groupLabelMaxTotalHeight: 0.9,
        groupLabelUpdateThreshold: 0.05,
        groupLabelDarkColor: "#000",
        groupLabelLightColor: "#fff",
        groupLabelColorThreshold: 0.35,
        rolloutStartPoint: "center",
        rolloutEasing: "squareOut",
        rolloutMethod: "groups",
        rolloutDuration: 2e3,
        rolloutScalingStrength: -0.7,
        rolloutTranslationXStrength: 0,
        rolloutTranslationYStrength: 0,
        rolloutRotationStrength: -0.7,
        rolloutTransformationCenter: 0.7,
        rolloutPolygonDrag: 0.1,
        rolloutPolygonDuration: 0.5,
        rolloutLabelDelay: 0.8,
        rolloutLabelDrag: 0.1,
        rolloutLabelDuration: 0.5,
        rolloutChildGroupsDrag: 0.1,
        rolloutChildGroupsDelay: 0.2,
        pullbackStartPoint: "center",
        pullbackEasing: "squareIn",
        pullbackMethod: "groups",
        pullbackDuration: 1500,
        pullbackScalingStrength: -0.7,
        pullbackTranslationXStrength: 0,
        pullbackTranslationYStrength: 0,
        pullbackRotationStrength: -0.7,
        pullbackTransformationCenter: 0.7,
        pullbackPolygonDelay: 0.3,
        pullbackPolygonDrag: 0.1,
        pullbackPolygonDuration: 0.8,
        pullbackLabelDelay: 0,
        pullbackLabelDrag: 0.1,
        pullbackLabelDuration: 0.3,
        pullbackChildGroupsDelay: 0.1,
        pullbackChildGroupsDrag: 0.1,
        pullbackChildGroupsDuration: 0.3,
        fadeDuration: 700,
        fadeEasing: "cubicInOut",
        zoomMouseWheelFactor: 1.5,
        zoomMouseWheelDuration: 500,
        zoomMouseWheelEasing: "squareOut",
        maxLabelSizeForTitleBar: 8,
        titleBarFontFamily: null,
        titleBarFontStyle: "normal",
        titleBarFontWeight: "normal",
        titleBarFontVariant: "normal",
        titleBarBackgroundColor: "rgba(0, 0, 0, 0.5)",
        titleBarTextColor: "rgba(255, 255, 255, 1)",
        titleBarMinFontSize: 10,
        titleBarMaxFontSize: 40,
        titleBarTextPaddingLeftRight: 20,
        titleBarTextPaddingTopBottom: 15,
        titleBarDecorator: P.qa,
        attributionText: null,
        attributionLogo: null,
        attributionLogoScale: 0.5,
        attributionUrl: "http://carrotsearch.com/foamtree",
        attributionPosition: "bottomright",
        attributionDistanceFromCenter: 1,
        attributionWeight: 0.025,
        attributionTheme: "light",
        interactionHandler: ea.Ih() ? "hammerjs" : "builtin",
        onModelChanging: [],
        onModelChanged: [],
        onRedraw: [],
        onRolloutStart: [],
        onRolloutComplete: [],
        onRelaxationStep: [],
        onViewReset: [],
        onGroupOpenOrCloseChanging: [],
        onGroupOpenOrCloseChanged: [],
        onGroupExposureChanging: [],
        onGroupExposureChanged: [],
        onGroupSelectionChanging: [],
        onGroupSelectionChanged: [],
        onGroupHover: [],
        onGroupMouseMove: [],
        onGroupClick: [],
        onGroupDoubleClick: [],
        onGroupHold: [],
        onGroupMouseWheel: [],
        onGroupMouseUp: [],
        onGroupMouseDown: [],
        onGroupDragStart: [],
        onGroupDrag: [],
        onGroupDragEnd: [],
        onGroupTransformStart: [],
        onGroupTransform: [],
        onGroupTransformEnd: [],
        onKeyUp: [],
        selection: null,
        open: null,
        exposure: null,
        imageData: null,
        hierarchy: null,
        geometry: null,
        containerCoordinates: null,
        state: null,
        viewport: null,
        times: null,
      });
      window.CarrotSearchFoamTree.geometry = Object.freeze(
        (function () {
          return {
            rectangleInPolygon: function (a, q, l, g, e, d, p) {
              e = P.I(e, 1);
              d = P.I(d, 0.5);
              p = P.I(p, 0.5);
              a = wa.Ka(a, { x: q, y: l }, g, d, p) * e;
              return { x: q - a * g * d, y: l - a * p, w: a * g, h: a };
            },
            circleInPolygon: function (a, q, l) {
              return wa.pb(a, { x: q, y: l });
            },
            stabPolygon: function (a, q, l, g) {
              return wa.ua(a, { x: q, y: l }, g);
            },
            polygonCentroid: function (a) {
              a = wa.u(a, {});
              return { x: a.x, y: a.y, area: a.ha };
            },
            boundingBox: function (a) {
              for (
                var q = a[0].x, l = a[0].y, g = a[0].x, e = a[0].y, d = 1;
                d < a.length;
                d++
              ) {
                var p = a[d];
                p.x < q && (q = p.x);
                p.y < l && (l = p.y);
                p.x > g && (g = p.x);
                p.y > e && (e = p.y);
              }
              return { x: q, y: l, w: g - q, h: e - l };
            },
          };
        })(),
      );
    },
    function () {
      window.CarrotSearchFoamTree = function () {
        window.console.error("FoamTree is not supported on this browser.");
      };
      window.CarrotSearchFoamTree.supported = !1;
    },
  );
})();

const FoamTree = window.CarrotSearchFoamTree;
export { FoamTree };
