export class AsyncAdapter<T> implements AsyncIterable<T> {
    constructor(
        private readonly _input:
            | Iterable<T | PromiseLike<T>>
            | AsyncIterable<T>
            | AsyncIterable<PromiseLike<T>>
    ) {}

    async *[Symbol.asyncIterator]() {
        yield* this._input
    }
}
