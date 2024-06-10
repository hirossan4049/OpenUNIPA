import { expect, test } from 'vitest'
import OpenUNIPA from '../../dist/OpenUNIPA'
import { UnivList } from '../../dist/types/UnivList'

test('timetable', async () => {
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

  unipa.DEBUG.stub = true

  await unipa.account.login()
  const timetable = await unipa.timetable.fetch()

  expect(timetable.items.length).toBe(11)
  expect(timetable.items[0].subject).toBe("基礎線形代数学１")
  expect(timetable.items[8].teacher).toBe("大谷 雅之")
  expect(timetable.items[3].class).toBeUndefined()
})