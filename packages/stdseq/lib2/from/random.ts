import type { Seq } from "../wrappers/seq.class"
import { fromSyncInput } from "./input"
export interface Ints {
    type: "int"
    min: number
    max: number
}

export interface Floats {
    type: "float"
    min: number
    max: number
}

export type Generator = Ints | Floats

export function getGeneratorFunction(g: Generator) {
    const float = () => Math.random() * (g.max - g.min) + g.min
    switch (g.type) {
        case "int":
            return () => Math.floor(float())
        case "float":
            return float
        default:
            throw new Error("Invalid generator type")
    }
}
interface GeneratorReturnTypes {
    int: number
    float: number
}
