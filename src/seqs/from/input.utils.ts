// We create explicit iterable and iterator classes because
// most JS objects that are iterable are also iterators, and we want to
// test specific code paths.
export namespace Dummy {
    export class _Iterator implements Iterator<number> {
        _count = 0
        next(...args: any[]) {
            if (this._count === 3) {
                return { done: true, value: undefined } as const
            }
            return { done: false, value: this._count++ } as const
        }
    }
    export class _AsyncIterator implements AsyncIterator<number> {
        _count = 0
        async next(...args: any[]) {
            if (this._count === 3) {
                return { done: true, value: null } as const
            }
            return { done: false, value: this._count++ } as const
        }
    }
    export class _Iterable {
        [Symbol.iterator]() {
            return new _Iterator()
        }
    }

    export class _AsyncIterable {
        [Symbol.asyncIterator]() {
            return new _AsyncIterator()
        }
    }
}
