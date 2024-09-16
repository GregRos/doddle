import { Doddle, doddle, type DoddleAsync } from "@lib"
import { declare, type, type_of } from "declare-it"

declare.it("Doddle<1> from () => 1", expect => {
    expect(type_of(doddle(() => 1))).to_equal(type<Doddle<number>>)
})

declare.it("DoddleAsync<1> from () => Promise<1>", expect => {
    expect(type_of(doddle(async () => 1))).to_equal(type<DoddleAsync<number>>)
})

declare.it("Doddle<1> from () => Doddle<1>", expect => {
    expect(type_of(doddle(() => doddle(() => 1)))).to_equal(type<Doddle<number>>)
})

declare.it("DoddleAsync<1> from () => DoddleAsync<1>", expect => {
    expect(type_of(doddle(async () => doddle(async () => 1)))).to_equal(type<DoddleAsync<number>>)
})

declare.it("DoddleAsync<1> from () => Promise<Doddle<1>>", expect => {
    expect(type_of(doddle(async () => doddle(() => 1)))).to_equal(type<DoddleAsync<number>>)
})

declare.it("DoddleAsync<1> from () => Promise<Doddle<Promise<1>>>", expect => {
    expect(type_of(doddle(async () => doddle(async () => 1)))).to_equal(type<DoddleAsync<number>>)
})

declare.it("DoddleAsync<1> from deeper nestings", expect => {
    expect(type_of(doddle(() => doddle(async () => doddle(async () => 1))))).to_equal(
        type<DoddleAsync<number>>
    )
    expect(type_of(doddle(async () => doddle(() => doddle(() => 1))))).to_equal(
        type<DoddleAsync<number>>
    )
})

it("doddle<1> for doddle(() => 1)", () => {
    const lz = doddle(() => 1)
    expect(lz).toBeInstanceOf(Doddle)
    expect(lz.pull()).toEqual(1)
})

it("lazyAsync<1> for doddle(async () => 1)", async () => {
    const lz = doddle(async () => 1)
    expect(lz).toBeInstanceOf(Doddle)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("doddle<1> for doddle(() => doddle(() => 1))", () => {
    const lz = doddle(() => doddle(() => 1))
    expect(lz).toBeInstanceOf(Doddle)
    expect(lz.pull()).toEqual(1)
})

it("lazyAsync<1> for doddle(async () => doddle(async () => 1))", async () => {
    const lz = doddle(async () => doddle(async () => 1))
    expect(lz).toBeInstanceOf(Doddle)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazyAsync<1> for doddle(() => doddle(async () => 1))", async () => {
    const lz = doddle(() => doddle(async () => 1))
    expect(lz).toBeInstanceOf(Doddle)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazyAsync<1> for doddle(async () => doddle(() => 1))", async () => {
    const lz = doddle(async () => doddle(() => 1))
    expect(lz).toBeInstanceOf(Doddle)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("lazyAsync<1> for doddle(async () => doddle(async () => 1))", async () => {
    const lz = doddle(async () => doddle(async () => 1))
    expect(lz).toBeInstanceOf(Doddle)
    await expect(lz.pull()).resolves.toEqual(1)
})

it("doddle(doddle.pull) returns self", () => {
    const lazy1 = doddle(() => 1)
    const lz = doddle(lazy1.pull)
    expect(lz).toBe(lazy1)
})
