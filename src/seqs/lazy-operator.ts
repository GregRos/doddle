import { lazy, Lazy } from "../lazy/index.js"

export function lazyFromOperator<In, Out>(
    operand: In,
    func: (input: In) => Out | Lazy.Pulled<Out>
): Lazy<Out> {
    const lz = lazy(() => func(operand)) as any
    Object.assign(lz, {
        operator: func.name,
        operand
    })
    return lz
}
