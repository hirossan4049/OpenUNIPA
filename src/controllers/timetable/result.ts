import { TimetableItem } from "../../types/TimeTableItem";

export class TimetableResult {
  items: TimetableItem[];
  constructor(items: TimetableItem[]) {
    this.items = items;
  }

  print() {
    console.table(this.items)
  }

  json() {
    throw new Error("Method not implemented.");
  }

  csv() {
    throw new Error("Method not implemented.");
  }
}