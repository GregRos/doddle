import { readFile, writeFile } from "fs/promises"
import globby from "globby"
import { basename, dirname } from "path"
import { exec } from "shelljs"
import * as ts from "typescript"
exec("git clean -fdx src/**/seqs/operators/*.sync.test.ts src/**/seqs/operators/*.async.test.ts")
function extractImports(node: ts.Node, source: { text: string }) {
    let imports = ""
    ts.forEachChild(node, child => {
        if (ts.isImportDeclaration(child)) {
            // Extract the text of the import declaration
            const start = child.getFullStart()
            const end = child.getEnd()
            imports += source.text.substring(start, end)
        }
    })
    return imports
}
function findDescribes(node: ts.Node, source: ts.SourceFile, label: string) {
    let content = ""
    function find(node: ts.Node) {
        ts.forEachChild(node, child => {
            if (
                ts.isCallExpression(child) &&
                child.expression.getText(source) === "describe" &&
                child.arguments.length > 0 &&
                ts.isStringLiteral(child.arguments[0])
            ) {
                const describeLabel = child.arguments[0].text
                if (describeLabel !== label) {
                    return
                }
                const arg2 = child.arguments[1]
                if (ts.isFunctionExpression(arg2) || ts.isArrowFunction(arg2)) {
                    const body = arg2.body
                    if (body && ts.isBlock(body)) {
                        for (const statement of body.statements) {
                            const statementStart = statement.getFullStart()
                            const statementEnd = statement.getEnd()
                            content += source.text.substring(statementStart, statementEnd)
                        }
                    }
                }
                return
            }
            find(child)
        })
    }
    find(node)
    return content
}

async function splitTestFile(filePath: string) {
    const source = ts.createSourceFile(
        filePath,
        await readFile(filePath, "utf8"),
        ts.ScriptTarget.Latest,
        true
    )

    const baseName = basename(filePath, ".test.ts")
    const importContent = extractImports(source, source)
    const syncContent = findDescribes(source, source, "sync")
    const asyncContent = findDescribes(source, source, "async")
    const basePath = dirname(filePath)
    const syncPath = `${basePath}/${baseName}.sync.test.ts`
    const asyncPath = `${basePath}/${baseName}.async.test.ts`
    if (syncContent) {
        console.log(`Writing ${syncPath}`)
        await writeFile(syncPath, importContent + syncContent, "utf8")
    }
    if (asyncContent) {
        console.log(`Writing ${asyncPath}`)
        await writeFile(asyncPath, importContent + asyncContent, "utf8")
    }
}
async function run() {
    const files = await globby("src/**/seqs/operators/*.test.ts")
    console.log(`Found ${files.length} files:
${files.map(x => `* ${x}`).join("\n")}`)
    const pSplits = files.map(splitTestFile)
    await Promise.all(pSplits)
}

run()
