import { doddle, type Doddle, type DoddleAsync } from "@lib"
import { declare, type, type_of } from "declare-it"
import { lazies } from "./lazies.helper"

const handlers = {
    sync() {
        return jest.fn(() => 2 as 2)
    },
    async() {
        return jest.fn(async () => 2 as 2)
    },
    mixed() {
        return jest.fn(() => 2 as 2 | Promise<2>)
    },
    any() {
        return jest.fn(() => 2 as any)
    },
    doddle_sync() {
        return jest.fn(() => doddle(() => 2 as 2))
    },
    doddle_async() {
        return jest.fn(() => doddle(async () => 2 as 2))
    },
    doddle_mixed() {
        return jest.fn(() => doddle(() => 2 as 2 | Promise<2>))
    },
    doddle_any() {
        return jest.fn(() => doddle(() => 2 as any))
    }
}
declare.it("sync.catch(sync) = sync", expect => {
    const myDoddle = lazies.sync().catch(handlers.sync())
    expect(type_of(myDoddle)).to_equal(type<Doddle<1 | 2>>)
})

declare.it("sync.catch(async) = mixed", expect => {
    // @ts-expect-error Should not allow sync catch with async handler
    const myDoddle = lazies.sync().catch(handlers.async())
})

declare.it("sync.catch(mixed) = mixed", expect => {
    // @ts-expect-error Should not allow sync catch with mixed handler
    const myDoddle = lazies.sync().catch(handlers.mixed())
})

declare.it("sync.catch(any) = any", expect => {
    const myDoddle = lazies.sync().catch(handlers.any())
    expect(type_of(myDoddle)).to_equal(type<Doddle<any>>)
})

declare.it("sync.catch(doddle sync) = sync", expect => {
    const myDoddle = lazies.sync().catch(handlers.doddle_sync())
    expect(type_of(myDoddle)).to_equal(type<Doddle<1 | 2>>)
})

declare.it("sync.catch(doddle async) = mixed", expect => {
    // @ts-expect-error Should not allow sync doddle with async catch
    lazies.sync().catch(handlers.doddle_async())
})

declare.it("sync.catch(doddle mixed) = mixed", expect => {
    // @ts-expect-error Should not allow sync doddle with mixed catch
    lazies.sync().catch(handlers.doddle_mixed())
})

declare.it("sync.catch(doddle any) = any", expect => {
    const myDoddle = lazies.sync().catch(handlers.doddle_any())
    expect(type_of(myDoddle)).to_equal(type<Doddle<any>>)
})

declare.it("async.catch(sync) = async", expect => {
    const myDoddle = lazies.async().catch(handlers.sync())
    expect(type_of(myDoddle)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(async) = async", expect => {
    const myDoddle = lazies.async().catch(handlers.async())
    expect(type_of(myDoddle)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(mixed) = async", expect => {
    const myDoddle = lazies.async().catch(handlers.mixed())
    expect(type_of(myDoddle)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(any) = any", expect => {
    const myDoddle = lazies.async().catch(handlers.any())
    expect(type_of(myDoddle)).to_equal(type<DoddleAsync<any>>)
})

declare.it("async.catch(doddle sync) = async", expect => {
    const myDoddle = lazies.async().catch(handlers.doddle_sync())
    expect(type_of(myDoddle)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(doddle async) = async", expect => {
    const myDoddle = lazies.async().catch(handlers.doddle_async())
    expect(type_of(myDoddle)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(doddle mixed) = async", expect => {
    const myDoddle = lazies.async().catch(handlers.doddle_mixed())
    expect(type_of(myDoddle)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(doddle any) = any", expect => {
    const myDoddle = lazies.async().catch(handlers.doddle_any())
    expect(type_of(myDoddle)).to_equal(type<DoddleAsync<any>>)
})

declare.it("mixed.catch(sync) = mixed", expect => {
    const myDoddle = lazies.mixed().catch(handlers.sync())
    expect(type_of(myDoddle)).to_equal(type<Doddle<1 | 2 | Promise<1>>>)
})

declare.it("mixed.catch(async) = mixed", expect => {
    const myDoddle = lazies.mixed().catch(handlers.async())
    expect(type_of(myDoddle)).to_equal(type<Doddle<1 | Promise<1> | Promise<2>>>)
})

declare.it("mixed.catch(mixed) = mixed", expect => {
    const myDoddle = lazies.mixed().catch(handlers.mixed())
    expect(type_of(myDoddle)).to_equal(type<Doddle<1 | 2 | Promise<1> | Promise<2>>>)
})

it("sync.catch(sync) - no error", () => {
    const handler = handlers.sync()
    const myDoddle = doddle(() => 1).catch(handler)
    expect(myDoddle.pull()).toBe(1)
    expect(handler).not.toHaveBeenCalled()
})

it("no error async", async () => {
    const handler = handlers.async()
    const myDoddle = doddle(async () => 1).catch(handler)
    await expect(myDoddle.pull()).resolves.toBe(1)
    expect(handler).not.toHaveBeenCalled()
})

it("sync error caught sync", () => {
    const fn = handlers.sync()
    const myDoddle = doddle(() => {
        throw "test"
    }).catch(fn)
    expect(myDoddle.pull()).toBe(2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith("test")
})

it("async error caught async", async () => {
    const fn = handlers.async()
    const myDoddle = doddle(async () => {
        throw "test"
    }).catch(fn)
    await expect(myDoddle.pull()).resolves.toBe(2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith("test")
})

it("sync error caught async", async () => {
    const fn = handlers.async()
    const myDoddle = doddle(() => {
        throw "test"
    }).catch(fn)
    await expect(myDoddle.pull()).resolves.toBe(2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith("test")
})

it("async error caught sync gives async", async () => {
    const fn = handlers.sync()
    const myDoddle = doddle(async () => {
        throw "test"
    }).catch(fn)
    await expect(myDoddle.pull()).resolves.toBe(2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith("test")
})
