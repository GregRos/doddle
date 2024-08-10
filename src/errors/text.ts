import { isArray } from "../utils.js"

export type _Text<T> = readonly (string | T)[]
export type Text = string | _Text<_Text<_Text<_Text<_Text<string>>>>>
export function splat(bits: Text): string {
    if (!isArray(bits)) {
        return bits as string
    }
    return bits.flat(5).join(" ")
}
