import { isAsyncIterable, isIterable } from "stdlazy/lib/utils"
import type { AnySeq, replaceIteratedElement } from "../async/types"
import { asyncFrom, syncFrom } from "../base/from"

export default {
    async<In, Subject extends AsyncIterable<In>, Ts extends any[]>(
        this: Subject,
        ...inputs: {
            [K in keyof Ts]: AsyncIterable<Ts[K]>
        }
    ): AsyncIterable<[In, ...Ts]> {
        const self = this
        return asyncFrom(async function* zip() {
            const iterators = [
                self[Symbol.asyncIterator](),
                ...inputs.map(input => input[Symbol.asyncIterator]())
            ]
            while (true) {
                const values = await Promise.all(iterators.map(iterator => iterator.next()))
                if (values.some(({ done }) => done)) {
                    break
                }
                yield values.map(({ value }) => value)
            }
        }) as any
    },
    sync<In, Subject extends Iterable<In>, Ts extends any[]>(
        this: Subject,
        ...inputs: {
            [K in keyof Ts]: Iterable<Ts[K]>
        }
    ): Iterable<[In, ...Ts]> {
        const self = this
        return syncFrom(function* zip() {
            const iterators = [
                self[Symbol.iterator](),
                ...inputs.map(input => input[Symbol.iterator]())
            ]
            while (true) {
                const values = iterators.map(iterator => iterator.next())
                if (values.some(({ done }) => done)) {
                    break
                }
                yield values.map(({ value }) => value)
            }
        }) as any
    }
}
