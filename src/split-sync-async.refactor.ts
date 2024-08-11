import { readFile, writeFile } from "fs/promises"
import globby from "globby"

function getInputFileName(dir: string, name: string, suffix: string) {
    return `src/seqs/${dir}/${name}.${suffix}.ts`
}

async function splitImportsAndDeclaration(file: string) {
    const content = await readFile(file, "utf-8")
    const decls = content.match(/^import[\s\S]*?\s*(^function \w+[\s\S]*?\})\s*^export default/m)
    if (!decls) {
        console.log("Not matched in", file)
        return
    }
    const declarations = decls[1]
    const fixed = declarations
        .replaceAll(/^function /gm, "")
        .replaceAll(/chk\((\w+)\)/g, "chk(this.$1)")

    console.log("Matched in", file)
    return fixed
}

async function mergeDeclarations(path: string, type: string) {
    const files = await globby([
        getInputFileName(path, "*", type),
        `!${getInputFileName(path, "*", "test")}`
    ])
    const decls = await Promise.all(
        files.map(async file => {
            return splitImportsAndDeclaration(file)
        })
    )
    console.log("Found", decls.length, "files")
    await writeFile(`src/result.${type}.ts`, decls.filter(x => !!x).join("\n"), "utf-8")
}

void mergeDeclarations("from", "sync")
