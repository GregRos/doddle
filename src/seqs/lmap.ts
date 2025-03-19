import { Doddle, lazyFromOperator } from "../lazy/index.js"
import { Seq } from "./seq.class.js"
import { seq } from "./seq.js"
const NO_SUCH_KEY = Symbol("NO_SUCH_KEY")
type NO_SUCH_KEY = typeof NO_SUCH_KEY
export namespace LMap {
    type MaybeDoddle<T> = T | Doddle<T>

    export type Subject = "pairs" | "keys" | "values"

    export type Iteratee<Key, Value, Out> = (element: Value, key: Key) => MaybeDoddle<Out>

    export type NoInputAction = () => unknown | Doddle<unknown>

    export type Predicate<K, V> = Iteratee<K, V, boolean>
    export type TypePredicate<E, T extends E> = (element: E, index: number) => element is T

    export type Reducer<E, O> = (acc: O, element: E, index: number) => MaybeDoddle<O>

    export type Core<Key, Value> = [
        keys: Seq<Key>,
        get: (key: Key) => MaybeDoddle<Value | NO_SUCH_KEY> | NO_SUCH_KEY
    ]
}

export abstract class LMap<Key, Value> {
    abstract readonly core: LMap.Core<Key, Value>
    abstract readonly keys: Seq<Key>
    protected abstract _get(key: Key): Value | NO_SUCH_KEY

    has(key: Key): Doddle<boolean> {
        return lazyFromOperator(this, function has(input) {
            const value = input._get(key)
            if (value === NO_SUCH_KEY) {
                return false
            }
            return true
        })
    }
    get<Alt = undefined>(key: Key, fallback?: Alt): Doddle<Value | Alt> {
        return lazyFromOperator(this, function get(input) {
            const value = input._get(key)
            if (value === NO_SUCH_KEY) {
                return fallback as Alt
            }
            return value
        })
    }
    mustGet(key: Key): Doddle<Value> {
        return lazyFromOperator(this, function mustGet(input) {
            const value = input._get(key)
            if (value === NO_SUCH_KEY) {
                throw new Error(`Key ${key} not found`)
            }
            return value
        })
    }

    pick<OutKey extends Key, Value>(...keys: OutKey[]): LMap<OutKey, Value> {
        const keySet = new Set(keys)
        return LMapOperator(this, function pick(input) {
            return [
                seq(keySet)
                    .filter(key => input.has(key))
                    .cache(),
                key => {
                    if (!keySet.has(key)) {
                        return NO_SUCH_KEY
                    }
                    const v = input._get(key)
                    return v
                }
            ] as LMap.Core<OutKey, Value>
        })
    }
    map<Out>(iteratee: LMap.Iteratee<Key, Value, Out>): LMap<Key, Out> {
        return LMapOperator(this, function map(input) {
            return [
                input.keys,
                (key: Key) => {
                    const v = input.mustGet(key).pull() as Value
                    if (v === NO_SUCH_KEY) {
                        return NO_SUCH_KEY
                    }
                    return iteratee(v, key) as Out
                }
            ]
        })
    }

    filter<R extends Key>(predicate: LMap.TypePredicate<Key, R>): LMap<R, Value>
    filter<R extends Value>(predicate: LMap.TypePredicate<Value, R>): LMap<Key, R>
    filter(predicate: LMap.Predicate<any, any>): LMap<Key, Value> {
        return LMapOperator(this, function filter(input) {
            return [
                input.keys.filter(key => {
                    const v = input._get(key)
                    if (v === NO_SUCH_KEY) {
                        throw new Error(`Key ${key} not found`)
                    }
                    return predicate(v, key)
                }),
                (key: Key) => {
                    const v = input._get(key)
                    if (v === NO_SUCH_KEY) {
                        return NO_SUCH_KEY
                    }
                    if (predicate(v, key)) {
                        return v
                    }
                    return v
                }
            ]
        })
    }
}

export const LMapOperator = function lmap<In, OutK, OutV>(
    _: In,
    __: (input: In) => LMap.Core<OutK, OutV>
): LMap<OutK, OutV> {
    return null!
}
