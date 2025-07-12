export type NoticeCategory = '重要' | '一般' | '事務' | '学生' | '教務' | '就活' | 'その他'

export type NoticePriority = 'high' | 'normal' | 'low'

export type NoticeItem = {
  id?: string
  title: string
  content?: string
  category: NoticeCategory
  priority: NoticePriority
  date: string
  author?: string
  department?: string
  url?: string
  isRead?: boolean
  attachments?: string[]
  deadline?: string
  targetAudience?: string[]
}

export type NoticeFilter = {
  category?: NoticeCategory
  priority?: NoticePriority
  dateFrom?: string
  dateTo?: string
  isRead?: boolean
  keyword?: string
}

export type NoticeSummary = {
  totalNotices: number
  unreadNotices: number
  highPriorityNotices: number
  categoryCounts: Record<NoticeCategory, number>
  recentNotices: NoticeItem[]
}