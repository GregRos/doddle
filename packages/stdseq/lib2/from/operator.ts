import { isAsyncIterable, isIterable } from "stdlazy/utils"
import { Lazy, type Pulled } from "stdlazy/lib"
import { Seq } from "../wrappers/seq.class"
import { aseq } from "../wrappers/aseq.ctor"
import { ASeq } from "../wrappers/aseq.class"

class AsyncFromOperator<In, Out> extends ASeq<Out> {
    [Symbol.asyncIterator]!: () => AsyncIterator<Out, any, undefined>
    constructor(
        readonly operator: string,
        private readonly _operand: AsyncIterable<In>,
        private readonly _func: (input: AsyncIterable<In>) => AsyncIterable<Out>
    ) {
        super()
        this[Symbol.asyncIterator] = () => this._func(this._operand)[Symbol.asyncIterator]()
    }
}

class SyncFromOperator<In, Out> extends Seq<Out> {
    [Symbol.iterator]!: () => Iterator<Out, any, undefined>
    constructor(
        readonly operator: string,
        private readonly _operand: Iterable<In>,
        private readonly _func: (input: Iterable<In>) => Iterable<Out>
    ) {
        super()
        this[Symbol.iterator] = () => this._func(this._operand)[Symbol.iterator]()
    }
}

export function syncFromOperator<In, Out>(
    operator: string,
    operand: Iterable<In>,
    func: (input: Iterable<In>) => Iterable<Out>
): Seq<Out> {
    return new SyncFromOperator(operator, operand, func)
}

export function asyncFromOperator<In, Out>(
    operator: string,
    operand: AsyncIterable<In>,
    func: (input: AsyncIterable<In>) => AsyncIterable<Out>
): ASeq<Out> {
    return new AsyncFromOperator(operator, operand, func)
}

class LazyFromOperator<In, Out> extends Lazy<Out> {
    constructor(
        readonly operator: string,
        private readonly _operand: In,
        private readonly _func: (input: In) => Out
    ) {
        super(() => this._func(this._operand))
    }
}

export function lazyFromOperator<In, Out>(
    operator: string,
    operand: In,
    func: (input: In) => Out
): Lazy<Out> {
    return new LazyFromOperator(operator, operand, func) as Lazy<Out>
}
