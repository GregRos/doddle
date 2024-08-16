import { lazy, type Lazy, type LazyAsync } from "@lib"
import { declare, type, type_of } from "declare-it"

declare.it("void callback doens't change type", expect => {
    const lz = lazy(() => 1).each(() => {})
    expect(type_of(lz)).to_equal(type<Lazy<number>>)
})

declare.it("async callback changes to lazyAsync", expect => {
    const lz = lazy(() => 1).each(async () => {})
    expect(type_of(lz)).to_equal(type<LazyAsync<number>>)
})

declare.it("mixedsync stays mixedsync with sync callback", expect => {
    const lz = lazy(() => null! as Promise<1> | 1).each(() => {})
    expect(type_of(lz)).to_equal(type<Lazy<1 | Promise<1>>>)
})

declare.it("mixedsync normalized with async callback", expect => {
    const lz = lazy(() => null! as Promise<1> | 1).each(async () => {})
    expect(type_of(lz)).to_equal(type<LazyAsync<1>>)
})

it("callback is invoked exactly once", () => {
    const fn = jest.fn()
    const lz = lazy(() => 1).each(fn)
    expect(fn).not.toHaveBeenCalled()
    lz.pull()
    expect(fn).toHaveBeenCalledTimes(1)
    lz.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("lazy returned by callback is pulled", () => {
    const fn = jest.fn()
    const lz = lazy(() => 1).each(() => lazy(fn))
    expect(fn).not.toHaveBeenCalled()
    lz.pull()
    expect(fn).toHaveBeenCalledTimes(1)
    lz.pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

it("lazy do doThing", () => {
    let i = ""
    expect(
        lazy(() => (i += "a"))
            .each(x => {
                expect(x).toBe("a")
                i += "b"
            })
            .pull()
    ).toBe("a")
    expect(i).toBe("ab")
})

it("lazy async do doThing", async () => {
    let i = ""
    await expect(
        lazy(async () => (i += "a"))
            .each(() => {
                expect(i).toBe("a")
                i += "b"
                return lazy(() => (i += "c"))
            })
            .pull()
    ).resolves.toBe("a")
    expect(i).toBe("abc")
})

it("lazy do doThing", async () => {
    let i = ""
    await expect(
        lazy(() => (i += "a"))
            .each(async x => {
                expect(x).toBe("a")
                i += "b"
                return lazy(() => (i += "c"))
            })
            .pull()
    ).resolves.toBe("a")
    expect(i).toBe("abc")
})

it("lazy async do doThing", async () => {
    let i = ""
    await lazy(async () => (i += "a"))
        .each(async x => {
            expect(x).toBe("a")
            i += "b"
            return lazy(() => (i += "c"))
        })
        .pull()
    expect(i).toBe("abc")
})

it("lazy do doThing", () => {
    let i = ""
    lazy(() => (i += "a"))
        .each(x => {
            expect(x).toBe("a")
            i += "b"
            return lazy(() => (i += "c"))
        })
        .pull()
    expect(i).toBe("abc")
})
