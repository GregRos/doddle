import { Lazy } from "../lazy/index.js"

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
    func: (input: In) => Out | Lazy.Pulled<Out>
): Lazy<Out> {
    return new LazyFromOperator(operator, operand, func) as Lazy<Out>
}
