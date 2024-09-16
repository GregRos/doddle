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
    lazy_sync() {
        return jest.fn(() => doddle(() => 2 as 2))
    },
    lazy_async() {
        return jest.fn(() => doddle(async () => 2 as 2))
    },
    lazy_mixed() {
        return jest.fn(() => doddle(() => 2 as 2 | Promise<2>))
    },
    lazy_any() {
        return jest.fn(() => doddle(() => 2 as any))
    }
}
declare.it("sync.catch(sync) = sync", expect => {
    const myLazy = lazies.sync().catch(handlers.sync())
    expect(type_of(myLazy)).to_equal(type<Doddle<1 | 2>>)
})

declare.it("sync.catch(async) = mixed", expect => {
    const myLazy = lazies.sync().catch(handlers.async())
    expect(type_of(myLazy)).to_equal(type<Doddle<1 | Promise<2>>>)
})

declare.it("sync.catch(mixed) = mixed", expect => {
    const myLazy = lazies.sync().catch(handlers.mixed())
    expect(type_of(myLazy)).to_equal(type<Doddle<1 | 2 | Promise<2>>>)
})

declare.it("sync.catch(any) = any", expect => {
    const myLazy = lazies.sync().catch(handlers.any())
    expect(type_of(myLazy)).to_equal(type<Doddle<any>>)
})

declare.it("sync.catch(lazy sync) = sync", expect => {
    const myLazy = lazies.sync().catch(handlers.lazy_sync())
    expect(type_of(myLazy)).to_equal(type<Doddle<1 | 2>>)
})

declare.it("sync.catch(lazy async) = mixed", expect => {
    const myLazy = lazies.sync().catch(handlers.lazy_async())
    expect(type_of(myLazy)).to_equal(type<Doddle<1 | Promise<2>>>)
})

declare.it("sync.catch(lazy mixed) = mixed", expect => {
    const myLazy = lazies.sync().catch(handlers.lazy_mixed())
    expect(type_of(myLazy)).to_equal(type<Doddle<1 | 2 | Promise<2>>>)
})

declare.it("sync.catch(lazy any) = any", expect => {
    const myLazy = lazies.sync().catch(handlers.lazy_any())
    expect(type_of(myLazy)).to_equal(type<Doddle<any>>)
})

declare.it("async.catch(sync) = async", expect => {
    const myLazy = lazies.async().catch(handlers.sync())
    expect(type_of(myLazy)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(async) = async", expect => {
    const myLazy = lazies.async().catch(handlers.async())
    expect(type_of(myLazy)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(mixed) = async", expect => {
    const myLazy = lazies.async().catch(handlers.mixed())
    expect(type_of(myLazy)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(any) = any", expect => {
    const myLazy = lazies.async().catch(handlers.any())
    expect(type_of(myLazy)).to_equal(type<DoddleAsync<any>>)
})

declare.it("async.catch(lazy sync) = async", expect => {
    const myLazy = lazies.async().catch(handlers.lazy_sync())
    expect(type_of(myLazy)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(lazy async) = async", expect => {
    const myLazy = lazies.async().catch(handlers.lazy_async())
    expect(type_of(myLazy)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(lazy mixed) = async", expect => {
    const myLazy = lazies.async().catch(handlers.lazy_mixed())
    expect(type_of(myLazy)).to_equal(type<DoddleAsync<1 | 2>>)
})

declare.it("async.catch(lazy any) = any", expect => {
    const myLazy = lazies.async().catch(handlers.lazy_any())
    expect(type_of(myLazy)).to_equal(type<DoddleAsync<any>>)
})

declare.it("mixed.catch(sync) = mixed", expect => {
    const myLazy = lazies.mixed().catch(handlers.sync())
    expect(type_of(myLazy)).to_equal(type<Doddle<1 | 2 | Promise<1>>>)
})

declare.it("mixed.catch(async) = mixed", expect => {
    const myLazy = lazies.mixed().catch(handlers.async())
    expect(type_of(myLazy)).to_equal(type<Doddle<1 | Promise<1> | Promise<2>>>)
})

declare.it("mixed.catch(mixed) = mixed", expect => {
    const myLazy = lazies.mixed().catch(handlers.mixed())
    expect(type_of(myLazy)).to_equal(type<Doddle<1 | 2 | Promise<1> | Promise<2>>>)
})

it("sync.catch(sync) - no error", () => {
    const handler = handlers.sync()
    const myLazy = doddle(() => 1).catch(handler)
    expect(myLazy.pull()).toBe(1)
    expect(handler).not.toHaveBeenCalled()
})

it("no error async", async () => {
    const handler = handlers.async()
    const myLazy = doddle(async () => 1).catch(handler)
    await expect(myLazy.pull()).resolves.toBe(1)
    expect(handler).not.toHaveBeenCalled()
})

it("sync error caught sync", () => {
    const fn = handlers.sync()
    const myLazy = doddle(() => {
        throw "test"
    }).catch(fn)
    expect(myLazy.pull()).toBe(2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith("test")
})

it("async error caught async", async () => {
    const fn = handlers.async()
    const myLazy = doddle(async () => {
        throw "test"
    }).catch(fn)
    await expect(myLazy.pull()).resolves.toBe(2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith("test")
})

it("sync error caught async", async () => {
    const fn = handlers.async()
    const myLazy = doddle(() => {
        throw "test"
    }).catch(fn)
    await expect(myLazy.pull()).resolves.toBe(2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith("test")
})

it("async error caught sync gives async", async () => {
    const fn = handlers.sync()
    const myLazy = doddle(async () => {
        throw "test"
    }).catch(fn)
    await expect(myLazy.pull()).resolves.toBe(2)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith("test")
})
