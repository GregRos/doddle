import { rm } from "fs/promises"
import globby from "globby"

async function run() {
    const files = await globby("**/seqs/operators/*.test.ts")
    const ps = files.map(async file => {
        if (file.includes("sync") || file.includes("async")) {
            return
        }
        await rm(file)
    })
    await Promise.all(ps)
}
run()
