import { ASeqOperator } from "../seq/aseq.class.js"
import { aseq } from "../seq/aseq.js"

function shuffleArray<T>(array: T[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
    return array
}
function shuffle<T>(this: AsyncIterable<T>) {
    return ASeqOperator(this, async function* shuffle(input) {
        const array = await aseq(input).toArray().pull()
        shuffleArray(array)
        yield* array
    })
}
export default shuffle
