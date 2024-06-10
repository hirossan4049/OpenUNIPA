import { OpenUNIPA, UnivList } from 'open-unipa'

const username = process.env.UNIPA_USER_ID
const password = process.env.UNIPA_PLAIN_PASSWORD
if (username === undefined || password === undefined) {
  throw new Error("UNIPA_USER_ID or UNIPA_PLAIN_PASSWORD is not defined")
}
console.time("unipa")
const unipa = OpenUNIPA({
  username,
  password,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
})

unipa.DEBUG.stub = true
// unipa.DEBUG.saveHTML = true

await unipa.account.login()

const timetable = await unipa.timetable.fetch()
console.timeEnd("unipa")
// BUNのテーブル💩
// timetable.print()