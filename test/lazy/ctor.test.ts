import { Doddle, doddle, type DoddleAsync } from "@lib"
import { declare, type, type_of } from "declare-it"

declare.it("Lazy<1> from () => 1", expect => {
    expect(type_of(doddle(() => 1))).to_equal(type<Doddle<number>>)
})

declare.it("LazyAsync<1> from () => Promise<1>", expect => {
    expect(type_of(doddle(async () => 1))).to_equal(type<DoddleAsync<number>>)
})

declare.it("Lazy<1> from () => Lazy<1>", expect => {
    expect(type_of(doddle(() => doddle(() => 1)))).to_equal(type<Doddle<number>>)
})

declare.it("LazyAsync<1> from () => LazyAsync<1>", expect => {
    expect(type_of(doddle(async () => doddle(async () => 1)))).to_equal(type<DoddleAsync<number>>)
})

declare.it("LazyAsync<1> from () => Promise<Lazy<1>>", expect => {
    expect(type_of(doddle(async () => doddle(() => 1)))).to_equal(type<DoddleAsync<number>>)
})

declare.it("LazyAsync<1> from () => Promise<Lazy<Promise<1>>>", expect => {
    expect(type_of(doddle(async () => doddle(async () => 1)))).to_equal(type<DoddleAsync<number>>)
})

declare.it("LazyAsync<1> from deeper nestings", expect => {
    expect(type_of(doddle(() => doddle(async () => doddle(async () => 1))))).to_equal(
        type<DoddleAsync<number>>
    )
    expect(type_of(doddle(async () => doddle(() => doddle(() => 1))))).to_equal(
        type<DoddleAsync<number>>
    )
})

it("lazy<1> for lazy(() => 1)", () => {
    const lz = doddle(() => 1)
    expect(lz).toBeInstanceOf(Doddle)
    expect(lz.pull()).toEqual(1)
})

it("lazyAsync<1> for lazy(async () => 1)", async () => {
    const lz = doddle(async () => 1)
    expect(lz).toBeInstanceOf(Doddle)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazy<1> for lazy(() => lazy(() => 1))", () => {
    const lz = doddle(() => doddle(() => 1))
    expect(lz).toBeInstanceOf(Doddle)
    expect(lz.pull()).toEqual(1)
})

it("lazyAsync<1> for lazy(async () => lazy(async () => 1))", async () => {
    const lz = doddle(async () => doddle(async () => 1))
    expect(lz).toBeInstanceOf(Doddle)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazyAsync<1> for lazy(() => lazy(async () => 1))", async () => {
    const lz = doddle(() => doddle(async () => 1))
    expect(lz).toBeInstanceOf(Doddle)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazyAsync<1> for lazy(async () => lazy(() => 1))", async () => {
    const lz = doddle(async () => doddle(() => 1))
    expect(lz).toBeInstanceOf(Doddle)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazyAsync<1> for lazy(async () => lazy(async () => 1))", async () => {
    const lz = doddle(async () => doddle(async () => 1))
    expect(lz).toBeInstanceOf(Doddle)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazy(lazy.pull) returns self", () => {
    const lazy1 = doddle(() => 1)
    const lz = doddle(lazy1.pull)
    expect(lz).toBe(lazy1)
})
