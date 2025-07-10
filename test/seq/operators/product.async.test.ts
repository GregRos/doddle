import type { ASeq } from "@lib"
import { aseq } from "@lib"
import { declare, type, type_of } from "declare-it"

const _seq = aseq
type _Seq<T> = ASeq<T>
declare.it("fails on array of values", expect => {
    // @ts-expect-error product expects an array of sequences
    _seq.empty().product([1])
})

declare.it("empty input gives singletons", expect => {
    const a = _seq.empty<number>().product([])
    expect(type_of(a)).to_equal(type<_Seq<[number]>>)
})

declare.it("number, string gives number×string", expect => {
    const s = _seq.empty<number>().product([_seq.empty<string>()])
    expect(type_of(s)).to_equal(type<_Seq<[number, string]>>)
})

declare.it("number, string, boolean gives number×string×boolean", expect => {
    const s = _seq.empty<number>().product([_seq.empty<string>(), _seq.empty<boolean>()])
    expect(type_of(s)).to_equal(type<_Seq<[number, string, boolean]>>)
})

declare.it("projection to string", expect => {
    const a = _seq<number>([])
    const b = _seq<object>([])
    const product = a.product([b], (x, y) => {
        expect(type_of(x)).to_equal(type<number>())
        expect(type_of(y)).to_equal(type<object>())
        return ""
    })
    expect(type_of(product)).to_equal(type<_Seq<string>>)
})

declare.it("array input → min tuple", expect => {
    const a = _seq.empty<number>()
    const b = _seq.empty<number>()
    const arr = [b]
    const product = a.product(arr)
    expect(type_of(product)).to_equal(type<_Seq<[number, ...number[]]>>)
})

it("works on empty", async () => {
    const empty = _seq([])
    const product = empty.product([empty, empty, empty])
    await expect(product._qr).resolves.toEqual([])
})

it("works on 1", async () => {
    const single = _seq([1] as const)
    const product = single.product([])
    await expect(product._qr).resolves.toEqual([[1]])
})

it("works on 1 × 0 = 0", async () => {
    const single = _seq([1] as const)
    const empty = _seq([] as const)
    const product = single.product([empty])
    await expect(product._qr).resolves.toEqual([])
})

it("works on 1 × 1 × 1 × 0 = 0", async () => {
    const empty = _seq([] as const)
    const one = _seq([1] as const)
    const product = one.product([one, one, empty])
    await expect(product._qr).resolves.toEqual([])
})

it("works on 1³ = 1", async () => {
    const single = _seq([1] as const)
    const product = single.product([single, single])
    await expect(product._qr).resolves.toEqual([[1, 1, 1]])
})

it("works on 2² = 4", async () => {
    const single = _seq([1, 2] as const)
    const product = single.product([single])
    await expect(product._qr).resolves.toEqual([
        [1, 1],
        [1, 2],
        [2, 1],
        [2, 2]
    ])
})

it("works on 2³ = 8", async () => {
    const triples = _seq([1, 2] as const).product([
        [3, 4],
        [5, 6]
    ])
    await expect(triples._qr).resolves.toEqual([
        [1, 3, 5],
        [1, 3, 6],
        [1, 4, 5],
        [1, 4, 6],
        [2, 3, 5],
        [2, 3, 6],
        [2, 4, 5],
        [2, 4, 6]
    ])
})

it("works on 2×3 = 6", async () => {
    const a = _seq([1, 2] as const)
    const b = _seq([3, 4, 5] as const)
    const product = a.product([b])
    await expect(product._qr).resolves.toEqual([
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 3],
        [2, 4],
        [2, 5]
    ])
})

it("has no side-effects before pull, pulls only once", async () => {
    const fn = jest.fn(async function* () {
        yield 1
    })
    const s = _seq(fn)
    const result = s.product([[1, 2]])
    expect(fn).not.toHaveBeenCalled()
    for await (const _ of result) {
    }
    expect(fn).toHaveBeenCalledTimes(1)
})
