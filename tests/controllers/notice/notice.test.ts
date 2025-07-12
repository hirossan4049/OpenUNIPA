import { describe, test, expect, vi } from 'vitest'
import { NoticeController, NoticeResult } from '../../../src/controllers/notice/index'
import { OpenUNIPA } from '../../../src/OpenUNIPA'
import { UnivList } from '../../../src/types/UnivList'

describe('NoticeController', () => {
  test('掲示情報の取得テスト (stub)', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    
    expect(result).toBeInstanceOf(NoticeResult)
    expect(result.items.length).toBeGreaterThan(0)
    
    // 最初の項目の検証
    const firstNotice = result.items[0]
    expect(firstNotice.title).toBeTruthy()
    expect(firstNotice.category).toBeTruthy()
    expect(firstNotice.priority).toBeTruthy()
    expect(firstNotice.date).toBeTruthy()
  })

  test('掲示情報のサマリー取得テスト', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    const summary = result.getSummary()
    
    expect(summary.totalNotices).toBeGreaterThan(0)
    expect(summary.categoryCounts).toBeDefined()
    expect(summary.recentNotices).toBeDefined()
    expect(Array.isArray(summary.recentNotices)).toBe(true)
  })

  test('カテゴリ別フィルタリングテスト', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    const importantNotices = result.getByCategory('重要')
    const studentNotices = result.getByCategory('学生')
    
    expect(Array.isArray(importantNotices)).toBe(true)
    expect(Array.isArray(studentNotices)).toBe(true)
    
    // 重要な掲示があることを確認
    expect(importantNotices.length).toBeGreaterThan(0)
    importantNotices.forEach(notice => {
      expect(notice.category).toBe('重要')
    })
  })

  test('未読掲示情報の取得テスト', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    const unreadNotices = result.getUnreadNotices()
    
    expect(Array.isArray(unreadNotices)).toBe(true)
    unreadNotices.forEach(notice => {
      expect(notice.isRead).toBe(false)
    })
  })

  test('高優先度掲示情報の取得テスト', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    const highPriorityNotices = result.getHighPriorityNotices()
    
    expect(Array.isArray(highPriorityNotices)).toBe(true)
    highPriorityNotices.forEach(notice => {
      expect(notice.priority).toBe('high')
    })
  })

  test('期限付き掲示情報の取得テスト', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    const noticesWithDeadline = result.getNoticesWithDeadline()
    
    expect(Array.isArray(noticesWithDeadline)).toBe(true)
    noticesWithDeadline.forEach(notice => {
      expect(notice.deadline).toBeTruthy()
    })
  })

  test('日付ソート機能テスト', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    
    // 降順ソート（新しい順）
    const sortedDesc = result.sortByDate(false)
    expect(sortedDesc.length).toBe(result.items.length)
    
    // 昇順ソート（古い順）
    const sortedAsc = result.sortByDate(true)
    expect(sortedAsc.length).toBe(result.items.length)
    
    // ソートが正しく機能していることを確認
    if (sortedDesc.length > 1) {
      const firstDate = new Date(sortedDesc[0].date)
      const lastDate = new Date(sortedDesc[sortedDesc.length - 1].date)
      expect(firstDate.getTime()).toBeGreaterThanOrEqual(lastDate.getTime())
    }
  })

  test('優先度ソート機能テスト', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    const sortedByPriority = result.sortByPriority()
    
    expect(sortedByPriority.length).toBe(result.items.length)
    
    // 優先度の順序を確認（高い順）
    const priorityOrder = ['high', 'normal', 'low']
    let lastPriorityIndex = -1
    
    sortedByPriority.forEach(notice => {
      const currentPriorityIndex = priorityOrder.indexOf(notice.priority)
      expect(currentPriorityIndex).toBeGreaterThanOrEqual(lastPriorityIndex)
      lastPriorityIndex = currentPriorityIndex
    })
  })

  test('フィルタリング機能テスト', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    
    // カテゴリフィルター
    const categoryFiltered = result.filter({ category: '重要' })
    categoryFiltered.forEach(notice => {
      expect(notice.category).toBe('重要')
    })
    
    // 優先度フィルター
    const priorityFiltered = result.filter({ priority: 'high' })
    priorityFiltered.forEach(notice => {
      expect(notice.priority).toBe('high')
    })
    
    // キーワード検索
    const keywordFiltered = result.filter({ keyword: 'システム' })
    keywordFiltered.forEach(notice => {
      const searchText = `${notice.title} ${notice.content || ''} ${notice.author || ''}`.toLowerCase()
      expect(searchText).toContain('システム'.toLowerCase())
    })
  })

  test('既読マーク機能テスト', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    
    if (result.items.length > 0) {
      const firstNotice = result.items[0]
      const originalReadStatus = firstNotice.isRead
      
      // 単一の掲示を既読にマーク
      result.markAsRead(firstNotice.id!)
      expect(firstNotice.isRead).toBe(true)
      
      // 全ての掲示を既読にマーク
      result.markAllAsRead()
      result.items.forEach(notice => {
        expect(notice.isRead).toBe(true)
      })
    }
  })

  test('全表示機能テスト', async () => {
    const session = OpenUNIPA({
      username: 'test',
      password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      debug: { stub: true, saveHTML: false }
    })

    const result = await session.notice.fetch()
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const consoleTableSpy = vi.spyOn(console, 'table').mockImplementation(() => {})
    
    // printAll()を実行
    result.printAll()
    
    // console.logが呼ばれたことを確認
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('=== 全ての掲示情報 ==='))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('総件数:'))
    
    // console.tableが呼ばれたことを確認
    expect(consoleTableSpy).toHaveBeenCalled()
    
    // console.tableに渡されたデータを確認
    const tableCallArgs = consoleTableSpy.mock.calls[0][0]
    expect(Array.isArray(tableCallArgs)).toBe(true)
    expect(tableCallArgs.length).toBe(result.items.length)
    
    // 各項目のフォーマットを確認
    if (tableCallArgs.length > 0) {
      const firstItem = tableCallArgs[0]
      expect(firstItem).toHaveProperty('No')
      expect(firstItem).toHaveProperty('タイトル')
      expect(firstItem).toHaveProperty('カテゴリ')
      expect(firstItem).toHaveProperty('優先度')
      expect(firstItem).toHaveProperty('日付')
      expect(firstItem).toHaveProperty('投稿者')
      expect(firstItem).toHaveProperty('未読')
      expect(firstItem).toHaveProperty('期限')
    }
    
    consoleSpy.mockRestore()
    consoleTableSpy.mockRestore()
  })
})