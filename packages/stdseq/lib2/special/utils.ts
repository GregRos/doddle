import { isAsyncIterable, isThenable } from "stdlazy"

export function returnKvp(input: any, key: any, value: any) {
    if (isAsyncIterable(input) && isThenable(key)) {
        return key.then(key => ({
            key: key,
            value: value
        })) as Promise<any>
    }
    return {
        key: key,
        value: value
    }
}
