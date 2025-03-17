import type { Seq } from "@lib"
import { seq } from "@lib"

const _seq = seq
type _Seq<T> = Seq<T>

it("works on empty", () => {
    const empty = _seq([] as const)
    const product = empty.product([empty, empty, empty])
    expect(product._qr).toEqual([])
})

it("works on single element", () => {
    const single = _seq([1] as const)
    const product = single.product([single, single])
    expect(product._qr).toEqual([[1, 1, 1]])
})

it("works on two elements squared", () => {
    const single = _seq([1, 2] as const)
    const product = single.product([single])
    expect(product._qr).toEqual([
        [1, 1],
        [1, 2],
        [2, 1],
        [2, 2]
    ])
})
