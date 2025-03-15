import type { ASeq } from "@lib"
import { aseq } from "@lib"

const _seq = aseq
type _Seq<T> = ASeq<T>

it("works on empty", () => {
    const input = _seq([] as const)
    const afterEmptyMatch = input.pathMap("")
    expect(afterEmptyMatch._qr).resolves.toEqual([])
})

it("works on non-empty", () => {
    const after = _seq([{ a: 1 }, { a: 2 }] as const).pathMap("a")
    expect(after._qr).resolves.toEqual([1, 2])
})

it("empty key is noop", () => {
    const after = _seq([{ a: 1 }, { a: 2 }] as const).pathMap("")
    expect(after._qr).resolves.toEqual([{ a: 1 }, { a: 2 }])
})

it("works on deeply nested", () => {
    const after = _seq([{ a: { b: 1 } }, { a: { b: 2 } }] as const).pathMap("a.b")
    expect(after._qr).resolves.toEqual([1, 2])
})
