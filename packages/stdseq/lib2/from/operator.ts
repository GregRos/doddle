import { isAsyncIterable, isIterable } from "stdlazy/utils"
import { Lazy, type Pulled } from "stdlazy/lib"
import { ASeq, Seq } from "../wrappers"

class AsyncFromOperator<In, Out> extends ASeq<Out> {
    [Symbol.asyncIterator]!: () => AsyncIterator<Out, any, undefined>
    constructor(
        readonly operator: { name: string },
        private readonly _operand: AsyncIterable<In>,
        private readonly _func: (input: AsyncIterable<In>) => AsyncIterable<Out>
    ) {
        super(_func(_operand))
    }
}

class SyncFromOperator<In, Out> extends Seq<Out> {
    [Symbol.iterator]!: () => Iterator<Out, any, undefined>
    constructor(
        readonly operator: { name: string },
        private readonly _operand: Iterable<In>,
        private readonly _func: (input: Iterable<In>) => Iterable<Out>
    ) {
        super(_func(_operand))
    }
}

export function syncFromOperator<In, Out>(
    operator: { name: string },
    operand: Iterable<In>,
    func: (input: Iterable<In>) => Iterable<Out>
): Seq<Out> {
    return new SyncFromOperator(operator, operand, func)
}

export function asyncFromOperator<In, Out>(
    operator: { name: string },
    operand: AsyncIterable<In>,
    func: (input: AsyncIterable<In>) => AsyncIterable<Out>
): ASeq<Out> {
    return new AsyncFromOperator(operator, operand, func)
}

class LazyFromOperator<In, Out> extends Lazy<Out> {
    constructor(
        readonly operator: { name: string },
        private readonly _operand: In,
        private readonly _func: (input: In) => Out
    ) {
        super(() => this._func(this._operand))
    }
}

export function lazyFromOperator<In, Out>(
    operator: { name: string },
    operand: In,
    func: (input: In) => Out
): Lazy<Out> {
    return new LazyFromOperator(operator, operand, func) as Lazy<Out>
}
