import { lazy } from "../../index.js"
it("assembles only sync", () => {
    const obj = {
        a: lazy(() => 1 as const),
        b: lazy(() => 2)
    }
    const assembled = lazy(() => 1)
        .assemble(obj)
        .pull()
    expect(assembled).toEqual({ a: 1 as const, b: 2, this: 1 })
})

it("can assemble empty", () => {
    const assembled = lazy(() => 1)
        .assemble({})
        .pull()
    expect(assembled).toEqual({ this: 1 })
})

it("assembles when this is async and others are sync", async () => {
    const obj = {
        a: lazy(() => 1 as const),
        b: lazy(() => 2)
    }
    const assembled = lazy(async () => 1)
        .assemble(obj)
        .pull()
    await expect(assembled).resolves.toEqual({ a: 1 as const, b: 2, this: 1 })
})

it("assembles when this is sync and one of the others is async", async () => {
    const obj = {
        a: lazy(() => 1 as const),
        b: lazy(async () => 2)
    }
    const assembled = lazy(() => 1)
        .assemble(obj)
        .pull()

    await expect(assembled).resolves.toEqual({ a: 1 as const, b: 2, this: 1 })
})
