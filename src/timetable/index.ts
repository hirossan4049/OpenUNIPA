import BaseController from "../base";
import { TimetableItem } from "../types/TimeTableItem";
import { TimetableResult } from "./result";


// とりあえず前期のみ対応
export class TimetableController extends BaseController {
  async fetch(): Promise<TimetableResult> {
    if (this.session.DEBUG.stub) {
      this.session.request.setStubData('-up-faces-up-po-Poa00601A.jsp')
    } else {
      const tbItem = this.session.menu.getMenu()["時間割・授業"].find(i => i.title === "学生時間割表")
      await this.session.menu.click(tbItem!)
    }

    let items: TimetableItem[] = []

    for (let w = 0; w < 6; w++) {
      for (let p = 0; p < 8; p++) {
        if (p === 0) { continue }
        const element = this.session.element?.getElementById(`form1:calendarList:${w}:rowVal0${p}`)
        const syllabusRawText = element?.querySelector("a")?.getAttribute("href")
        const syllabus = this.convertSyllabus(syllabusRawText || "")
        //[ 空, 教科名, クラス, 教員名, 教室, 単位数 ]
        const itemRawText = element?.textContent.replace("\n", "").split(" ")
        if (!itemRawText?.[1]) continue
        const item: TimetableItem = {
          week: w,
          period: p - 1,
          subject: this.deleteGOMI(itemRawText?.[1] || ""),
          class: this.deleteGOMI(itemRawText?.[2] || "").replace(" ", "") || undefined,
          teacher: this.deleteGOMI(itemRawText?.[3] || "") || undefined,
          room: this.deleteGOMI(itemRawText?.[4] || "") || undefined,
          syllabus,
        }
        items.push(item)
      }
    }
    return new TimetableResult(items)
  }

  private convertSyllabus(raw: string) {
    const sp = raw.split("'")
    return { year: sp?.[1], id: sp?.[3] }
  }

  private deleteGOMI(text: string) {
    return text.replaceAll("\n", "")
      .replaceAll("　", " ")
      .replace("（", "").replace("）", "")
      .replace("【", "").replace("】", "")
  }
}
