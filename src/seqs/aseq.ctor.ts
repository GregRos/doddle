import { pull, type Doddle, type DoddleAsync } from "../doddle/index.js"
import { checkASeqInputValue } from "../errors/error.js"
import {
    _xiter,
    isArrayLike,
    isAsyncIterable,
    isInt,
    isIterable,
    isNextable,
    isReadableStream,
    type MaybePromise
} from "../utils.js"
import { ASeqOperator, type ASeq } from "./aseq.class.js"

function aseq<E>(input: readonly E[]): ASeq<E>
function aseq<E>(input: ASeq.SimpleInput<Promise<DoddleAsync<E>>>): ASeq<E>
function aseq<E>(input: ASeq.SimpleInput<DoddleAsync<E>>): ASeq<E>
function aseq<E>(input: ASeq.SimpleInput<Promise<E>>): ASeq<E>
function aseq<E>(input: ASeq.SimpleInput<Doddle<E>>): ASeq<E>
function aseq<E>(input: ASeq.SimpleInput<MaybePromise<E>>): ASeq<E>
function aseq<E>(input: ASeq.Input<E>): ASeq<E>
function aseq<E>(input: ASeq.Input<E>): any {
    function fromFunctionResult(input: ReturnType<ASeq.FunctionInput<MaybePromise<E>>>): ASeq<E> {
        return ASeqOperator(input, async function* aseq(input) {
            const pulled = await pull(input)
            if (isAsyncIterable(pulled) || isIterable(pulled)) {
                var iterator = _xiter(pulled)
            } else if (isArrayLike(pulled)) {
                for (const key of Object.keys(pulled)) {
                    if (isInt(+key)) {
                        yield pull(pulled[+key])
                    }
                }
                return
            } else if (isNextable(pulled)) {
                iterator = pulled
            } else {
                throw new Error("Should be unreachable")
            }
            for (let item = await iterator.next(); !item.done; item = await iterator.next()) {
                yield pull(item.value)
            }
            await iterator.return?.()
        }) as ASeq<E>
    }
    input = checkASeqInputValue(input)
    if (isNextable(input) || isReadableStream(input)) {
        // readable streams are basically iterators
        return fromFunctionResult(input as any).cache()
    }
    if (isAsyncIterable(input) || isIterable(input)) {
        return aseq(() => input)
    }

    return ASeqOperator(input, async function* aseq(input) {
        const result = typeof input === "function" ? await input() : input
        const pulled = await pull(result)
        if (isNextable(pulled) || isReadableStream(pulled)) {
            yield* fromFunctionResult(pulled as any).cache()
        }
        yield* fromFunctionResult(pulled as any)
    })
}

export const ___aseq = aseq
