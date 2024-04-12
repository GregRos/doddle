import { SeqLike } from "./types";
import { isIterable, isLazy, isLazyLike, isNextable, pull } from "../../util";
import { Lazy, Pulled } from "../..";
import { Seq } from "./wrapper";
import { LaziesError } from "../error";

export function seq(): Seq<never>;
export function seq<E>(input: Lazy<SeqLike<E>>): Seq<E>;
export function seq<E>(input: E[]): Seq<E>;
export function seq<E>(input: SeqLike<E>): Seq<E>;
export function seq<E>(input?: SeqLike<E> | Lazy<SeqLike<E>>) {
    input = pull(input);
    if (!input) {
        return new Seq<never>([]);
    } else if (input instanceof Seq) {
        return input;
    } else if (isIterable(input)) {
        return new Seq<E>(input);
    } else if (typeof input === "function") {
        return new Seq<E>({
            *[Symbol.iterator]() {
                const result = input();
                if (isIterable<E>(result)) {
                    yield* result;
                } else if (isNextable<E>(result)) {
                    for (
                        let item = result.next();
                        !item.done;
                        item = result.next()
                    ) {
                        yield item.value;
                    }
                } else {
                    throw new TypeError(
                        `Got unexpected result from iterator constructor: ${result}`
                    );
                }
            }
        });
    }
    throw new TypeError(`Cannot create Seq from ${input}`);
}
