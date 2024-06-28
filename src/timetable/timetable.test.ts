import { expect, test } from 'vitest';
import { OpenUNIPA, UnivList } from "../";

test('timetable', async () => {
  const unipa = OpenUNIPA({
    username: "username",
    password: "password",
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  })

  unipa.DEBUG.stub = true

  await unipa.account.login()
  const timetable = await unipa.timetable.fetch()

  timetable.print()

  expect(timetable.items.length).toBe(11)
  expect(timetable.items[0].subject).toBe("基礎線形代数学１")
  expect(timetable.items[8].teacher).toBe("大谷 雅之")
  expect(timetable.items[3].class).toBeUndefined()
})