# Examples

This page provides practical examples of using OpenUNIPA for common tasks and workflows.

## Quick Start Examples

### Basic Authentication and Data Fetching

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

// Login and fetch all data
await unipa.account.login();

const timetable = await unipa.timetable.fetch();
const grades = await unipa.grades.fetch();
const attendance = await unipa.attendance.fetch();
const notices = await unipa.notice.fetch();

console.log(`GPA: ${grades.getGPA()}`);
console.log(`Attendance: ${attendance.getOverallAttendanceRate()}%`);
console.log(`Unread notices: ${notices.getUnreadNotices().length}`);
```

### Environment Setup

Create a `.env` file:

```env
UNIPA_USER_ID=your_student_id
UNIPA_PLAIN_PASSWORD=your_password
```

Load environment variables:

```typescript
import 'dotenv/config';
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});
```

## Academic Monitoring

### Daily Academic Dashboard

```typescript
async function dailyDashboard() {
  const unipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  });

  await unipa.account.login();

  console.log('=== Daily Academic Dashboard ===\n');

  // Today's schedule
  const timetable = await unipa.timetable.fetch();
  console.log('📅 Today\'s Schedule:');
  timetable.print();

  // Academic performance
  const grades = await unipa.grades.fetch();
  const attendance = await unipa.attendance.fetch();
  
  console.log('\n📊 Academic Performance:');
  console.log(`   GPA: ${grades.getGPA().toFixed(2)}`);
  console.log(`   Credits: ${grades.getTotalEarnedCredits()}`);
  console.log(`   Attendance: ${attendance.getOverallAttendanceRate().toFixed(1)}%`);

  // Important notices
  const notices = await unipa.notice.fetch();
  const importantNotices = notices.getHighPriorityNotices();
  const upcomingDeadlines = notices.getUpcomingDeadlines(7);

  if (importantNotices.length > 0) {
    console.log('\n🚨 Important Notices:');
    importantNotices.slice(0, 3).forEach(notice => {
      console.log(`   - ${notice.title}`);
    });
  }

  if (upcomingDeadlines.length > 0) {
    console.log('\n⏰ Upcoming Deadlines:');
    upcomingDeadlines.forEach(notice => {
      const days = Math.ceil((notice.deadline - new Date()) / (1000 * 60 * 60 * 24));
      console.log(`   - ${notice.title}: ${days} days`);
    });
  }
}

await dailyDashboard();
```

### Weekly Performance Report

```typescript
import fs from 'fs';

async function weeklyReport() {
  const unipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  });

  await unipa.account.login();

  const grades = await unipa.grades.fetch();
  const attendance = await unipa.attendance.fetch();
  const notices = await unipa.notice.fetch();

  const report = {
    week: new Date().toISOString().slice(0, 10),
    academic: {
      gpa: grades.getGPA(),
      credits: grades.getTotalEarnedCredits(),
      attendanceRate: attendance.getOverallAttendanceRate(),
    },
    alerts: {
      lowAttendance: attendance.getLowAttendanceSubjects(80),
      unreadImportant: notices.filter({ priority: 'high', isRead: false }),
      upcomingDeadlines: notices.getUpcomingDeadlines(14),
    },
    recommendations: [],
  };

  // Generate recommendations
  if (report.academic.attendanceRate < 80) {
    report.recommendations.push('Improve attendance - currently below 80%');
  }
  
  if (report.alerts.lowAttendance.length > 0) {
    report.recommendations.push(`Focus on: ${report.alerts.lowAttendance.map(s => s.subject).join(', ')}`);
  }
  
  if (report.alerts.upcomingDeadlines.length > 0) {
    report.recommendations.push(`Prepare for ${report.alerts.upcomingDeadlines.length} upcoming deadlines`);
  }

  // Save report
  fs.writeFileSync(`weekly_report_${report.week}.json`, JSON.stringify(report, null, 2));

  console.log('=== Weekly Academic Report ===');
  console.log(`GPA: ${report.academic.gpa.toFixed(2)}`);
  console.log(`Attendance: ${report.academic.attendanceRate.toFixed(1)}%`);
  console.log(`Alerts: ${Object.values(report.alerts).flat().length}`);
  
  if (report.recommendations.length > 0) {
    console.log('\nRecommendations:');
    report.recommendations.forEach(rec => console.log(`- ${rec}`));
  }
}

await weeklyReport();
```

## Attendance Monitoring

### Attendance Alert System

```typescript
async function attendanceAlerts() {
  const unipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  });

  await unipa.account.login();
  const attendance = await unipa.attendance.fetch();

  const CRITICAL_THRESHOLD = 70;
  const WARNING_THRESHOLD = 80;

  console.log('=== Attendance Alert System ===\n');

  // Overall status
  const overallRate = attendance.getOverallAttendanceRate();
  if (overallRate < CRITICAL_THRESHOLD) {
    console.log('🚨 CRITICAL: Overall attendance dangerously low!');
    console.log('   Action: Contact academic advisor immediately');
  } else if (overallRate < WARNING_THRESHOLD) {
    console.log('⚠️  WARNING: Attendance needs improvement');
    console.log('   Action: Review attendance strategy');
  } else {
    console.log('✅ GOOD: Attendance is satisfactory');
  }

  console.log(`Overall Rate: ${overallRate.toFixed(1)}%\n`);

  // Subject-specific alerts
  const subjects = attendance.getSubjectSummaries();
  const criticalSubjects = subjects.filter(s => s.attendanceRate < CRITICAL_THRESHOLD);
  const warningSubjects = subjects.filter(s => s.attendanceRate >= CRITICAL_THRESHOLD && s.attendanceRate < WARNING_THRESHOLD);

  if (criticalSubjects.length > 0) {
    console.log('🚨 CRITICAL SUBJECTS:');
    criticalSubjects.forEach(subject => {
      console.log(`   ${subject.subject}: ${subject.attendanceRate.toFixed(1)}%`);
      console.log('   → Contact professor immediately');
    });
    console.log();
  }

  if (warningSubjects.length > 0) {
    console.log('⚠️  WARNING SUBJECTS:');
    warningSubjects.forEach(subject => {
      console.log(`   ${subject.subject}: ${subject.attendanceRate.toFixed(1)}%`);
      console.log('   → Prioritize attendance');
    });
    console.log();
  }

  // Recommendations
  console.log('📝 Recommendations:');
  if (criticalSubjects.length > 0) {
    console.log('   1. Contact professors for critical subjects');
    console.log('   2. Discuss makeup opportunities');
    console.log('   3. Review attendance policies');
  } else if (warningSubjects.length > 0) {
    console.log('   1. Perfect attendance for warning subjects');
    console.log('   2. Set calendar reminders');
  } else {
    console.log('   1. Maintain current attendance habits');
    console.log('   2. Continue excellent work!');
  }
}

await attendanceAlerts();
```

### Monthly Attendance Tracking

```typescript
async function monthlyAttendanceTracking() {
  const unipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  });

  await unipa.account.login();
  const attendance = await unipa.attendance.fetch();

  // Calculate date ranges
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const thisMonthRecords = attendance.getAttendanceByDateRange(thisMonthStart, now);
  const lastMonthRecords = attendance.getAttendanceByDateRange(lastMonthStart, lastMonthEnd);

  console.log('=== Monthly Attendance Tracking ===\n');

  console.log(`📅 This Month (${thisMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}):`);
  console.log(`   Classes Attended: ${thisMonthRecords.filter(r => r.status === 'present').length}`);
  console.log(`   Total Classes: ${thisMonthRecords.length}`);
  
  if (thisMonthRecords.length > 0) {
    const thisMonthRate = (thisMonthRecords.filter(r => r.status === 'present').length / thisMonthRecords.length) * 100;
    console.log(`   Attendance Rate: ${thisMonthRate.toFixed(1)}%`);
  }

  console.log(`\n📅 Last Month (${lastMonthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}):`);
  console.log(`   Classes Attended: ${lastMonthRecords.filter(r => r.status === 'present').length}`);
  console.log(`   Total Classes: ${lastMonthRecords.length}`);
  
  if (lastMonthRecords.length > 0) {
    const lastMonthRate = (lastMonthRecords.filter(r => r.status === 'present').length / lastMonthRecords.length) * 100;
    console.log(`   Attendance Rate: ${lastMonthRate.toFixed(1)}%`);
    
    // Compare months
    if (thisMonthRecords.length > 0) {
      const thisMonthRate = (thisMonthRecords.filter(r => r.status === 'present').length / thisMonthRecords.length) * 100;
      const improvement = thisMonthRate - lastMonthRate;
      
      console.log(`\n📊 Month-over-Month Change:`);
      if (improvement > 0) {
        console.log(`   ✅ Improved by ${improvement.toFixed(1)}%`);
      } else if (improvement < 0) {
        console.log(`   ⚠️  Decreased by ${Math.abs(improvement).toFixed(1)}%`);
      } else {
        console.log(`   ➡️  No change`);
      }
    }
  }
}

await monthlyAttendanceTracking();
```

## Notice Management

### Important Notice Checker

```typescript
async function checkImportantNotices() {
  const unipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  });

  await unipa.account.login();
  const notices = await unipa.notice.fetch();

  console.log('=== Important Notice Checker ===\n');

  // High priority unread notices
  const highPriorityUnread = notices.filter({ priority: 'high', isRead: false });
  if (highPriorityUnread.length > 0) {
    console.log(`🚨 HIGH PRIORITY UNREAD (${highPriorityUnread.length}):`);
    highPriorityUnread.forEach(notice => {
      console.log(`   • ${notice.title}`);
      console.log(`     Published: ${notice.publishDate.toLocaleDateString()}`);
      if (notice.deadline) {
        const daysLeft = Math.ceil((notice.deadline - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`     Deadline: ${daysLeft} days remaining`);
      }
      console.log();
    });
  }

  // Urgent deadlines (next 3 days)
  const urgentDeadlines = notices.getUpcomingDeadlines(3);
  if (urgentDeadlines.length > 0) {
    console.log(`⏰ URGENT DEADLINES (${urgentDeadlines.length}):`);
    urgentDeadlines.forEach(notice => {
      const daysLeft = Math.ceil((notice.deadline - new Date()) / (1000 * 60 * 60 * 24));
      const urgency = daysLeft <= 1 ? '🔴' : '🟡';
      console.log(`   ${urgency} ${notice.title} - ${daysLeft} day(s) left`);
    });
    console.log();
  }

  // Academic notices
  const academicUnread = notices.filter({ category: 'academic', isRead: false });
  if (academicUnread.length > 0) {
    console.log(`🎓 UNREAD ACADEMIC NOTICES (${academicUnread.length}):`);
    academicUnread.slice(0, 5).forEach(notice => {
      console.log(`   • ${notice.title}`);
    });
    if (academicUnread.length > 5) {
      console.log(`   ... and ${academicUnread.length - 5} more`);
    }
    console.log();
  }

  // Summary and recommendations
  const totalUnread = notices.getUnreadNotices().length;
  console.log(`📊 Summary: ${totalUnread} total unread notices\n`);

  if (highPriorityUnread.length > 0 || urgentDeadlines.length > 0) {
    console.log('🎯 IMMEDIATE ACTIONS REQUIRED:');
    if (highPriorityUnread.length > 0) {
      console.log(`   1. Read ${highPriorityUnread.length} high priority notices`);
    }
    if (urgentDeadlines.length > 0) {
      console.log(`   2. Handle ${urgentDeadlines.length} urgent deadlines`);
    }
  } else {
    console.log('✅ No urgent notices requiring immediate attention');
  }
}

await checkImportantNotices();
```

### Automated Notice Management

```typescript
async function automatedNoticeManagement() {
  const unipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  });

  await unipa.account.login();
  const notices = await unipa.notice.fetch();

  console.log('=== Automated Notice Management ===\n');

  // Auto-mark old low-priority notices as read
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldLowPriorityUnread = notices.filter({
    priority: 'low',
    isRead: false,
    dateTo: thirtyDaysAgo,
  });

  if (oldLowPriorityUnread.length > 0) {
    console.log(`📚 Auto-marking ${oldLowPriorityUnread.length} old low-priority notices as read...`);
    
    for (const notice of oldLowPriorityUnread) {
      await notices.markAsRead(notice.id);
      console.log(`   ✓ Marked: ${notice.title.substring(0, 50)}...`);
    }
    console.log('   Complete!\n');
  }

  // Generate priority inbox
  const priorityNotices = [
    ...notices.filter({ priority: 'high', isRead: false }),
    ...notices.getUpcomingDeadlines(7),
    ...notices.filter({ category: 'academic', isRead: false }).slice(0, 3),
  ];

  // Remove duplicates
  const uniquePriorityNotices = priorityNotices.filter((notice, index, self) => 
    index === self.findIndex(n => n.id === notice.id)
  );

  console.log(`📥 Your Priority Inbox (${uniquePriorityNotices.length} items):`);
  
  if (uniquePriorityNotices.length === 0) {
    console.log('   🎉 All caught up! No priority items.');
  } else {
    uniquePriorityNotices.forEach((notice, index) => {
      const urgency = notice.priority === 'high' ? '🚨' : 
                     notice.deadline ? '⏰' : '📚';
      console.log(`   ${index + 1}. ${urgency} ${notice.title}`);
      
      if (notice.deadline) {
        const daysLeft = Math.ceil((notice.deadline - new Date()) / (1000 * 60 * 60 * 24));
        console.log(`      Deadline in ${daysLeft} days`);
      }
    });
  }

  console.log(`\n📊 Statistics:`);
  console.log(`   Total notices: ${notices.getSummary().total}`);
  console.log(`   Unread: ${notices.getUnreadNotices().length}`);
  console.log(`   Auto-managed: ${oldLowPriorityUnread.length}`);
  console.log(`   Priority items: ${uniquePriorityNotices.length}`);
}

await automatedNoticeManagement();
```

## Data Export and Backup

### Complete Data Export

```typescript
import fs from 'fs';

async function exportAllData() {
  const unipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  });

  await unipa.account.login();

  console.log('=== Exporting All UNIPA Data ===\n');

  // Fetch all data
  console.log('📥 Fetching timetable...');
  const timetable = await unipa.timetable.fetch();
  
  console.log('📥 Fetching grades...');
  const grades = await unipa.grades.fetch();
  
  console.log('📥 Fetching attendance...');
  const attendance = await unipa.attendance.fetch();
  
  console.log('📥 Fetching notices...');
  const notices = await unipa.notice.fetch();

  // Create export package
  const exportData = {
    exportedAt: new Date().toISOString(),
    metadata: {
      university: 'Kindai University',
      campus: 'Higashi-Osaka',
      exportVersion: '1.0',
    },
    academic: {
      gpa: grades.getGPA(),
      totalCredits: grades.getTotalEarnedCredits(),
      attendanceRate: attendance.getOverallAttendanceRate(),
    },
    data: {
      timetable: timetable,
      grades: grades,
      attendance: {
        summary: attendance.getSubjectSummaries(),
        overall: attendance.getOverallAttendanceRate(),
        statusCounts: attendance.getStatusCounts(),
      },
      notices: {
        summary: notices.getSummary(),
        unread: notices.getUnreadNotices(),
        highPriority: notices.getHighPriorityNotices(),
        withDeadlines: notices.getNoticesWithDeadline(),
      },
    },
  };

  // Save to file
  const filename = `unipa_export_${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));

  console.log(`✅ Export complete: ${filename}`);
  console.log(`📊 Exported data summary:`);
  console.log(`   GPA: ${exportData.academic.gpa}`);
  console.log(`   Credits: ${exportData.academic.totalCredits}`);
  console.log(`   Attendance: ${exportData.academic.attendanceRate.toFixed(1)}%`);
  console.log(`   Notices: ${exportData.data.notices.summary.total} total`);
}

await exportAllData();
```

## Testing and Development

### Stub Mode Example

```typescript
// Use stub mode for testing without real UNIPA access
const unipa = OpenUNIPA({
  username: 'test_user',
  password: 'test_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    stub: true,  // Use test data instead of real API calls
  }
});

// No need to login in stub mode
const timetable = await unipa.timetable.fetch();
const grades = await unipa.grades.fetch();

console.log('🧪 Testing with stub data:');
console.log(`GPA: ${grades.getGPA()}`);
timetable.print();
```

### Development with HTML Saving

```typescript
// Save HTML responses for debugging or stub creation
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    saveHTML: true,  // Save all HTML responses to stub/ directory
  }
});

await unipa.account.login();
const timetable = await unipa.timetable.fetch();

// HTML files will be saved to stub/ directory for inspection
console.log('HTML files saved for debugging');
```

## Running Examples

You can run these examples using various TypeScript runners:

### Using tsx (recommended)

```bash
npm install -g tsx
tsx example-script.ts
```

### Using ts-node

```bash
npm install -g ts-node
ts-node example-script.ts
```

### Using Bun

```bash
bun run example-script.ts
```

For more examples, check the `examples/` directory in the OpenUNIPA repository.