import OpenUNIPA from './openunipa';
import { UnivList } from './types/UnivList';

export { hello } from './core';

(async () => {
  const username = process.env.UNIPA_USER_ID
  const password = process.env.UNIPA_PLAIN_PASSWORD
  if (username === undefined || password === undefined) {
    throw new Error("UNIPA_USER_ID or UNIPA_PLAIN_PASSWORD is not defined")
  }

  const unipa = new OpenUNIPA({
    username,
    password,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  })

  unipa.DEBUG.stub = true
  unipa.DEBUG.saveHTML = true

  await unipa.login()

  const timetable = await unipa.timetable.fetch()
  timetable.csv()
  timetable.json()
})()