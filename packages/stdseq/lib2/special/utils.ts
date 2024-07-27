import { isAsyncIterable, isThenable } from "stdlazy"

export function returnKvp(input: any, key: any, value: any) {
    if (isAsyncIterable(input) && isThenable(key)) {
        return key.then(key => ({
            key: key,
            value: value
        }))
    }
    return {
        key: key,
        value: value
    }
}
