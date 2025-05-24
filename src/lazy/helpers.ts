import { Doddle, DoddleAsync } from "../lazy/index.js"

export type Is_Any_Pure_Async<T extends Doddle<any>[], IfTrue, IfFalse> = {
    [K in keyof T]: T[K] extends DoddleAsync<any> ? K : never
}[number] extends never
    ? IfFalse
    : IfTrue

export type Is_Any_Mixed<T extends Doddle<any>[], IfTrue, IfFalse> =
    DoddleAsync<any> extends T[number] ? IfTrue : IfFalse

export type Matches_Mixed_Value<Input, DoddleType = Doddle<Input>> =
    Promise<any> extends Input ? DoddleType : never
