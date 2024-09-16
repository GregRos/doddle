import { doddle, Doddle, type DoddleAsync } from "@lib"
import { declare, type, type_of } from "declare-it"
import { lazies } from "./lazies.helper"

const maps = {
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

{
    const myMap = maps.sync()
    const myDoddle = lazies.sync().map(myMap)
    declare.it("sync.map(sync) = sync", expect => {
        expect(type_of(myDoddle)).to_equal(type<Doddle<2>>)
    })
    it("sync.map(sync) = sync", () => {
        expect(myDoddle.pull()).toBe(2)
        expect(myDoddle.pull()).toBe(2)
        expect(myMap).toHaveBeenCalledWith(1)
        expect(myMap).toHaveBeenCalledTimes(1)
        expect(myMap).toHaveBeenCalledTimes(1)
    })
    {
        const myMap = maps.lazy_sync()
        const myDoddle = lazies.sync().map(myMap)
        declare.it("sync.map(doddle sync) = sync", expect => {
            expect(type_of(myDoddle)).to_equal(type<Doddle<2>>)
        })
        it("sync.map(doddle sync) = sync", () => {
            expect(myDoddle.pull()).toBe(2)
            expect(myDoddle.pull()).toBe(2)
        })
    }
}
{
    const myMap = maps.async()
    const myDoddle = lazies.sync().map(myMap)
    declare.it("sync.map(async) = async", expect => {
        expect(type_of(myDoddle)).to_equal(type<DoddleAsync<2>>)
    })
    it("sync.map(async) = async", async () => {
        await expect(myDoddle.pull()).resolves.toBe(2)
        await expect(myDoddle.pull()).resolves.toBe(2)
        expect(myMap).toHaveBeenCalledWith(1)
        expect(myMap).toHaveBeenCalledTimes(1)
        expect(myMap).toHaveBeenCalledTimes(1)
    })
    {
        const myMap = maps.lazy_async()
        const myDoddle = lazies.sync().map(myMap)
        declare.it("sync.map(doddle async) = async", expect => {
            expect(type_of(myDoddle)).to_equal(type<DoddleAsync<2>>)
        })
        it("sync.map(doddle async) = async", async () => {
            await expect(myDoddle.pull()).resolves.toBe(2)
            await expect(myDoddle.pull()).resolves.toBe(2)
        })
    }
}
{
    const myMap = maps.mixed()
    const myDoddle = lazies.sync().map(myMap)
    declare.it("sync.map(mixed) = mixed", expect => {
        expect(type_of(myDoddle)).to_equal(type<Doddle<2 | Promise<2>>>)
    })
    {
        const myMap = maps.lazy_mixed()
        const myDoddle = lazies.sync().map(myMap)
        declare.it("sync.map(doddle mixed) = mixed", expect => {
            expect(type_of(myDoddle)).to_equal(type<Doddle<2 | Promise<2>>>)
        })
    }
}

{
    const myMap = maps.sync()
    const myDoddle = lazies.async().map(myMap)
    declare.it("async.map(sync) = async", expect => {
        expect(type_of(myDoddle)).to_equal(type<DoddleAsync<2>>)
    })
    it("async.map(sync) = async", async () => {
        await expect(myDoddle.pull()).resolves.toBe(2)
        await expect(myDoddle.pull()).resolves.toBe(2)
        expect(myMap).toHaveBeenCalledWith(1)
        expect(myMap).toHaveBeenCalledTimes(1)
        expect(myMap).toHaveBeenCalledTimes(1)
    })
    {
        const myMap = maps.lazy_sync()
        const myDoddle = lazies.async().map(myMap)
        declare.it("async.map(doddle sync) = async", expect => {
            expect(type_of(myDoddle)).to_equal(type<DoddleAsync<2>>)
        })
        it("async.map(doddle sync) = async", async () => {
            await expect(myDoddle.pull()).resolves.toBe(2)
            await expect(myDoddle.pull()).resolves.toBe(2)
        })
    }
}
{
    const myMap = maps.async()
    const myDoddle = lazies.async().map(myMap)
    declare.it("async.map(async) = async", expect => {
        expect(type_of(myDoddle)).to_equal(type<DoddleAsync<2>>)
    })
    it("async.map(async) = async", async () => {
        await expect(myDoddle.pull()).resolves.toBe(2)
        await expect(myDoddle.pull()).resolves.toBe(2)
        expect(myMap).toHaveBeenCalledWith(1)
        expect(myMap).toHaveBeenCalledTimes(1)
        expect(myMap).toHaveBeenCalledTimes(1)
    })
    {
        const myMap = maps.lazy_async()
        const myDoddle = lazies.async().map(myMap)
        declare.it("async.map(doddle async) = async", expect => {
            expect(type_of(myDoddle)).to_equal(type<DoddleAsync<2>>)
        })
        it("async.map(doddle async) = async", async () => {
            await expect(myDoddle.pull()).resolves.toBe(2)
            await expect(myDoddle.pull()).resolves.toBe(2)
        })
    }
}
{
    const myMap = maps.mixed()
    const myDoddle = lazies.async().map(myMap)
    declare.it("async.map(mixed) = async", expect => {
        expect(type_of(myDoddle)).to_equal(type<DoddleAsync<2>>)
    })
    {
        const myMap = maps.lazy_mixed()
        const myDoddle = lazies.async().map(myMap)
        declare.it("async.map(doddle mixed) = mixed", expect => {
            expect(type_of(myDoddle)).to_equal(type<DoddleAsync<2>>)
        })
    }
}

{
    const myMap = maps.sync()
    const myDoddle = lazies.mixed().map(myMap)
    declare.it("mixed.map(sync) = mixed", expect => {
        expect(type_of(myDoddle)).to_equal(type<Doddle<2 | Promise<2>>>)
    })
    it("mixed.map(sync) = mixed", () => {
        expect(myDoddle.pull()).toBe(2)
        expect(myDoddle.pull()).toBe(2)
        expect(myMap).toHaveBeenCalledWith(1)
        expect(myMap).toHaveBeenCalledTimes(1)
        expect(myMap).toHaveBeenCalledTimes(1)
    })
    {
        const myMap = maps.lazy_sync()
        const myDoddle = lazies.mixed().map(myMap)
        declare.it("mixed.map(doddle sync) = mixed", expect => {
            expect(type_of(myDoddle)).to_equal(type<Doddle<2 | Promise<2>>>)
        })
        it("mixed.map(doddle sync) = mixed", () => {
            expect(myDoddle.pull()).toBe(2)
            expect(myDoddle.pull()).toBe(2)
        })
    }
}
{
    declare.it("any.map(sync) = mixed", expect => {
        const myMap = maps.sync()
        const myDoddle = lazies.any().map(myMap)
        expect(type_of(myDoddle)).to_equal(type<Doddle<2 | Promise<2>>>)
    })
    declare.it("any.map(async) = async", expect => {
        const myMap = maps.async()
        const myDoddle = lazies.any().map(myMap)
        expect(type_of(myDoddle)).to_equal(type<DoddleAsync<2>>)
    })
    declare.it("any.map(mixed) = mixed", expect => {
        const myMap = maps.mixed()
        const myDoddle = lazies.any().map(myMap)
        expect(type_of(myDoddle)).to_equal(type<Doddle<2 | Promise<2>>>)
    })
}
