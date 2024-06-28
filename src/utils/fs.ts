export function readFileSync(path: string): string {
  const readFileSync = require("fs").readFileSync
  return readFileSync(path, "utf-8")
}

export function writeFileSync(path: string, text: string) {
  const writeFileSync = require("fs").writeFileSync
  return writeFileSync(path, text, "utf-8")
}