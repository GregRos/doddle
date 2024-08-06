import { declare, type, type_of } from "declare-it"
import type { LazyAsync } from "@lib"
import { aseq } from "@lib"

const _seq = aseq
declare.test("correctly typed as LazyAsync and disjunction with undefined", expect => {
    const s = _seq([1, 2, 3]).at(0)
    expect(type_of(s)).to_equal(type<LazyAsync<number | undefined>>)
})

it("gets first element", async () => {
    const s = _seq([1, 2, 3]).at(0)
    await expect(s.pull()).resolves.toEqual(1)
})

it("gets last element", async () => {
    const s = _seq([1, 2, 3]).at(2)
    await expect(s.pull()).resolves.toEqual(3)
})

it("gets undefined for out of bounds", async () => {
    const s = _seq([1, 2, 3]).at(3)
    await expect(s.pull()).resolves.toEqual(undefined)
})

it("gets last item for negative index", async () => {
    const s = _seq([1, 2, 3]).at(-1)
    await expect(s.pull()).resolves.toEqual(3)
})

it("gets first item for negative index", async () => {
    const s = _seq([1, 2, 3]).at(-3)
    await expect(s.pull()).resolves.toEqual(1)
})

it("has no side-effects before pull", async () => {
    const fn = jest.fn(async function* () {})
    const s = _seq(fn)
    const lazy = s.at(0)
    expect(fn).not.toHaveBeenCalled()
    await lazy.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

describe("invalid inputs", () => {
    describe("throws on invocation", () => {
        it("non-number index", async () => {
            // @ts-expect-error
            await expect(async () => await _aseq([1, 2, 3]).at("0").pull()).rejects.toThrow()
        })

        it("non-integer index", async () => {
            await expect(async () => await _seq([1, 2, 3]).at(0.5).pull()).rejects.toThrow()
            await expect(async () => await _seq([1, 2, 3]).at(NaN).pull()).rejects.toThrow()
            await expect(async () => await _seq([1, 2, 3]).at(Infinity).pull()).rejects.toThrow()
            await expect(async () => await _seq([1, 2, 3]).at(-Infinity).pull()).rejects.toThrow()
        })

        it("bigint index", async () => {
            // @ts-expect-error
            await expect(async () => await _aseq([1, 2, 3]).at(0n).pull()).rejects.toThrow()
        })
    })
})
