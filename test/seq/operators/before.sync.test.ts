import { DoddleError } from "@error"
import { doddle, seq } from "@lib"
import { declare } from "declare-it"

declare.it("callable with various returns", () => {
    seq.empty().before(() => {})
    seq.empty().before(() => 1)
    seq.empty().before(() => [])
})

it("empty stays empty", () => {
    expect(
        seq
            .empty()
            .before(() => 1)
            .toArray()
            .pull()
    ).toEqual([])
})

it("doesn't change elements", () => {
    expect(
        seq([1, 2, 3])
            .before(() => 1)
            .toArray()
            .pull()
    ).toEqual([1, 2, 3])
})

it("can iterate twice", () => {
    const s = seq([1, 2, 3]).before(() => 1)
    expect(s.toArray().pull()).toEqual([1, 2, 3])
    expect(s.toArray().pull()).toEqual([1, 2, 3])
})

it("gets called before iteration starts", () => {
    const fn = jest.fn(() => [1, 2, 3])
    const beforeFn = jest.fn(() => 1)
    const s = seq(fn).before(beforeFn)
    for (const _ of s) {
        expect(beforeFn).toHaveBeenCalledTimes(1)
        break
    }
    expect(fn).toHaveBeenCalledTimes(1)
})

it("gets called twice for two iterations", () => {
    const fn = jest.fn(() => [1, 2, 3])
    const beforeFn = jest.fn(() => 1)
    const s = seq(fn).before(beforeFn)
    for (const _ of s) {
        expect(beforeFn).toHaveBeenCalledTimes(1)
    }
    for (const _ of s) {
        expect(beforeFn).toHaveBeenCalledTimes(2)
    }
})

it("doesn't get called if take(0) is used", () => {
    const fn = jest.fn(() => [1, 2, 3])
    const beforeFn = jest.fn(() => 1)
    const s = seq(fn).before(beforeFn)
    s.take(0).toArray().pull()
    expect(beforeFn).toHaveBeenCalledTimes(0)
})

it("pulls doddle result", () => {
    const fn = jest.fn(() => 1)
    const beforeFn = () => doddle(fn)
    const s = seq([1, 2, 3]).before(beforeFn)
    s.toArray().pull()
    expect(fn).toHaveBeenCalledTimes(1)
})

describe("invalid input", () => {
    it("throws TypeError if before function is not callable", () => {
        expect(() => seq([1, 2, 3]).before(123 as any)).toThrow(DoddleError)
    })
})
