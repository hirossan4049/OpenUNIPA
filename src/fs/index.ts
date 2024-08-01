export interface FSController {
  readFileSync(path: string): Promise<string>
  writeFileSync(path: string, text: string): void
}
// export class FSController extends BaseController {
//   async readFileSync(path: string): Promise<string> {
//     const fs = await import("fs");
//     require.context("fs", true)
//     return await fs.promises.readFile(path, "utf-8");
//   }

//   async writeFileSync(path: string, text: string) {
//     const fs = await import("fs")
//     console.log("FSFSFSREADFIE", fs.writeFileSync)
//     fs.writeFileSync(path, text)
//   }
// }
