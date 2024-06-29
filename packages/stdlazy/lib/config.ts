import { getBoolEnvVar } from "./utils"

/** Don't clear the lazy initialicer after it's been executed. This is useful for debugging purposes. */
// eslint-disable-next-line prefer-const
export let LAZY_NOCLEAR = getBoolEnvVar("LAZY_NOCLEAR")
