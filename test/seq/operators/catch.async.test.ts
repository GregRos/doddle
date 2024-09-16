/* eslint-disable @typescript-eslint/no-throw-literal */
import { declare, type, type_of } from "declare-it"

import type { ASeq } from "@lib"
import { aseq, doddle } from "@lib"
const _seq = aseq
type _ASeq<T> = ASeq<T>

declare.it("should not be callable without handler", () => {
    // @ts-expect-error
    _seq([1, 2, 3]).catch()
})

declare.it("callable with void handler gives aseq of same type", expect => {
    expect(type_of(_seq([1, 2, 3]).catch(() => {}))).to_equal(type<_ASeq<number>>)
})

declare.it("callable with iterable handler of same type", expect => {
    expect(type_of(_seq([1, 2, 3]).catch(() => [1, 2, 3]))).to_equal(type<_ASeq<number>>)
})

declare.it("iterable handler of another type gives disjunction", expect => {
    const s = _seq([1, 2, 3])
    expect(type_of(s.catch(() => ["a"]))).to_equal(type<_ASeq<number | string>>)
})

declare.it("handler explicitly returning undefined is also okay", expect => {
    const s = _seq([1, 2, 3])
    expect(type_of(s.catch(() => undefined))).to_equal(type<_ASeq<number>>)
})

declare.it("allows doddle handler", expect => {
    const s = _seq([1, 2, 3]).catch(() => doddle(() => [1, 2, 3]))
    expect(type_of(s)).to_equal(type<_ASeq<number>>)
})

declare.it("allows doddle async handler", expect => {
    const s = _seq([1, 2, 3]).catch(() => doddle(async () => [1, 2, 3]))
    expect(type_of(s)).to_equal(type<_ASeq<number>>)
})

declare.it("allows async doddle async handler", expect => {
    const s = _seq([1, 2, 3]).catch(async () => doddle(async () => [1, 2, 3]))
    expect(type_of(s)).to_equal(type<_ASeq<number>>)
})
it("returns same for no errors", async () => {
    const s = _seq([1, 2, 3]).catch(() => {})
    expect(await s._qr).toEqual([1, 2, 3])
})

it("returns same for empty", async () => {
    const s = _seq([]).catch(() => {})
    expect(await s._qr).toEqual([])
})

it("handler stops seq on void", async () => {
    const handler = jest.fn(() => {})
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    for await (const _ of s) {
    }
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(new Error("test"), 2)
})

it("handler concats seq on iterable", async () => {
    const handler = jest.fn(() => [1, 2, 3])
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    expect(await s._qr).toEqual([1, 2, 1, 2, 3])
})

it("can iterate twice, calls handler twice, same behavior", async () => {
    const handler = jest.fn(() => {})
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    for await (const _ of s) {
    }
    for await (const _ of s) {
    }
    expect(handler).toHaveBeenCalledTimes(2)
})

it("can iterate twice with iterable handler", async () => {
    const handler = jest.fn(() => [1, 2, 3])
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    expect(await s._qr).toEqual([1, 2, 1, 2, 3])
    expect(await s._qr).toEqual([1, 2, 1, 2, 3])
    expect(handler).toHaveBeenCalledTimes(2)
})

it("works for rejected promise", async () => {
    const handler = jest.fn(() => {})
    const s = _seq([1, 2, 3])
        .each(async x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    for await (const _ of s) {
    }
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(new Error("test"), 2)
})

declare.it("can't be called with async handler returning a non-iterable", () => {
    // @ts-expect-error
    _seq([1, 2, 3]).catch(async () => 1)
})

declare.it("can be called with async handler returning an iterable, or an async iterable", () => {
    _seq([1, 2, 3]).catch(async () => [1, 2, 3])
    _seq([1, 2, 3]).catch(async function* () {
        yield 1
        yield 2
        yield 3
    })
    _seq([1, 2, 3]).catch(async () => {
        return async function* () {
            yield 1
            yield 2
            yield 3
        }
    })
})

it("works for async handler returning void", async () => {
    const handler = jest.fn(async () => {})
    const s = _seq([1, 2, 3])
        .each(async x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    for await (const _ of s) {
    }
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(new Error("test"), 2)
})

it("works for async handler returning iterable", async () => {
    const handler = jest.fn(async () => [1, 2, 3])
    const s = _seq([1, 2, 3])
        .each(async x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    expect(await s._qr).toEqual([1, 2, 1, 2, 3])
})

it("works for async handler returning async iterable", async () => {
    const handler = jest.fn(async function* () {
        yield 1
        yield 2
        yield 3
    })
    const s = _seq([1, 2, 3])
        .each(async x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(handler)
    expect(await s._qr).toEqual([1, 2, 1, 2, 3])
})

it("catches non-error and turns it into error", async () => {
    const handler = jest.fn(() => {})
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw "test"
            }
        })
        .catch(handler)
    for await (const _ of s) {
    }
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith("test", 2)
})

it("allows doddle handler", async () => {
    const handler = jest.fn(() => {})
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(() => doddle(() => [1, 2, 3]))
    expect(await s._qr).toEqual([1, 2, 1, 2, 3])
})

it("allows doddle async handler", async () => {
    const handler = jest.fn(() => {})
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(() => doddle(async () => [1, 2, 3]))
    expect(await s._qr).toEqual([1, 2, 1, 2, 3])
})

it("allows async doddle async handler", async () => {
    const handler = jest.fn(() => {})
    const s = _seq([1, 2, 3])
        .each(x => {
            if (x === 3) {
                throw new Error("test")
            }
        })
        .catch(async () => doddle(async () => [1, 2, 3]))
    expect(await s._qr).toEqual([1, 2, 1, 2, 3])
})
