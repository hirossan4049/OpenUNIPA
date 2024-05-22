import OpenUNIPA from './OpenUNIPA';
import { UnivList } from './types/UnivList';

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

  // unipa.DEBUG.stub = true
  // unipa.DEBUG.saveHTML = true

  const res = await unipa.login()
  console.log(res)
  
  console.log(unipa.menu.getMenu()["時間割・授業"])

  const timetable = await unipa.timetable.fetch()
  timetable.csv()
  timetable.json()
})()