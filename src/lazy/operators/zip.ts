import { isThenable } from "../../utils"
import { lazy } from "../lazy"
import type { Lazy } from "../lazy"
import { type LazyAsync, type Pullable, type Pulled, type PulledAwaited } from "../types"

/**
 * Zips **this** {@link Lazy} primitive with one or more others, returning a new {@link Lazy} that,
 * when pulled, will pull all of them and return an array with the results. If any primitive
 * involved is async, the new {@link Lazy} will also be async.
 *
 * @example
 *     const a = lazy(() => 1).zip(lazy(() => 2)) satisfies Lazy<[number, number]>
 *     expect(a.pull()).toEqual([1, 2])
 *
 *     const b = lazy(async () => 1).zip(lazy(() => 2)) satisfies LazyAsync<[number, number]>
 *     await expect(b.pull()).resolves.toEqual([1, 2])
 *
 * @param others One or more {@link Lazy} primitives to zip with **this**.
 * @summary Turns multiple lazy values into a single lazy value producing an array.
 */
function zip<T, Others extends readonly [Lazy<any>, ...Lazy<any>[]]>(
    this: Lazy<T>,
    ...others: Others
): LazyAsync<any> extends [Lazy<T>, ...Others][number]
    ? LazyAsync<
          [
              PulledAwaited<T>,
              ...{
                  [K in keyof Others]: PulledAwaited<Others[K]>
              }
          ]
      >
    : Lazy<
          [
              Pulled<T>,
              ...{
                  [K in keyof Others]: Pulled<Others[K]>
              }
          ]
      >

function zip(this: Lazy<any>, ...others: Pullable<any>[]): Lazy<any> {
    // eslint-disable-next-line @typescript-eslint/promise-function-async
    return lazy(() => {
        const values = [this, ...others].map(x => x.pull())
        if (values.some(isThenable)) {
            return Promise.all(values)
        }
        return values
    })
}

export default zip
