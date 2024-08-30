import { aseq, lazy } from "@lib"
import { declare } from "declare-it"

describe("async", () => {
    declare.it("callable with various returns", async () => {
        await aseq.empty().after(() => {})
        await aseq.empty().after(() => 1)
        await aseq.empty().after(() => [])
    })

    it("empty stays empty", async () => {
        expect(
            await aseq
                .empty()
                .after(() => 1)
                .toArray()
                .pull()
        ).toEqual([])
    })

    it("doesn't change elements", async () => {
        expect(
            await aseq([1, 2, 3])
                .after(() => 1)
                .toArray()
                .pull()
        ).toEqual([1, 2, 3])
    })

    it("can iterate twice", async () => {
        const s = aseq([1, 2, 3]).after(() => 1)
        expect(await s.toArray().pull()).toEqual([1, 2, 3])
        expect(await s.toArray().pull()).toEqual([1, 2, 3])
    })

    it("pulls as many as needed", async () => {
        const fn = jest.fn(async () => [1, 2, 3])
        const s = aseq(fn).after(() => 1)
        await s.toArray().pull()
        expect(fn).toHaveBeenCalledTimes(1)
        await s.toArray().pull()
        expect(fn).toHaveBeenCalledTimes(2)
    })

    it("doesn't get called if end not reached", async () => {
        const fn = jest.fn(async () => [1, 2, 3])
        const afterFn = jest.fn(() => 1)
        const s = aseq(fn).after(afterFn)
        await s.take(3).toArray().pull()
        expect(fn).toHaveBeenCalledTimes(1)
        expect(afterFn).toHaveBeenCalledTimes(0)
    })

    it("gets called if end reached", async () => {
        const fn = jest.fn(async () => [1, 2, 3])
        const afterFn = jest.fn(() => 1)
        const s = aseq(fn).after(afterFn)
        await s.toArray().pull()
        expect(fn).toHaveBeenCalledTimes(1)
        expect(afterFn).toHaveBeenCalledTimes(1)
    })

    it("gets called twice if end reached twice", async () => {
        const fn = jest.fn(async () => [1, 2, 3])
        const afterFn = jest.fn(() => 1)
        const s = aseq(fn).after(afterFn)
        await s.toArray().pull()
        expect(fn).toHaveBeenCalledTimes(1)
        expect(afterFn).toHaveBeenCalledTimes(1)
        await s.toArray().pull()
        expect(fn).toHaveBeenCalledTimes(2)
        expect(afterFn).toHaveBeenCalledTimes(2)
    })

    it("awaits promise result", async () => {
        const testFn = jest.fn(async () => 1)
        const afterFn = async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            return await testFn()
        }
        const s = aseq([1, 2, 3]).after(afterFn)
        await s.toArray().pull()
        expect(testFn).toHaveBeenCalledTimes(1)
    })

    it("awaits async lazy async result", async () => {
        const testFn = jest.fn(async () => 1)
        const afterFn = async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            return lazy(testFn)
        }
        const s = aseq([1, 2, 3]).after(afterFn)
        await s.toArray().pull()
        expect(testFn).toHaveBeenCalledTimes(1)
    })
})
