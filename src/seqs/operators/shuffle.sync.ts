import { SeqOperator } from "../seq/seq.class.js"

import { seq } from "../seq/seq.js"

function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}
function shuffle<T>(this: Iterable<T>) {
    return SeqOperator(this, function* shuffle(input) {
        const array = seq(input).toArray().pull()
        shuffleArray(array)
        yield* array
    })
}
export default shuffle
