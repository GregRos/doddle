import { lazy, memoize, type Lazy } from "@lib"

it("memoizes sync", () => {
    let count = 0
    const func = () => count++
    const memFunc = memoize(func) satisfies () => number
    expect(memFunc()).toEqual(0)
    expect(memFunc()).toEqual(0)
})

it("memoizes async", async () => {
    let count = 0
    const func = async () => count++
    const memFunc = memoize(func) satisfies () => Promise<number>
    await expect(memFunc()).resolves.toBe(0)
    await expect(memFunc()).resolves.toBe(0)
})

it("doesn't memoize twice", () => {
    const memo = memoize(() => 1)
    const memo2 = memoize(memo)
    expect(memo).toBe(memo2)
})

it("even if a type arg is involved, Lazy.Pulled should not be introduced", () => {
    function generic<T>() {
        memoize(() => null! as T) satisfies () => T
    }
    generic()
})

it("if Lazy is explicitly involved, Lazy.Pulled should be introduced", () => {
    function generic<T>() {
        memoize(() => lazy(() => null! as T)) satisfies () => Lazy.Pulled<T>
    }
    generic()
})

it("if LazyAsync is explicitly involved, Promise<Lazy.PulledAwaited> should be introduced", () => {
    function generic<T>() {
        memoize(() => lazy(async () => null! as T)) satisfies () => Promise<Lazy.PulledAwaited<T>>
    }
    generic()
})

it("if any is explicitly involved, the result should be any", () => {
    const f = () => 1 as any
    memoize(f) satisfies () => any
})
