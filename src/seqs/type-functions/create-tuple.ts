export type getReturnedWindowType<T, L> = L extends 0
    ? []
    : number extends L
      ? [T, ...T[]]
      : L extends 1
        ? [T]
        : L extends 2
          ? [T, T] | getReturnedWindowType<T, 1>
          : L extends 3
            ? [T, T, T] | getReturnedWindowType<T, 2>
            : L extends 4
              ? [T, T, T, T] | getReturnedWindowType<T, 3>
              : L extends 5
                ? [T, T, T, T, T] | getReturnedWindowType<T, 4>
                : L extends 6
                  ? [T, T, T, T, T, T] | getReturnedWindowType<T, 5>
                  : L extends 7
                    ? [T, T, T, T, T, T, T] | getReturnedWindowType<T, 6>
                    : L extends 8
                      ? [T, T, T, T, T, T, T, T] | getReturnedWindowType<T, 7>
                      : L extends 9
                        ? [T, T, T, T, T, T, T, T, T] | getReturnedWindowType<T, 8>
                        : L extends 10
                          ? [T, T, T, T, T, T, T, T, T, T] | getReturnedWindowType<T, 9>
                          : L extends 11
                            ? [T, T, T, T, T, T, T, T, T, T, T] | getReturnedWindowType<T, 10>
                            : L extends 12
                              ? [T, T, T, T, T, T, T, T, T, T, T, T] | getReturnedWindowType<T, 11>
                              : L extends 13
                                ?
                                      | [T, T, T, T, T, T, T, T, T, T, T, T, T]
                                      | getReturnedWindowType<T, 12>
                                : L extends 14
                                  ?
                                        | [T, T, T, T, T, T, T, T, T, T, T, T, T, T]
                                        | getReturnedWindowType<T, 13>
                                  : L extends 15
                                    ?
                                          | [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T]
                                          | getReturnedWindowType<T, 14>
                                    :
                                          | [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, ...T[]]
                                          | getReturnedWindowType<T, 15>
