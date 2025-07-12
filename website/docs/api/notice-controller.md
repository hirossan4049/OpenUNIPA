# NoticeController

The NoticeController handles university notices and announcements with comprehensive filtering, categorization, and management capabilities.

## Methods

### `fetch()`

Retrieves notice data from UNIPA and returns a structured object with filtering and management methods.

```typescript
const notices = await unipa.notice.fetch();
```

**Parameters:** None

**Returns:** `Promise<NoticeData>`

**Requires:** Prior authentication via `unipa.account.login()`

## NoticeData Methods

The returned `NoticeData` object provides extensive methods for notice management and analysis.

### `getSummary()`

Returns a summary of notice statistics.

```typescript
const summary = notices.getSummary();
console.log(`Total notices: ${summary.total}`);
console.log(`Unread notices: ${summary.unread}`);
```

**Returns:** `NoticeSummary` - Object containing notice statistics

### `filter(filterOptions)`

Filters notices based on specified criteria.

```typescript
const importantUnread = notices.filter({ 
  priority: 'high', 
  isRead: false 
});
console.log(`Important unread notices: ${importantUnread.length}`);
```

**Parameters:**
- `filterOptions`: Object with filtering criteria
  - `priority`: 'high' | 'normal' | 'low'
  - `isRead`: boolean
  - `category`: string
  - `dateFrom`: Date
  - `dateTo`: Date
  - `keyword`: string

**Returns:** `NoticeItem[]` - Filtered notice array

### `getByCategory(category)`

Retrieves notices by category.

```typescript
const academicNotices = notices.getByCategory('academic');
```

**Parameters:**
- `category`: Notice category ('academic', 'administrative', 'student', etc.)

**Returns:** `NoticeItem[]` - Notices in the specified category

### `getUnreadNotices()`

Gets all unread notices.

```typescript
const unread = notices.getUnreadNotices();
console.log(`You have ${unread.length} unread notices`);
```

**Returns:** `NoticeItem[]` - Array of unread notices

### `getHighPriorityNotices()`

Gets all high-priority notices.

```typescript
const important = notices.getHighPriorityNotices();
important.forEach(notice => {
  console.log(`🚨 ${notice.title}`);
});
```

**Returns:** `NoticeItem[]` - High-priority notices

### `getNoticesWithDeadline()`

Gets notices that have deadlines.

```typescript
const deadlineNotices = notices.getNoticesWithDeadline();
```

**Returns:** `NoticeItem[]` - Notices with deadline information

### `getUpcomingDeadlines(days)`

Gets notices with deadlines within the specified number of days.

```typescript
const urgent = notices.getUpcomingDeadlines(7); // Next 7 days
console.log(`Urgent deadlines: ${urgent.length}`);
```

**Parameters:**
- `days`: Number of days ahead to check

**Returns:** `NoticeItem[]` - Notices with upcoming deadlines

### `sortByDate(ascending?)`

Sorts notices by date.

```typescript
const latest = notices.sortByDate(false); // Latest first
const oldest = notices.sortByDate(true);  // Oldest first
```

**Parameters:**
- `ascending`: boolean (optional) - Sort order, defaults to false (newest first)

**Returns:** `NoticeItem[]` - Sorted notices

### `sortByPriority()`

Sorts notices by priority (high to low).

```typescript
const prioritized = notices.sortByPriority();
```

**Returns:** `NoticeItem[]` - Priority-sorted notices

### `markAsRead(noticeId)`

Marks a specific notice as read.

```typescript
await notices.markAsRead('notice_12345');
```

**Parameters:**
- `noticeId`: Unique identifier of the notice

**Returns:** `Promise<void>`

### `markAllAsRead()`

Marks all notices as read.

```typescript
await notices.markAllAsRead();
console.log('All notices marked as read');
```

**Returns:** `Promise<void>`

### `print()`

Displays a formatted summary of notices.

```typescript
notices.print();
```

**Output Example:**
```
=== Notice Summary ===
Total: 15 notices | Unread: 3 | High Priority: 2

📋 Recent Notices:
🚨 [HIGH] 期末試験日程について (2024-01-15) [UNREAD]
📢 [NORMAL] 春季休暇中の図書館利用について (2024-01-12)
📝 [NORMAL] 履修登録期間の延長について (2024-01-10) [UNREAD]

⏰ Upcoming Deadlines:
- 履修登録締切: 2024-01-20 (5 days remaining)
- レポート提出: 2024-01-25 (10 days remaining)
```

### `printAll()`

Displays all notices with full details.

```typescript
notices.printAll();
```

## Usage Examples

### Basic Notice Management

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

try {
  await unipa.account.login();
  const notices = await unipa.notice.fetch();
  
  // Display summary
  notices.print();
  
  // Check for important unread notices
  const importantUnread = notices.filter({ 
    priority: 'high', 
    isRead: false 
  });
  
  if (importantUnread.length > 0) {
    console.log(`⚠️ ${importantUnread.length} important unread notices!`);
  }
} catch (error) {
  console.error('Failed to fetch notices:', error);
}
```

### Comprehensive Notice Analysis

```typescript
async function analyzeNotices() {
  await unipa.account.login();
  const notices = await unipa.notice.fetch();
  
  console.log('=== Notice Dashboard ===\n');
  
  // Summary statistics
  const summary = notices.getSummary();
  console.log(`📊 Overview:`);
  console.log(`   Total Notices: ${summary.total}`);
  console.log(`   Unread: ${summary.unread}`);
  console.log(`   High Priority: ${summary.highPriority || 0}`);
  console.log(`   With Deadlines: ${summary.withDeadlines || 0}\n`);
  
  // Priority breakdown
  const highPriority = notices.getHighPriorityNotices();
  if (highPriority.length > 0) {
    console.log(`🚨 High Priority Notices (${highPriority.length}):`);
    highPriority.forEach(notice => {
      const status = notice.isRead ? '' : '[UNREAD]';
      console.log(`   - ${notice.title} ${status}`);
    });
    console.log();
  }
  
  // Upcoming deadlines
  const urgent = notices.getUpcomingDeadlines(7);
  const soon = notices.getUpcomingDeadlines(14);
  
  if (urgent.length > 0) {
    console.log(`⏰ Urgent Deadlines (Next 7 days):`);
    urgent.forEach(notice => {
      const daysLeft = Math.ceil((notice.deadline - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`   - ${notice.title}: ${daysLeft} days left`);
    });
    console.log();
  }
  
  if (soon.length > urgent.length) {
    console.log(`📅 Upcoming Deadlines (Next 14 days):`);
    soon.filter(n => !urgent.includes(n)).forEach(notice => {
      const daysLeft = Math.ceil((notice.deadline - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`   - ${notice.title}: ${daysLeft} days left`);
    });
    console.log();
  }
  
  // Category breakdown
  console.log(`📂 Categories:`);
  const categories = ['academic', 'administrative', 'student', 'career'];
  categories.forEach(category => {
    const categoryNotices = notices.getByCategory(category);
    if (categoryNotices.length > 0) {
      const unreadCount = categoryNotices.filter(n => !n.isRead).length;
      console.log(`   ${category}: ${categoryNotices.length} notices (${unreadCount} unread)`);
    }
  });
}

await analyzeNotices();
```

### Notice Filtering and Search

```typescript
async function searchNotices() {
  await unipa.account.login();
  const notices = await unipa.notice.fetch();
  
  console.log('=== Notice Search and Filter ===\n');
  
  // Search by keyword
  const examNotices = notices.filter({ keyword: '試験' });
  console.log(`📝 Exam-related notices: ${examNotices.length}`);
  
  // Filter by date range
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const recentNotices = notices.filter({ 
    dateFrom: lastWeek 
  });
  console.log(`📅 Notices from last week: ${recentNotices.length}`);
  
  // Unread academic notices
  const unreadAcademic = notices.filter({
    category: 'academic',
    isRead: false
  });
  console.log(`🎓 Unread academic notices: ${unreadAcademic.length}`);
  
  // High priority with deadlines
  const urgentWithDeadlines = notices.filter({
    priority: 'high'
  }).filter(notice => notice.deadline);
  
  if (urgentWithDeadlines.length > 0) {
    console.log(`\n⚠️ Urgent notices with deadlines:`);
    urgentWithDeadlines.forEach(notice => {
      const daysLeft = Math.ceil((notice.deadline - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`   - ${notice.title}: ${daysLeft} days left`);
    });
  }
}

await searchNotices();
```

### Notice Management Automation

```typescript
async function manageNotices() {
  await unipa.account.login();
  const notices = await unipa.notice.fetch();
  
  console.log('=== Automated Notice Management ===\n');
  
  // Mark old notices as read
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  const oldNotices = notices.filter({
    dateTo: oneMonthAgo,
    isRead: false
  });
  
  if (oldNotices.length > 0) {
    console.log(`📚 Marking ${oldNotices.length} old notices as read...`);
    for (const notice of oldNotices) {
      await notices.markAsRead(notice.id);
    }
    console.log('✅ Old notices marked as read\n');
  }
  
  // Generate alerts for urgent items
  const urgent = notices.getUpcomingDeadlines(3); // Next 3 days
  const highPriorityUnread = notices.filter({
    priority: 'high',
    isRead: false
  });
  
  if (urgent.length > 0 || highPriorityUnread.length > 0) {
    console.log('🚨 ALERTS:');
    
    if (urgent.length > 0) {
      console.log(`   - ${urgent.length} deadlines in next 3 days`);
    }
    
    if (highPriorityUnread.length > 0) {
      console.log(`   - ${highPriorityUnread.length} unread high-priority notices`);
    }
    
    console.log('\n📧 Consider checking these notices immediately!\n');
  }
  
  // Summary after management
  const updatedSummary = notices.getSummary();
  console.log('📊 Updated Summary:');
  console.log(`   Total: ${updatedSummary.total}`);
  console.log(`   Unread: ${updatedSummary.unread}`);
  console.log(`   Requires Attention: ${urgent.length + highPriorityUnread.length}`);
}

await manageNotices();
```

## Data Structure

Notice data includes comprehensive information and metadata:

```typescript
interface NoticeItem {
  id: string;              // Unique identifier
  title: string;           // Notice title
  content: string;         // Full notice content
  category: NoticeCategory; // Notice category
  priority: 'high' | 'normal' | 'low'; // Priority level
  publishDate: Date;       // Publication date
  deadline?: Date;         // Deadline if applicable
  isRead: boolean;         // Read status
  isImportant: boolean;    // Importance flag
  author: string;          // Notice author/department
  attachments?: string[];  // File attachments
  tags?: string[];         // Notice tags
  url?: string;           // Link to full notice
}

enum NoticeCategory {
  IMPORTANT = 'important',      // 重要
  GENERAL = 'general',          // 一般
  ADMINISTRATIVE = 'admin',     // 事務
  STUDENT = 'student',          // 学生
  ACADEMIC = 'academic',        // 教務
  CAREER = 'career',           // 就活
  OTHER = 'other'              // その他
}

interface NoticeSummary {
  total: number;
  unread: number;
  highPriority: number;
  withDeadlines: number;
  byCategory: Record<NoticeCategory, number>;
  oldestUnread?: Date;
  newestNotice?: Date;
}

interface FilterOptions {
  priority?: 'high' | 'normal' | 'low';
  isRead?: boolean;
  category?: NoticeCategory | string;
  dateFrom?: Date;
  dateTo?: Date;
  keyword?: string;
  hasDeadline?: boolean;
  isImportant?: boolean;
}
```

## Error Handling

```typescript
async function safeNoticeFetch() {
  try {
    await unipa.account.login();
    const notices = await unipa.notice.fetch();
    
    // Validate data
    const summary = notices.getSummary();
    if (summary.total === 0) {
      console.warn('No notices found - this may indicate an issue');
    }
    
    return notices;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        console.error('Authentication required for notice access');
      } else if (error.message.includes('parsing')) {
        console.error('Failed to parse notice data');
      } else if (error.message.includes('network')) {
        console.error('Network error accessing notices');
      } else {
        console.error('Notice fetch failed:', error.message);
      }
    }
    throw error;
  }
}
```

## Best Practices

1. **Regular checks** - Fetch notices daily or weekly
2. **Prioritize urgent items** - Check high-priority and deadline notices first
3. **Use filtering** - Focus on relevant categories and unread items
4. **Manage read status** - Mark notices as read to stay organized
5. **Set up alerts** - Monitor for urgent deadlines and important notices
6. **Archive old notices** - Keep the notice list manageable

## Related Controllers

- [AccountController](./account-controller) - Required for authentication
- [TimetableController](./timetable-controller) - Schedule-related notices
- [GradesController](./grades-controller) - Grade and exam announcements
- [AttendanceController](./attendance-controller) - Attendance policy notices