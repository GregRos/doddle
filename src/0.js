function S(r) {
    return r[Symbol.iterator]()
}
function A(r) {
    return r[Symbol.asyncIterator]()
}
function C(r) {
    return typeof r == "object" && r != null
}
function g(r) {
    return typeof r == "function"
}
function x(r) {
    return C(r) && g(r[Symbol.iterator])
}
function sr(r) {
    return x(r) || b(r)
}
var ve = [void 0, "before", "after", "both"],
    R = r => ve.indexOf(r),
    mt = r => {
        let t = R(r)
        return t > 0 && t <= 3
    }
var D = Number.isSafeInteger,
    ut = r => D(r) && r >= 0,
    pt = r => !!r === r
var yt = r => Array.isArray(r) && r.length === 2,
    lt = r => D(r) && r > 0,
    ht = r => r instanceof Error,
    Me = r => typeof r == "symbol"
function b(r) {
    return C(r) && typeof r[Symbol.asyncIterator] == "function"
}
function Ne(r) {
    return typeof r == "bigint"
}
function Ce(r) {
    return typeof r == "string"
}
function Pe(r) {
    return r == null
}
function z(r) {
    return C(r) && g(r.next)
}
function k(r) {
    return C(r)
        ? r === null
            ? "null"
            : (r.constructor?.name ?? r?.[Symbol.toStringTag] ?? "Object")
        : typeof r
}
function Te(r) {
    return `Symbol(${r.description})`
}
function $e(r) {
    return x(r)
        ? `iterable ${k(r)}`
        : b(r)
          ? `async iterable ${k(r)}`
          : z(r)
            ? `iterator ${k(r)}`
            : V(r)
              ? r.toString()
              : h(r)
                ? "a Promise"
                : `object ${k(r)}`
}
function dt(r) {
    return Pe(r)
        ? `${r}`
        : g(r)
          ? `function ${ir(r) || "<anonymous>"}`
          : Ne(r)
            ? `${r}n`
            : Me(r)
              ? Te(r)
              : Ce(r)
                ? (r.length > 30 && (r = r.slice(0, 30) + "\u22EF"), `"${r}"`)
                : C(r)
                  ? $e(r)
                  : `${r}`
}
function ir(r) {
    return r.name || null
}
function h(r) {
    return typeof r == "object" && !!r && "then" in r && typeof r.then == "function"
}
function V(r) {
    return typeof r == "object" && r != null && r instanceof B
}
var xt = Array.isArray
function I(r, t, e) {
    return b(r) && h(t) ? t.then(n => ({ key: n, value: e })) : { key: t, value: e }
}
function qt(r) {
    return xt(r) ? r.flat(4).join(" ") : r
}
var _ = class extends Error {
    constructor(t) {
        super(qt(Array.isArray(t) ? t : [t]))
    }
}
function St() {
    return new _(
        "Tried to call 'Lazy.pull' recursively in a sync context, which would not terminate."
    )
}
function We(r) {
    return d(() => {
        let t = ["this", ...Object.keys(r)],
            e = [this, ...Object.values(r)].map(n => n.pull())
        return e.some(h)
            ? Promise.all(e).then(n => t.reduce((o, s, i) => ((o[s] = n[i]), o), {}))
            : e.reduce((n, o, s) => ((n[t[s]] = o), n), {})
    })
}
var At = We
function Le(r) {
    return this.map(t => {
        let e = r(t)
        return d(() => e).map(() => t)
    })
}
var kt = Le
function Re(r) {
    return this.zip(d(() => r)).map(([t, e]) => t === e)
}
var gt = Re
function De(r) {
    return d(() => {
        let t = this.pull()
        return h(t) ? t.then(r) : r(t)
    })
}
var wt = De
function Ve(...r) {
    return d(() => {
        let t = [this, ...r].map(e => e.pull())
        return t.some(h) ? Promise.all(t) : t
    })
}
var Ot = Ve
var vn = Symbol("methodName"),
    cr = Symbol("ownerInstance"),
    B = class r {
        _cached
        _info
        _cacheName
        get info() {
            let { stage: t, syncness: e, name: n } = this._info,
                o = ["untouched", "sync", "async"][e],
                s = e === 0 ? [] : [o],
                i = ["untouched", "executing", "done", "threw"][t],
                m = t === 2 ? this._cacheName : `<${i}>`,
                l = n ? `lazy(${n})` : "lazy"
            return { isReady: t >= 2, desc: [l, ...s, m].join(" "), stage: i, syncness: o, name: n }
        }
        _init
        constructor(t) {
            ;(this._info = { syncness: 0, stage: 0, name: ir(t) }), (this._init = t)
            for (let e of Ke) {
                let n = e.bind(this)
                Object.defineProperty(n, cr, { value: this }), (this[e.name] = n)
            }
        }
        static create(t) {
            return new r(t)
        }
        map
        each
        zip
        assemble
        equals;
        *[Symbol.iterator]() {
            let t = this.pull()
            x(t) ? yield* t : yield t
        }
        async *[Symbol.asyncIterator]() {
            let t = await this.pull()
            b(t) || x(t) ? yield* t : yield t
        }
        toString() {
            return this.info.desc
        }
        pull() {
            let t = this._info
            if (t.stage === 3) throw this._cached
            if (t.stage === 1) {
                if (t.syncness === 2) return this._cached
                throw St()
            }
            if (t.stage === 2) return this._cached
            t.stage = 1
            let e
            try {
                let n = this._init()
                e = V(n) ? n.pull() : n
            } catch (n) {
                throw ((this._cached = n), (t.stage = 3), n)
            }
            return (
                (this._init = null),
                h(e)
                    ? ((t.syncness = 2),
                      (e = e.then(
                          n => (V(n) && (n = n.pull()), (t.stage = 2), (this._cacheName = k(n)), n)
                      )))
                    : ((t.syncness = 1), (t.stage = 2), (this._cacheName = k(e))),
                (this._cached = e),
                e
            )
        }
        get [Symbol.toStringTag]() {
            return this.toString()
        }
    },
    Ke = [wt, kt, Ot, At, gt, B.prototype.pull]
function d(r) {
    return B.create(r)
}
function Ye(r) {
    return cr in r ? r : d(r).pull
}
function bt(...r) {
    return a(r)
}
function _t(...r) {
    return f(r)
}
var Y = "function",
    ar = "integer",
    He = "argument",
    Qe = "return",
    P = "iterable",
    Bt = "(async)",
    fr = "iterator",
    mr = "conversion"
function zt(r) {
    return ["but got", dt(r)]
}
function F(r, t, e) {
    return [r, "of", t, "must", e]
}
var q = (r, t) => e => n => {
        if (!t(n)) {
            let o = [e, r, zt(n)]
            throw new _(o)
        }
        return n
    },
    K = q(`a ${ar}`, D),
    Ue = q(`a non-negative ${ar}`, ut),
    Ge = q(`a positive ${ar}`, lt),
    It = q("true or false", pt),
    Je = q("an error", ht),
    E = q(`a ${Y}`, g),
    Xe = q("an array of length 2", yt),
    Ze = q("'before', 'after', 'both', or undefined", mt),
    je = q(["an", P, "or", Y], r => x(r) || g(r)),
    rn = q(["an", Bt, P, "or", Y], r => sr(r) || g(r)),
    tn = ["an", P, "or", fr],
    en = q(["an", P, "or", fr], r => x(r) || z(r)),
    nn = q(["an", Bt, P, "or", fr], r => sr(r) || z(r))
function ur(r, t, e, n) {
    return o => (
        E(F(r, t, "be"))(o),
        (...s) => {
            let i = o(...s),
                m = e(F([Y, r], t, Qe))
            return h(i) && n ? i.then(m) : m(i)
        }
    )
}
function Et(r) {
    let t = ["operator", `'${r}'`]
    function e(l) {
        return [He, `'${l}'`]
    }
    let n = r.toLowerCase().startsWith("a")
    function o(l) {
        return F(e(l), t, "be")
    }
    function s(l, O) {
        return [l, O(o(l))]
    }
    function i(l, O) {
        return [l, ur(e(l), t, O, n)]
    }
    let m = [
        s("size", Ge),
        s("start", K),
        s("times", Ue),
        s("end", K),
        s("index", K),
        s("count", K),
        s("projection", E),
        s("action", E),
        s("handler", E),
        s("reverse", It),
        s("reducer", E),
        s("stage", Ze),
        s("keyProjection", E),
        i("kvpProjection", Xe),
        i("predicate", It),
        i("throws", Je)
    ]
    return Object.fromEntries(m)
}
var Ft = r => {
        let t = "input",
            e = [mr, "aseq"]
        return je(F(t, e, "be"))(r), g(r) ? ur(t, e, en, !1)(r) : r
    },
    on = "input",
    vt = r => {
        let t = on,
            e = [mr, "aseq"]
        return rn(F(t, e, "be"))(r), g(r) ? ur(t, e, nn, !0)(r) : r
    },
    Mt = () => {
        throw new _([F("input", [mr, "aseq"], "be"), tn, zt("an async iterator")])
    }
var Nt = Symbol("CHECKERS_LOADED")
function v(r) {
    if (!r[Nt]) {
        for (let t of Object.getOwnPropertyNames(r)) {
            if (t.startsWith("_")) continue
            let e = r[t]
            typeof e == "function" &&
                ("__checkers" in e ||
                    Object.defineProperty(r[t], "__checkers", { value: Et(`${k(r)}.${t}`) }))
        }
        r[Nt] = !0
    }
}
function c(r) {
    return r.__checkers
}
var M = class {
    loadCheckers() {
        v(this)
    }
}
function w(r, t, e = 1) {
    c(w).size(e), c(w).start(r), c(w).end(t)
    let n = Math.sign(t - r)
    return a(function* () {
        for (let s = r; n * s < n * t; s += n * e) yield s
    })
}
function Ct(r, t, e = 1) {
    return c(w).size(e), c(w).start(r), c(w).end(t), a(w(r, t, e)).aseq()
}
function pr(r, t) {
    return a(function* () {
        for (let e = 0; e < r; e++) yield t
    })
}
function Pt(r, t) {
    return f(pr(r, t))
}
function Tt() {
    return f(this)
}
function y(r, t) {
    let e = d(() => t(r))
    return Object.assign(e, { operator: t.name, operand: r }), e
}
function $t(r, t, e) {
    return (
        c(r).index(e),
        y(t, function (o) {
            return e < 0 ? o.take(e).first().pull() : o.skip(e).first().pull()
        })
    )
}
function yr(r) {
    return $t(yr, a(this), r)
}
function lr(r) {
    return $t(lr, f(this), r)
}
var N = class {
    error
    constructor(t) {
        this.error = t
    }
}
function Wt() {
    let r = this,
        t = [],
        e = !1,
        n
    return u(this, function* () {
        let s = 0
        for (;;)
            if (s < t.length) {
                let i = t[s]
                if (i instanceof N) throw i.error
                yield i, s++
            } else {
                if (e) return
                n ??= S(r)
                try {
                    let { done: i, value: m } = n.next()
                    if (i) {
                        e = !0
                        return
                    }
                    t.push(m), yield m, s++
                } catch (i) {
                    throw (t.push(new N(i)), i)
                }
            }
    })
}
function Lt() {
    let r = this,
        t = [],
        e = !1,
        n,
        o
    return p(this, async function* () {
        let i = 0
        for (;;)
            if (i < t.length) {
                let m = t[i]
                if (m instanceof N) throw m.error
                yield m, i++
            } else if (!e)
                (n ??= A(r)),
                    o ||
                        (o = (async () => {
                            try {
                                let { done: m, value: l } = await n.next()
                                if (m) {
                                    e = !0
                                    return
                                }
                                t.push(l), (o = void 0)
                                return
                            } catch (m) {
                                t.push(new N(m)), (o = void 0)
                                return
                            }
                        })()),
                    await o
            else return
    })
}
var H = class extends Error {
    value
    constructor(t) {
        super(`An iterable threw a non-error value of type ${typeof t}: ${t}`), (this.value = t)
    }
}
function hr(r) {
    return (
        c(hr).handler(r),
        u(this, function* (e) {
            let n = 0,
                o = S(e)
            for (;;) {
                try {
                    let i = o.next()
                    var s = i.value
                    if (i.done) return
                    yield s
                } catch (i) {
                    let m = i
                    ;(typeof m != "object" || !(m instanceof Error)) && (m = new H(m))
                    let l = r(m, n)
                    if (!l || l == null) return
                    if (h(l))
                        throw TypeError(
                            "Unexpected promise or thenable returned from sync catch handler."
                        )
                    yield* a(l)
                    return
                }
                n++
            }
        })
    )
}
function dr(r) {
    return (
        c(dr).handler(r),
        p(this, async function* (e) {
            let n = 0,
                o = A(e)
            for (;;) {
                try {
                    let i = await o.next()
                    var s = i.value
                    if (i.done) return
                    yield s
                } catch (i) {
                    let m = i
                    ;(typeof m != "object" || !(m instanceof Error)) && (m = new H(m))
                    let l = await r(m, n)
                    if (!l || l == null) return
                    yield* f(l)
                    return
                }
                n++
            }
        })
    )
}
function Q(r, t) {
    return (
        c(Q).size(r),
        (t ??= (...e) => e),
        c(Q).projection(t),
        u(this, function* (n) {
            let o = []
            for (let s of n) o.push(s), o.length === r && (yield t(...o), (o = []))
            o.length && (yield t(...o))
        })
    )
}
function U(r, t) {
    return (
        c(U).size(r),
        (t ??= (...e) => e),
        c(U).projection(t),
        p(this, async function* (n) {
            let o = []
            for await (let s of n) o.push(s), o.length === r && (yield t(...o), (o = []))
            o.length && (yield t(...o))
        })
    )
}
function G(r) {
    return (
        c(G).projection(r),
        u(this, function* (e) {
            let n = 0
            for (let o of e) for (let s of a(r(o, n++))) yield s
        })
    )
}
function J(r) {
    return (
        c(J).projection(r),
        p(this, async function* (e) {
            let n = 0
            for await (let o of e) for await (let s of f(await r(o, n++))) yield s
        })
    )
}
function Rt(...r) {
    let t = r.map(a)
    return u(this, function* (n) {
        yield* n
        for (let o of t) yield* o
    })
}
function Dt(...r) {
    let t = r.map(f)
    return p(this, async function* (n) {
        for await (let o of n) yield o
        for (let o of t) for await (let s of o) yield s
    })
}
function Vt(r, t, e) {
    return (
        (e ??= () => !0),
        (e = c(r).predicate(e)),
        y(t, function (o) {
            return o
                .filter(e ?? (() => !0))
                .reduce(s => s + 1, 0)
                .pull()
        })
    )
}
function xr(r) {
    return Vt(xr, a(this), r)
}
function qr(r) {
    return Vt(qr, f(this), r)
}
function X(r, t = "before") {
    c(X).action(r), c(X).stage(t)
    let e = R(t)
    return u(this, function* (o) {
        let s = 0
        for (let i of o) e & 1 && r(i, s, "before"), yield i, e & 2 && r(i, s, "after"), s++
    })
}
function Z(r, t = "before") {
    c(Z).action(r), c(Z).stage(t)
    let e = R(t)
    return p(this, async function* (o) {
        let s = 0
        for await (let i of o)
            e & 1 && (await r(i, s, "before")), yield i, e & 2 && (await r(i, s, "after")), s++
    })
}
function Kt(r, t, e) {
    return (
        (e = c(r).predicate(e)),
        y(t, function (o) {
            return o
                .map(e)
                .some(s => !s)
                .pull()
        }).map(n => !n)
    )
}
function Sr(r) {
    return Kt(Sr, a(this), r)
}
function Ar(r) {
    return Kt(Ar, f(this), r)
}
function kr(r) {
    return (
        (r = c(kr).predicate(r)),
        u(this, function* (e) {
            yield* a(e).concatMap((n, o) => (r(n, o) ? [n] : []))
        })
    )
}
function gr(r) {
    return (
        (r = c(gr).predicate(r)),
        p(this, async function* (e) {
            yield* f(e).concatMap(async (n, o) => ((await r(n, o)) ? [n] : []))
        })
    )
}
function Yt(r, t, e, n) {
    return (
        (e = c(r).predicate(e)),
        y(t, function (s) {
            return s.filter(e).last(n).pull()
        })
    )
}
function wr(r, t) {
    return Yt(wr, a(this), r, t)
}
function Or(r, t) {
    return Yt(Or, f(this), r, t)
}
function Ht(r, t, e, n) {
    return (
        (e = c(r).predicate(e)),
        y(t, function (s) {
            return s.filter(e).first(n).pull()
        })
    )
}
function br(r, t) {
    return Ht(br, a(this), r, t)
}
function _r(r, t) {
    return Ht(_r, f(this), r, t)
}
function Qt(r) {
    return y(this, function (e) {
        for (let n of e) return n
        return r
    })
}
function Ut(r) {
    return y(this, async function (e) {
        for await (let n of e) return n
        return r
    })
}
function Ir(r) {
    return (
        c(Ir).keyProjection(r),
        y(this, function (e) {
            let n = new Map()
            for (let o of e) {
                let s = r(o),
                    i = n.get(s)
                i ? i.push(o) : ((i = [o]), n.set(s, i))
            }
            return n
        })
    )
}
function Br(r) {
    return (
        c(Br).keyProjection(r),
        y(this, async function (e) {
            let n = new Map()
            for await (let o of e) {
                let s = await r(o),
                    i = n.get(s)
                i ? i.push(o) : ((i = [o]), n.set(s, i))
            }
            return n
        })
    )
}
function Gt(r, t) {
    return y(r, function (n) {
        return n.some(o => o === t).pull()
    })
}
function Jt(r) {
    return Gt(a(this), r)
}
function Xt(r) {
    return Gt(f(this), r)
}
function Zt(r) {
    return y(this, function (e) {
        let n = r
        for (let o of e) n = o
        return n
    })
}
function jt(r) {
    return y(this, async function (e) {
        let n = r
        for await (let o of e) n = o
        return n
    })
}
function zr(r) {
    return (
        c(zr).projection(r),
        u(this, function* (e) {
            yield* a(e).concatMap((n, o) => [r(n, o)])
        })
    )
}
function Er(r) {
    return (
        c(Er).projection(r),
        p(this, async function* (e) {
            yield* f(e).concatMap(async (n, o) => [await r(n, o)])
        })
    )
}
var re = Symbol("EMPTY_SEQ")
function te(r, t, e, n) {
    return (
        c(r).projection(e),
        y(t, function (s) {
            return s
                .map((i, m) => I(s, e(i, m), i))
                .reduce((i, m) => (i.key >= m.key ? i : m), re)
                .map(i => (i === re ? n : i.value))
                .pull()
        })
    )
}
function Fr(r, t) {
    return te(Fr, a(this), r, t)
}
function vr(r, t) {
    return te(vr, f(this), r, t)
}
var ee = Symbol("EMPTY_SEQ")
function ne(r, t, e, n) {
    return (
        c(r).projection(e),
        y(t, function (s) {
            return s
                .map((i, m) => I(s, e(i, m), i))
                .reduce((i, m) => (i.key <= m.key ? i : m), ee)
                .map(i => (i === ee ? n : i.value))
                .pull()
        })
    )
}
function Mr(r, t) {
    return ne(Mr, a(this), r, t)
}
function Nr(r, t) {
    return ne(Nr, f(this), r, t)
}
function j(r, t = !1) {
    return (
        c(j).projection(r),
        c(j).reverse(t),
        u(this, function* (n) {
            yield* a(n)
                .map(o => I(o, r(o), o))
                .toArray()
                .map(
                    o => (
                        o.sort((s, i) => {
                            let m = s.key < i.key ? -1 : s.key > i.key ? 1 : 0
                            return t ? -m : m
                        }),
                        o.map(s => s.value)
                    )
                )
                .pull()
        })
    )
}
function rr(r, t = !1) {
    return (
        c(rr).projection(r),
        c(rr).reverse(t),
        p(this, async function* (n) {
            yield* await f(n)
                .map(o => I(o, r(o), o))
                .toArray()
                .map(
                    async o => (
                        o.sort((s, i) => {
                            let m = s.key < i.key ? -1 : s.key > i.key ? 1 : 0
                            return t ? -m : m
                        }),
                        o.map(s => s.value)
                    )
                )
                .pull()
        })
    )
}
var oe = Symbol("NO_INTIAL")
function se(r, t, e, n) {
    return (
        c(r).reducer(e),
        y(t, function (s) {
            return s
                .scan(e, n)
                .last(oe)
                .map(i => {
                    if (i === oe) throw new _("Cannot reduce empty sequence with no initial value")
                    return i
                })
                .pull()
        })
    )
}
function Cr(r, t) {
    return se(Cr, a(this), r, t)
}
function Pr(r, t) {
    return se(Pr, f(this), r, t)
}
function ie() {
    return u(this, function* (t) {
        yield* a(t)
            .toArray()
            .map(e => e.reverse())
            .pull()
    })
}
function ce() {
    return p(this, async function* (t) {
        yield* await f(t)
            .toArray()
            .map(e => e.reverse())
            .pull()
    })
}
function Tr(r, t) {
    return (
        c(Tr).reducer(r),
        u(this, function* (n) {
            let o = t !== void 0,
                s = t,
                i = 0
            o && (yield s)
            for (let m of n) o ? (s = r(s, m, i++)) : ((s = m), (o = !0)), yield s
        })
    )
}
function $r(r, t) {
    return (
        c($r).reducer(r),
        p(this, async function* (n) {
            let o = t !== void 0,
                s = t,
                i = 0
            o && (yield s)
            for await (let m of n) o ? (s = await r(s, m, i++)) : ((s = m), (o = !0)), yield s
        })
    )
}
function ae(r) {
    let t = a(r)
    return y(this, function (n) {
        let o = S(t)
        for (let s of n) {
            let i = o.next()
            if (i.done || s !== i.value) return !1
        }
        return !!o.next().done
    })
}
function fe(r) {
    let t = f(r)
    return y(this, async function (n) {
        let o = A(t)
        for await (let s of n) {
            let i = await o.next()
            if (i.done || s !== i.value) return !1
        }
        return !!(await o.next()).done
    })
}
function me(r) {
    let t = a(r)
    return y(this, function (n) {
        let o = new Set(t)
        for (let s of n) if (!o.delete(s)) return !1
        return o.size === 0
    })
}
function ue(r) {
    let t = f(r)
    return y(this, async function (n) {
        let o = new Set()
        for await (let s of t) o.add(s)
        for await (let s of n) if (!o.delete(s)) return !1
        return o.size === 0
    })
}
function pe(r) {
    for (let t = r.length - 1; t > 0; t--) {
        let e = Math.floor(Math.random() * (t + 1)),
            n = r[t]
        ;(r[t] = r[e]), (r[e] = n)
    }
    return r
}
function ye() {
    return u(this, function* (t) {
        let e = a(t).toArray().pull()
        pe(e), yield* e
    })
}
function le() {
    return p(this, async function* (t) {
        let e = await f(t).toArray().pull()
        pe(e), yield* e
    })
}
function Wr(r, t) {
    return (
        (r = c(Wr).predicate(r)),
        u(this, function* (n) {
            let o = 0,
                s = 0
            for (let i of n) {
                if (o === 2) {
                    yield i
                    continue
                }
                let m = r(i, s++)
                m || ((o !== 1 || !t?.skipFinal) && (yield i)), (o = m ? 1 : 2)
            }
        })
    )
}
function Lr(r, t) {
    return (
        (r = c(Lr).predicate(r)),
        p(this, async function* (n) {
            let o = 0,
                s = 0
            for await (let i of n) {
                if (o === 2) {
                    yield i
                    continue
                }
                let m = await r(i, s++)
                m || ((o !== 1 || !t?.skipFinal) && (yield i)), (o = m ? 1 : 2)
            }
        })
    )
}
var tr = Symbol("SKIP")
function Rr(r) {
    return (
        c(Rr).count(r),
        u(this, function* (e) {
            let n = r
            if (n === 0) {
                yield* a(e)
                return
            }
            n < 0
                ? ((n = -n),
                  yield* a(e)
                      .window(n + 1, (...o) => (o.length === n + 1 ? o[0] : tr))
                      .filter(o => o !== tr))
                : yield* a(e).skipWhile((o, s) => s < n, {})
        })
    )
}
function Dr(r) {
    return (
        c(Dr).count(r),
        p(this, async function* (e) {
            let n = r
            if (n === 0) {
                yield* f(e)
                return
            }
            n < 0
                ? ((n = -n),
                  yield* f(e)
                      .window(n + 1, (...o) => (o.length === n + 1 ? o[0] : tr))
                      .filter(o => o !== tr))
                : yield* f(e).skipWhile((o, s) => s < n, {})
        })
    )
}
var he = Symbol("NO_MATCH")
function de(r, t, e) {
    return (
        (e = c(r).predicate(e)),
        y(t, function (o) {
            return o
                .find(e, he)
                .map(s => s !== he)
                .pull()
        })
    )
}
function Vr(r) {
    return de(Vr, a(this), r)
}
function Kr(r) {
    return de(Kr, f(this), r)
}
function xe(r, t, e) {
    return (
        c(r).projection(e),
        y(t, function (o) {
            return o
                .map(e)
                .reduce((s, i) => s + i, 0)
                .pull()
        })
    )
}
function Yr(r) {
    return xe(Yr, a(this), r)
}
function Hr(r) {
    return xe(Hr, f(this), r)
}
function Qr(r, t) {
    return (
        c(Qr).predicate(r),
        u(this, function* (n) {
            let o = 0
            for (let s of n)
                if (r(s, o++)) yield s
                else {
                    t?.takeFinal && (yield s)
                    return
                }
        })
    )
}
function Ur(r, t) {
    return (
        c(Ur).predicate(r),
        p(this, async function* (n) {
            let o = 0
            for await (let s of n)
                if (await r(s, o++)) yield s
                else {
                    t?.takeFinal && (yield s)
                    return
                }
        })
    )
}
var er = Symbol("DUMMY")
function Gr(r) {
    return (
        c(Gr).count(r),
        u(this, function* (e) {
            let n = r
            if (n === 0) {
                yield* []
                return
            }
            n < 0
                ? ((n = -n),
                  yield* a(e)
                      .append(er)
                      .window(n + 1, (...s) => {
                          if (s[s.length - 1] === er) return s.pop(), s
                      })
                      .filter(s => s !== void 0)
                      .first()
                      .pull())
                : yield* a(e).takeWhile((o, s) => s < n - 1, { takeFinal: !0 })
        })
    )
}
function Jr(r) {
    return (
        c(Jr).count(r),
        p(this, async function* (e) {
            let n = r
            if (n === 0) {
                yield* []
                return
            }
            n < 0
                ? ((n = -n),
                  yield* await f(e)
                      .append(er)
                      .window(n + 1, (...s) => {
                          if (s[s.length - 1] === er) return s.pop(), s
                      })
                      .filter(s => s !== void 0)
                      .first()
                      .pull())
                : yield* f(e).takeWhile((o, s) => s < n - 1, { takeFinal: !0 })
        })
    )
}
function qe() {
    return y(this, function (t) {
        return [...t]
    })
}
function Se() {
    return y(this, async function (t) {
        let e = []
        for await (let n of t) e.push(n)
        return e
    })
}
function Ae(r, t, e) {
    return (
        (e = c(r).kvpProjection(e)),
        y(t, function (o) {
            return o
                .map(e)
                .toArray()
                .map(s => new Map(s))
                .pull()
        })
    )
}
function Xr(r) {
    return Ae(Xr, a(this), r)
}
function Zr(r) {
    return Ae(Zr, f(this), r)
}
function ke() {
    return y(this, function (t) {
        return new Set(t)
    })
}
function ge() {
    return y(this, async function (t) {
        let e = new Set()
        for await (let n of t) e.add(n)
        return e
    })
}
function jr(r) {
    return (
        c(jr).projection(r),
        u(this, function* (e) {
            let n = new Set()
            for (let o of e) {
                let s = r(o)
                n.has(s) || (n.add(s), yield o)
            }
        })
    )
}
function rt(r) {
    return (
        c(rt).projection(r),
        p(this, async function* (e) {
            let n = new Set()
            for await (let o of e) {
                let s = await r(o)
                n.has(s) || (n.add(s), yield o)
            }
        })
    )
}
function we() {
    return u(this, function* (t) {
        yield* a(t).uniqBy(e => e)
    })
}
function Oe() {
    return p(this, async function* (t) {
        yield* f(t).uniqBy(e => e)
    })
}
function nr(r, t) {
    return (
        c(nr).size(r),
        (t ??= (...e) => e),
        c(nr).projection(t),
        u(this, function* (n) {
            let o = Array(r),
                s = 0
            for (let i of n)
                (o[s++ % r] = i),
                    s >= r && (yield t.call(null, ...o.slice(s % r), ...o.slice(0, s % r)))
            s > 0 && s < r && (yield t.call(null, ...o.slice(0, s)))
        })
    )
}
function or(r, t) {
    return (
        c(or).size(r),
        (t ??= (...e) => e),
        c(or).projection(t),
        p(this, async function* (n) {
            let o = Array(r),
                s = 0
            for await (let i of n)
                (o[s++ % r] = i),
                    s >= r && (yield t.call(null, ...o.slice(s % r), ...o.slice(0, s % r)))
            s > 0 && s < r && (yield t.call(null, ...o.slice(0, s)))
        })
    )
}
function tt(r, t) {
    let e = r.map(a)
    return (
        (t ??= (...n) => n),
        c(tt).projection(t),
        u(this, function* (o) {
            let s = [o, ...e].map(S)
            for (;;) {
                let i = s.map((m, l) => {
                    if (!m) return
                    let O = m.next()
                    if (O.done) {
                        s[l] = void 0
                        return
                    }
                    return O
                })
                if (i.every(m => !m)) break
                yield t.apply(
                    void 0,
                    i.map(m => m?.value)
                )
            }
        })
    )
}
function et(r, t) {
    let e = r.map(f)
    return (
        (t ??= (...n) => n),
        c(et).projection(t),
        p(this, async function* (o) {
            let s = [o, ...e].map(A)
            for (;;) {
                let i = s.map(async (l, O) => {
                        if (!l) return
                        let ft = await l.next()
                        if (ft.done) {
                            s[O] = void 0
                            return
                        }
                        return ft
                    }),
                    m = await Promise.all(i)
                if (m.every(l => !l)) break
                yield t.apply(
                    void 0,
                    m.map(l => l?.value)
                )
            }
        })
    )
}
var T = Symbol("doddle.seq"),
    $ = Symbol("doddle.aseq")
var W = class extends M {
        constructor() {
            super(), this.loadCheckers()
        }
        get _qr() {
            return this.toArray().pull()
        }
        [T] = !0
        append = be
        aseq = Tt
        at = yr
        cache = Wt
        catch = hr
        concat = Rt
        chunk = Q
        concatMap = G
        count = xr
        each = X
        every = Sr
        filter = kr
        findLast = wr
        find = br
        first = Qt
        flatMap = G
        groupBy = Ir
        includes = Jt
        last = Zt
        map = zr
        maxBy = Fr
        minBy = Mr
        orderBy = j
        reduce = Cr
        reverse = ie
        scan = Tr
        seqEquals = ae
        setEquals = me
        shuffle = ye
        skipWhile = Wr
        skip = Rr
        some = Vr
        sumBy = Yr
        takeWhile = Qr
        take = Gr
        toArray = qe
        toSet = ke
        toMap = Xr
        uniqBy = jr
        uniq = we
        window = nr
        zip = tt
    },
    nt,
    u = function (t, e) {
        nt || (nt = new W())
        let n = Object.create(nt)
        return Object.assign(n, {
            _operator: e.name,
            _operand: t,
            [Symbol.iterator]: function () {
                return S(e.call(this, this._operand))
            }
        })
    }
function _e(r) {
    return r instanceof Error ? r : new Error(String(r))
}
function ot(r) {
    return (
        (r = c(ot).throws(r)),
        u(r, function* (e) {
            let n = e()
            throw _e(n)
        })
    )
}
function st(r) {
    return (
        (r = c(st).throws(r)),
        p(r, async function* (e) {
            let n = e()
            throw _e(n)
        })
    )
}
function it(r) {
    return (
        (r = vt(r)),
        b(r) || x(r)
            ? p(r, async function* (e) {
                  yield* e
              })
            : p(r, async function* (e) {
                  let n = await e()
                  if (b(n) || x(n)) {
                      yield* n
                      return
                  }
                  if (z(n)) for (let o = await n.next(); !o.done; o = await n.next()) yield o.value
              })
    )
}
function ct(r) {
    return (
        (r = Ft(r)),
        x(r)
            ? u(r, function* (e) {
                  yield* e
              })
            : u(r, function* (e) {
                  let n = e()
                  if (x(n)) {
                      yield* n
                      return
                  }
                  for (let o = n.next(); !o.done; o = n.next()) h(o) && Mt(), yield o.value
              })
    )
}
function Ie(r) {
    return r ? ct(r) : ct([])
}
var a = Object.assign(Ie, {
    of: bt,
    repeat: pr,
    range: w,
    is(r) {
        return T in r && r[T] === !0
    },
    iterate: Be,
    throws: ot
})
v(a)
function Be(r, t) {
    return a(function* () {
        for (let e = 0; e < r; e++) yield t(e)
    })
}
function ze(r, t) {
    return f(async function* () {
        for (let e = 0; e < r; e++) yield t(e)
    })
}
function Ee(r) {
    return r ? it(r) : it([])
}
var f = Object.assign(Ee, {
    of: _t,
    repeat: Pt,
    range: Ct,
    is(r) {
        return $ in r && r[$] === !0
    },
    iterate: ze,
    throws: st
})
v(f)
function be(...r) {
    return u(this, function* (e) {
        yield* a(e).concat(r)
    })
}
function Fe(...r) {
    return p(this, async function* (e) {
        yield* f(e).concat(r)
    })
}
var L = class extends M {
        constructor() {
            super(), this.loadCheckers()
        }
        get _qr() {
            return this.toArray().pull()
        }
        [$] = !0
        append = Fe
        at = lr
        catch = dr
        concat = Dt
        concatMap = J
        chunk = U
        cache = Lt
        count = qr
        each = Z
        every = Ar
        filter = gr
        findLast = Or
        find = _r
        first = Ut
        flatMap = J
        groupBy = Br
        includes = Xt
        last = jt
        map = Er
        maxBy = vr
        minBy = Nr
        orderBy = rr
        reduce = Pr
        reverse = ce
        scan = $r
        seqEquals = fe
        setEquals = ue
        shuffle = le
        skipWhile = Lr
        skip = Dr
        some = Kr
        sumBy = Hr
        takeWhile = Ur
        take = Jr
        toArray = Se
        toSet = ge
        toMap = Zr
        uniqBy = rt
        uniq = Oe
        window = or
        zip = et
    },
    at,
    p = function (t, e) {
        at || (at = new L())
        let n = Object.create(at)
        return Object.assign(n, {
            _operator: e.name,
            _operand: t,
            [Symbol.asyncIterator]: function () {
                return A(e.call(this, this._operand))
            }
        })
    }
export { L as ASeq, B as Lazy, W as Seq, f as aseq, d as lazy, Ye as memoize, a as seq }
