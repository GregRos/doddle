import { readFile, writeFile } from "fs/promises"
import globby from "globby"
import { basename } from "path"

function getInputFileName(dir: string, name: string, suffix: string) {
    return `src/seqs/${dir}/${name}.${suffix}.ts`
}

async function run(dir: string, suffix: string) {
    const files = await globby([
        getInputFileName(dir, "*", suffix),
        `!${getInputFileName(dir, "*", "test")}`
    ])
    const files2 = files.filter(file => !basename(file, ".ts").includes("."))
    const allPs = files2.map(file => splitByDeclaration(file))
    await Promise.all(allPs)
}

async function splitImportsAndDeclaration(file: string) {
    const content = await readFile(file, "utf-8")
    const decls = content.match(/^import[\s\S]*?\s*(function \w+[\s\S]*?\})\s*export default$/)
    if (!decls) {
        console.log("Not matched in", file)
        return
    }
    const declarations = decls[1]
    const fixed = declarations
        .replaceAll(/^function /gm, "")
        .replaceAll(/this: [^,]+,/g, "")
        .replaceAll(/<T,/, "<")
        .replaceAll(/<T>/, "")

    console.log("Matched in", file)
    return fixed
}

async function mergeDeclarations(path: string, type: string) {
    const files = await globby([`src/seqs/${path}/*.${type}.ts`])
    const decls = await Promise.all(
        files.map(async file => {
            const content = await readFile(file, "utf-8")
            return splitImportsAndDeclaration(content)
        })
    )
    await writeFile(`src/result.${type}.ts`, decls.join("\n"), "utf-8")
}

run("operators", "sync")
