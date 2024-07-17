import { isIterable } from "stdlazy/lib/utils"
import { Seq, type SeqLike } from "../sync"

export class SeqFrom<E> extends Seq<E> {
    constructor(private _internal: SeqLike<E>) {
        super()
    }
    *[Symbol.iterator](): Iterator<E, any, undefined> {
        if (typeof this._internal === "function") {
            const result = this._internal()
            if (isIterable(result)) {
                yield* result
            } else {
                for (;;) {
                    const { done, value } = result.next()
                    if (done) {
                        return
                    }
                    yield value
                }
            }
        } else {
            yield* this._internal
        }
    }
    get _innerArray() {
        return Array.isArray(this._internal) ? this._internal : undefined
    }
    get _innerSet() {
        return this._internal instanceof Set ? this._internal : undefined
    }

    get _innerMap() {
        return this._internal instanceof Map ? this._internal : undefined
    }
}
