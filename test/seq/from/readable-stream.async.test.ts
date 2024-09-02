import { ASeq, aseq } from "@lib"
import { isAsyncIterable, isReadableStream } from "@utils"
import { declare, type, type_of } from "declare-it"
import { ReadableStream } from "stream/web"

// Let's pretend we can't use the built-in iterator, since it's not
// available in some implemenetations
delete (ReadableStream.prototype as any)[Symbol.asyncIterator]

declare.it("determines element type", expect => {
    const rs = ReadableStream.from([1, 2, 3])
    expect(type_of(aseq(rs))).to_equal(type<ASeq<number>>)
})

it("is not async iterable or iterable", () => {
    const readableStream = ReadableStream.from([1, 2, 3])

    expect(isAsyncIterable(readableStream)).toBe(false)
    expect(isReadableStream(readableStream)).toBe(true)
})

it("can still be iterated using aseq", async () => {
    const readableStream = ReadableStream.from([1, 2, 3])

    const s = aseq(readableStream)
    await expect(s._qr).resolves.toEqual([1, 2, 3])
})

it("can be iterated twice", async () => {
    const readableStream = ReadableStream.from([1, 2, 3])

    const s = aseq(readableStream)
    await expect(s._qr).resolves.toEqual([1, 2, 3])
    await expect(s._qr).resolves.toEqual([1, 2, 3])
})
