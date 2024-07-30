import { Lazy, type Pulled } from "stdlazy"
import { AsyncFromOperator, type ASeq } from "../seq/aseq.class"
import { SyncFromOperator, type Seq } from "../seq/seq.class"

export function asyncFromOperator<In, Out>(
    operator: string,
    operand: AsyncIterable<In>,
    func: (input: AsyncIterable<In>) => AsyncIterable<Out> | Pulled<AsyncIterable<Out>>
): ASeq<Out> {
    return new AsyncFromOperator(operator, operand, func)
}

export function syncFromOperator<In, Out>(
    operator: string,
    operand: Iterable<In>,
    func: (input: Iterable<In>) => Iterable<Out> | Pulled<Iterable<Out>>
): Seq<Out> {
    return new SyncFromOperator(operator, operand, func)
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
    func: (input: In) => Out | Pulled<Out>
): Lazy<Out> {
    return new LazyFromOperator(operator, operand, func) as Lazy<Out>
}
