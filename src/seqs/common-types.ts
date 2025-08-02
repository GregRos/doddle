export type Get_Concat_Element_Type<T, S> = T extends never ? never : S
/** The stage of yielding at which a function should be called. */
export type EachCallStage = "before" | "after" | "both" | undefined

/** Options for `takeWhile` and similar predicate-based subsequence operations. */
export interface TakeWhileOptions {
    takeFinal?: boolean
}
/** Options for `skipWhile` and similar predicate-based skipping operators. */
export interface SkipWhileOptions {
    /** Whether to skip the boundary element for which the predicate returns `false`. */
    skipFinal?: boolean
}
export const enum SkippingMode {
    None = 0,
    Skipping = 1,
    NotSkipping = 2
}
type neverToUndefined<T> = T extends never ? undefined : T
export type getZipValuesType<Xs extends [any, ...any[]]> = {
    [K in keyof Xs]: neverToUndefined<Xs[K]> | undefined
}

export type getWindowArgsType<T, L> = L extends 0
    ? []
    : number extends L
      ? [T, ...(T | undefined)[]]
      : L extends 1
        ? [T]
        : L extends 2
          ? [T, T?]
          : L extends 3
            ? [T, T?, T?]
            : L extends 4
              ? [T, T?, T?, T?]
              : L extends 5
                ? [T, T?, T?, T?, T?]
                : L extends 6
                  ? [T, T?, T?, T?, T?, T?]
                  : L extends 7
                    ? [T, T?, T?, T?, T?, T?, T?]
                    : L extends 8
                      ? [T, T?, T?, T?, T?, T?, T?, T?]
                      : L extends 9
                        ? [T, T?, T?, T?, T?, T?, T?, T?, T?]
                        : L extends 10
                          ? [T, T?, T?, T?, T?, T?, T?, T?, T?, T?]
                          : L extends 11
                            ? [T, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?]
                            : L extends 12
                              ? [T, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?]
                              : L extends 13
                                ? [T, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?]
                                : L extends 14
                                  ? [T, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?]
                                  : L extends 15
                                    ? [T, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?, T?]
                                    : [
                                          T,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          T?,
                                          ...T[]
                                      ]

export type getWindowOutputType<T, L> = L extends 0
    ? []
    : number extends L
      ? [T, ...T[]]
      : L extends 1
        ? [T]
        : L extends 2
          ? [T, T] | getWindowOutputType<T, 1>
          : L extends 3
            ? [T, T, T] | getWindowOutputType<T, 2>
            : L extends 4
              ? [T, T, T, T] | getWindowOutputType<T, 3>
              : L extends 5
                ? [T, T, T, T, T] | getWindowOutputType<T, 4>
                : L extends 6
                  ? [T, T, T, T, T, T] | getWindowOutputType<T, 5>
                  : L extends 7
                    ? [T, T, T, T, T, T, T] | getWindowOutputType<T, 6>
                    : L extends 8
                      ? [T, T, T, T, T, T, T, T] | getWindowOutputType<T, 7>
                      : L extends 9
                        ? [T, T, T, T, T, T, T, T, T] | getWindowOutputType<T, 8>
                        : L extends 10
                          ? [T, T, T, T, T, T, T, T, T, T] | getWindowOutputType<T, 9>
                          : L extends 11
                            ? [T, T, T, T, T, T, T, T, T, T, T] | getWindowOutputType<T, 10>
                            : L extends 12
                              ? [T, T, T, T, T, T, T, T, T, T, T, T] | getWindowOutputType<T, 11>
                              : L extends 13
                                ?
                                      | [T, T, T, T, T, T, T, T, T, T, T, T, T]
                                      | getWindowOutputType<T, 12>
                                : L extends 14
                                  ?
                                        | [T, T, T, T, T, T, T, T, T, T, T, T, T, T]
                                        | getWindowOutputType<T, 13>
                                  : L extends 15
                                    ?
                                          | [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T]
                                          | getWindowOutputType<T, 14>
                                    :
                                          | [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, ...T[]]
                                          | getWindowOutputType<T, 15>
