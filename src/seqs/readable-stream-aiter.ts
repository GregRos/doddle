import type { DoddleReadableStream, DoddleReadableStreamReader } from "../extra-types.js"

// Adapted from https://gist.github.com/MattiasBuelens/496fc1d37adb50a733edd43853f2f60e
// https://gist.github.com/MattiasBuelens/496fc1d37adb50a733edd43853f2f60e
export class DoddleReadableStreamIterator<T> implements AsyncIterator<T> {
    _reader: DoddleReadableStreamReader<T>
    _error: Error | undefined
    constructor(
        stream: DoddleReadableStream<T>,
        private readonly _cancel = false
    ) {
        this._reader = stream.getReader()
    }

    async next() {
        if (this._error) {
            return { done: true, value: this._error } as const
        }
        try {
            const { done, value } = await this._reader.read()
            if (done) {
                this._reader.releaseLock()
                return { done, value: value! } as const
            }
            return { done, value: value! } as const
        } catch (error: any) {
            this._error = error
            this._reader.releaseLock()
            return { done: true, value: error } as const
        }
    }

    async return(value: any) {
        if (this._cancel) {
            const pCancel = this._reader.cancel(value)
            this._reader.releaseLock()
            await pCancel
        } else {
            this._reader.releaseLock()
        }
        return { done: true, value }
    }
}
