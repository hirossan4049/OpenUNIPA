export type WindowState = "maintenance" | "login" | "success" | "error"

/** 画面の状態を返す */
export function getWindowState(text: string): WindowState {
  if (text.includes("システム停止中")) {
    return "maintenance"
  }
  return "success"
}
