import { OpenUNIPA, UnivList } from 'open-unipa'
import BaseController from 'open-unipa/dist/base'

const username = process.env.UNIPA_USER_ID
const password = process.env.UNIPA_PLAIN_PASSWORD
if (username === undefined || password === undefined) {
  throw new Error("UNIPA_USER_ID or UNIPA_PLAIN_PASSWORD is not defined")
}

const unipa = OpenUNIPA({
  username,
  password,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
})

export class FSController extends BaseController {
  readFileSync(path: string) { return Bun.file(path).text() }
  async writeFileSync(path: string, text: string) { await Bun.write(path, text) }
}

unipa.fs = new FSController(unipa)

// unipa.DEBUG.stub = true
unipa.DEBUG.saveHTML = false

await unipa.account.login()

// const timetable = await unipa.timetable.fetch()
console.timeEnd("unipa")

const grades = await unipa.grades.fetch()
console.log(grades)

// timetable.print()