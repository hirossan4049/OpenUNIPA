import { readFileSync, writeFileSync } from "fs";
import parse, { HTMLElement } from "node-html-parser";
import { Session } from "./OpenUNIPA";
import { WindowState, getWindowState } from "./utils/getWindowState";

export default class Request {
  private cookies = ""
  private session: Session

  constructor(session: Session) {
    this.session = session
  }

  async fetch(url: string, params?: URLSearchParams, method: "GET" | "POST" = "GET", fromBody = "<body", toBody = "</body>"): Promise<{ state: WindowState, element: HTMLElement }> {
    let text = ""
    console.info(this.session.DEBUG.stub ? "[STUB ]:" : "[FETCH]:", getCaller(), this.session.univ!.baseUrl + url + (params ? `?${params}` : ""))
    if (this.session.DEBUG.stub) {
      text = readFileSync(`stub/${encodeURI(url).replaceAll("/", "-")}.html`, "utf-8")
    } else {
      const res = await fetch(this.session.univ!.baseUrl + url + (params ? `?${params}` : ""), {
        method,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie": this.cookies,
        },
        // mode: "cors",
        // body: body,
      })
      this.cookies += res.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ")
      text = await res.text()
    }
    text = text //html_beautify(text, { indent_size: 2 })
      .slice(text.indexOf(fromBody), text.lastIndexOf(toBody) + toBody.length)
      .replaceAll(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    // .replaceAll("&nbsp;", "")

    // const element = parse(text.slice(text.indexOf(fromBody), text.lastIndexOf(toBody) + toBody.length))
    // console.log(fromBody, toBody)
    const element = parse(text)
    const state = getWindowState(text)

    if (this.session.DEBUG.saveHTML) { writeFileSync(`stub/${encodeURI(url).replaceAll("/", "-")}.html`, text, "utf-8") }

    return { state, element }
  }

  getToken() {
    return this.session.element?.querySelector("input[name='com.sun.faces.VIEW']")?.getAttribute("value")
  }

  removeCookies() {
    this.cookies = ""
  }

  setStubData(path: string) {
    this.session.element = parse(readFileSync(`stub/${path}.html`, "utf-8"))
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