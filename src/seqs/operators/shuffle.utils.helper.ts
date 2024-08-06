export function countEachItemAppearance(examplars: number[][]): number[][] {
    const counts: number[][] = []

    examplars.forEach(examplar => {
        examplar.forEach((item, i) => {
            counts[item] ??= []
            counts[item][i] ??= 0
            counts[item][i]++
        })
    })
    return counts.map(xs => xs.map(x => x / examplars.length))
}
