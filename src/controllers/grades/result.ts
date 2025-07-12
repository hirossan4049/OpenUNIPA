import { GradeItem, GradesSummary } from "../../types/GradeItem"

export class GradesResult {
  constructor(public data: GradesSummary) {}

  get grades(): GradeItem[] {
    return this.data.grades
  }

  get student() {
    return this.data.student
  }

  get creditSummary() {
    return this.data.creditSummary
  }

  // 年度・学期別でフィルタ
  getGradesByPeriod(year: number, semester: string): GradeItem[] {
    return this.data.grades.filter(item => 
      item.year === year && item.semester === semester
    )
  }

  // 科目分類でフィルタ
  getGradesByCategory(category: string): GradeItem[] {
    return this.data.grades.filter(item => item.category === category)
  }

  // 単位を取得した科目のみ
  getPassedGrades(): GradeItem[] {
    return this.data.grades.filter(item => 
      item.grade && !['不可', '不受'].includes(item.grade) && item.credits
    )
  }

  // 不合格科目
  getFailedGrades(): GradeItem[] {
    return this.data.grades.filter(item => 
      item.grade && ['不可', '不受'].includes(item.grade)
    )
  }

  // GPAを計算（秀:4, 優:3, 良:2, 可:1, 不可/不受:0）
  calculateGPA(): number {
    const gradePoints: { [key: string]: number } = {
      '秀': 4, '優': 3, '良': 2, '可': 1, '不可': 0, '不受': 0
    }
    
    const validGrades = this.data.grades.filter(item => 
      item.grade && item.credits && gradePoints[item.grade] !== undefined
    )
    
    if (validGrades.length === 0) return 0
    
    const totalPoints = validGrades.reduce((sum, item) => 
      sum + (gradePoints[item.grade!] * item.credits!), 0
    )
    const totalCredits = validGrades.reduce((sum, item) => sum + item.credits!, 0)
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0
  }

  // 取得単位数の合計
  getTotalEarnedCredits(): number {
    return this.getPassedGrades().reduce((sum, item) => sum + (item.credits || 0), 0)
  }

  print() {
    console.log(`学生情報: ${this.data.student.department} ${this.data.student.year}`)
    console.log(`取得単位数: ${this.getTotalEarnedCredits()}`)
    console.log(`GPA: ${this.calculateGPA().toFixed(2)}`)
    console.log('\n成績一覧:')
    this.data.grades.forEach(item => {
      const indent = '  '.repeat(item.indent)
      console.log(`${indent}${item.subject} ${item.grade || ''} ${item.credits || ''} ${item.score || ''}`)
    })
  }
}