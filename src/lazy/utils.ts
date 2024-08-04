
export function getBoolEnvVar(name: string): boolean {
    if (!(name in process.env)) {
        return false
    }
    if (process.env.name === "false") {
        return false
    }
    return true
}


