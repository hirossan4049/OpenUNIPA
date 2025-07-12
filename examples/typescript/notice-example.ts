import { OpenUNIPA } from '../../src/OpenUNIPA'
import { UnivList } from '../../src/types/UnivList'

async function main() {
  const session = OpenUNIPA({
    username: process.env.UNIPA_USER_ID || 'your_username',
    password: process.env.UNIPA_PLAIN_PASSWORD || 'your_password',
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
    debug: { stub: true, saveHTML: false }
  })

  try {
    console.log('=== 掲示情報取得例 ===\n')

    // 全ての掲示情報を取得
    const notices = await session.notice.fetch()
    
    // 基本的な情報を表示
    notices.print()
    
    console.log('\n=== 詳細情報 ===')
    
    // サマリー情報を取得
    const summary = notices.getSummary()
    console.log('掲示情報サマリー:')
    console.table({
      '総件数': summary.totalNotices,
      '未読件数': summary.unreadNotices,
      '重要件数': summary.highPriorityNotices
    })
    
    // カテゴリ別の件数
    console.log('\nカテゴリ別件数:')
    console.table(summary.categoryCounts)
    
    // 重要な掲示情報のみ表示
    console.log('\n=== 重要な掲示情報 ===')
    const importantNotices = notices.getHighPriorityNotices()
    if (importantNotices.length > 0) {
      const importantForTable = importantNotices.map(notice => ({
        タイトル: notice.title.substring(0, 60) + (notice.title.length > 60 ? '...' : ''),
        カテゴリ: notice.category,
        日付: notice.date,
        投稿者: notice.author || '不明',
        期限: notice.deadline || 'なし'
      }))
      console.table(importantForTable)
    } else {
      console.log('重要な掲示情報はありません')
    }
    
    // 未読の掲示情報を表示
    console.log('\n=== 未読の掲示情報 ===')
    const unreadNotices = notices.getUnreadNotices()
    if (unreadNotices.length > 0) {
      const unreadForTable = unreadNotices.map(notice => ({
        タイトル: notice.title.substring(0, 60) + (notice.title.length > 60 ? '...' : ''),
        カテゴリ: notice.category,
        優先度: notice.priority,
        日付: notice.date
      }))
      console.table(unreadForTable)
    } else {
      console.log('未読の掲示情報はありません')
    }
    
    // 期限が近い掲示情報
    console.log('\n=== 期限が近い掲示情報（7日以内）===')
    const upcomingDeadlines = notices.getUpcomingDeadlines(7)
    if (upcomingDeadlines.length > 0) {
      const deadlineForTable = upcomingDeadlines.map(notice => ({
        タイトル: notice.title.substring(0, 50) + '...',
        期限: notice.deadline,
        カテゴリ: notice.category,
        優先度: notice.priority
      }))
      console.table(deadlineForTable)
    } else {
      console.log('期限が近い掲示情報はありません')
    }
    
    // カテゴリ別の掲示情報を表示
    console.log('\n=== 学生向け掲示情報 ===')
    const studentNotices = notices.getByCategory('学生')
    if (studentNotices.length > 0) {
      const studentForTable = studentNotices.map(notice => ({
        タイトル: notice.title.substring(0, 50) + (notice.title.length > 50 ? '...' : ''),
        日付: notice.date,
        投稿者: notice.author || '不明',
        既読: notice.isRead ? '既読' : '未読'
      }))
      console.table(studentForTable)
    } else {
      console.log('学生向けの掲示情報はありません')
    }
    
    // フィルタリング例
    console.log('\n=== フィルタリング例 ===')
    
    // キーワード検索
    const keywordFiltered = notices.filter({ keyword: 'システム' })
    console.log(`"システム"を含む掲示: ${keywordFiltered.length}件`)
    
    // 日付範囲での検索
    const recentNotices = notices.filter({ 
      dateFrom: '2024-07-01',
      dateTo: '2024-07-31'
    })
    console.log(`2024年7月の掲示: ${recentNotices.length}件`)
    
    // ソート例
    console.log('\n=== ソート例 ===')
    
    // 日付でソート（新しい順）
    const sortedByDate = notices.sortByDate(false)
    console.log('\n最新の掲示情報（上位3件）:')
    const latestForTable = sortedByDate.slice(0, 3).map(notice => ({
      タイトル: notice.title.substring(0, 40) + '...',
      日付: notice.date,
      カテゴリ: notice.category
    }))
    console.table(latestForTable)
    
    // 優先度でソート
    const sortedByPriority = notices.sortByPriority()
    console.log('\n優先度順の掲示情報（上位3件）:')
    const priorityForTable = sortedByPriority.slice(0, 3).map(notice => ({
      タイトル: notice.title.substring(0, 40) + '...',
      優先度: notice.priority,
      カテゴリ: notice.category,
      日付: notice.date
    }))
    console.table(priorityForTable)
    
    // 統計情報
    console.log('\n=== 統計情報 ===')
    const stats = {
      '総掲示数': notices.items.length,
      '未読数': notices.getUnreadNotices().length,
      '重要掲示数': notices.getHighPriorityNotices().length,
      '期限付き掲示数': notices.getNoticesWithDeadline().length,
      '直近7日の期限': notices.getUpcomingDeadlines(7).length
    }
    console.table(stats)
    
    // 全ての掲示情報を表示
    console.log('\n全ての掲示情報を表示しますか？ (実際の実装では条件分岐で制御)')
    notices.printAll()
    
  } catch (error) {
    console.error('エラーが発生しました:', error)
  }
}

// スクリプトが直接実行された場合のみmain関数を呼び出す
if (require.main === module) {
  main().catch(console.error)
}