export function isIterable<T>(value: any): value is Iterable<T> {
    return (
        typeof value === "object" && value != null && typeof value[Symbol.iterator] === "function"
    )
}

export function isAsyncIterable<T>(value: any): value is AsyncIterable<T> {
    return (
        typeof value === "object" &&
        value != null &&
        typeof value[Symbol.asyncIterator] === "function"
    )
}

export function isNextable<T>(value: any): value is Iterator<T> | AsyncIterator<T> {
    // Checks if value is an iterator
    return typeof value === "object" && value && "next" in value && typeof value.next === "function"
}
export type AnyConstructor = { new (...args: any[]): any }
export type Selector = AnyConstructor | keyof NamedTypes
export type GetTypeForSelector<T> = T extends keyof NamedTypes
    ? NamedTypes[T]
    : T extends AnyConstructor
      ? InstanceType<T>
      : never
export type NamedTypes = {
    object: object
    string: string
    number: number
    boolean: boolean
    symbol: symbol
    bigint: bigint
    function: Function
    undefined: undefined
}
