import { isAsyncIterable, isIterable, isNextable } from "../util";
import { LaziesError } from "../error";
import { ASeqLike } from "./types";
import { ASeq } from "./wrapper";

export function aseq<E>(input: E[]): ASeq<E>;
export function aseq<E>(input: ASeqLike<E>): ASeq<E>;
export function aseq<E>(input: ASeqLike<E>) {
    if (input instanceof ASeq) {
        return input;
    } else if (isAsyncIterable<E>(input)) {
        return new ASeq<E>(input);
    } else if (isIterable<E>(input)) {
        return new ASeq<E>({
            async *[Symbol.asyncIterator]() {
                yield* input;
            }
        });
    } else if (typeof input === "function") {
        return new ASeq<E>({
            async *[Symbol.asyncIterator]() {
                const result = input();
                if (isAsyncIterable<E>(result)) {
                    yield* result;
                } else if (isIterable<E>(result)) {
                    yield* result;
                } else if (isNextable<E>(result)) {
                    for (
                        let item = await result.next();
                        !item.done;
                        item = await result.next()
                    ) {
                        yield item.value;
                    }
                } else {
                    throw new LaziesError(
                        `Got unexpected result from iterator constructor: ${result}`
                    );
                }
            }
        });
    }
    throw new LaziesError(`Cannot create Seq from ${input}`);
}
