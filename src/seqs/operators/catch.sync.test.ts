/* eslint-disable @typescript-eslint/no-throw-literal */
import type { Seq } from "@lib"
import { declare, type, type_of } from "declare-it"

import { seq } from "@lib"

const _seq = seq
type SType<T> = Seq<T>
declare.it("should not be callable without handler", () => {
    // @ts-expect-error
    _seq([1, 2, 3]).catch()
})

declare.it("callable with void handler gives seq of same type", expect => {
    expect(type_of(_seq([1, 2, 3]).catch(() => {}))).to_equal(type<SType<number>>)
})

declare.it("callable with iterable handler of same type", expect => {
    expect(type_of(_seq([1, 2, 3]).catch(() => [1, 2, 3]))).to_equal(type<SType<number>>)
})

declare.it("iterable handler of another type gives disjunction", expect => {
    const s = _seq([1, 2, 3])
    expect(type_of(s.catch(() => ["a"]))).to_equal(type<SType<number | string>>)
})
declare.it("handler explicitly returning undefined is also okay", expect => {
    const s = _seq([1, 2, 3])
    expect(type_of(s.catch(() => undefined))).to_equal(type<SType<number>>)
})

it("returns same for no errors", () => {
    const s = _seq([1, 2, 3]).catch(() => {})
    expect(s._qr).toEqual([1, 2, 3])
})

it("returns same for empty", () => {
    const s = _seq([]).catch(() => {})
    expect(s._qr).toEqual([])
})

it("handler stops seq on void", () => {
    const handler = jest.fn(() => {})
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    for (const _ of s) {
    }

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(new Error("test"), 2)
})

it("handler concats seq on iterable", () => {
    const handler = jest.fn(() => [1, 2, 3])
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    expect(s._qr).toEqual([1, 2, 1, 2, 3])
})

it("can iterate twice, calls handler twice, same behavior", () => {
    const handler = jest.fn(() => {})
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    for (const _ of s) {
    }
    for (const _ of s) {
    }
    expect(handler).toHaveBeenNthCalledWith(1, new Error("test"), 2)
    expect(handler).toHaveBeenNthCalledWith(2, new Error("test"), 2)
})

it("can iterate twice with iterable handler", () => {
    const handler = jest.fn(() => [1, 2, 3])
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    expect(s._qr).toEqual([1, 2, 1, 2, 3])
    expect(s._qr).toEqual([1, 2, 1, 2, 3])
    expect(handler).toHaveBeenCalledTimes(2)
})

it("catches non-error and turns it into error", () => {
    const handler = jest.fn(() => {})
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw "test"
            }
        })
        .catch(handler)
    for (const _ of s) {
    }
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(expect.any(Error), 2)
})

describe("invalid inputs", () => {
    describe("throws on invocation", () => {
        it("non-function handler", () => {
            // @ts-expect-error
            expect(() => _seq([1, 2, 3]).catch(1)).toThrow()
        })

        it("no handler", () => {
            // @ts-expect-error
            expect(() => _seq([1, 2, 3]).catch()).toThrow()
        })
    })

    describe("throws on iteration", () => {
        it("throws conversion TypeError if handler returns random value", () => {
            const throwing = _seq.throws("error")
            // @ts-expect-error
            expect(() => [...throwing.catch(() => 1)]).toThrow(TypeError)
            expect(() => [
                // @ts-expect-error
                ...throwing.catch(() => {
                    return {}
                })
            ]).toThrow(TypeError)
        })
        it("throws if catch returns a Promise", () => {
            const throwing = _seq.throws("error")
            // @ts-expect-error
            expect(() => [...throwing.catch(() => Promise.resolve(1))]).toThrow()
        })
    })
})
