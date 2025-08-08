import { _aiter } from "./utils.js"

const MAX_CONCURRENCY = 12

class PSeqFlatteningIterator<T> implements AsyncIterator<T> {
    private readonly outer: AsyncIterator<AsyncIterable<T>>
    private readonly inners: {
        iterator: AsyncIterator<T>
        next: Promise<IteratorResult<T>>
    }[] = []
    private outerDone = false
    private outerPending: Promise<void> | undefined

    constructor(source: AsyncIterable<AsyncIterable<T>>) {
        this.outer = _aiter(source)
    }

    private ensureFetch() {
        if (
            this.inners.length >= MAX_CONCURRENCY ||
            this.outerDone ||
            this.outerPending
        ) {
            return
        }
        this.outerPending = (async () => {
            const { done, value } = await this.outer.next()
            this.outerPending = undefined
            if (done) {
                this.outerDone = true
                return
            }
            const iterator = _aiter(value)
            this.inners.push({ iterator, next: iterator.next() })
        })().then(() => {
            this.ensureFetch()
        })
    }

    async next(): Promise<IteratorResult<T>> {
        for (;;) {
            this.ensureFetch()
            if (this.inners.length === 0) {
                if (this.outerDone) {
                    return { done: true, value: undefined as any }
                }
                if (this.outerPending) {
                    await this.outerPending
                    continue
                }
                await Promise.resolve()
                continue
            }
            const races: Promise<
                | { type: "inner"; index: number; result: IteratorResult<T> }
                | { type: "outer" }
            >[] = this.inners.map((s, i) =>
                s.next.then(result => ({ type: "inner", index: i, result }))
            )
            if (this.outerPending) {
                races.push(this.outerPending.then(() => ({ type: "outer" as const })))
            }
            const winner = await Promise.race(races)
            if (winner.type === "outer") {
                continue
            }
            const { index, result } = winner
            if (result.done) {
                this.inners.splice(index, 1)
                continue
            }
            this.inners[index].next = this.inners[index].iterator.next()
            return { done: false, value: result.value }
        }
    }
}

export class PSeq<T> implements AsyncIterable<T> {
    constructor(private readonly source: AsyncIterable<AsyncIterable<T>>) {}
    [Symbol.asyncIterator](): AsyncIterator<T> {
        return new PSeqFlatteningIterator(this.source)
    }
}

