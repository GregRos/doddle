import { SeqLike } from "./types";
import { isIterable, isLazy, isLazyLike, isNextable, pull } from "../util";
import { Pulled } from "..";
import { Seq } from "./wrapper";

export function seq<E>(input: SeqLike<E>) {
    if (input instanceof Seq) {
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
                }
                throw new Error(
                    `Got unexpected result from iterator constructor: ${result}`
                );
            }
        });
    }
    throw new Error(`Cannot create Seq from ${input}`);
}
