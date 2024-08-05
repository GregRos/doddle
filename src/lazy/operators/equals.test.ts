import { declare, type, type_of } from "declare-it"
import { lazy, Lazy, LazyAsync } from "../.."

const sync = lazy(() => 1)
const asy = lazy(async () => 1)

declare.it("lazy equals value gives Lazy<boolean>", expect => {
    expect(type_of(lazy(() => 1).equals(1))).to_equal(type<Lazy<boolean>>)
    expect(type_of(lazy(() => 1 as 1).equals(1 as number))).to_equal(type<Lazy<boolean>>)
    expect(type_of(lazy(() => 1 as number).equals(1 as 1))).to_equal(type<Lazy<boolean>>)
})

declare.it("lazy equals lazy value gives Lazy<boolean>", expect => {
    expect(type_of(lazy(() => 1).equals(lazy(() => 1)))).to_equal(type<Lazy<boolean>>)
    expect(type_of(lazy(() => 1 as 1).equals(lazy(() => 1 as number)))).to_equal(
        type<Lazy<boolean>>
    )
    expect(type_of(lazy(() => 1 as number).equals(lazy(() => 1 as 1)))).to_equal(
        type<Lazy<boolean>>
    )
})

declare.it("lazy equals lazy async gives LazyAsync<boolean>", expect => {
    const eq = lazy(() => 1).equals(lazy(async () => 1))
    expect(type_of(eq)).to_equal(type<LazyAsync<boolean>>)
    expect(type_of(lazy(() => 1 as 1).equals(lazy(async () => 1 as number)))).to_equal(
        type<LazyAsync<boolean>>
    )
    expect(type_of(lazy(() => 1 as number).equals(lazy(async () => 1 as 1)))).to_equal(
        type<LazyAsync<boolean>>
    )
})

declare.it("lazy async equals value gives LazyAsync<boolean>", expect => {
    expect(type_of(lazy(async () => 1).equals(1))).to_equal(type<LazyAsync<boolean>>)
    expect(type_of(lazy(async () => 1 as 1).equals(1 as number))).to_equal(type<LazyAsync<boolean>>)
    expect(type_of(lazy(async () => 1 as number).equals(1 as 1))).to_equal(type<LazyAsync<boolean>>)
})

declare.it("lazy async equals lazy gives LazyAsync<boolean>", expect => {
    const eq = lazy(async () => 1).equals(lazy(() => 1))
    expect(type_of(eq)).to_equal(type<LazyAsync<boolean>>)
    expect(type_of(lazy(async () => 1 as 1).equals(lazy(() => 1 as number)))).to_equal(
        type<LazyAsync<boolean>>
    )
    expect(type_of(lazy(async () => 1 as number).equals(lazy(() => 1 as 1)))).to_equal(
        type<LazyAsync<boolean>>
    )
})

declare.it("lazy async equals lazy async gives LazyAsync<boolean>", expect => {
    const eq = lazy(async () => 1).equals(lazy(async () => 1))
    expect(type_of(eq)).to_equal(type<LazyAsync<boolean>>)
    expect(type_of(lazy(async () => 1 as 1).equals(lazy(async () => 1 as number)))).to_equal(
        type<LazyAsync<boolean>>
    )
    expect(type_of(lazy(async () => 1 as number).equals(lazy(async () => 1 as 1)))).to_equal(
        type<LazyAsync<boolean>>
    )
})

declare.it("equals not callable with different types", expect => {
    // @ts-expect-error
    lazy(() => 1).equals("1")
    // @ts-expect-error
    lazy(() => 1).equals(null)
    // @ts-expect-error
    lazy(() => 1).equals(undefined)
    // @ts-expect-error
    lazy(() => 1).equals(lazy(() => "a"))
    // @ts-expect-error
    lazy(() => 1).equals(lazy(() => null))
    // @ts-expect-error
    lazy(() => 1).equals(lazy(async () => undefined))
})

it("lazy equals value", () => {
    const lz = lazy(() => 1)
    expect(lz.equals(1).pull()).toBe(true)
})

it("lazy async equals value", async () => {
    const lz = lazy(async () => 1)
    expect(await lz.equals(1).pull()).toBe(true)
})

it("lazy equals lazy", () => {
    const lz = lazy(() => 1)
    expect(lz.equals(lz).pull()).toBe(true)
})

it("lazy async equals lazy", async () => {
    const lz = lazy(async () => 1)
    expect(await lz.equals(lz).pull()).toBe(true)
})

it("lazy equals lazy async", async () => {
    const lz = lazy(() => 1)
    const lz2 = lazy(async () => 1)
    expect(await lz.equals(lz2).pull()).toBe(true)
})

it("lazy async equals lazy async", async () => {
    const lz = lazy(async () => 1)
    const lz2 = lazy(async () => 1)
    expect(await lz.equals(lz2).pull()).toBe(true)
})

it("lazy equals value false", () => {
    const lz = lazy(() => 1)
    expect(lz.equals(2).pull()).toBe(false)
})

it("lazy async equals value false", async () => {
    const lz = lazy(async () => 1)
    expect(await lz.equals(2).pull()).toBe(false)
})

it("lazy equals lazy false", () => {
    const lz = lazy(() => 1)
    expect(lz.equals(lazy(() => 2)).pull()).toBe(false)
})

it("lazy async equals lazy false", async () => {
    const lz = lazy(async () => 1)
    expect(await lz.equals(lazy(() => 2)).pull()).toBe(false)
})

it("lazy equals lazy async false", async () => {
    const lz = lazy(() => 1)
    const lz2 = lazy(async () => 2)
    expect(await lz.equals(lz2).pull()).toBe(false)
})

it("lazy async equals lazy async false", async () => {
    const lz = lazy(async () => 1)
    const lz2 = lazy(async () => 2)
    expect(await lz.equals(lz2).pull()).toBe(false)
})

it("uses strict equality", () => {
    const lz = lazy(() => 1)
    expect(lz.equals("1" as any).pull()).toBe(false)
})

it("works for null, undefined", () => {
    const lz = lazy(() => null)
    expect(lz.equals(null).pull()).toBe(true)
    expect(lz.equals(undefined as any).pull()).toBe(false)
})
