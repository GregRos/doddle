import { readFile, writeFile } from "fs/promises"
import g from "globby"
import { exec } from "shelljs"

exec("git reset --hard HEAD")
const syncReplacements = {
    Iteratee: "seq.Iteratee",
    SeqLikeInput: "seq.Input",
    Reducer: "seq.Reducer",
    Predicate: "seq.Predicate",
    TypePredicate: "seq.TypePredicate",
    NoIndexIteratee: "seq.NoIndexIteratee",
    StageIteratee: "seq.StageIteratee",
    ElementOfInput: "seq.ElementOfInput"
}

const asyncReplacements = {
    AsyncIteratee: "aseq.Iteratee",
    ASeqLikeInput: "aseq.Input",
    AsyncPredicate: "aseq.Predicate",
    AsyncReducer: "aseq.Reducer",
    AsyncNoIndexIteratee: "aseq.NoIndexIteratee",
    StageAsyncIteratee: "aseq.StageIteratee"
}

const fTypesRegexp = /^import.*? from.*?\/f-types.*/
const seqImportRegexp = /^import .*? from.*?\/seq\/seq.ctor"/
const aseqImportRegexp = /^import .*? from.*?\/seq\/aseq.ctor"/
async function renameInFile(file: string) {
    let contents = await readFile(file, "utf-8")
    if (fTypesRegexp.test(contents)) {
        console.log(`Removing f-types import [${file}]`)
        const seqReplacement = 'import { seq } from "../seq/seq.ctor"'
        const aseqReplacement = 'import { aseq } from "../seq/aseq.ctor"'
        let replacement = ""
        if (contents.match(seqImportRegexp)) {
            replacement = seqReplacement
        }
        if (contents.match(aseqImportRegexp)) {
            replacement += "\n" + aseqReplacement
        }
        contents = contents.replace(fTypesRegexp, replacement)
    }
    for (const [oldName, newName] of Object.entries(syncReplacements)) {
        console.log(`${oldName} -> ${newName} [${file}]`)
        contents = contents.replace(new RegExp(`(?<!type) ${oldName}<`, "g"), ` ${newName}<`)
        await writeFile(file, contents)
    }
    for (const [oldName, newName] of Object.entries(asyncReplacements)) {
        console.log(`${oldName} -> ${newName} [${file}]`)

        contents = contents.replace(new RegExp(`(?<!type) ${oldName}<`, "g"), ` ${newName}<`)
        await writeFile(file, contents)
    }
}

g("src/**/*.ts").then(files => {
    files.forEach(renameInFile)
})
