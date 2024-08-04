/* eslint-disable @typescript-eslint/no-unused-vars */

import { lazy, Lazy, LazyAsync, Pulled, PulledAwaited } from ".."

it("lazy<1> for lazy 1", () => {
    const lz = lazy(() => 1) satisfies Lazy<number>
    expect(lz).toBeInstanceOf(Lazy)
    expect(lz.pull()).toEqual(1)
})

it("lazyAsync<1> for lazy async 1", async () => {
    const lz = lazy(async () => 1) satisfies LazyAsync<number> satisfies Lazy<Promise<number>>
    expect(lz).toBeInstanceOf(Lazy)
    await expect(lz.pull() satisfies Promise<number>).resolves.toBe(1)
})

it("lazy<async<1>> for lazy thenable 1", async () => {
    const lz = lazy(() => ({
        then: Promise.resolve(1).then.bind(Promise.resolve(1))
    }))
    await expect(lz.pull() satisfies PromiseLike<number>).resolves.toBe(1)
})

it("lazy<1> for lazy lazy 1", () => {
    const lz = lazy(() => lazy(() => 1)).map(x => x) satisfies Lazy<number>
    expect(lz.pull()).toEqual(1)
})

it("lazy<async<1>> for lazy lazy async 1", async () => {
    const lz = lazy(() => lazy(async () => 1)) satisfies LazyAsync<number>
    await expect(lz.pull()).resolves.toBe(1)
})

it("lazy<async<1>> lazy async lazy 1", async () => {
    const lz = lazy(async () => lazy(() => 1)) satisfies LazyAsync<number>
    lz.pull() satisfies Promise<number>
})

it("lazy<async<1>> for lazy async lazy async 1", async () => {
    const lz = lazy(async () => lazy(async () => 1)) satisfies LazyAsync<number>
    lz.pull() satisfies Promise<number>
})

it("lazyAsync<T> for lazy async T", async () => {
    async function generic<T>(x: T) {
        const lz = lazy(async () => x as T) satisfies LazyAsync<T>
        const pulledAwaited = (await lz.pull()) satisfies PulledAwaited<T>
        return pulledAwaited
    }
    ;(await generic(1)) satisfies number
})

it("lazy<T> for lazy lazy T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(() => lazy(() => x as T)) satisfies Lazy<T>
        const pulled = lz.pull() satisfies Pulled<T>
        return pulled
    }
    generic(1) satisfies number
})

it("lazyAsync<T> for lazy lazy async T", async () => {
    async function generic<T extends { a: 1 }>(x: T) {
        const lz = lazy(() => lazy(async () => x as T)) satisfies LazyAsync<T>
        const pulled = (await lz.pull()) satisfies PulledAwaited<T>
        return pulled
    }
    ;(await generic({ a: 1 })) satisfies { a: 1 }
})

it("lazyAsync<T> for lazy async lazy T", async () => {
    async function generic<T>(x: T) {
        const lz = lazy(async () => lazy(() => x)) satisfies LazyAsync<T>
        const pulled = (await lz.pull()) satisfies PulledAwaited<T>
        return pulled
    }
    const pulled = await generic(1)
    expect(pulled).toEqual(1)
})
it("lazyAsync<T> for lazy async lazy async T", async <T>() => {
    async function generic<T>(x: T) {
        const lz = lazy(async () => lazy(async () => null! as T)) satisfies LazyAsync<T>
        const pulled = (await lz.pull()) satisfies PulledAwaited<T>
        return pulled
    }
    const pulled = await generic(1)
    return
})
