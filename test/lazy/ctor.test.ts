import { Lazy, lazy, type LazyAsync } from "@lib"
import { declare, type, type_of } from "declare-it"

declare.it("Lazy<1> from () => 1", expect => {
    expect(type_of(lazy(() => 1))).to_equal(type<Lazy<number>>)
})

declare.it("LazyAsync<1> from () => Promise<1>", expect => {
    expect(type_of(lazy(async () => 1))).to_equal(type<LazyAsync<number>>)
})

declare.it("Lazy<1> from () => Lazy<1>", expect => {
    expect(type_of(lazy(() => lazy(() => 1)))).to_equal(type<Lazy<number>>)
})

declare.it("LazyAsync<1> from () => LazyAsync<1>", expect => {
    expect(type_of(lazy(async () => lazy(async () => 1)))).to_equal(type<LazyAsync<number>>)
})

declare.it("LazyAsync<1> from () => Promise<Lazy<1>>", expect => {
    expect(type_of(lazy(async () => lazy(() => 1)))).to_equal(type<LazyAsync<number>>)
})

declare.it("LazyAsync<1> from () => Promise<Lazy<Promise<1>>>", expect => {
    expect(type_of(lazy(async () => lazy(async () => 1)))).to_equal(type<LazyAsync<number>>)
})

declare.it("LazyAsync<1> from deeper nestings", expect => {
    expect(type_of(lazy(() => lazy(async () => lazy(async () => 1))))).to_equal(
        type<LazyAsync<number>>
    )
    expect(type_of(lazy(async () => lazy(() => lazy(() => 1))))).to_equal(type<LazyAsync<number>>)
})

it("lazy<1> for lazy(() => 1)", () => {
    const lz = lazy(() => 1)
    expect(lz).toBeInstanceOf(Lazy)
    expect(lz.pull()).toEqual(1)
})

it("lazyAsync<1> for lazy(async () => 1)", async () => {
    const lz = lazy(async () => 1)
    expect(lz).toBeInstanceOf(Lazy)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazy<1> for lazy(() => lazy(() => 1))", () => {
    const lz = lazy(() => lazy(() => 1))
    expect(lz).toBeInstanceOf(Lazy)
    expect(lz.pull()).toEqual(1)
})

it("lazyAsync<1> for lazy(async () => lazy(async () => 1))", async () => {
    const lz = lazy(async () => lazy(async () => 1))
    expect(lz).toBeInstanceOf(Lazy)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazyAsync<1> for lazy(() => lazy(async () => 1))", async () => {
    const lz = lazy(() => lazy(async () => 1))
    expect(lz).toBeInstanceOf(Lazy)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazyAsync<1> for lazy(async () => lazy(() => 1))", async () => {
    const lz = lazy(async () => lazy(() => 1))
    expect(lz).toBeInstanceOf(Lazy)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazyAsync<1> for lazy(async () => lazy(async () => 1))", async () => {
    const lz = lazy(async () => lazy(async () => 1))
    expect(lz).toBeInstanceOf(Lazy)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazy(lazy.pull) returns self", () => {
    const lazy1 = lazy(() => 1)
    const lz = lazy(lazy1.pull)
    expect(lz).toBe(lazy1)
})
