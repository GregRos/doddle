import { doddle, Doddle } from "@lib"
import { declare, type } from "declare-it"

it("no name normalizes to empty", () => {
    const lz = doddle(() => 1)
    expect(lz.info.name).toEqual("")
})

it("name is recovered", () => {
    const lz = doddle(function foo() {
        return 1
    })
    expect(lz.info.name).toEqual("foo")
    expect(lz.toString()).toEqual("doddle(foo) <untouched>")
})

it("starts out untouched", () => {
    const lz = doddle(() => 1)
    expect(lz.info).toEqual({
        desc: expect.any(String),
        isReady: false,
        name: "",
        stage: "untouched",
        syncness: "untouched"
    })
})
declare.it("If S ⊆ T then Doddle<S> ⊆ Doddle<T>", expect => {
    expect(type<Doddle<1>>).to_subtype(type<Doddle<number>>)
    const _: Doddle<number> = doddle(() => 1 as const)
    function __<T, S extends T>() {
        const _: Doddle<T> = null! as Doddle<S>
    }
})

it("pulling changes stage (in sync)", () => {
    const lz = doddle(() => {
        expect(lz.info.stage).toEqual("executing")
    })
    lz.pull()
    expect(lz.info.stage).toEqual("done")
})

it("pulling changes stage (in async)", async () => {
    const lz = doddle(async () => {
        expect(lz.info.stage).toEqual("executing")
        expect(lz.toString()).toEqual("doddle <executing>")
        return 5
    })
    const p = lz.pull()
    expect(lz.info.stage).toEqual("executing")
    await p
    expect(lz.info.stage).toEqual("done")
    expect(lz.toString()).toEqual("doddle async number")
})

it("pulling changes syncness (in sync)", () => {
    const lz = doddle(() => {
        expect(lz.info.syncness).toEqual("untouched")
    })
    lz.pull()
    expect(lz.toString()).toEqual("doddle sync undefined")
    expect(lz.info.syncness).toEqual("sync")
})

it("pulling changes syncness (in async)", async () => {
    const lz = doddle(async () => {
        expect(lz.info.syncness).toEqual("untouched")
        expect(lz.toString()).toEqual("doddle <executing>")
    })
    const p = lz.pull()
    expect(lz.info.syncness).toEqual("async")
    expect(lz.toString()).toEqual("doddle async <executing>")
    await p
    expect(lz.info.syncness).toEqual("async")
})

it.skip("(re)throws error on pull, only calls init once", () => {
    const init = jest.fn(() => {
        throw new Error("test")
    })
    const lz = doddle(init)
    expect(() => lz.pull()).toThrow("test")
    expect(() => lz.pull()).toThrow("test")
    expect(init).toHaveBeenCalledTimes(1)
})

it.skip("async (re)throws error on pull, only calls init once", async () => {
    const init = jest.fn(async () => {
        throw new Error("test")
    })
    const lz = doddle(init)
    await expect(lz.pull()).rejects.toThrow("test")
    await expect(lz.pull()).rejects.toThrow("test")
    expect(init).toHaveBeenCalledTimes(1)
})

it("trying to pull in sync context as part of init throws", () => {
    const lz = doddle(() => {
        lz.pull()
    })
    expect(() => lz.pull()).toThrow("pull")
})

it("pulling multiple times while init is happening in async context returns same promise", async () => {
    const lz = doddle(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return 1
    })
    const p1 = lz.pull()
    const p2 = lz.pull()
    expect(p1).toBe(p2)
    expect(await p1).toBe(1)
    expect(await p2).toBe(1)
})
