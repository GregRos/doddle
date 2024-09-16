import { type Doddle, type DoddleAsync } from "@lib"
import { MaybePromise } from "@utils"
import { declare, type, type_of } from "declare-it"
import { lazies } from "./lazies.helper"

declare.it("sync.zip(sync) = sync", expect => {
    const a = lazies.sync()
    const b = lazies.sync()
    const zipped = a.zip(b)
    expect(type_of(zipped)).to_equal(type<Doddle<[1, 1]>>)
})

declare.it("sync.zip(async) = async", expect => {
    const a = lazies.sync()
    const b = lazies.async()
    const zipped = a.zip(b)
    expect(type_of(zipped)).to_equal(type<DoddleAsync<[1, 1]>>)
})

declare.it("sync.zip(async, sync) = async", expect => {
    const zipped = lazies.sync().zip(lazies.async(), lazies.sync())
    expect(type_of(zipped)).to_equal(type<DoddleAsync<[1, 1, 1]>>)
})

declare.it("sync.zip(mixed) = mixed", expect => {
    const zipped = lazies.sync().zip(lazies.mixed())
    expect(type_of(zipped)).to_equal(type<Doddle<MaybePromise<[1, 1]>>>)
})

declare.it("sync.zip(async, mixed) = async", expect => {
    const zipped = lazies.sync().zip(lazies.async(), lazies.mixed())
    expect(type_of(zipped)).to_equal(type<DoddleAsync<[1, 1, 1]>>)
})

declare.it("async.zip(sync) = async", expect => {
    const zipped = lazies.async().zip(lazies.sync())
    expect(type_of(zipped)).to_equal(type<DoddleAsync<[1, 1]>>)
})

declare.it("async.zip(async) = async", expect => {
    const zipped = lazies.async().zip(lazies.async())
    expect(type_of(zipped)).to_equal(type<DoddleAsync<[1, 1]>>)
})

declare.it("async.zip(mixed) = async", expect => {
    const zipped = lazies.async().zip(lazies.mixed())
    expect(type_of(zipped)).to_equal(type<DoddleAsync<[1, 1]>>)
})

declare.it("mixed.zip(sync) = mixed", expect => {
    const zipped = lazies.mixed().zip(lazies.sync())
    expect(type_of(zipped)).to_equal(type<Doddle<MaybePromise<[1, 1]>>>)
})

declare.it("mixed.zip(async) = async", expect => {
    const zipped = lazies.mixed().zip(lazies.async())
    expect(type_of(zipped)).to_equal(type<DoddleAsync<[1, 1]>>)
})

declare.it("mixed.zip(mixed) = mixed", expect => {
    const zipped = lazies.mixed().zip(lazies.mixed())
    expect(type_of(zipped)).to_equal(type<Doddle<MaybePromise<[1, 1]>>>)
})

it("zips only sync", () => {
    const fn1 = jest.fn(),
        fn2 = jest.fn(),
        fn3 = jest.fn()
    const target = lazies.sync().each(fn1)
    const zipped = target.zip(lazies.sync().each(fn2), lazies.sync().each(fn3))
    expect(zipped.pull()).toEqual([1, 1, 1])
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledWith(1)
    expect(fn2).toHaveBeenCalledWith(1)
    expect(zipped.pull()).toEqual([1, 1, 1])
    expect(fn1).toHaveBeenCalledTimes(1)
})

it("zips async and sync", async () => {
    const fn1 = jest.fn(),
        fn2 = jest.fn(),
        fn3 = jest.fn()
    const target = lazies.sync().each(fn1)
    const zipped = target.zip(lazies.async().each(fn2), lazies.sync().each(fn3))
    await expect(zipped.pull()).resolves.toEqual([1, 1, 1])
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
    expect(fn3).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledWith(1)
    expect(fn2).toHaveBeenCalledWith(1)
    expect(fn3).toHaveBeenCalledWith(1)
    await expect(zipped.pull()).resolves.toEqual([1, 1, 1])
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
    expect(fn3).toHaveBeenCalledTimes(1)
})

it("zips only async", async () => {
    const fn1 = jest.fn(),
        fn2 = jest.fn(),
        fn3 = jest.fn()
    const target = lazies.async().each(fn1)
    const zipped = target.zip(lazies.async().each(fn2), lazies.async().each(fn3))
    await expect(zipped.pull()).resolves.toEqual([1, 1, 1])
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
    expect(fn3).toHaveBeenCalledTimes(1)
    expect(fn1).toHaveBeenCalledWith(1)
    expect(fn2).toHaveBeenCalledWith(1)
    expect(fn3).toHaveBeenCalledWith(1)
    await expect(zipped.pull()).resolves.toEqual([1, 1, 1])
    expect(fn1).toHaveBeenCalledTimes(1)
    expect(fn2).toHaveBeenCalledTimes(1)
    expect(fn3).toHaveBeenCalledTimes(1)
})
