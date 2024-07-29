import { Lazy, type Pulled } from "stdlazy"
import { ASeq } from "../seq/aseq.class"
import { Seq } from "../seq/seq.class"
import { seq } from "../seq/seq.ctor"

export function syncFromOperator<In extends Iterable<any>, Out>(
    operator: string,
    operand: In,
    func: (input: In) => Iterable<Out>
): Seq<Out> {
    type IteratedType<T> = T extends Iterable<infer U> ? U : never
    class SyncFromOperator extends Seq<Out> {
        [Symbol.iterator]!: () => Iterator<Out, any, undefined>
        constructor(
            readonly operator: string,
            private readonly _operand: In,
            private readonly _func: (input: In) => Iterable<Out>
        ) {
            super()
            this[Symbol.iterator] = () => this._func(this._operand)[Symbol.iterator]()
        }
    }

    return new SyncFromOperator(operator, operand, func)
}

export function asyncFromOperator<In, Out>(
    operator: string,
    operand: AsyncIterable<In>,
    func: (input: AsyncIterable<In>) => AsyncIterable<Out>
): ASeq<Out> {
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
    return new AsyncFromOperator(operator, operand, func)
}

export function genericOperator<E, Sq extends Seq<E> | ASeq<E>, Out>(
    operator: string,
    operand: Sq,
    func: (input: Sq) => Sq extends Seq<E> ? Iterable<Out> : AsyncIterable<Out>
): Sq extends Seq<E> ? Seq<Out> : ASeq<Out> {
    if (seq.is(operand)) {
        return syncFromOperator(operator, operand, func as any) as any
    } else {
        return asyncFromOperator(operator, operand as any, func as any) as any
    }
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
