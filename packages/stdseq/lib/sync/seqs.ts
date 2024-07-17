import { seq } from "./seq"
import { Seq, SeqFrom } from "./sync-wrapper"

export namespace seqs {
    export function empty<E = never>(): Seq<E> {
        return seq().as<E>()
    }
    export function of<Es extends unknown[]>(...elements: Es): Seq<Es[number]> {
        return new SeqFrom(elements)
    }
    export function randomFloats(range: [start: number, end: number], count: number) {
        return seq(function* () {
            for (let i = 0; i < count; i++) {
                yield Math.random() * (range[1] - range[0]) + range[0]
            }
        })
    }

    export function randomInts(range: [start: number, end: number], count: number) {
        return seqs.randomFloats(range, count).map(Math.floor)
    }

    export function range(start: number, end: number): Seq<number> {
        const len = Math.abs(end - start)
        const sign = Math.sign(end - start)
        return seq(function* () {
            for (let i = 0; i < len; i++) {
                yield i * sign + start
            }
        })
    }

    export function repeat<E>(element: E, times: number): Seq<E> {
        return seq(function* () {
            for (let i = 0; i < times; i++) {
                yield element
            }
        })
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
