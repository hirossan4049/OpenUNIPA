import { TimetableResult } from "./result";

export class Timetable {
  async fetch(): Promise<TimetableResult> {
    return new TimetableResult()
  }
}
