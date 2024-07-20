export type getTuple<T, L extends number> = L extends 0
    ? []
    : L extends 1
      ? [T]
      : L extends 2
        ? [T, T]
        : L extends 3
          ? [T, T, T]
          : L extends 4
            ? [T, T, T, T]
            : L extends 5
              ? [T, T, T, T, T]
              : L extends 6
                ? [T, T, T, T, T, T]
                : L extends 7
                  ? [T, T, T, T, T, T, T]
                  : L extends 8
                    ? [T, T, T, T, T, T, T, T]
                    : L extends 9
                      ? [T, T, T, T, T, T, T, T, T]
                      : L extends 10
                        ? [T, T, T, T, T, T, T, T, T, T]
                        : L extends 11
                          ? [T, T, T, T, T, T, T, T, T, T, T]
                          : L extends 12
                            ? [T, T, T, T, T, T, T, T, T, T, T, T]
                            : L extends 13
                              ? [T, T, T, T, T, T, T, T, T, T, T, T, T]
                              : L extends 14
                                ? [T, T, T, T, T, T, T, T, T, T, T, T, T, T]
                                : L extends 15
                                  ? [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T]
                                  : [T, T, T, T, T, T, T, T, T, T, T, T, T, T, T, ...T[]]
