import { _aiter } from "../utils.js"
import { ASeq } from "./aseq.class.js"
import { aseq } from "./aseq.ctor.js"

const MAX_CONCURRENCY = 12

class PSeqFlatteningIterator<T> implements AsyncIterator<T> {
    private readonly _inners: {
        iterator: AsyncIterator<T>
        next: Promise<IteratorResult<T>>
    }[] = []
    private _outerDone = false
    private _outerPending: Promise<void> | undefined

    private readonly _root: AsyncIterator<AsyncIterable<T>>
    constructor(root: AsyncIterable<AsyncIterable<T>>) {
        this._root = _aiter(root)
    }

    async next(): Promise<IteratorResult<T>> {
        for (;;) {
            this.ensureFetch()
            if (this._inners.length === 0) {
                if (this._outerDone) {
                    return { done: true, value: undefined as any }
                }
                if (this._outerPending) {
                    await this._outerPending
                    continue
                }
                await Promise.resolve()
                continue
            }
            const races: Promise<
                { index: number; result: IteratorResult<T>; type: "inner" } | { type: "outer" }
            >[] = this._inners.map((s, i) =>
                s.next.then(result => ({ type: "inner", index: i, result }))
            )
            if (this._outerPending) {
                races.push(this._outerPending.then(() => ({ type: "outer" as const })))
            }
            const winner = await Promise.race(races)
            if (winner.type === "outer") {
                continue
            }
            const { index, result } = winner
            if (result.done) {
                this._inners.splice(index, 1)
                continue
            }
            this._inners[index].next = this._inners[index].iterator.next()
            return { done: false, value: result.value }
        }
    }
    private ensureFetch() {
        if (this._inners.length >= MAX_CONCURRENCY || this._outerDone || this._outerPending) {
            return
        }
        this._outerPending = (async () => {
            const { done, value } = await this._root.next()
            this._outerPending = undefined
            if (done) {
                this._outerDone = true
                return
            }
            const iterator = _aiter(value)
            this._inners.push({ iterator, next: iterator.next() })
        })().then(() => {
            this.ensureFetch()
        })
    }
}

export class PSeq<T> extends ASeq<T> implements AsyncIterable<T> {
    constructor(private readonly source: ASeq<ASeq<T>>) {
        super()
    }
    private get _aaseq() {
        return aseq(this.source).map(x => aseq(x))
    }
    private get _aseq(): ASeq<T> {
        return aseq(this)
    }

    [Symbol.asyncIterator](): AsyncIterator<T> {
        return new PSeqFlatteningIterator(this.source)
    }

    cache(): ASeq<T> {
        return PSeqOperator(this._aseq.cache())
    }

    filter(predicate: ASeq.Predicate<T>): PSeq<T> {
        return this.mergeMap(async (x, i) => {
            return (await predicate(x, i)) ? [x] : []
        })
    }

    map<S>(projection: ASeq.Iteratee<T, S>): PSeq<S> {
        return this.mergeMap(async (x, i) => [await projection(x, i)] as any)
    }
    merge<Xs extends any[]>(
        ...others: {
            [K in keyof Xs]: ASeq.Input<Xs[K]>
        }
    ): PSeq<T | Xs[number]> {
        return PSeqOperator(this._aseq)
    }

    mergeMap<U>(projection: ASeq.Iteratee<T, ASeq.Input<U>>): PSeq<U> {
        return PSeqOperator(this._aseq.map(projection))
    }
}

export function PSeqOperator<T>(input: ASeq.Input<ASeq.Input<T>>): PSeq<T>
export function PSeqOperator<T>(input: ASeq.Input<T>): PSeq<T>
export function PSeqOperator(input: ASeq.Input<any>): PSeq<any> {
    return new PSeq(aseq(input).map(x => aseq(x)))
}

export namespace PSeq {
    export type Input<T> = ASeq.Input<T> | ASeq.Input<Promise<T>>
}
