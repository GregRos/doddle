import { Doddle, doddle, type DoddleAsync } from "@lib"
import { declare, type, type_of } from "declare-it"
import { lazies } from "./lazies.helper"

const callbacks = {
    sync() {
        return jest.fn(() => {})
    },
    async() {
        return jest.fn(async () => {})
    },
    mixed() {
        return jest.fn(() => null! as Promise<void> | void)
    },
    lazy_sync() {
        return jest.fn(() => doddle(() => {}))
    },
    lazy_async() {
        return jest.fn(() => doddle(async () => {}))
    },
    lazy_mixed() {
        return jest.fn(() => doddle(() => null! as Promise<void> | void))
    }
}

{
    const myCallback = callbacks.sync()
    const myDoddle = lazies.sync().each(myCallback)
    declare.it("sync.each(sync) = sync", expect => {
        expect(type_of(myDoddle)).to_equal(type<Doddle<1>>)
    })
    it("sync.each(sync) = sync", () => {
        expect(myDoddle.pull()).toBe(1)
        expect(myDoddle.pull()).toBe(1)
        expect(myCallback).toHaveBeenCalledWith(1)
        expect(myCallback).toHaveBeenCalledTimes(1)
        expect(myCallback).toHaveBeenCalledTimes(1)
    })
    {
        const myCallback = callbacks.lazy_sync()
        const myDoddle = lazies.sync().each(myCallback)
        declare.it("sync.each(doddle sync) = sync", expect => {
            expect(type_of(myDoddle)).to_equal(type<Doddle<1>>)
        })
        it("sync.each(doddle sync) = sync", () => {
            expect(myDoddle.pull()).toBe(1)
            expect(myDoddle.pull()).toBe(1)
        })
    }
}
{
    const myCallback = callbacks.async()
    const myDoddle = lazies.sync().each(myCallback)
    declare.it("sync.each(async) = async", expect => {
        expect(type_of(myDoddle)).to_equal(type<DoddleAsync<1>>)
    })
    it("sync.each(async) = async", async () => {
        await expect(myDoddle.pull()).resolves.toBe(1)
        await expect(myDoddle.pull()).resolves.toBe(1)
        expect(myCallback).toHaveBeenCalledWith(1)
        expect(myCallback).toHaveBeenCalledTimes(1)
        expect(myCallback).toHaveBeenCalledTimes(1)
    })
    {
        const myCallback = callbacks.lazy_async()
        const myDoddle = doddle(() => 1).each(myCallback)
        declare.it("sync.each(doddle async) = async", expect => {
            expect(type_of(myDoddle)).to_equal(type<DoddleAsync<number>>)
        })
        it("sync.each(doddle async) = async", async () => {
            await expect(myDoddle.pull()).resolves.toBe(1)
            await expect(myDoddle.pull()).resolves.toBe(1)
        })
    }
}
{
    const myCallback = callbacks.mixed()
    const myDoddle = lazies.sync().each(myCallback)
    declare.it("sync.each(mixed) = mixed", expect => {
        expect(type_of(myDoddle)).to_equal(type<Doddle<1 | Promise<1>>>)
    })

    {
        const myCallback = callbacks.lazy_mixed()
        const myDoddle = lazies.sync().each(myCallback)
        declare.it("sync.each(doddle mixed) = mixed", expect => {
            expect(type_of(myDoddle)).to_equal(type<Doddle<1 | Promise<1>>>)
        })
    }
}
{
    const myCallback = callbacks.sync()
    const myDoddle = doddle(async () => 1).each(myCallback)
    declare.it("async.each(sync) = async", expect => {
        expect(type_of(myDoddle)).to_equal(type<DoddleAsync<number>>)
    })
    it("async.each(sync) = async", async () => {
        await expect(myDoddle.pull()).resolves.toBe(1)
        await expect(myDoddle.pull()).resolves.toBe(1)
        expect(myCallback).toHaveBeenCalledWith(1)
        expect(myCallback).toHaveBeenCalledTimes(1)
        expect(myCallback).toHaveBeenCalledTimes(1)
    })
    {
        const myCallback = callbacks.lazy_sync()
        const myDoddle = doddle(async () => 1).each(myCallback)
        declare.it("async.each(doddle sync) = async", expect => {
            expect(type_of(myDoddle)).to_equal(type<DoddleAsync<number>>)
        })
        it("async.each(doddle sync) = async", async () => {
            await expect(myDoddle.pull()).resolves.toBe(1)
            await expect(myDoddle.pull()).resolves.toBe(1)
        })
    }
}
{
    const myCallback = callbacks.async()
    const myDoddle = doddle(async () => 1).each(myCallback)
    declare.it("async.each(async) = async", expect => {
        expect(type_of(myDoddle)).to_equal(type<DoddleAsync<number>>)
    })

    it("async.each(async) = async", async () => {
        await expect(myDoddle.pull()).resolves.toBe(1)
        await expect(myDoddle.pull()).resolves.toBe(1)
        expect(myCallback).toHaveBeenCalledWith(1)
        expect(myCallback).toHaveBeenCalledTimes(1)
        expect(myCallback).toHaveBeenCalledTimes(1)
    })
    {
        const myCallback = callbacks.lazy_async()
        const myDoddle = doddle(async () => 1).each(myCallback)
        declare.it("async.each(doddle async) = async", expect => {
            expect(type_of(myDoddle)).to_equal(type<DoddleAsync<number>>)
        })
        it("async.each(doddle async) = async", async () => {
            await expect(myDoddle.pull()).resolves.toBe(1)
            await expect(myDoddle.pull()).resolves.toBe(1)
        })
    }
}
{
    const myCallback = callbacks.mixed()
    const myDoddle = doddle(async () => 1).each(myCallback)
    declare.it("async.each(mixed) = async", expect => {
        expect(type_of(myDoddle)).to_equal(type<DoddleAsync<number>>)
    })

    {
        const myCallback = callbacks.lazy_mixed()
        const myDoddle = doddle(async () => 1).each(myCallback)
        declare.it("async.each(doddle mixed) = async", expect => {
            expect(type_of(myDoddle)).to_equal(type<DoddleAsync<number>>)
        })
    }
}
{
    const myCallback = callbacks.sync()
    const myDoddle = lazies.mixed().each(myCallback)
    declare.it("mixed.each(sync) = mixed", expect => {
        expect(type_of(myDoddle)).to_equal(type<Doddle<1 | Promise<1>>>)
    })

    {
        const myCallback = callbacks.lazy_sync()
        const myDoddle = lazies.mixed().each(myCallback)
        declare.it("mixed.each(doddle sync) = mixed", expect => {
            expect(type_of(myDoddle)).to_equal(type<Doddle<1 | Promise<1>>>)
        })
    }
}
{
    const myCallback = callbacks.async()
    const myDoddle = lazies.mixed().each(myCallback)
    declare.it("mixed.each(async) = asynb", expect => {
        expect(type_of(myDoddle)).to_equal(type<DoddleAsync<1>>)
    })

    {
        const myCallback = callbacks.lazy_async()
        const myDoddle = lazies.mixed().each(myCallback)
        declare.it("mixed.each(doddle async) = async", expect => {
            expect(type_of(myDoddle)).to_equal(type<DoddleAsync<1>>)
        })
    }
}
