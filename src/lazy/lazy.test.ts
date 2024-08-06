import { Lazy, lazy, LazyAsync } from "@lib"
import { declare, type } from "declare-it"

describe("sync", () => {
    test("iterates as singleton when value non-iterable", () => {
        expect([...lazy(() => 1)]).toEqual([1])
    })

    test("iterates inner elements when value iterable", () => {
        expect([...lazy(() => [1, 2, 3])]).toEqual([1, 2, 3])
    })

    test("iterates inner elements when value iterable and nested", () => {
        expect([...lazy(() => lazy(() => [1, 2, 3]))]).toEqual([1, 2, 3])
    })

    test("iterates elements when nested array", () => {
        expect([
            ...lazy(() => [
                [1, 2],
                [3, 4]
            ])
        ]).toEqual([
            [1, 2],
            [3, 4]
        ])
    })
})

describe("async", () => {
    async function asyncIterateToArray<T>(iter: AsyncIterable<T>) {
        const result: T[] = []
        for await (const value of iter) {
            result.push(value)
        }
        return result
    }
    test("async iterates as singleton when value non-iterable", async () => {
        const results = asyncIterateToArray(lazy(async () => 1))
        await expect(results).resolves.toEqual([1])
    })

    test("async iterates inner elements when value iterable", async () => {
        const results = asyncIterateToArray(lazy(async () => [1, 2, 3]))
        await expect(results).resolves.toEqual([1, 2, 3])
    })

    test("async iterates inner elements when value iterable and nested", async () => {
        const results = asyncIterateToArray(lazy(async () => lazy(() => [1, 2, 3])))
        await expect(results).resolves.toEqual([1, 2, 3])
    })

    test("async iterates elements when nested array", () => {
        expect([
            ...lazy(() => [
                [1, 2],
                [3, 4]
            ])
        ]).toEqual([
            [1, 2],
            [3, 4]
        ])
    })
})

it("no name normalizes to null", () => {
    const lz = lazy(() => 1)
    expect(lz.info.name).toEqual(null)
})

it("name is recovered", () => {
    const lz = lazy(function foo() {
        return 1
    })
    expect(lz.info.name).toEqual("foo")
    expect(lz.toString()).toEqual("lazy(foo) <untouched>")
})

it("toString() is equal to Symbol.toStringTag", () => {
    const lz = lazy(() => 1)
    expect(lz.toString()).toEqual(lz[Symbol.toStringTag])
})

it("starts out untouched", () => {
    const lz = lazy(() => 1)
    expect(lz.info).toEqual({
        isReady: false,
        name: null,
        stage: "untouched",
        syncness: "untouched"
    })
})
declare.it("If S ⊆ T then Lazy<S> ⊆ Lazy<T>", expect => {
    expect(type<Lazy<1>>).to_subtype(type<Lazy<number>>)
    const _: Lazy<number> = lazy(() => 1 as const)
    function __<T, S extends T>() {
        const _: Lazy<T> = null! as Lazy<S>
    }
})

it("pulling changes stage (in sync)", () => {
    const lz = lazy(() => {
        expect(lz.info.stage).toEqual("executing")
    })
    lz.pull()
    expect(lz.info.stage).toEqual("done")
})

it("pulling changes stage (in async)", async () => {
    const lz = lazy(async () => {
        expect(lz.info.stage).toEqual("executing")
        expect(lz.toString()).toEqual("lazy <executing>")
        return 5
    })
    const p = lz.pull()
    expect(lz.info.stage).toEqual("executing")
    await p
    expect(lz.info.stage).toEqual("done")
    expect(lz.toString()).toEqual("lazy async number")
})

it("pulling changes syncness (in sync)", () => {
    const lz = lazy(() => {
        expect(lz.info.syncness).toEqual("untouched")
    })
    lz.pull()
    expect(lz.toString()).toEqual("lazy sync undefined")
    expect(lz.info.syncness).toEqual("sync")
})

it("pulling changes syncness (in async)", async () => {
    const lz = lazy(async () => {
        expect(lz.info.syncness).toEqual("untouched")
        expect(lz.toString()).toEqual("lazy <executing>")
    })
    const p = lz.pull()
    expect(lz.info.syncness).toEqual("async")
    expect(lz.toString()).toEqual("lazy async <executing>")
    await p
    expect(lz.info.syncness).toEqual("async")
})

it("(re)throws error on pull, only calls init once", () => {
    const init = jest.fn(() => {
        throw new Error("test")
    })
    const lz = lazy(init)
    expect(() => lz.pull()).toThrow("test")
    expect(() => lz.pull()).toThrow("test")
    expect(init).toHaveBeenCalledTimes(1)
})

it("async (re)throws error on pull, only calls init once", async () => {
    const init = jest.fn(async () => {
        throw new Error("test")
    })
    const lz = lazy(init)
    await expect(lz.pull()).rejects.toThrow("test")
    await expect(lz.pull()).rejects.toThrow("test")
    expect(init).toHaveBeenCalledTimes(1)
})

it("trying to pull in sync context as part of init throws", () => {
    const lz = lazy(() => {
        lz.pull()
    })
    expect(() => lz.pull()).toThrow("pull")
})

it("pulling multiple times while init is happening in async context returns same promise", async () => {
    const lz = lazy(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return 1
    })
    const p1 = lz.pull()
    const p2 = lz.pull()
    expect(p1).toBe(p2)
    expect(await p1).toBe(1)
    expect(await p2).toBe(1)
})

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
    await (lz.pull() satisfies Promise<number>)
})

it("lazy<async<1>> for lazy async lazy async 1", async () => {
    const lz = lazy(async () => lazy(async () => 1)) satisfies LazyAsync<number>
    await (lz.pull() satisfies Promise<number>)
})

it("lazyAsync<T> for lazy async T", async () => {
    async function generic<T>(x: T) {
        const lz = lazy(async () => x as T) satisfies LazyAsync<T>
        const pulledAwaited = (await lz.pull()) satisfies Lazy.PulledAwaited<T>
        return pulledAwaited
    }
    ;(await generic(1)) satisfies number
})

it("lazy<T> for lazy lazy T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(() => lazy(() => x as T)) satisfies Lazy<T>
        const pulled = lz.pull() satisfies Lazy.Pulled<T>
        return pulled
    }
    generic(1) satisfies number
})

it("lazyAsync<T> for lazy lazy async T", async () => {
    async function generic<T extends { a: 1 }>(x: T) {
        const lz = lazy(() => lazy(async () => x as T)) satisfies LazyAsync<T>
        const pulled = (await lz.pull()) satisfies Lazy.PulledAwaited<T>
        return pulled
    }
    ;(await generic({ a: 1 })) satisfies { a: 1 }
})

it("lazyAsync<T> for lazy async lazy T", async () => {
    async function generic<T>(x: T) {
        const lz = lazy(async () => lazy(() => x)) satisfies LazyAsync<T>
        const pulled = (await lz.pull()) satisfies Lazy.PulledAwaited<T>
        return pulled
    }
    const pulled = await generic(1)
    expect(pulled).toEqual(1)
})
it("lazyAsync<T> for lazy async lazy async T", async () => {
    async function generic<T>(_: T) {
        const lz = lazy(async () => lazy(async () => null! as T)) satisfies LazyAsync<T>
        const pulled = (await lz.pull()) satisfies Lazy.PulledAwaited<T>
        return pulled
    }
    await generic(1)
    return
})
