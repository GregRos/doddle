import { lazy, Lazy, LazyAsync } from "../.."

const sync = lazy(() => 1)
const asy = lazy(async () => 1)
it("lazy map 1 => lazy(1)", () => {
    const lz2 = sync.map(x => {
        expect(x).toBe(1)
        return x
    }) satisfies Lazy<number>
    expect(lz2.pull() satisfies number).toBe(1)
})
it("lazy map lazy 1 => lazy(1)", () => {
    const lz2 = sync.map(x => {
        expect(x).toBe(1)
        return lazy(() => x satisfies number)
    }) satisfies Lazy<number>
    expect(lz2.pull() satisfies number).toBe(1)
})
it("lazy map async 1 to lazyAsync(1)", async () => {
    const lz2 = sync.map(async x => {
        expect(x).toBe(1)
        return x satisfies number
    }) satisfies LazyAsync<number>
    expect((await lz2.pull()) satisfies number).toBe(1)
})

it("lazy map async lazy 1 to lazyAsync(1)", async () => {
    const lz2 = sync.map(async x => {
        expect(x).toBe(1)
        return lazy(() => x satisfies number)
    }) satisfies LazyAsync<number>
    expect((await lz2.pull()) satisfies number).toBe(1)
})

it("lazy map lazy async lazy async 1 to lazyAsync(1)", async () => {
    const lz2 = sync.map(async x => {
        expect(x).toBe(1)
        return lazy(async () => x satisfies number)
    }) satisfies LazyAsync<number>

    expect((await lz2.pull()) satisfies number).toBe(1)
})

it("lazy async map 1", async () => {
    const lz = asy.map(async x => {
        expect(x).toBe(1)
        return x satisfies number
    }) satisfies LazyAsync<number>
    expect((await lz.pull()) satisfies number).toBe(1)
})
it("lazy async map lazy 1", async () => {
    const lz = asy.map(async x => {
        expect(x).toBe(1)
        return lazy(() => x satisfies number)
    }) satisfies LazyAsync<number>
    expect((await lz.pull()) satisfies number).toBe(1)
})
it("lazy async map async 1", async () => {
    const lz = asy.map(async x => {
        expect(x).toBe(1)
        return x satisfies number
    }) satisfies LazyAsync<number>
    expect((await lz.pull()) satisfies number).toBe(1)
})
it("lazy async map async lazy 1", async () => {
    const lz = asy.map(async x => {
        expect(x).toBe(1)
        return lazy(() => x satisfies number)
    }) satisfies LazyAsync<number>
    expect((await lz.pull()) satisfies number).toBe(1)
})
it("lazy async map lazy async 1", async () => {
    const lz = asy.map(async x => {
        expect(x).toBe(1)
        return lazy(async () => x satisfies number)
    }) satisfies LazyAsync<number>
    expect((await lz.pull()) satisfies number).toBe(1)
})
it("lazy async map async lazy async 1", async () => {
    const lz = asy.map(async x => {
        expect(x).toBe(1)
        return lazy(async () => x satisfies number)
    }) satisfies LazyAsync<number>
    expect((await lz.pull()) satisfies number).toBe(1)
})
it("lazy T map T", () => {
    function generic<T>(x: T) {
        const lz = lazy(() => x) satisfies Lazy<T>
        return lz.map(x => {
            expect(x).toBe(1 as any)
            return x satisfies Lazy.PulledAwaited<T>
        }) satisfies Lazy<Lazy.PulledAwaited<T>>
    }
    expect(generic(1).pull() satisfies number).toBe(1)
})
it("lazy T map async T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(() => x) satisfies Lazy<T>
        return lz.map(async x => {
            expect(x).toBe(1 as any)
            return x satisfies Lazy.PulledAwaited<T>
        }) satisfies LazyAsync<Lazy.PulledAwaited<T>>
    }
    await expect(generic(1).pull() satisfies Promise<number>).resolves.toBe(1)
})
it("lazy T map lazy T", () => {
    function generic<T>(x: T) {
        const lz = lazy(() => x) satisfies Lazy<T>
        return lz.map(x => {
            expect(x).toBe(1 as any)
            return lazy(() => x satisfies Lazy.PulledAwaited<T>)
        }) satisfies Lazy<Lazy.PulledAwaited<T>>
    }
    expect(generic(1).pull() satisfies number).toBe(1)
})
it("lazy T map async lazy T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(() => x) satisfies Lazy<T>
        return lz.map(async x => {
            expect(x).toBe(1 as any)
            return lazy(() => x satisfies Lazy.PulledAwaited<T>)
        }) satisfies LazyAsync<Lazy.PulledAwaited<T>>
    }
    await expect(generic(1).pull() satisfies Promise<number>).resolves.toBe(1)
})
it("lazy T map lazy async T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(() => x) satisfies Lazy<T>
        return lz.map(x => {
            expect(x).toBe(1 as any)
            return lazy(async () => x satisfies Lazy.PulledAwaited<T>)
        }) satisfies LazyAsync<Lazy.PulledAwaited<T>>
    }
    await expect(generic(1).pull()).resolves.toBe(1)
})
it("lazy T map async lazy async T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(() => x) satisfies Lazy<T>
        return lz.map(async x => {
            expect(x).toBe(1 as any)
            return lazy(async () => x satisfies Lazy.PulledAwaited<T>)
        }) satisfies LazyAsync<Lazy.PulledAwaited<T>>
    }
    await expect(generic(1).pull() satisfies Promise<number>).resolves.toBe(1)
})

it("lazy T map lazy async T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(() => x) satisfies Lazy<T>
        return lz.map(x => lazy(async () => x satisfies Lazy.PulledAwaited<T>)) satisfies LazyAsync<
            Lazy.PulledAwaited<T>
        >
    }
    await expect(generic(1).pull() satisfies Promise<number>).resolves.toBe(1)
})
it("lazy T map async lazy async T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(() => x) satisfies Lazy<T>
        return lz.map(async x =>
            lazy(async () => x satisfies Lazy.PulledAwaited<T>)
        ) satisfies LazyAsync<Lazy.PulledAwaited<T>>
    }
    await expect(generic(1).pull() satisfies Promise<number>).resolves.toBe(1)
})

it("lazy async T map T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(async () => x) satisfies LazyAsync<T>
        return lz.map(x => x satisfies Lazy.PulledAwaited<T>) satisfies LazyAsync<
            Lazy.PulledAwaited<T>
        >
    }
    await expect(generic(1).pull() satisfies Promise<number>).resolves.toBe(1)
})

it("lazy async T map async T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(async () => x) satisfies LazyAsync<T>
        return lz.map(async x => x satisfies Lazy.PulledAwaited<T>) satisfies LazyAsync<
            Lazy.PulledAwaited<T>
        >
    }
    await expect(generic(1).pull() satisfies Promise<number>).resolves.toBe(1)
})
it("lazy async T map lazy T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(async () => x) satisfies LazyAsync<T>
        return lz.map(x => lazy(() => x satisfies Lazy.PulledAwaited<T>)) satisfies LazyAsync<
            Lazy.PulledAwaited<T>
        >
    }
    await expect(generic(1).pull() satisfies Promise<number>).resolves.toBe(1)
})
it("lazy async T map async lazy T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(async () => x) satisfies LazyAsync<T>
        return lz.map(async x => lazy(() => x satisfies Lazy.PulledAwaited<T>)) satisfies LazyAsync<
            Lazy.PulledAwaited<T>
        >
    }
    await expect(generic(1).pull() satisfies Promise<number>).resolves.toBe(1)
})
it("lazy async T map lazy async T", async () => {
    function generic<T>(x: T) {
        const lz = lazy(async () => x) satisfies LazyAsync<T>
        return lz.map(x => lazy(async () => x satisfies Lazy.PulledAwaited<T>)) satisfies LazyAsync<
            Lazy.PulledAwaited<T>
        >
    }
    await expect(generic(1).pull() satisfies Promise<number>).resolves.toBe(1)
})
