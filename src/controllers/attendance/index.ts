import BaseController from "../../base"
import { AttendanceResult } from "./result"
import { AttendanceItem, AttendanceStatus } from "../../types/AttendanceItem"

export class AttendanceController extends BaseController {
  /**
   * 出席状況データを取得
   */
  async fetch(): Promise<AttendanceResult> {
    if (this.session.DEBUG.stub) {
      return this.fetchStub()
    }

    // メニューから出席状況確認ページに移動
    const menuItems = await this.session.menu.getStudentMenu()
    console.log('Student menu items:', menuItems.map(item => item.title))
    
    const attendanceMenuItem = menuItems.find(item => 
      item.title.includes('学生出欠状況確認') ||
      item.title.includes('出欠状況確認') ||
      item.title.includes('出席状況確認') ||
      (item.title.includes('出席') && !item.title.includes('注意事項')) ||
      (item.title.includes('出欠') && !item.title.includes('注意事項'))
    )

    if (!attendanceMenuItem) {
      console.error('Available menu items:', menuItems.map(item => item.title))
      throw new Error('出席状況確認メニューが見つかりません')
    }

    console.log('Found attendance menu item:', attendanceMenuItem)

    // メニューアイテムをクリックして出席状況ページにアクセス
    const menuItem = { title: attendanceMenuItem.title, link: attendanceMenuItem.url }
    await this.session.menu.click(menuItem, 'attendance')
    
    const element = this.session.element
    if (!element) {
      throw new Error('出席状況ページの読み込みに失敗しました')
    }

    return this.parseAttendanceData(element)
  }

  /**
   * スタブモードでのデータ取得
   */
  private async fetchStub(): Promise<AttendanceResult> {
    try {
      // スタブHTMLファイルが存在する場合はそれをパース
      await this.session.request.setStubData('-up-faces-up-po-Poa00701A.jsp')
      if (this.session.element) {
        return this.parseAttendanceData(this.session.element)
      }
    } catch (error) {
      // スタブファイルが存在しない場合は固定データを使用
      console.warn('Stub file not found, using hardcoded data')
    }
    
    // スタブデータを直接作成（HTMLファイルに依存しない）
    const attendanceItems: AttendanceItem[] = [
      {
        date: '2024-04-08',
        period: 1,
        subject: 'プログラミング基礎１',
        teacher: '濵砂　幸裕',
        status: '出席'
      },
      {
        date: '2024-04-08',
        period: 2,
        subject: '基礎線形代数学１',
        teacher: '大谷 雅之',
        status: '出席'
      },
      {
        date: '2024-04-15',
        period: 1,
        subject: 'プログラミング基礎１',
        teacher: '濵砂　幸裕',
        status: '遅刻'
      },
      {
        date: '2024-04-15',
        period: 2,
        subject: '基礎線形代数学１',
        teacher: '大谷 雅之',
        status: '出席'
      },
      {
        date: '2024-04-22',
        period: 1,
        subject: 'プログラミング基礎１',
        teacher: '濵砂　幸裕',
        status: '欠席'
      },
      {
        date: '2024-04-22',
        period: 2,
        subject: '基礎線形代数学１',
        teacher: '大谷 雅之',
        status: '出席'
      },
      {
        date: '2024-04-29',
        period: 1,
        subject: 'プログラミング基礎１',
        teacher: '濵砂　幸裕',
        status: '公欠'
      },
      {
        date: '2024-04-29',
        period: 2,
        subject: '基礎線形代数学１',
        teacher: '大谷 雅之',
        status: '休講'
      },
      {
        date: '2024-05-06',
        period: 1,
        subject: 'プログラミング基礎１',
        teacher: '濵砂　幸裕',
        status: '出席'
      },
      {
        date: '2024-05-06',
        period: 2,
        subject: '基礎線形代数学１',
        teacher: '大谷 雅之',
        status: '早退'
      }
    ]

    return new AttendanceResult(attendanceItems)
  }

  /**
   * HTMLから出席データをパース
   */
  private parseAttendanceData(element: any): AttendanceResult {
    const attendanceItems: AttendanceItem[] = []

    try {
      // 全てのテーブルを調査
      const allTables = element.querySelectorAll('table')
      console.log(`Found ${allTables.length} tables on the page`)
      
      // 各テーブルの最初の行をチェックして出席関連のテーブルを特定
      let attendanceTable = null
      for (let i = 0; i < allTables.length; i++) {
        const table = allTables[i]
        const firstRow = table.querySelector('tr')
        if (firstRow) {
          const headerText = this.extractText(firstRow).toLowerCase()
          if (headerText.includes('日付') || 
              headerText.includes('科目') || 
              headerText.includes('出席') ||
              headerText.includes('授業') ||
              headerText.includes('欠席') ||
              headerText.includes('date') ||
              headerText.includes('subject') ||
              headerText.includes('attend')) {
            console.log(`Table ${i} looks like attendance data:`, headerText)
            attendanceTable = table
            break
          }
        }
      }
      
      // フォールバック: 最大のテーブルを使用
      if (!attendanceTable && allTables.length > 0) {
        let maxRows = 0
        for (let i = 0; i < allTables.length; i++) {
          const rowCount = allTables[i].querySelectorAll('tr').length
          if (rowCount > maxRows) {
            maxRows = rowCount
            attendanceTable = allTables[i]
          }
        }
        console.log(`Using largest table with ${maxRows} rows`)
      }
      
      if (!attendanceTable) {
        console.warn('出席状況テーブルが見つかりません')
        return new AttendanceResult([])
      }
      
      console.log('Using table for attendance data')

      const rows = attendanceTable.querySelectorAll('tr')
      
      for (let i = 1; i < rows.length; i++) { // ヘッダー行をスキップ
        const cells = rows[i].querySelectorAll('td, th')
        
        if (cells.length >= 5) {
          const date = this.extractText(cells[0])
          const period = parseInt(this.extractText(cells[1]) || '0')
          const subject = this.extractText(cells[2])
          const teacher = this.extractText(cells[3])
          const status = this.normalizeAttendanceStatus(this.extractText(cells[4]))
          const note = cells.length > 5 ? this.extractText(cells[5]) : undefined

          if (date && subject && teacher) {
            attendanceItems.push({
              date: this.normalizeDate(date),
              period,
              subject: subject.trim(),
              teacher: teacher.trim(),
              status,
              note: note?.trim() || undefined
            })
          }
        }
      }
    } catch (error) {
      console.error('出席データのパースエラー:', error)
    }

    return new AttendanceResult(attendanceItems)
  }

  /**
   * テキストを抽出
   */
  private extractText(element: any): string {
    if (!element) return ''
    return element.innerText?.trim() || element.textContent?.trim() || ''
  }

  /**
   * 日付を正規化
   */
  private normalizeDate(dateStr: string): string {
    // YYYY/MM/DD形式に変換
    const match = dateStr.match(/(\d{4})[\/\-年](\d{1,2})[\/\-月](\d{1,2})/)
    if (match) {
      const [, year, month, day] = match
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    return dateStr
  }

  /**
   * 出席状況を正規化
   */
  private normalizeAttendanceStatus(statusStr: string): AttendanceStatus {
    const status = statusStr.trim()
    
    // 出席状況のマッピング
    const statusMap: Record<string, AttendanceStatus> = {
      '出席': '出席',
      '○': '出席',
      '△': '遅刻',
      '遅刻': '遅刻',
      '×': '欠席',
      '欠席': '欠席',
      '早退': '早退',
      '公欠': '公欠',
      '忌引': '忌引',
      '病欠': '病欠',
      '補講': '補講',
      '休講': '休講',
      '-': '-',
      '': '-'
    }

    return statusMap[status] || '-'
  }

  /**
   * 特定の科目の出席状況を取得
   */
  async fetchSubjectAttendance(subjectName: string): Promise<AttendanceItem[]> {
    const result = await this.fetch()
    return result.getSubjectAttendance(subjectName)
  }

  /**
   * 出席率が低い科目を取得
   */
  async getLowAttendanceSubjects(threshold: number = 80) {
    const result = await this.fetch()
    return result.getLowAttendanceSubjects(threshold)
  }
}

export { AttendanceResult }