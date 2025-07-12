# AttendanceController

The AttendanceController manages attendance records and provides detailed statistics for tracking class attendance across all subjects.

## Methods

### `fetch()`

Retrieves attendance data from UNIPA and returns a structured object with analysis methods.

```typescript
const attendance = await unipa.attendance.fetch();
```

**Parameters:** None

**Returns:** `Promise<AttendanceData>`

**Requires:** Prior authentication via `unipa.account.login()`

## AttendanceData Methods

The returned `AttendanceData` object provides comprehensive methods for attendance analysis and reporting.

### `getOverallAttendanceRate()`

Calculates the overall attendance rate across all subjects.

```typescript
const rate = attendance.getOverallAttendanceRate();
console.log(`Overall Attendance Rate: ${rate}%`);
```

**Returns:** `number` - Attendance rate as a percentage (0-100)

### `getSubjectSummaries()`

Returns attendance summaries for each subject.

```typescript
const summaries = attendance.getSubjectSummaries();
summaries.forEach(summary => {
  console.log(`${summary.subject}: ${summary.attendanceRate}%`);
});
```

**Returns:** `SubjectSummary[]` - Array of subject attendance summaries

### `getSubjectAttendance(subjectName: string)`

Gets detailed attendance records for a specific subject.

```typescript
const mathAttendance = attendance.getSubjectAttendance('数学');
console.log(`Math attendance: ${mathAttendance.length} records`);
```

**Parameters:**
- `subjectName`: Name of the subject

**Returns:** `AttendanceRecord[]` - Detailed attendance records for the subject

### `getStatusCounts()`

Returns count of different attendance statuses.

```typescript
const counts = attendance.getStatusCounts();
console.log(`Present: ${counts.present}, Absent: ${counts.absent}`);
```

**Returns:** `StatusCounts` - Object with counts for each attendance status

### `getLowAttendanceSubjects(threshold: number)`

Finds subjects with attendance below the specified threshold.

```typescript
const lowAttendance = attendance.getLowAttendanceSubjects(75);
console.log(`Subjects below 75%: ${lowAttendance.length}`);
```

**Parameters:**
- `threshold`: Minimum attendance rate (percentage)

**Returns:** `SubjectSummary[]` - Subjects below the threshold

### `getAttendanceByDateRange(from: Date, to: Date)`

Gets attendance records within a specific date range.

```typescript
const fromDate = new Date('2024-04-01');
const toDate = new Date('2024-04-30');
const aprilAttendance = attendance.getAttendanceByDateRange(fromDate, toDate);
```

**Parameters:**
- `from`: Start date
- `to`: End date

**Returns:** `AttendanceRecord[]` - Records within the date range

### `print()`

Displays formatted attendance summary in the console.

```typescript
attendance.print();
```

**Output Example:**
```
=== Attendance Summary ===
Overall Attendance Rate: 87.5%

Subject-wise Attendance:
┌─────────────────┬─────────┬─────────┬────────────────┬─────────────────┐
│ Subject         │ Present │ Absent  │ Total Classes  │ Attendance Rate │
├─────────────────┼─────────┼─────────┼────────────────┼─────────────────┤
│ 数学            │ 12      │ 2       │ 14             │ 85.7%           │
│ 英語            │ 13      │ 1       │ 14             │ 92.9%           │
│ 物理学          │ 10      │ 3       │ 13             │ 76.9%           │
│ プログラミング  │ 14      │ 0       │ 14             │ 100.0%          │
└─────────────────┴─────────┴─────────┴────────────────┴─────────────────┘

⚠️  Low Attendance Warning:
- 物理学: 76.9% (below 80% threshold)
```

## Usage Examples

### Basic Attendance Check

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

try {
  await unipa.account.login();
  const attendance = await unipa.attendance.fetch();
  
  console.log(`Overall Attendance: ${attendance.getOverallAttendanceRate()}%`);
  console.log(`Total Credits: ${attendance.getTotalEarnedCredits()}`);
  
  // Display formatted summary
  attendance.print();
} catch (error) {
  console.error('Failed to fetch attendance:', error);
}
```

### Detailed Attendance Analysis

```typescript
async function analyzeAttendance() {
  await unipa.account.login();
  const attendance = await unipa.attendance.fetch();
  
  console.log('=== Detailed Attendance Analysis ===\n');
  
  // Overall statistics
  const overallRate = attendance.getOverallAttendanceRate();
  const statusCounts = attendance.getStatusCounts();
  
  console.log(`📊 Overall Statistics:`);
  console.log(`   Attendance Rate: ${overallRate.toFixed(1)}%`);
  console.log(`   Present: ${statusCounts.present}`);
  console.log(`   Absent: ${statusCounts.absent}`);
  console.log(`   Late: ${statusCounts.late || 0}`);
  console.log(`   Excused: ${statusCounts.excused || 0}\n`);
  
  // Subject summaries
  const summaries = attendance.getSubjectSummaries();
  console.log(`📚 Subject Performance:`);
  summaries.forEach(summary => {
    const status = summary.attendanceRate >= 90 ? '✅' : 
                  summary.attendanceRate >= 80 ? '⚠️' : '❌';
    console.log(`   ${status} ${summary.subject}: ${summary.attendanceRate.toFixed(1)}%`);
  });
  
  // Identify problem areas
  const lowAttendance = attendance.getLowAttendanceSubjects(80);
  if (lowAttendance.length > 0) {
    console.log(`\n⚠️  Subjects needing attention (below 80%):`);
    lowAttendance.forEach(subject => {
      console.log(`   - ${subject.subject}: ${subject.attendanceRate.toFixed(1)}%`);
    });
  }
  
  // Monthly breakdown
  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const monthEnd = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0);
  
  const monthlyAttendance = attendance.getAttendanceByDateRange(monthStart, monthEnd);
  console.log(`\n📅 This Month's Attendance: ${monthlyAttendance.length} classes`);
}

await analyzeAttendance();
```

### Attendance Tracking and Alerts

```typescript
async function attendanceMonitoring() {
  await unipa.account.login();
  const attendance = await unipa.attendance.fetch();
  
  // Set alert thresholds
  const CRITICAL_THRESHOLD = 70;  // Critical attendance level
  const WARNING_THRESHOLD = 80;   // Warning level
  
  const overallRate = attendance.getOverallAttendanceRate();
  const lowAttendance = attendance.getLowAttendanceSubjects(WARNING_THRESHOLD);
  const criticalAttendance = attendance.getLowAttendanceSubjects(CRITICAL_THRESHOLD);
  
  console.log('=== Attendance Monitoring System ===\n');
  
  // Overall status
  if (overallRate < CRITICAL_THRESHOLD) {
    console.log('🚨 CRITICAL: Overall attendance is dangerously low!');
  } else if (overallRate < WARNING_THRESHOLD) {
    console.log('⚠️  WARNING: Overall attendance needs improvement');
  } else {
    console.log('✅ GOOD: Overall attendance is satisfactory');
  }
  
  console.log(`Overall Rate: ${overallRate.toFixed(1)}%\n`);
  
  // Critical subjects
  if (criticalAttendance.length > 0) {
    console.log('🚨 CRITICAL SUBJECTS (below 70%):');
    criticalAttendance.forEach(subject => {
      console.log(`   ${subject.subject}: ${subject.attendanceRate.toFixed(1)}%`);
      console.log(`   ⚡ Action Required: Contact professor immediately`);
    });
    console.log();
  }
  
  // Warning subjects
  if (lowAttendance.length > 0) {
    console.log('⚠️  WARNING SUBJECTS (below 80%):');
    lowAttendance.filter(s => s.attendanceRate >= CRITICAL_THRESHOLD).forEach(subject => {
      console.log(`   ${subject.subject}: ${subject.attendanceRate.toFixed(1)}%`);
      console.log(`   📝 Recommendation: Improve attendance immediately`);
    });
    console.log();
  }
  
  // Good subjects
  const goodSubjects = attendance.getSubjectSummaries().filter(s => s.attendanceRate >= WARNING_THRESHOLD);
  if (goodSubjects.length > 0) {
    console.log('✅ GOOD SUBJECTS (80% or above):');
    goodSubjects.forEach(subject => {
      console.log(`   ${subject.subject}: ${subject.attendanceRate.toFixed(1)}%`);
    });
  }
}

await attendanceMonitoring();
```

### Attendance Report Generation

```typescript
import fs from 'fs';

async function generateAttendanceReport() {
  await unipa.account.login();
  const attendance = await unipa.attendance.fetch();
  
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      overallRate: attendance.getOverallAttendanceRate(),
      statusCounts: attendance.getStatusCounts(),
      totalSubjects: attendance.getSubjectSummaries().length,
    },
    subjects: attendance.getSubjectSummaries(),
    alerts: {
      critical: attendance.getLowAttendanceSubjects(70),
      warning: attendance.getLowAttendanceSubjects(80),
    },
    recommendations: [],
  };
  
  // Generate recommendations
  if (report.summary.overallRate < 70) {
    report.recommendations.push('Immediate action required: Contact academic advisor');
    report.recommendations.push('Review class schedule and prioritize attendance');
  } else if (report.summary.overallRate < 80) {
    report.recommendations.push('Improve overall attendance to avoid academic issues');
    report.recommendations.push('Focus on subjects with lowest attendance rates');
  }
  
  if (report.alerts.critical.length > 0) {
    report.recommendations.push(`Critical subjects need immediate attention: ${report.alerts.critical.map(s => s.subject).join(', ')}`);
  }
  
  // Save report
  const filename = `attendance_report_${new Date().toISOString().split('T')[0]}.json`;
  fs.writeFileSync(filename, JSON.stringify(report, null, 2));
  
  console.log('=== Attendance Report Generated ===');
  console.log(`File: ${filename}`);
  console.log(`Overall Rate: ${report.summary.overallRate.toFixed(1)}%`);
  console.log(`Subjects Monitored: ${report.summary.totalSubjects}`);
  
  if (report.recommendations.length > 0) {
    console.log('\nRecommendations:');
    report.recommendations.forEach(rec => console.log(`- ${rec}`));
  }
}

await generateAttendanceReport();
```

## Data Structure

Attendance data includes various status types and detailed records:

```typescript
interface AttendanceRecord {
  date: Date;
  subject: string;
  status: AttendanceStatus;
  period?: string;      // Class period
  classroom?: string;   // Location
  instructor?: string;  // Professor
  notes?: string;       // Additional notes
}

enum AttendanceStatus {
  PRESENT = 'present',        // 出席
  ABSENT = 'absent',          // 欠席  
  LATE = 'late',              // 遅刻
  EARLY_LEAVE = 'early_leave', // 早退
  EXCUSED = 'excused',        // 公欠
  MOURNING = 'mourning',      // 忌引
  SICK = 'sick',              // 病欠
  MAKEUP = 'makeup',          // 補講
  CANCELED = 'canceled',      // 休講
}

interface SubjectSummary {
  subject: string;
  totalClasses: number;
  attendedClasses: number;
  attendanceRate: number;
  statusBreakdown: Record<AttendanceStatus, number>;
}

interface StatusCounts {
  present: number;
  absent: number;
  late: number;
  early_leave: number;
  excused: number;
  mourning: number;
  sick: number;
  makeup: number;
  canceled: number;
}
```

## Error Handling

```typescript
async function safeAttendanceFetch() {
  try {
    await unipa.account.login();
    const attendance = await unipa.attendance.fetch();
    
    // Validate data
    const rate = attendance.getOverallAttendanceRate();
    if (isNaN(rate) || rate < 0 || rate > 100) {
      console.warn('Invalid attendance rate detected:', rate);
    }
    
    return attendance;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        console.error('Authentication required for attendance access');
      } else if (error.message.includes('parsing')) {
        console.error('Failed to parse attendance data');
      } else if (error.message.includes('no data')) {
        console.warn('No attendance data available');
      } else {
        console.error('Attendance fetch failed:', error.message);
      }
    }
    throw error;
  }
}
```

## Best Practices

1. **Regular monitoring** - Check attendance weekly or bi-weekly
2. **Set thresholds** - Define warning and critical attendance levels
3. **Track trends** - Monitor attendance changes over time
4. **Proactive alerts** - Set up notifications for low attendance
5. **Subject-specific focus** - Pay attention to problem subjects
6. **Use the print() method** - Quick visual summary of attendance status

## Related Controllers

- [AccountController](./account-controller) - Required for authentication
- [TimetableController](./timetable-controller) - Class schedule information
- [GradesController](./grades-controller) - Attendance affects academic performance
- [NoticeController](./notice-controller) - Attendance-related announcements