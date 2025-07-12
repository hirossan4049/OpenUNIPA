import { OpenUNIPA } from "../../src/OpenUNIPA"
import { UnivList } from "../../src/types/UnivList"
import { vi } from 'vitest'
import { writeFileSync } from 'fs'
import { readFile } from 'fs/promises'

describe("AttendanceController", () => {
  let unipa: any

  beforeEach(() => {
    unipa = OpenUNIPA({
      username: "test",
      password: "test", 
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    // Set up the file system controller for reading stub files
    unipa.fs = {
      writeFileSync(path: string, text: string) { 
        writeFileSync(path, text, { encoding: 'utf-8' }) 
      },
      async readFileSync(path: string) {
        return readFile(path, { encoding: 'utf-8' })
      }
    }
  })

  test("fetch attendance data", async () => {
    const result = await unipa.attendance.fetch()
    
    expect(result).toBeDefined()
    expect(Array.isArray(result.items)).toBe(true)
    expect(result.items.length).toBeGreaterThan(0)
    
    // Check first attendance record
    const firstRecord = result.items[0]
    expect(firstRecord.date).toBe("2024-04-08")
    expect(firstRecord.subject).toBe("プログラミング基礎１")
    expect(firstRecord.teacher).toBe("濵砂　幸裕")
    expect(firstRecord.status).toBe("出席")
    expect(firstRecord.period).toBe(1)
  })

  test("get subject summaries", async () => {
    const result = await unipa.attendance.fetch()
    const summaries = result.getSubjectSummaries()
    
    expect(Array.isArray(summaries)).toBe(true)
    expect(summaries.length).toBeGreaterThan(0)
    
    // Check summary structure
    const firstSummary = summaries[0]
    expect(firstSummary).toHaveProperty('subject')
    expect(firstSummary).toHaveProperty('teacher')
    expect(firstSummary).toHaveProperty('totalClasses')
    expect(firstSummary).toHaveProperty('attendedClasses')
    expect(firstSummary).toHaveProperty('attendanceRate')
    
    expect(typeof firstSummary.attendanceRate).toBe('number')
    expect(firstSummary.attendanceRate).toBeGreaterThanOrEqual(0)
    expect(firstSummary.attendanceRate).toBeLessThanOrEqual(100)
  })

  test("calculate overall attendance rate", async () => {
    const result = await unipa.attendance.fetch()
    const overallRate = result.getOverallAttendanceRate()
    
    expect(typeof overallRate).toBe('number')
    expect(overallRate).toBeGreaterThanOrEqual(0)
    expect(overallRate).toBeLessThanOrEqual(100)
    
    // Based on HTML stub data: 5 total records, 4 attended (3 出席 + 1 遅刻) = 80%
    expect(overallRate).toBeGreaterThanOrEqual(80)
    expect(overallRate).toBeLessThanOrEqual(100)
  })

  test("get status counts", async () => {
    const result = await unipa.attendance.fetch()
    const statusCounts = result.getStatusCounts()
    
    expect(statusCounts).toHaveProperty('出席')
    expect(statusCounts).toHaveProperty('欠席')
    expect(statusCounts).toHaveProperty('遅刻')
    expect(statusCounts).toHaveProperty('早退')
    expect(statusCounts).toHaveProperty('公欠')
    expect(statusCounts).toHaveProperty('休講')
    
    // Based on HTML stub data: 3 出席, 1 遅刻, 1 欠席
    expect(statusCounts['出席']).toBe(3)
    expect(statusCounts['欠席']).toBe(1)
    expect(statusCounts['遅刻']).toBe(1)
    expect(statusCounts['早退']).toBe(0)
    expect(statusCounts['公欠']).toBe(0)
    expect(statusCounts['休講']).toBe(0)
  })

  test("get subject attendance", async () => {
    const result = await unipa.attendance.fetch()
    const programmingAttendance = result.getSubjectAttendance("プログラミング基礎１")
    
    expect(Array.isArray(programmingAttendance)).toBe(true)
    expect(programmingAttendance.length).toBe(3) // 3 records for this subject in HTML stub
    
    programmingAttendance.forEach(record => {
      expect(record.subject).toBe("プログラミング基礎１")
      expect(record.teacher).toBe("濵砂　幸裕")
    })
  })

  test("get low attendance subjects", async () => {
    const result = await unipa.attendance.fetch()
    const lowAttendanceSubjects = result.getLowAttendanceSubjects(85)
    
    expect(Array.isArray(lowAttendanceSubjects)).toBe(true)
    
    // All subjects in stub data should have attendance rate below 85%
    expect(lowAttendanceSubjects.length).toBeGreaterThan(0)
    
    lowAttendanceSubjects.forEach(summary => {
      expect(summary.attendanceRate).toBeLessThan(85)
    })
  })

  test("get attendance by date range", async () => {
    const result = await unipa.attendance.fetch()
    const aprilAttendance = result.getAttendanceByDateRange("2024-04-01", "2024-04-30")
    
    expect(Array.isArray(aprilAttendance)).toBe(true)
    expect(aprilAttendance.length).toBeGreaterThan(0)
    
    aprilAttendance.forEach(record => {
      const recordDate = new Date(record.date)
      expect(recordDate.getMonth()).toBe(3) // April is month 3 (0-indexed)
    })
  })

  test("print functionality", async () => {
    const result = await unipa.attendance.fetch()
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const consoleTableSpy = vi.spyOn(console, 'table').mockImplementation(() => {})
    
    result.print()
    
    expect(consoleSpy).toHaveBeenCalled()
    expect(consoleTableSpy).toHaveBeenCalled()
    
    consoleSpy.mockRestore()
    consoleTableSpy.mockRestore()
  })
})