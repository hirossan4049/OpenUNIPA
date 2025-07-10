import { writeFileSync } from 'fs';
import { readFile } from 'fs/promises';
import { expect, test } from 'vitest';
import { OpenUNIPA, UnivList } from "../../";

test('timetable', async () => {
  const username = process.env.UNIPA_USER_ID || 'username'
  const password = process.env.UNIPA_PLAIN_PASSWORD || 'password'

  const unipa = OpenUNIPA({
    username,
    password,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  })

  unipa.fs = {
    writeFileSync(path, text) { writeFileSync(path, text, { encoding: 'utf-8' }) },
    async readFileSync(path) {
      return readFile(path, { encoding: 'utf-8' })
    }
  }
  unipa.DEBUG.stub = true
  // unipa.DEBUG.saveHTML = true

  await unipa.account.login()
  const timetable = await unipa.timetable.fetch()

  expect(timetable.items.length).toBe(11)
  expect(timetable.items[0].subject).toBe("基礎線形代数学１")
  expect(timetable.items[8].teacher).toBe("大谷 雅之")
  expect(timetable.items[3].class).toBeUndefined()
})