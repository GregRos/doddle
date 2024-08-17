import { lazy, Lazy, type LazyAsync } from "@lib"
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
        return jest.fn(() => lazy(() => 2 as 2))
    },
    lazy_async() {
        return jest.fn(() => lazy(async () => 2 as 2))
    },
    lazy_mixed() {
        return jest.fn(() => lazy(() => 2 as 2 | Promise<2>))
    },
    lazy_any() {
        return jest.fn(() => lazy(() => 2 as any))
    }
}

{
    const myMap = maps.sync()
    const myLazy = lazies.sync().map(myMap)
    declare.it("sync.map(sync) = sync", expect => {
        expect(type_of(myLazy)).to_equal(type<Lazy<2>>)
    })
    it("sync.map(sync) = sync", () => {
        expect(myLazy.pull()).toBe(2)
        expect(myLazy.pull()).toBe(2)
        expect(myMap).toHaveBeenCalledWith(1)
        expect(myMap).toHaveBeenCalledTimes(1)
        expect(myMap).toHaveBeenCalledTimes(1)
    })
    {
        const myMap = maps.lazy_sync()
        const myLazy = lazies.sync().map(myMap)
        declare.it("sync.map(lazy sync) = sync", expect => {
            expect(type_of(myLazy)).to_equal(type<Lazy<2>>)
        })
        it("sync.map(lazy sync) = sync", () => {
            expect(myLazy.pull()).toBe(2)
            expect(myLazy.pull()).toBe(2)
        })
    }
}
{
    const myMap = maps.async()
    const myLazy = lazies.sync().map(myMap)
    declare.it("sync.map(async) = async", expect => {
        expect(type_of(myLazy)).to_equal(type<LazyAsync<2>>)
    })
    it("sync.map(async) = async", async () => {
        await expect(myLazy.pull()).resolves.toBe(2)
        await expect(myLazy.pull()).resolves.toBe(2)
        expect(myMap).toHaveBeenCalledWith(1)
        expect(myMap).toHaveBeenCalledTimes(1)
        expect(myMap).toHaveBeenCalledTimes(1)
    })
    {
        const myMap = maps.lazy_async()
        const myLazy = lazies.sync().map(myMap)
        declare.it("sync.map(lazy async) = async", expect => {
            expect(type_of(myLazy)).to_equal(type<LazyAsync<2>>)
        })
        it("sync.map(lazy async) = async", async () => {
            await expect(myLazy.pull()).resolves.toBe(2)
            await expect(myLazy.pull()).resolves.toBe(2)
        })
    }
}
{
    const myMap = maps.mixed()
    const myLazy = lazies.sync().map(myMap)
    declare.it("sync.map(mixed) = mixed", expect => {
        expect(type_of(myLazy)).to_equal(type<Lazy<2 | Promise<2>>>)
    })
    {
        const myMap = maps.lazy_mixed()
        const myLazy = lazies.sync().map(myMap)
        declare.it("sync.map(lazy mixed) = mixed", expect => {
            expect(type_of(myLazy)).to_equal(type<Lazy<2 | Promise<2>>>)
        })
    }
}

{
    const myMap = maps.sync()
    const myLazy = lazies.async().map(myMap)
    declare.it("async.map(sync) = async", expect => {
        expect(type_of(myLazy)).to_equal(type<LazyAsync<2>>)
    })
    it("async.map(sync) = async", async () => {
        await expect(myLazy.pull()).resolves.toBe(2)
        await expect(myLazy.pull()).resolves.toBe(2)
        expect(myMap).toHaveBeenCalledWith(1)
        expect(myMap).toHaveBeenCalledTimes(1)
        expect(myMap).toHaveBeenCalledTimes(1)
    })
    {
        const myMap = maps.lazy_sync()
        const myLazy = lazies.async().map(myMap)
        declare.it("async.map(lazy sync) = async", expect => {
            expect(type_of(myLazy)).to_equal(type<LazyAsync<2>>)
        })
        it("async.map(lazy sync) = async", async () => {
            await expect(myLazy.pull()).resolves.toBe(2)
            await expect(myLazy.pull()).resolves.toBe(2)
        })
    }
}
{
    const myMap = maps.async()
    const myLazy = lazies.async().map(myMap)
    declare.it("async.map(async) = async", expect => {
        expect(type_of(myLazy)).to_equal(type<LazyAsync<2>>)
    })
    it("async.map(async) = async", async () => {
        await expect(myLazy.pull()).resolves.toBe(2)
        await expect(myLazy.pull()).resolves.toBe(2)
        expect(myMap).toHaveBeenCalledWith(1)
        expect(myMap).toHaveBeenCalledTimes(1)
        expect(myMap).toHaveBeenCalledTimes(1)
    })
    {
        const myMap = maps.lazy_async()
        const myLazy = lazies.async().map(myMap)
        declare.it("async.map(lazy async) = async", expect => {
            expect(type_of(myLazy)).to_equal(type<LazyAsync<2>>)
        })
        it("async.map(lazy async) = async", async () => {
            await expect(myLazy.pull()).resolves.toBe(2)
            await expect(myLazy.pull()).resolves.toBe(2)
        })
    }
}
{
    const myMap = maps.mixed()
    const myLazy = lazies.async().map(myMap)
    declare.it("async.map(mixed) = async", expect => {
        expect(type_of(myLazy)).to_equal(type<LazyAsync<2>>)
    })
    {
        const myMap = maps.lazy_mixed()
        const myLazy = lazies.async().map(myMap)
        declare.it("async.map(lazy mixed) = mixed", expect => {
            expect(type_of(myLazy)).to_equal(type<LazyAsync<2>>)
        })
    }
}

{
    const myMap = maps.sync()
    const myLazy = lazies.mixed().map(myMap)
    declare.it("mixed.map(sync) = mixed", expect => {
        expect(type_of(myLazy)).to_equal(type<Lazy<2 | Promise<2>>>)
    })
    it("mixed.map(sync) = mixed", () => {
        expect(myLazy.pull()).toBe(2)
        expect(myLazy.pull()).toBe(2)
        expect(myMap).toHaveBeenCalledWith(1)
        expect(myMap).toHaveBeenCalledTimes(1)
        expect(myMap).toHaveBeenCalledTimes(1)
    })
    {
        const myMap = maps.lazy_sync()
        const myLazy = lazies.mixed().map(myMap)
        declare.it("mixed.map(lazy sync) = mixed", expect => {
            expect(type_of(myLazy)).to_equal(type<Lazy<2 | Promise<2>>>)
        })
        it("mixed.map(lazy sync) = mixed", () => {
            expect(myLazy.pull()).toBe(2)
            expect(myLazy.pull()).toBe(2)
        })
    }
}
{
    declare.it("any.map(sync) = mixed", expect => {
        const myMap = maps.sync()
        const myLazy = lazies.any().map(myMap)
        expect(type_of(myLazy)).to_equal(type<Lazy<2 | Promise<2>>>)
    })
    declare.it("any.map(async) = async", expect => {
        const myMap = maps.async()
        const myLazy = lazies.any().map(myMap)
        expect(type_of(myLazy)).to_equal(type<LazyAsync<2>>)
    })
    declare.it("any.map(mixed) = mixed", expect => {
        const myMap = maps.mixed()
        const myLazy = lazies.any().map(myMap)
        expect(type_of(myLazy)).to_equal(type<Lazy<2 | Promise<2>>>)
    })
}
