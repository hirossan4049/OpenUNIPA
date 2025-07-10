import parse, { HTMLElement } from "node-html-parser";
import { Session } from "./OpenUNIPA";
import { WindowState, getWindowState } from "./utils/getWindowState";

const getSetCookie = function (headers: Headers) {
  const set_cookies = []
  for (const [name, value] of headers) {
    if (name === "set-cookie") {
      set_cookies.push(value)
    }
  }
  return set_cookies
}

type Props = {
  method?: "GET" | "POST",
  fromBody?: string,
  toBody?: string,
  name?: string,
}

export default class Request {
  private cookies = ""
  private session: Session

  constructor(session: Session) {
    this.session = session
  }

  async fetch(url: string, params: URLSearchParams | undefined = undefined, { method = "GET", fromBody = "<body", toBody = "</body>", name = "" }: Props): Promise<{ state: WindowState, element: HTMLElement }> {
    let text = ""
    console.info(this.session.DEBUG.stub ? "[STUB]:" : "[FETCH]:", getCaller(), this.session.univ!.baseUrl + url + "?" + params)
    if (this.session.DEBUG.stub) {
      text = await this.session.fs!.readFileSync(`stub/${encodeURI(url).replaceAll("/", "-")}${name}.html`)
    } else {
      const res = await fetch(this.session.univ!.baseUrl + url + (params ? `?${params}` : ""), {
        method,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": this.cookies,
        },
        // mode: "cors",
        body: params?.toString(),
      })
      this.cookies += getSetCookie(res.headers).map((cookie) => cookie.split(";")[0]).join("; ")
      text = await res.text()
    }
    if (this.session.DEBUG.saveHTML) { this.session.fs?.writeFileSync(`stub/${encodeURI(url).replaceAll("/", "-")}${name}.html`, text) }
    
    const existLowerBody = text.indexOf(fromBody) !== -1
    text = text //html_beautify(text, { indent_size: 2 })
    .slice(existLowerBody ? text.indexOf(fromBody) : text.indexOf(fromBody.toUpperCase()),
    (existLowerBody ? text.lastIndexOf(toBody) : text.lastIndexOf(toBody.toUpperCase())) + toBody.length)
    .replaceAll(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    // .replaceAll("&nbsp;", "")
    
    // const element = parse(text.slice(text.indexOf(fromBody), text.lastIndexOf(toBody) + toBody.length))
    // console.log(fromBody, toBody)
    const element = parse(text)
    const state = getWindowState(text)


    return { state, element }
  }

  getToken() {
    return this.session.element?.querySelector("input[name='com.sun.faces.VIEW']")?.getAttribute("value")
  }

  removeCookies() {
    this.cookies = ""
  }

  async setStubData(path: string) {
    const file = await this.session.fs?.readFileSync(`stub/${path}.html`) || ""
    this.session.element = parse(file)
  }
}

function getCaller() {
  const error = new Error();
  const stack = error.stack || '';
  const stackLines = stack.split('\n');
  const callerIndex = stackLines.findIndex(line => line.includes('getCaller')) + 2;
  if (stackLines[callerIndex]) {
    return stackLines[callerIndex].trim().split("/").reverse()[0].replace(")", "");
  }
  return 'Unknown';
}