import { NoticeItem, NoticeCategory, NoticePriority, NoticeFilter, NoticeSummary } from "../../types/NoticeItem"

export class NoticeResult {
  constructor(public items: NoticeItem[]) {}

  /**
   * 掲示情報のサマリーを取得
   */
  getSummary(): NoticeSummary {
    const totalNotices = this.items.length
    const unreadNotices = this.items.filter(item => !item.isRead).length
    const highPriorityNotices = this.items.filter(item => item.priority === 'high').length
    
    const categoryCounts: Record<NoticeCategory, number> = {
      '重要': 0,
      '一般': 0,
      '事務': 0,
      '学生': 0,
      '教務': 0,
      '就活': 0,
      'その他': 0
    }
    
    this.items.forEach(item => {
      categoryCounts[item.category]++
    })
    
    // 最新の5件を取得
    const recentNotices = this.items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
    
    return {
      totalNotices,
      unreadNotices,
      highPriorityNotices,
      categoryCounts,
      recentNotices
    }
  }

  /**
   * フィルタリング機能
   */
  filter(filter: NoticeFilter): NoticeItem[] {
    return this.items.filter(item => {
      // カテゴリフィルター
      if (filter.category && item.category !== filter.category) {
        return false
      }
      
      // 優先度フィルター
      if (filter.priority && item.priority !== filter.priority) {
        return false
      }
      
      // 日付範囲フィルター
      if (filter.dateFrom && new Date(item.date) < new Date(filter.dateFrom)) {
        return false
      }
      if (filter.dateTo && new Date(item.date) > new Date(filter.dateTo)) {
        return false
      }
      
      // 既読/未読フィルター
      if (filter.isRead !== undefined && item.isRead !== filter.isRead) {
        return false
      }
      
      // キーワード検索
      if (filter.keyword) {
        const keyword = filter.keyword.toLowerCase()
        const searchText = `${item.title} ${item.content || ''} ${item.author || ''}`.toLowerCase()
        if (!searchText.includes(keyword)) {
          return false
        }
      }
      
      return true
    })
  }

  /**
   * カテゴリ別の掲示情報を取得
   */
  getByCategory(category: NoticeCategory): NoticeItem[] {
    return this.items.filter(item => item.category === category)
  }

  /**
   * 未読の掲示情報を取得
   */
  getUnreadNotices(): NoticeItem[] {
    return this.items.filter(item => !item.isRead)
  }

  /**
   * 重要な掲示情報を取得
   */
  getHighPriorityNotices(): NoticeItem[] {
    return this.items.filter(item => item.priority === 'high')
  }

  /**
   * 期限付きの掲示情報を取得
   */
  getNoticesWithDeadline(): NoticeItem[] {
    return this.items.filter(item => item.deadline)
  }

  /**
   * 期限が近い掲示情報を取得（指定日数以内）
   */
  getUpcomingDeadlines(daysAhead: number = 7): NoticeItem[] {
    const now = new Date()
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
    
    return this.items.filter(item => {
      if (!item.deadline) return false
      const deadline = new Date(item.deadline)
      return deadline >= now && deadline <= futureDate
    })
  }

  /**
   * 日付でソート
   */
  sortByDate(ascending: boolean = false): NoticeItem[] {
    return [...this.items].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return ascending ? dateA - dateB : dateB - dateA
    })
  }

  /**
   * 優先度でソート
   */
  sortByPriority(): NoticeItem[] {
    const priorityOrder = { 'high': 3, 'normal': 2, 'low': 1 }
    return [...this.items].sort((a, b) => {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  /**
   * 掲示情報をマークを既読にする
   */
  markAsRead(noticeId: string): void {
    const notice = this.items.find(item => item.id === noticeId)
    if (notice) {
      notice.isRead = true
    }
  }

  /**
   * 複数の掲示情報を既読にする
   */
  markMultipleAsRead(noticeIds: string[]): void {
    noticeIds.forEach(id => this.markAsRead(id))
  }

  /**
   * 全ての掲示情報を既読にする
   */
  markAllAsRead(): void {
    this.items.forEach(item => {
      item.isRead = true
    })
  }

  /**
   * 全ての掲示情報を表示
   */
  printAll(): void {
    console.log('\n=== 全ての掲示情報 ===')
    const allForTable = this.items.map((item, index) => ({
      No: index + 1,
      タイトル: item.title.substring(0, 50) + (item.title.length > 50 ? '...' : ''),
      カテゴリ: item.category,
      優先度: item.priority,
      日付: item.date,
      投稿者: item.author || '不明',
      未読: item.isRead ? '既読' : '未読',
      期限: item.deadline || 'なし'
    }))
    console.table(allForTable)
    console.log(`総件数: ${this.items.length}件`)
  }

  /**
   * 掲示情報をコンソールに表示
   */
  print(): void {
    const summary = this.getSummary()
    
    console.log('\n=== 掲示情報サマリー ===')
    console.table({
      '総件数': summary.totalNotices,
      '未読件数': summary.unreadNotices,
      '重要件数': summary.highPriorityNotices,
    })
    
    console.log('\n=== カテゴリ別件数 ===')
    console.table(summary.categoryCounts)
    
    console.log('\n=== 最新の掲示情報 ===')
    const recentForTable = summary.recentNotices.map(item => ({
      タイトル: item.title.substring(0, 50) + (item.title.length > 50 ? '...' : ''),
      カテゴリ: item.category,
      優先度: item.priority,
      日付: item.date,
      未読: item.isRead ? '既読' : '未読'
    }))
    console.table(recentForTable)
    
    // 重要な掲示情報がある場合は警告
    if (summary.highPriorityNotices > 0) {
      console.log(`\n⚠️ 重要な掲示情報が${summary.highPriorityNotices}件あります`)
    }
    
    // 未読がある場合は通知
    if (summary.unreadNotices > 0) {
      console.log(`\n📬 未読の掲示情報が${summary.unreadNotices}件あります`)
    }
    
    // 期限が近い掲示情報をチェック
    const upcoming = this.getUpcomingDeadlines()
    if (upcoming.length > 0) {
      console.log(`\n⏰ 期限が近い掲示情報が${upcoming.length}件あります`)
      console.table(upcoming.map(item => ({
        タイトル: item.title.substring(0, 40) + '...',
        期限: item.deadline,
        カテゴリ: item.category
      })))
    }
  }
}