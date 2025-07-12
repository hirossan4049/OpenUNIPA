import { AttendanceItem, AttendanceSummary, AttendanceStatus } from "../../types/AttendanceItem"

export class AttendanceResult {
  constructor(public items: AttendanceItem[]) {}

  /**
   * 科目ごとの出席状況サマリーを取得
   */
  getSubjectSummaries(): AttendanceSummary[] {
    const subjectMap = new Map<string, AttendanceItem[]>()
    
    // 科目ごとにグループ化
    this.items.forEach(item => {
      const key = `${item.subject}-${item.teacher}`
      if (!subjectMap.has(key)) {
        subjectMap.set(key, [])
      }
      subjectMap.get(key)!.push(item)
    })

    return Array.from(subjectMap.entries()).map(([key, items]) => {
      const [subject, teacher] = key.split('-')
      const totalClasses = items.length
      const attendedClasses = items.filter(item => item.status === '出席').length
      const absentClasses = items.filter(item => item.status === '欠席').length
      const lateClasses = items.filter(item => item.status === '遅刻').length
      const earlyLeaveClasses = items.filter(item => item.status === '早退').length
      const excusedAbsences = items.filter(item => 
        ['公欠', '忌引', '病欠'].includes(item.status)
      ).length
      
      const attendanceRate = totalClasses > 0 
        ? Math.round(((attendedClasses + lateClasses + earlyLeaveClasses) / totalClasses) * 100 * 100) / 100
        : 0

      return {
        subject,
        teacher,
        totalClasses,
        attendedClasses,
        absentClasses,
        lateClasses,
        earlyLeaveClasses,
        excusedAbsences,
        attendanceRate
      }
    })
  }

  /**
   * 全体の出席率を計算
   */
  getOverallAttendanceRate(): number {
    if (this.items.length === 0) return 0
    
    const attendedCount = this.items.filter(item => 
      ['出席', '遅刻', '早退'].includes(item.status)
    ).length
    
    return Math.round((attendedCount / this.items.length) * 100 * 100) / 100
  }

  /**
   * 出席状況別の件数を取得
   */
  getStatusCounts(): Record<AttendanceStatus, number> {
    const counts = {
      '出席': 0,
      '欠席': 0,
      '遅刻': 0,
      '早退': 0,
      '公欠': 0,
      '忌引': 0,
      '病欠': 0,
      '補講': 0,
      '休講': 0,
      '-': 0
    }

    this.items.forEach(item => {
      counts[item.status]++
    })

    return counts
  }

  /**
   * 特定の科目の出席状況を取得
   */
  getSubjectAttendance(subjectName: string): AttendanceItem[] {
    return this.items.filter(item => item.subject === subjectName)
  }

  /**
   * 特定の期間の出席状況を取得
   */
  getAttendanceByDateRange(startDate: string, endDate: string): AttendanceItem[] {
    return this.items.filter(item => {
      const itemDate = new Date(item.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return itemDate >= start && itemDate <= end
    })
  }

  /**
   * 出席率が指定値以下の科目を取得
   */
  getLowAttendanceSubjects(threshold: number = 80): AttendanceSummary[] {
    return this.getSubjectSummaries().filter(summary => 
      summary.attendanceRate < threshold
    )
  }

  /**
   * 出席状況をコンソールに表示
   */
  print(): void {
    console.log('\n=== 出席状況一覧 ===')
    console.table(this.items)
    
    console.log('\n=== 科目別出席状況 ===')
    console.table(this.getSubjectSummaries())
    
    console.log('\n=== 出席状況統計 ===')
    const stats = {
      '総記録数': this.items.length,
      '全体出席率': `${this.getOverallAttendanceRate()}%`,
      ...this.getStatusCounts()
    }
    console.table(stats)

    const lowAttendance = this.getLowAttendanceSubjects()
    if (lowAttendance.length > 0) {
      console.log('\n⚠️ 出席率80%未満の科目:')
      console.table(lowAttendance)
    }
  }
}