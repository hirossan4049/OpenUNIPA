import { readFileSync, writeFileSync } from "fs"
import parse, { HTMLElement } from "node-html-parser"
import { Timetable } from "./timetable"
import { Univ } from "./types/UnivList"
import { WindowState, getWindowState } from "./utils/getWindowState"

export default class OpenUNIPA {
  DEBUG = {
    timeLog: false,
    stub: false,
    saveHTML: false,
  }
  timetable: Timetable = new Timetable()

  private username: string
  private password: string // Plain
  private univ: Univ

  private cookies = ""

  /** @example
   * const unipa = new OpenUNIPA({
   *  username: "2412110000a",
   *  password: "password",
   *  univ: UnivList.KINDAI.HIGASHI_OSAKA,
   * })
   */
  constructor({ username, password, univ }: { username: string, password: string, univ: Univ }) {
    this.username = username
    this.password = password
    this.univ = univ
  }

  async login() {
    if (!this.univ.loginPath) { throw new Error("loginPath is not defined") }
    const { state, element } = await this._fetch(this.univ.loginPath, undefined, "GET", "<form", "</form>")

    if (state !== "success") { throw new Error(state) }

    const loginUrl = element.getElementById("form1")?.getAttribute("action")
    const token = element.querySelector("input[name='com.sun.faces.VIEW']")?.getAttribute("value")

    // stubの場合、ログイン用トークン取得URLとホームのURLが同じなため、loginUrlとtokenが取得できないためチェックしない
    if (!this.DEBUG.stub && (!loginUrl || !token)) { throw new Error("LoginURL or Token not found. failed") }

    const params = new URLSearchParams({
      'form1:htmlUserId': this.username,
      'form1:htmlPassword': this.password,
      'form1:login.x': '50',
      'form1:login.y': '10',
      "form1:htmlNextFuncId": "",
      "form1:htmlHiddenSsoFlg": "",
      "form1:htmlHiddenUserId": "",
      "form1:htmlHiddenPassword": "",
      "form1:htmlHiddenUnipaSso": "",
      "com.sun.faces.VIEW": token ?? "",
      "form1": "form1",
    })

    const { state: state2, element: element2 } = await this._fetch(loginUrl ?? this.univ.loginPath, params, "POST")
    if (state2 !== "success") { throw new Error("Login failed") }

    const account = element2.getElementById("account")?.querySelector(".middle")?.textContent.split("\u00A0")
    const fullName = account?.[0], latestLoginDate = account?.slice(-1)[0]
    console.log(fullName, latestLoginDate)

    this.getMenu(element2)

    return { fullName, latestLoginDate }
  }

  private getMenu(element: HTMLElement) {
    const menus = element.getElementById("menubox")?.querySelectorAll("div")
    menus?.forEach((menu1) => {
    const title = menu1?.querySelector(".menuhead")?.textContent
    // menuheadがないやつはめんどくさいのでスキップ
    if (!title) { return }
    console.log(title)

    menu1?.querySelector(".submenu")?.querySelectorAll("a").forEach((a) => {
      console.log(a.textContent, a.attrs["onclick"])

      const submenuId = a.attrs["onmouseover"]
      if (submenuId) {
        console.log(menu1.querySelectorAll("div").find(d => d.getAttribute("onmouseover") === submenuId)?.textContent)
      }
      // (a.attrs["onmouseover"], a.textContent)
      console.log("---------")
    })
    console.log("================")
  })
  }

  private async _fetch(url: string, params?: URLSearchParams, method: "GET" | "POST" = "GET", fromBody = "<body", toBody = "</body>"): Promise<{ state: WindowState, element: HTMLElement }> {
    let text = ""
    console.info("[FETCH]:", getCaller())
    if (this.DEBUG.stub) {
      text = readFileSync(`stub/${encodeURI(url).replaceAll("/", "-")}.html`, "utf-8")
    } else {
      const res = await fetch(this.univ.baseUrl + url + (params ? `?${params}` : ""), {
        method,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": this.cookies,
        }
      })
      this.cookies = res.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ")
      text = await res.text()
    }
    const state = getWindowState(text)

    const element = parse(text.slice(text.indexOf(fromBody), text.lastIndexOf(toBody) + toBody.length))

    if (this.DEBUG.saveHTML) { writeFileSync(`stub/${encodeURI(url).replaceAll("/", "-")}.html`, text, "utf-8") }

    return { state, element }
  }
}

function getCaller() {
  const error = new Error();
  const stack = error.stack || '';
  const stackLines = stack.split('\n');
  const callerIndex = stackLines.findIndex(line => line.includes('getCaller')) + 2;
  if (stackLines[callerIndex]) {
    return stackLines[callerIndex].trim();
  }
  return 'Unknown';
}