import { OpenUNIPA } from "../../src/OpenUNIPA"
import { UnivList } from "../../src/types/UnivList"
import { vi } from 'vitest'
import { writeFileSync } from 'fs'
import { readFile } from 'fs/promises'

describe("GradesController", () => {
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

  test("fetch grades data", async () => {
    const result = await unipa.grades.fetch()
    
    expect(result).toBeDefined()
    expect(result.student).toBeDefined()
    expect(result.student.department).toBe("大学 学部生 情報学部 情報学科 実世界コンピ")
    expect(result.student.year).toBe("2年")
    
    expect(result.grades).toBeDefined()
    expect(Array.isArray(result.grades)).toBe(true)
    expect(result.grades.length).toBeGreaterThan(0)
    
    // Check if we have the expected grade data based on real data
    const kinDaiZemi = result.grades.find(grade => grade.subject === "近大ゼミ")
    expect(kinDaiZemi).toBeDefined()
    expect(kinDaiZemi?.year).toBe(2024)
    expect(kinDaiZemi?.semester).toBe("前期")
    expect(kinDaiZemi?.category).toBe("共通教養科目")
    expect(kinDaiZemi?.subcategory).toBe("必修科目")
    expect(kinDaiZemi?.credits).toBe(2.0)
    expect(kinDaiZemi?.grade).toBe("秀")
    expect(kinDaiZemi?.score).toBe(100)
    expect(kinDaiZemi?.teacher).toBe("石水　隆")

    // Check for additional real courses
    const programmingBasics = result.grades.find(grade => grade.subject === "プログラミング基礎１")
    expect(programmingBasics).toBeDefined()
    expect(programmingBasics?.grade).toBe("秀")
    expect(programmingBasics?.score).toBe(96)
    expect(programmingBasics?.teacher).toBe("濵砂　幸裕")
  })

  test("calculate GPA", async () => {
    const result = await unipa.grades.fetch()
    const gpa = result.calculateGPA()
    
    expect(typeof gpa).toBe("number")
    expect(gpa).toBeGreaterThan(0)
    expect(gpa).toBeLessThanOrEqual(4)
    // Based on real data, GPA should be around 3.0-3.5 range
    expect(gpa).toBeGreaterThan(2.5)
  })

  test("get passed grades", async () => {
    const result = await unipa.grades.fetch()
    const passedGrades = result.getPassedGrades()
    
    expect(Array.isArray(passedGrades)).toBe(true)
    passedGrades.forEach(grade => {
      expect(grade.grade).not.toBe("不可")
      expect(grade.grade).not.toBe("不受")
      expect(grade.credits).toBeGreaterThan(0)
    })
  })

  test("get grades by category", async () => {
    const result = await unipa.grades.fetch()
    const commonGrades = result.getGradesByCategory("共通教養科目")
    
    expect(Array.isArray(commonGrades)).toBe(true)
    commonGrades.forEach(grade => {
      expect(grade.category).toBe("共通教養科目")
    })
  })

  test("get total earned credits", async () => {
    const result = await unipa.grades.fetch()
    const totalCredits = result.getTotalEarnedCredits()
    
    expect(typeof totalCredits).toBe("number")
    expect(totalCredits).toBeGreaterThan(0)
    // Based on real data, total credits should be around 31
    expect(totalCredits).toBeGreaterThan(20)
  })

  test("print functionality", async () => {
    const result = await unipa.grades.fetch()
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    result.print()
    
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})