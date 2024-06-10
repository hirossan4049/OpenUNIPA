export type TimetableItem = {
  week: number,
  period: number,
  subject: string,
  class?: string,
  teacher?: string,
  room?: string,
  syllabus: {
    year: string,
    id: string,
  }
}