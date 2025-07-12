import BaseController from "../../base"
import { NoticeResult } from "./result"
import { NoticeItem, NoticeCategory, NoticePriority } from "../../types/NoticeItem"

export class NoticeController extends BaseController {
  /**
   * 掲示情報データを取得
   */
  async fetch(): Promise<NoticeResult> {
    if (this.session.DEBUG.stub) {
      return this.fetchStub()
    }

    // メニューから掲示情報ページに移動
    const menuItems = await this.session.menu.getStudentMenu()
    console.log('Student menu items:', menuItems.map(item => item.title))
    
    const noticeMenuItem = menuItems.find(item => 
      item.title.includes('掲示') ||
      item.title.includes('お知らせ') ||
      item.title.includes('通知') ||
      item.title.includes('案内') ||
      item.title.includes('bulletin') ||
      item.title.includes('notice') ||
      item.title.includes('information')
    )

    if (!noticeMenuItem) {
      console.error('Available menu items:', menuItems.map(item => item.title))
      throw new Error('掲示情報メニューが見つかりません')
    }

    console.log('Found notice menu item:', noticeMenuItem)

    // メニューアイテムをクリックして掲示情報ページにアクセス
    const menuItem = { title: noticeMenuItem.title, link: noticeMenuItem.url }
    await this.session.menu.click(menuItem, 'notice')
    
    const element = this.session.element
    if (!element) {
      throw new Error('掲示情報ページの読み込みに失敗しました')
    }

    return this.parseNoticeData(element)
  }

  /**
   * スタブモードでのデータ取得
   */
  private async fetchStub(): Promise<NoticeResult> {
    try {
      // スタブHTMLファイルが存在する場合はそれをパース
      await this.session.request.setStubData('-up-faces-up-po-notice.jsp')
      if (this.session.element) {
        const tables = this.session.element.querySelectorAll('table')
        if (tables && tables.length > 0) {
          return this.parseNoticeData(this.session.element)
        }
      }
    } catch (error) {
      // スタブファイルが存在しない場合は固定データを使用
      console.warn('Stub file not found, using hardcoded data')
    }
    
    // HTMLが存在しないか、テーブルが見つからない場合は固定データを使用
    console.warn('No valid HTML tables found, using hardcoded data')
    
    // スタブデータを直接作成（HTMLファイルに依存しない）
    const noticeItems: NoticeItem[] = [
      {
        id: '1',
        title: '【重要】システムメンテナンスのお知らせ',
        content: '2024年7月15日(月) 2:00～6:00の間、システムメンテナンスを実施いたします。',
        category: '重要',
        priority: 'high',
        date: '2024-07-10',
        author: 'システム管理部',
        department: '情報システム課',
        isRead: false,
        deadline: '2024-07-15'
      },
      {
        id: '2',
        title: '夏季休暇期間中の図書館利用について',
        content: '夏季休暇期間中の図書館利用時間が変更となります。詳細は図書館ホームページをご確認ください。',
        category: '学生',
        priority: 'normal',
        date: '2024-07-08',
        author: '図書館',
        department: '図書館',
        isRead: true
      },
      {
        id: '3',
        title: '就活セミナーのご案内',
        content: '2024年度就職活動支援セミナーを開催いたします。参加希望者は期日までにお申し込みください。',
        category: '就活',
        priority: 'normal',
        date: '2024-07-05',
        author: 'キャリアセンター',
        department: 'キャリアセンター',
        isRead: false,
        deadline: '2024-07-20'
      },
      {
        id: '4',
        title: '【緊急】台風接近に伴う休講措置について',
        content: '台風の接近に伴い、本日午後の授業を休講といたします。',
        category: '重要',
        priority: 'high',
        date: '2024-07-03',
        author: '教務課',
        department: '教務課',
        isRead: true
      },
      {
        id: '5',
        title: '学生証再発行手続きについて',
        content: '学生証の再発行手続きに関するご案内です。',
        category: '事務',
        priority: 'low',
        date: '2024-07-01',
        author: '学生課',
        department: '学生課',
        isRead: true
      },
      {
        id: '6',
        title: '前期試験時間割発表',
        content: '前期末試験の時間割を発表いたします。各自確認をお願いします。',
        category: '教務',
        priority: 'high',
        date: '2024-06-28',
        author: '教務課',
        department: '教務課',
        isRead: false
      },
      {
        id: '7',
        title: 'サークル活動における注意事項',
        content: 'サークル活動を行う際の注意事項について連絡いたします。',
        category: '学生',
        priority: 'normal',
        date: '2024-06-25',
        author: '学生課',
        department: '学生課',
        isRead: true
      },
      {
        id: '8',
        title: '学食メニュー変更のお知らせ',
        content: '来月より学食のメニューが一部変更となります。',
        category: '一般',
        priority: 'low',
        date: '2024-06-20',
        author: '生協',
        department: '生協',
        isRead: true
      }
    ]

    return new NoticeResult(noticeItems)
  }

  /**
   * HTMLから掲示情報データをパース
   */
  private parseNoticeData(element: any): NoticeResult {
    const noticeItems: NoticeItem[] = []

    try {
      // 全てのテーブルを調査
      const allTables = element.querySelectorAll('table')
      console.log(`Found ${allTables.length} tables on the page`)
      
      // 各テーブルの最初の行をチェックして掲示情報関連のテーブルを特定
      let noticeTable = null
      for (let i = 0; i < allTables.length; i++) {
        const table = allTables[i]
        const firstRow = table.querySelector('tr')
        if (firstRow) {
          const headerText = this.extractText(firstRow).toLowerCase()
          if (headerText.includes('タイトル') || 
              headerText.includes('件名') || 
              headerText.includes('掲示') ||
              headerText.includes('日付') ||
              headerText.includes('お知らせ') ||
              headerText.includes('通知') ||
              headerText.includes('title') ||
              headerText.includes('notice') ||
              headerText.includes('bulletin')) {
            console.log(`Table ${i} looks like notice data:`, headerText)
            noticeTable = table
            break
          }
        }
      }
      
      // フォールバック: 最大のテーブルを使用
      if (!noticeTable && allTables.length > 0) {
        let maxRows = 0
        for (let i = 0; i < allTables.length; i++) {
          const rowCount = allTables[i].querySelectorAll('tr').length
          if (rowCount > maxRows) {
            maxRows = rowCount
            noticeTable = allTables[i]
          }
        }
        console.log(`Using largest table with ${maxRows} rows`)
      }
      
      if (!noticeTable) {
        console.warn('掲示情報テーブルが見つかりません')
        return new NoticeResult([])
      }
      
      console.log('Using table for notice data')

      const rows = noticeTable.querySelectorAll('tr')
      
      for (let i = 1; i < rows.length; i++) { // ヘッダー行をスキップ
        const cells = rows[i].querySelectorAll('td, th')
        
        if (cells.length >= 3) {
          const title = this.extractText(cells[0])
          const category = this.normalizeNoticeCategory(this.extractText(cells[1]))
          const date = this.normalizeDate(this.extractText(cells[2]))
          const author = cells.length > 3 ? this.extractText(cells[3]) : undefined
          const content = cells.length > 4 ? this.extractText(cells[4]) : undefined

          if (title && date) {
            noticeItems.push({
              id: `notice_${i}`,
              title: title.trim(),
              content: content?.trim(),
              category,
              priority: this.determinePriority(title, category),
              date: date,
              author: author?.trim(),
              isRead: false
            })
          }
        }
      }
    } catch (error) {
      console.error('掲示情報データのパースエラー:', error)
    }

    return new NoticeResult(noticeItems)
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
    const match = dateStr.match(/(\d{4})[\\/\-年](\d{1,2})[\\/\-月](\d{1,2})/)
    if (match) {
      const [, year, month, day] = match
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
    return dateStr
  }

  /**
   * カテゴリを正規化
   */
  private normalizeNoticeCategory(categoryStr: string): NoticeCategory {
    const category = categoryStr.trim()
    
    // カテゴリのマッピング
    if (category.includes('重要') || category.includes('緊急')) return '重要'
    if (category.includes('事務') || category.includes('手続き')) return '事務'
    if (category.includes('学生') || category.includes('生活')) return '学生'
    if (category.includes('教務') || category.includes('試験') || category.includes('授業')) return '教務'
    if (category.includes('就活') || category.includes('就職') || category.includes('キャリア')) return '就活'
    if (category.includes('一般') || category.includes('お知らせ')) return '一般'
    
    return 'その他'
  }

  /**
   * 優先度を決定
   */
  private determinePriority(title: string, category: NoticeCategory): NoticePriority {
    if (category === '重要' || 
        title.includes('重要') || 
        title.includes('緊急') || 
        title.includes('至急')) {
      return 'high'
    }
    
    if (category === '教務' || 
        category === '就活' ||
        title.includes('試験') ||
        title.includes('期限') ||
        title.includes('締切')) {
      return 'normal'
    }
    
    return 'low'
  }

  /**
   * 特定のカテゴリの掲示情報を取得
   */
  async fetchNoticesByCategory(category: NoticeCategory): Promise<NoticeItem[]> {
    const result = await this.fetch()
    return result.getByCategory(category)
  }

  /**
   * 未読の掲示情報を取得
   */
  async getUnreadNotices(): Promise<NoticeItem[]> {
    const result = await this.fetch()
    return result.getUnreadNotices()
  }

  /**
   * 重要な掲示情報を取得
   */
  async getHighPriorityNotices(): Promise<NoticeItem[]> {
    const result = await this.fetch()
    return result.getHighPriorityNotices()
  }
}

export { NoticeResult }