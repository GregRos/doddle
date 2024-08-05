import { lazy } from "./input"

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
