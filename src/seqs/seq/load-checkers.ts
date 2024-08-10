import { forOperator, type OperatorMessages } from "../../errors/messages.js"
import { getClassName, isFunction } from "../../utils.js"
const __checkers = "__checkers"

const LOADED = Symbol("CHECKERS_LOADED")
export function loadCheckers(target: any) {
    if (target[LOADED]) {
        return
    }
    for (const key of Object.getOwnPropertyNames(target) as (keyof typeof target & string)[]) {
        if (key.startsWith("_")) {
            continue
        }
        const v = target[key] as any
        if (!isFunction(v)) {
            continue
        }
        if (__checkers in v) {
            continue
        }
        Object.defineProperty(target[key], __checkers, {
            value: forOperator(`${getClassName(target)}.${key}`)
        })
    }
    target[LOADED] = true
}

export function chk(input: any): OperatorMessages {
    return input[__checkers]
}
