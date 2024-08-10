import { readFile, writeFile } from "fs/promises"
import globby from "globby"
import { basename } from "path"
import shelljs from "shelljs"
async function run() {
    shelljs.rm("-f", "src/seqs/operators/*.ts.test")
    const files = await globby(["src/seqs/operators/*.ts", "!src/seqs/operators/*.test.ts"])
    const files2 = files.filter(file => !basename(file, ".ts").includes("."))
    const allPs = files2.map(file => splitByDeclaration(file))
    await Promise.all(allPs)
}

async function splitByDeclaration(file: string) {
    const content = await readFile(file, "utf-8")
    const decls = content.match(
        /^(import[\s\S]*?)(export? function generic[\s\S]*?\})?\s*(export function sync[\s\S]*?\})\s*(export function async[\s\S]*?\})\s*$/
    )
    if (!decls) {
        console.log("Not matched in", file)
        return
    }
    console.log("Matched in", file)
    let imports = decls[1]
    const generic = decls[2]
    let syncDecl = decls[3]
    let asyncDecl = decls[4]
    const operatorName = basename(file, ".ts").replace(/-./g, s => s[1].toUpperCase())
    if (generic) {
        await writeFile(file, [imports, generic].join("\n"), "utf-8")
        imports = `import {generic} from "./${basename(file, ".ts")}.js"\n${imports}`
    }
    syncDecl = syncDecl.replaceAll("export function sync", `function ${operatorName}`)
    asyncDecl = asyncDecl.replaceAll("export function async", `function ${operatorName}`)
    await writeFile(
        `${file.replace(".ts", ".sync.ts")}`,
        [imports, syncDecl, `export default ${operatorName}`].join("\n"),
        "utf-8"
    )
    await writeFile(
        `${file.replace(".ts", ".async.ts")}`,
        [imports, asyncDecl, `export default ${operatorName}`].join("\n"),
        "utf-8"
    )
}
run()
