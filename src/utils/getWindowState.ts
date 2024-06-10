export type WindowState = "maintenance" | "timeout" | "login" | "success" | "error"

/** 画面の状態を返す */
export function getWindowState(text: string): WindowState {
  if (text.includes("システム停止中")) {
    return "maintenance"
  } else if (text.includes("セッション")) {
    return "timeout"
  }
  return "success"
}
