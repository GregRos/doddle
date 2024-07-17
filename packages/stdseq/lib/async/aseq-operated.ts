import type { ASeq } from "./async-wrapper"

export class ASeqOperated<From, To> extends ASeq<To> {
    override [Symbol.asyncIterator]!: () => AsyncIterator<To>

    constructor(
        private readonly _internal: ASeq<From>,
        private readonly _generator: (self: ASeq<From>) => AsyncIterable<To>
    ) {
        super()
        this[Symbol.asyncIterator] = () => this._generator(this._internal)[Symbol.asyncIterator]()
    }
}
