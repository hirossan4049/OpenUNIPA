import { HTMLElement } from "node-html-parser"
import Request from "./Request"
import AccountController from "./controllers/account"
import { FSController } from "./controllers/fs"
import { MenuController } from "./controllers/menu"
import { GradesController } from "./controllers/grades"
import { TimetableController } from "./controllers/timetable"
import { AttendanceController } from "./controllers/attendance"
import { NoticeController } from "./controllers/notice"
import { Univ } from "./types/UnivList"

type DebugOption = {
  stub: boolean,
  saveHTML: boolean,
}

export type Session = {
  DEBUG: DebugOption
  element?: HTMLElement,
  username: string,
  password: string,
  univ: Univ,

  fs?: FSController,
  request: Request,

  account: AccountController,
  menu: MenuController,
  timetable: TimetableController,
  grades: GradesController,
  attendance: AttendanceController,
  notice: NoticeController,
}

export function OpenUNIPA({ username, password, univ, debug }: { username: string, password: string, univ: Univ, debug?: DebugOption }) {
  const particalSession: Partial<Session> = {}

  particalSession.username = username
  particalSession.password = password
  particalSession.univ = univ

  particalSession.DEBUG = debug || {
    stub: false,
    saveHTML: false,
  }

  particalSession.request = new Request(particalSession as Session)

  particalSession.account = new AccountController(particalSession as Session)
  particalSession.menu = new MenuController(particalSession as Session)
  particalSession.timetable = new TimetableController(particalSession as Session)
  particalSession.grades = new GradesController(particalSession as Session)
  particalSession.attendance = new AttendanceController(particalSession as Session)
  particalSession.notice = new NoticeController(particalSession as Session)

  return particalSession as Session
}