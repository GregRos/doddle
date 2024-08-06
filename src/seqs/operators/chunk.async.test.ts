import { declare, type, type_of } from "declare-it"
import { aseq, type ASeq } from "../.."

const _seq = aseq
type SType<T> = ASeq<T>
declare.it("typed as 1-N length tuple", expect => {
    expect(type_of(_seq([1, 2, 3]).chunk(3))).to_equal(
        type<SType<[number] | [number, number] | [number, number, number]>>
    )
    expect(type_of(_seq([1, 2, 3]).chunk(1))).to_equal(type<SType<[number]>>)
})

declare.it("typed as length 1-∞ tuple when non-literal chunk length", expect => {
    const s = _seq([1, 2, 3]).chunk(3 as number)
    expect(type_of(s)).to_equal(type<SType<[number, ...number[]]>>)
})
declare.it("projection parameters typed as [T, T? ...]", expect => {
    _seq([1, 2, 3]).window(2, (...args) => {
        expect(type_of(args)).to_equal(type<[number, number?]>)
    })
    _seq([1, 2, 3]).window(3, (...args) => {
        expect(type_of(args)).to_equal(type<[number, number?, number?]>)
    })
})

declare.it("accepts projection with N parameters", expect => {
    _seq([1, 2, 3]).window(2, (a, b) => {
        expect(type_of(a)).to_equal(type<number>)
        expect(type_of(b)).to_equal(type<number | undefined>)
    })
})
it("chunks empty as empty", async () => {
    const s = _seq([]).chunk(1)
    await expect(s._qr).resolves.toEqual([])
})

it("chunks singletons correctly", async () => {
    const s = _seq([1, 2, 3]).chunk(1)
    await expect(s._qr).resolves.toEqual([[1], [2], [3]])
})

it("chunks pairs", async () => {
    const s = _seq([1, 2, 3, 4, 5]).chunk(2)
    await expect(s._qr).resolves.toEqual([[1, 2], [3, 4], [5]])
})

it("errors on chunk length of 0 immediately", async () => {
    expect(() => _seq([1, 2, 3]).chunk(0)).toThrow("must be positive")
})

it("is not eager", async () => {
    const s = aseq.repeat(Infinity, 1)
    const chunked = s.chunk(3)
    for await (const _ of chunked) {
        break
    }
})

it("doesn't pull more than necessary", async () => {
    const iter = jest.fn(async function* () {
        yield 1
        yield 2
        fail("should not pull next element")
    })
    const s = _seq(iter)
    const chunked = s.chunk(2)
    expect(iter).not.toHaveBeenCalled()
    for await (const _ of chunked) {
        break
    }
})

it("can iterate twice", async () => {
    const s = _seq([1, 2, 3]).chunk(2)
    await expect(s._qr).resolves.toEqual([[1, 2], [3]])
    await expect(s._qr).resolves.toEqual([[1, 2], [3]])
})

it("chunk empty as empty with projection", async () => {
    const s = _seq([]).window(1, _ => 1)
    await expect(s._qr).resolves.toEqual([])
})

it("projects singleton chunk correctly", async () => {
    const s = _seq([1, 2, 3]).chunk(1, x => x + 1)
    await expect(s._qr).resolves.toEqual([2, 3, 4])
})
it("projects pairs", async () => {
    const s = _seq([1, 2, 3, 4]).chunk(2, (a, b) => a + b!)
    await expect(s._qr).resolves.toEqual([3, 7])
})

it("accepts async projection", async () => {
    const s = _seq([1, 2, 3, 4])
        .chunk(2)
        .map(async ([a, b]) => a + b!)
    await expect(s._qr).resolves.toEqual([3, 7])
})
