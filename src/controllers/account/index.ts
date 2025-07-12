import BaseController from "../../base";

export default class AccountController extends BaseController {
  async login() {
    if (!this.session.univ!.loginPath) { throw new Error("loginPath is not defined") }
    const { state, element } = await this.session.request!.fetch(this.session.univ!.loginPath, undefined, { method: "GET", fromBody: "<form", toBody: "</form>" })

    if (state !== "success" && state !== "timeout") { throw new Error(state) }

    const loginUrl = element.getElementById("form1")?.getAttribute("action")
    const token = element.querySelector("input[name='com.sun.faces.VIEW']")?.getAttribute("value")

    // stubの場合、ログイン用トークン取得URLとホームのURLが同じなため、loginUrlとtokenが取得できないためチェックしない
    if (!this.session.DEBUG.stub && (!loginUrl || !token)) { throw new Error("LoginURL or Token not found. failed") }

    const params = new URLSearchParams({
      'form1:htmlUserId': this.session.username,
      'form1:htmlPassword': this.session.password,
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

    const { state: state2, element: element2 } = await this.session.request!.fetch(loginUrl ?? this.session.univ!.loginPath, params, { method: "POST" })
    if (state2 !== "success" && state !== "timeout") { throw new Error("Login failed") }

    this.session.element = element2

    const account = element2.getElementById("account")?.querySelector(".middle")?.textContent.split("\u00A0")
    const fullName = account?.[0], latestLoginDate = account?.slice(-1)[0].replaceAll(" ", "").replace("\r\n", " ")

    // const dummy = await this.session.request!.fetch("/up/system/inc/dummy.html")
    // console.log({ dummy })

    return { fullName, latestLoginDate }
  }
}