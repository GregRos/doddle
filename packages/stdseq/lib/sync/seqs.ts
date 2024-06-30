import { seq } from "./seq"
import { Seq, SeqFrom } from "./sync-wrapper"

export namespace seqs {
    export function empty<E = never>(): Seq<E> {
        return seq().as<E>()
    }
    export function of<Es extends unknown[]>(...elements: Es): Seq<Es[number]> {
        return new SeqFrom(elements)
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

    export function cycle<E>(elements: E[], times: number): Seq<E> {
        return seq(function* () {
            for (let i = 0; i < times; times === Infinity || i++) {
                for (const element of elements) {
                    yield element
                }
            }
        })
    }

    export function repeatedly<E>(generator: () => E): Seq<E> {
        return seq(function* () {
            while (true) {
                yield generator()
            }
        })
    }
}
