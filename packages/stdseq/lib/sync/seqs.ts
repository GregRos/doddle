import { seq } from "./seq"
import { Seq } from "./sync-wrapper"

export namespace seqs {
    export function empty<E = never>(): Seq<E> {
        return seq().as<E>()
    }
    export function of<Es extends unknown[]>(...elements: Es): Seq<Es[number]> {
        return new Seq(elements)
    }

    export namespace inf {
        export const nat = seq(function* () {
            let i = 0
            while (true) {
                yield i++
            }
        })

        export function value<E>(value: E): Seq<E> {
            return seq(function* () {
                while (true) {
                    yield value
                }
            })
        }
    }

    export function range(start: number, end: number): Seq<number> {
        const len = Math.abs(end - start)
        const sign = Math.sign(end - start)
        return inf.nat.map(x => x * sign + start).take(len)
    }

    export function repeat<E>(element: E, times: number): Seq<E> {
        return inf.value(element).take(times)
    }
}
