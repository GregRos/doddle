import { aseq } from "./aseq"
import { ASeq } from "./async-wrapper"

export namespace aseqs {
    export function empty<E = never>(): ASeq<E> {
        return aseq().as<E>()
    }
    export function of<Es extends unknown[]>(...elements: Es): ASeq<Es[number]> {
        return aseq(elements)
    }

    export namespace inf {
        export const nat = aseq(async function* () {
            let i = 0
            while (true) {
                yield i++
            }
        })

        export function value<E>(value: E): ASeq<E> {
            return aseq(function* () {
                while (true) {
                    yield value
                }
            })
        }
    }

    export function range(start: number, end: number): ASeq<number> {
        const len = Math.abs(end - start)
        const sign = Math.sign(end - start)
        return inf.nat.map(x => x * sign + start).take(len)
    }

    export function repeat<E>(element: E, times: number): ASeq<E> {
        return inf.value(element).take(times)
    }
}
