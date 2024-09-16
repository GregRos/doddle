import { doddle, seq } from "@lib"
import { declare } from "declare-it"

declare.it("callable with various returns", () => {
    seq.empty().after(() => {})
    seq.empty().after(() => 1)
    seq.empty().after(() => [])
})

it("empty stays empty", () => {
    expect(
        seq
            .empty()
            .after(() => 1)
            .toArray()
            .pull()
    ).toEqual([])
})

it("doesn't change elements", () => {
    expect(
        seq([1, 2, 3])
            .after(() => 1)
            .toArray()
            .pull()
    ).toEqual([1, 2, 3])
})

it("can iterate twice", () => {
    const s = seq([1, 2, 3]).after(() => 1)
    expect(s.toArray().pull()).toEqual([1, 2, 3])
    expect(s.toArray().pull()).toEqual([1, 2, 3])
})

it("pulls as many as needed", () => {
    const fn = jest.fn(() => [1, 2, 3])
    const s = seq(fn).after(() => 1)
    s.toArray().pull()
    expect(fn).toHaveBeenCalledTimes(1)
    s.toArray().pull()
    expect(fn).toHaveBeenCalledTimes(2)
})

it("doesn't get called if end not reached", () => {
    const fn = jest.fn(() => [1, 2, 3])
    const afterFn = jest.fn(() => 1)
    const s = seq(fn).after(afterFn)
    s.take(3).toArray().pull()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(afterFn).toHaveBeenCalledTimes(0)
})

it("gets called if end reached", () => {
    const fn = jest.fn(() => [1, 2, 3])
    const afterFn = jest.fn(() => 1)
    const s = seq(fn).after(afterFn)
    s.toArray().pull()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(afterFn).toHaveBeenCalledTimes(1)
})

it("gets called twice if end reached twice", () => {
    const fn = jest.fn(() => [1, 2, 3])
    const afterFn = jest.fn(() => 1)
    const s = seq(fn).after(afterFn)
    s.toArray().pull()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(afterFn).toHaveBeenCalledTimes(1)
    s.toArray().pull()
    expect(fn).toHaveBeenCalledTimes(2)
    expect(afterFn).toHaveBeenCalledTimes(2)
})

it("pulls doddle result", () => {
    const fn = jest.fn(() => 1)
    const afterFn = () => doddle(fn)
    const s = seq([1, 2, 3]).after(afterFn)
    s.toArray().pull()
    expect(fn).toHaveBeenCalledTimes(1)
})
