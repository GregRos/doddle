import type { Seq } from "./sync"

export class SeqOperated<From, To> implements Iterable<To> {
    [Symbol.iterator]!: () => Iterator<To>

    constructor(
        private _base: Seq<From>,
        private _operator: (this: Seq<From>, from: Seq<From>) => Iterable<To>
    ) {
        this[Symbol.iterator] = () => this._operator.call(this._base, this._base)[Symbol.iterator]()
    }operate(function*
}
