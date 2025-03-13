export type Get_All_Paths_Of<T> =
    | []
    | {
          [K in keyof T]: T[K] extends object ? [K, ...Get_All_Paths_Of<T[K]>] : [K]
      }[keyof T]

type Compose_Dotted_Path<Paths extends any[]> = Paths extends []
    ? ""
    : Paths extends [infer A extends number | string]
      ? `${A}`
      : Paths extends [
              infer A extends number | string,
              ...infer Rest extends [unknown, ...unknown[]]
          ]
        ? `${A}.${Compose_Dotted_Path<Rest>}`
        : never

export type Get_All_Dotted_Paths_Of<T> = Compose_Dotted_Path<Get_All_Paths_Of<T>>

export type Get_Value_At_Path<T, Path extends PropertyKey[]> = Path extends []
    ? T
    : Path extends [keyof T]
      ? T[Path[0]]
      : Path extends [infer Head extends keyof T, ...infer Rest extends PropertyKey[]]
        ? T[Head] extends object
            ? Get_Value_At_Path<T[Head], Rest>
            : never
        : never

export type Get_Value_At_Dotted_Path<T, Path extends string> = Get_Value_At_Path<
    T,
    Split_Dotted_Path<Path>
>

export type Split_Dotted_Path<Path extends string> = Path extends ""
    ? []
    : Path extends `${infer Head}.${infer Rest}`
      ? [Head, ...Split_Dotted_Path<Rest>]
      : [Path]

export type Get_Path_Value_Filter<Path extends PropertyKey[], Value> = Path extends []
    ? Value
    : Path extends [infer Head extends PropertyKey, ...infer Rest extends PropertyKey[]]
      ? {
            [K in Head]: Get_Path_Value_Filter<Rest, Value>
        }
      : never

export type Get_Match_Object_Structure<Object, Path extends any[]> = {
    [K in Extract<Get_Value_At_Path<Object, Path>, PropertyKey>]: Extract<
        Object,
        Get_Path_Value_Filter<Path, K>
    >
}
