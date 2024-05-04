
import { JSDOM } from "jsdom"

export async function hello() {
  const res = await fetch("https://unipa.itp.kindai.ac.jp")
  const text = await res.text()

  const dom = new JSDOM(text)
  console.log(dom.window.title)
  return "hello world"
}