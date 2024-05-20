import { hello } from './core';
import OpenUNIPA from './openunipa';
import { UnivList } from './types/UnivList';

export { hello } from './core';

(async () => {
  console.time("hello")
  await hello()
  console.timeEnd("hello")

  console.log(process.env.UNIPA_USER_ID)

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
  await unipa.login()

  const timetable = await unipa.timetable.fetch()
  timetable.csv()
  timetable.json()


})()