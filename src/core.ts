
import { parse } from 'node-html-parser'
import { getWindowState } from './utils/getWindowState'


export async function hello() {
  const BASE_URL = "https://unipa.itp.kindai.ac.jp"

  const url = `${BASE_URL}/up/faces/login/Com00501A.jsp`
  const res = await fetch(url)
  console.log(res)

  const text = await res.text()
  // writeFileSync("login.html", text, "utf-8")
  const windowState = getWindowState(text)
  if (windowState !== "success") { return }

  const dom = parse(text.slice(text.indexOf("<form"), text.lastIndexOf("</form>") + 7))

  const loginUrl = dom.getElementById("form1")?.getAttribute("action")
  const token = dom.querySelector("input[name='com.sun.faces.VIEW']")?.getAttribute("value")
  console.log(loginUrl, token)
  return "hello world"
}
