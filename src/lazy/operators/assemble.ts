import { isThenable } from "../../utils"
import { lazy } from "../from/input"
import type { Lazy } from "../lazy"
import { type LazyAsync, type Pullable, type Pulled, type PulledAwaited } from "../types"

/**
 * Takes an key-value object with {@link Lazy} values and returns a new {@link Lazy} that, when
 * pulled, will pull all of them and return an object with the same keys, but with the values
 * replaced by the pulled results. If any of the values are async, the new {@link Lazy} will also be
 * async.
 *
 * The value of **this** {@link Lazy} will be available under the key `"this"`.
 *
 * @example
 *     const self = lazy(() => 1).assemble({
 *         a: lazy(() => 2),
 *         b: lazy(() => 3)
 *     })
 *     expect(self.pull()).toEqual({ this: 1, a: 2, b: 3 })
 *
 *     const asyncSelf = lazy(async () => 1).assemble({
 *         a: lazy(() => 2),
 *         b: lazy(() => 3)
 *     })
 *     await expect(asyncSelf.pull()).resolves.toEqual({ this: 1, a: 2, b: 3 })
 *
 * @param assembly An object with {@link Lazy} values.
 * @returns A new {@link Lazy} primitive that will return an object with the same keys as the input
 *   object, plus the key `"this"`, with the pulled results.
 * @summary Converts an object of {@link Lazy} values into a {@link Lazy} value producing an object.
 */
function assemble<T, X extends Record<keyof X, Pullable<unknown>>>(
    this: Lazy<T>,
    assembly: X
): LazyAsync<any> extends X[keyof X] | Lazy<T>
    ? LazyAsync<
          {
              [K in keyof X]: PulledAwaited<X[K]>
          } & {
              this: PulledAwaited<T>
          }
      >
    : Lazy<
          {
              [K in keyof X]: Pulled<X[K]>
          } & {
              this: Pulled<T>
          }
      > {
    return lazy(() => {
        const keys = ["this", ...Object.keys(assembly)]
        const values = [this, ...Object.values(assembly)].map((x: any) => x.pull())
        if (values.some(isThenable)) {
            return Promise.all(values).then(values =>
                keys.reduce((acc, key, i) => {
                    acc[key] = values[i]
                    return acc
                }, {} as any)
            )
        }
        return values.reduce((acc, value, i) => {
            acc[keys[i]] = value
            return acc
        }, {} as any)
    }) as any
}

export default assemble
