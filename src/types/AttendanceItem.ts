export type AttendanceStatus = '出席' | '欠席' | '遅刻' | '早退' | '公欠' | '忌引' | '病欠' | '補講' | '休講' | '-'

export type AttendanceItem = {
  date: string
  period: number
  subject: string
  teacher: string
  status: AttendanceStatus
  note?: string
}

export type AttendanceSummary = {
  subject: string
  teacher: string
  totalClasses: number
  attendedClasses: number
  absentClasses: number
  lateClasses: number
  earlyLeaveClasses: number
  excusedAbsences: number
  attendanceRate: number
}