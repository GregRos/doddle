import type { Seq } from "@lib"
import { seq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = seq
type _Seq<T> = Seq<T>

declare.it("never not allowed", expect => {
    const s = _seq([] as never[])
    // @ts-expect-error Map on never not allowed
    s.pathMap("a")
})
declare.it("map on non-object not allowed", expect => {
    const s = _seq([1])
    // @ts-expect-error Map on non-object not allowed
    s.pathMap("x")
})

declare.it("bad path not allowed", expect => {
    const s = _seq([{ a: 1 }, { a: 2 }])
    // @ts-expect-error Bad path
    s.pathMap("x.y")
    // @ts-expect-error Bad path
    s.pathMap("x")
})

declare.it("bad path not allowed - has valid subpath", expect => {
    const s = _seq([{ a: 1 }, { a: 2 }])
    // @ts-expect-error Bad path
    s.pathMap("a.x")
})

declare.it("single key", expect => {
    const s = _seq([{ a: 1 }, { a: 2 }])
    expect(type_of(s.pathMap("a"))).to_equal(type<_Seq<number>>)
})

declare.it("multiple keys", expect => {
    const s = _seq([{ a: { b: 1 } }])
    expect(type_of(s.pathMap("a.b"))).to_equal(type<_Seq<number>>)
})
it("works on non-empty", () => {
    const after = _seq([{ a: 1 }, { a: 2 }] as const).pathMap("a")
    expect(after._qr).toEqual([1, 2])
})
it("empty key is noop", () => {
    const after = _seq([{ a: 1 }, { a: 2 }] as const).pathMap("")
    expect(after._qr).toEqual([{ a: 1 }, { a: 2 }])
})
it("works on deeply nested", () => {
    const after = _seq([{ a: { b: 1 } }, { a: { b: 2 } }] as const).pathMap("a.b")
    expect(after._qr).toEqual([1, 2])
})
