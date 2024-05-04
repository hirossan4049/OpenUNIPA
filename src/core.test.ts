import { expect, test } from 'vitest'
import { hello } from './core'

test('adds 1 + 2 to equal 3',async () => {
  const res = await hello()
  expect(res).toBe("hello world")
})