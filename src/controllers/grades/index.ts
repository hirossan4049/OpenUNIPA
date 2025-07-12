import BaseController from "../../base";
import { GradeItem, GradesSummary, CreditSummary } from "../../types/GradeItem";
import { GradesResult } from "./result";

export class GradesController extends BaseController {
  async fetch(): Promise<GradesResult> {
    if (this.session.DEBUG.stub) {
      await this.session.request.setStubData('-up-faces-up-xu-Xuk00301A.jspgrades')
    } else {
      const gradesItem = this.session.menu.getMenu()["成績・履修登録"].find(i => i.title === "成績照会")
      await this.session.menu.click(gradesItem!, "grades")
      await this.postGradesSettings()
    }

    return this.parseGradesData()
  }

  private async postGradesSettings() {
    const form = this.session.element?.getElementById("form1")
    if (!form) { throw new Error("form not found") }
    
    const formAction = form.getAttribute("action")
    const token = this.session.request.getToken()
    if (!token) { throw new Error("token not found") }

    const params = new URLSearchParams({
      'form1:viewhidden': '表示',
      'form1:htmlDispPtn': 'gakki', // 年度学期別表示
      'form1:htmlChkHyoka': 'on', // 評価名称
      'form1:htmlChkSoten': 'on', // 素点
      'form1:htmlChkHugoukakuKamoku': 'on', // 不合格科目
      'form1:htmlChkRisyuuCyuuKamoku': 'on', // 履修中科目
      'form1:htmlChkTaniSyutoku': 'on', // 単位修得状況欄
      'form1:htmlChkMediaJugyo': 'on', // メディア授業
      'form1:htmlHidnErr': '',
      'form1:htmlHidnPtn': 'gakki',
      'form1:htmlHidnMediaJugyo': '0',
      'form1:htmlHidnHyoka': '0',
      'form1:htmlHidnSoten': '0',
      'form1:htmlHidnSyusseki': '1',
      'form1:htmlHidnHugoukakuKamoku': '0',
      'form1:htmlHidnRisyuuCyuuKamoku': '0',
      'form1:htmlHidnGpa': '1',
      'form1:htmlHidnTaniSyutoku': '0',
      'com.sun.faces.VIEW': token,
      'form1': 'form1'
    })

    const { state, element } = await this.session.request.fetch(formAction!, params, { method: "POST", name: "grades" })
    if (state !== "success") { throw new Error(`Failed to fetch grades: ${state}`) }
    
    this.session.element = element
  }

  private parseGradesData(): GradesResult {
    if (!this.session.element) { throw new Error("No element to parse") }

    // 学生情報の取得
    const studentInfo = this.parseStudentInfo()
    
    // 成績データの取得
    const grades = this.parseGrades()
    
    // 単位修得状況の取得
    const creditSummary = this.parseCreditSummary()

    const summary: GradesSummary = {
      student: studentInfo,
      grades,
      creditSummary
    }

    return new GradesResult(summary)
  }

  private parseStudentInfo() {
    const departmentElement = this.session.element?.getElementById("form1:propShozokuGakkaRenketsuName")
    const yearElement = this.session.element?.getElementById("form1:htmlGakunen")
    const semesterElement = this.session.element?.getElementById("form1:htmlSemester")

    return {
      department: departmentElement?.textContent?.trim() || '',
      year: yearElement?.textContent?.trim() || '',
      semester: semesterElement?.textContent?.trim()
    }
  }

  private parseGrades(): GradeItem[] {
    const grades: GradeItem[] = []
    let currentYear = 0
    let currentSemester = ''
    let categoryStack: string[] = [] // カテゴリのスタック

    // 年度学期タイトルを取得
    const semesterTitles = this.session.element?.querySelectorAll('.kamokuTitle .subTitleArea .left')
    const gradeTables = this.session.element?.querySelectorAll('.singleTableLine')

    semesterTitles?.forEach((titleElement, tableIndex) => {
      const titleText = titleElement.textContent?.trim() || ''
      const match = titleText.match(/(\d{4})年度(前期|後期)/)
      if (match) {
        currentYear = parseInt(match[1])
        currentSemester = match[2]
      }

      // 対応するテーブルを取得
      const table = gradeTables?.[tableIndex]
      if (!table) return

      const rows = table.querySelectorAll('tr')
      rows.forEach((row, rowIndex) => {
        if (rowIndex === 0) return // ヘッダー行をスキップ

        const kamokuCell = row.querySelector('.kamokuList')
        const classTypeCell = row.querySelector('.tdJugyoSbtList')
        const creditsCell = row.querySelector('.tdTaniList')
        const gradeCell = row.querySelector('.tdHyokaList')
        const scoreCell = row.querySelector('.tdSotenList')
        const teacherCell = row.querySelector('.tdKyoshokuinNameList')

        if (!kamokuCell) return

        // インデントレベルを取得
        const blankCell = kamokuCell.querySelector('.tdBlankList')
        const width = blankCell?.getAttribute('width') || '0'
        const indent = Math.floor(parseInt(width) / 8)

        const subjectText = kamokuCell.querySelector('.tdKamokuList')?.textContent?.trim() || ''
        if (!subjectText) return

        // カテゴリの階層を管理
        if (indent === 0) {
          categoryStack = [subjectText]
        } else if (indent <= categoryStack.length) {
          categoryStack = categoryStack.slice(0, indent)
          categoryStack.push(subjectText)
        } else {
          categoryStack.push(subjectText)
        }

        const creditsText = creditsCell?.textContent?.trim()
        const gradeText = gradeCell?.textContent?.trim()
        const scoreText = scoreCell?.textContent?.trim()

        // 実際の科目データ（単位数や評価があるもの）のみ追加
        if (creditsText || gradeText || scoreText) {
          const grade: GradeItem = {
            year: currentYear,
            semester: currentSemester,
            category: categoryStack[0] || '',
            subcategory: categoryStack[1],
            subsubcategory: categoryStack[2],
            subject: subjectText,
            classType: classTypeCell?.textContent?.trim() || undefined,
            credits: creditsText ? parseFloat(creditsText) : undefined,
            grade: gradeText || undefined,
            score: scoreText && !isNaN(parseInt(scoreText)) ? parseInt(scoreText) : undefined,
            teacher: teacherCell?.textContent?.trim() || undefined,
            indent
          }
          grades.push(grade)
        }
      })
    })

    return grades
  }

  private parseCreditSummary(): CreditSummary[] {
    const summary: CreditSummary[] = []
    
    // 単位修得状況テーブルの解析
    const creditTables = this.session.element?.querySelectorAll('table.singleTableLine[width="100%"]')
    
    creditTables?.forEach(table => {
      const headerRow = table.querySelector('tr:first-child')
      const earnedRow = table.querySelector('tr:nth-last-child(2)')
      
      if (!headerRow || !earnedRow) return
      
      const headers = Array.from(headerRow.querySelectorAll('td')).map(td => td.textContent?.trim() || '')
      const earnedCells = Array.from(earnedRow.querySelectorAll('td'))
      
      headers.forEach((header, index) => {
        if (index === 0 || !header) return
        
        const earnedCell = earnedCells[index]
        if (!earnedCell) return
        
        const cellText = earnedCell.textContent?.trim() || ''
        const match = cellText.match(/(\d+\.\d+)\s*\((\d+\.\d+)\)/)
        
        if (match) {
          const earnedCredits = parseFloat(match[1])
          const mediaCredits = parseFloat(match[2])
          
          summary.push({
            category: header,
            earnedCredits,
            mediaCredits,
            totalCredits: earnedCredits
          })
        }
      })
    })
    
    return summary
  }


}
