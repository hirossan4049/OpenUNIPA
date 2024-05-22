import { HTMLElement } from "node-html-parser"
import Request from "./Request"
import { Menu } from "./menu"
import { Timetable } from "./timetable"
import { Univ } from "./types/UnivList"

export type Session = {
  DEBUG: {
    stub: boolean,
    saveHTML: boolean,
  }
  element?: HTMLElement,
  univ?: Univ,
}

export default class OpenUNIPA {
  private session: Session = OpenUNIPA.createSession()

  timetable: Timetable = new Timetable()
  menu = new Menu(this.session)
  private request = new Request(this.session)

  private username: string
  private password: string // Plain

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
    this.session.univ = univ
  }

  private static createSession(): Session {
    return {
      DEBUG: {
        stub: true,
        saveHTML: false,
      }
    }
  }

  async login() {
    if (!this.session.univ!.loginPath) { throw new Error("loginPath is not defined") }
    const { state, element } = await this.request.fetch(this.session.univ!.loginPath, undefined, "GET", "<form", "</form>")

    if (state !== "success") { throw new Error(state) }

    const loginUrl = element.getElementById("form1")?.getAttribute("action")
    const token = element.querySelector("input[name='com.sun.faces.VIEW']")?.getAttribute("value")

    // stubの場合、ログイン用トークン取得URLとホームのURLが同じなため、loginUrlとtokenが取得できないためチェックしない
    if (!this.session.DEBUG.stub && (!loginUrl || !token)) { throw new Error("LoginURL or Token not found. failed") }

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

    const { state: state2, element: element2 } = await this.request.fetch(loginUrl ?? this.session.univ!.loginPath, params, "POST")
    if (state2 !== "success") { throw new Error("Login failed") }

    this.session.element = element2

    const account = element2.getElementById("account")?.querySelector(".middle")?.textContent.split("\u00A0")
    const fullName = account?.[0], latestLoginDate = account?.slice(-1)[0]

    return { fullName, latestLoginDate }
  }
}