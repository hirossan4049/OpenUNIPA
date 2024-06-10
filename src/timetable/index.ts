import BaseController from "../base";
import { TimetableResult } from "./result";

export class Timetable extends BaseController {
  async fetch(): Promise<TimetableResult> {
    const tbItem = this.session.menu.getMenu()["時間割・授業"].find(i => i.title === "学生時間割表")
    console.log(tbItem)
    await this.session.menu.click(tbItem!)
    return new TimetableResult()
  }
}
