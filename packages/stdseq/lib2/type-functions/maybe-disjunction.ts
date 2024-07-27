export type isNullish<T> = T extends null | undefined ? true : false
export type maybeDisjunction<T, Ellipsis> =
    isNullish<Ellipsis> extends true ? T : T | NonNullable<Ellipsis>
