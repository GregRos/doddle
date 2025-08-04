import { DoddleError } from "@error"
import { aseq, doddle } from "@lib"
import { declare } from "declare-it"

describe("async", () => {
    declare.it("callable with various returns", async () => {
        aseq([]).before(() => {})
        aseq([]).before(() => 1)
        aseq([]).before(() => [])
    })

    it("empty stays empty", async () => {
        expect(
            await aseq([])
                .before(() => 1)
                .toArray()
                .pull()
        ).toEqual([])
    })

    it("doesn't change elements", async () => {
        expect(
            await aseq([1, 2, 3])
                .before(() => 1)
                .toArray()
                .pull()
        ).toEqual([1, 2, 3])
    })

    it("can iterate twice", async () => {
        const s = aseq([1, 2, 3]).before(() => 1)
        expect(await s.toArray().pull()).toEqual([1, 2, 3])
        expect(await s.toArray().pull()).toEqual([1, 2, 3])
    })

    it("gets called before iteration starts", async () => {
        const fn = jest.fn(async () => [1, 2, 3])
        const beforeFn = jest.fn(() => 1)
        const s = aseq(fn).before(beforeFn)
        for await (const _ of s) {
            expect(beforeFn).toHaveBeenCalledTimes(1)
            break
        }
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("gets called once for each iteration", async () => {
        const fn = jest.fn(async () => [1, 2, 3])
        const beforeFn = jest.fn(() => 1)
        const s = aseq(fn).before(beforeFn)
        for await (const _ of s) {
            // Drain
        }
        expect(beforeFn).toHaveBeenCalledTimes(1)
        for await (const _ of s) {
            // Drain
        }
        expect(beforeFn).toHaveBeenCalledTimes(2)
    })

    it("doesn't get called if take(0) is used", async () => {
        const fn = jest.fn(async () => [1, 2, 3])
        const beforeFn = jest.fn(() => 1)
        const s = aseq(fn).before(beforeFn)
        await s.take(0).toArray().pull()
        expect(beforeFn).toHaveBeenCalledTimes(0)
    })

    it("pulls doddle result", async () => {
        const fn = jest.fn(() => 1)
        const beforeFn = () => doddle(fn)
        const s = aseq([1, 2, 3]).before(beforeFn)
        await s.toArray().pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("waits for promise result", async () => {
        const fn = jest.fn(async () => 1)
        const beforeFn = async () => {
            await new Promise(resolve => setTimeout(resolve, 1))
            return fn()
        }
        const s = aseq([1, 2, 3]).before(beforeFn)
        await s.toArray().pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })

    it("waits for async doddle async result", async () => {
        const fn = jest.fn(async () => 1)
        const beforeFn = async () =>
            doddle(async () => {
                await new Promise(resolve => setTimeout(resolve, 1))
                return fn()
            })
        const s = aseq([1, 2, 3]).before(beforeFn)
        await s.toArray().pull()
        expect(fn).toHaveBeenCalledTimes(1)
    })

    describe("invalid input", () => {
        it("throws TypeError if before function is not callable", async () => {
            await expect(async () => aseq([1, 2, 3]).before(123 as any)).rejects.toThrow(
                DoddleError
            )
        })
    })
})
