# GradesController

The GradesController handles grade information, GPA calculation, and credit summaries from the UNIPA system.

## Methods

### `fetch()`

Retrieves grade data from UNIPA and returns a structured object with calculation methods.

```typescript
const grades = await unipa.grades.fetch();
```

**Parameters:** None

**Returns:** `Promise<GradeData>`

**Requires:** Prior authentication via `unipa.account.login()`

## GradeData Methods

The returned `GradeData` object provides comprehensive methods for accessing and analyzing grade information.

### `getGPA()`

Calculates and returns the Grade Point Average.

```typescript
const gpa = grades.getGPA();
console.log(`Current GPA: ${gpa}`);
```

**Returns:** `number` - GPA value (typically 0.0 - 4.0)

### `getTotalEarnedCredits()`

Returns the total number of credits earned from passed courses.

```typescript
const credits = grades.getTotalEarnedCredits();
console.log(`Total Credits: ${credits}`);
```

**Returns:** `number` - Total earned credits

### Additional Methods

The GradeData object typically provides additional methods for detailed analysis:

```typescript
// Get grades by semester/year
const semesterGrades = grades.getGradesBySemester('2024-1');

// Get failed courses
const failedCourses = grades.getFailedCourses();

// Get honor roll status
const isHonorRoll = grades.isHonorRoll();

// Get credit summary by category
const creditSummary = grades.getCreditSummary();

// Get grade distribution
const gradeDistribution = grades.getGradeDistribution();
```

## Usage Examples

### Basic Grade Information

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

try {
  await unipa.account.login();
  const grades = await unipa.grades.fetch();
  
  console.log('=== Grade Summary ===');
  console.log(`GPA: ${grades.getGPA()}`);
  console.log(`Total Credits: ${grades.getTotalEarnedCredits()}`);
} catch (error) {
  console.error('Failed to fetch grades:', error);
}
```

### Comprehensive Grade Analysis

```typescript
async function analyzeGrades() {
  await unipa.account.login();
  const grades = await unipa.grades.fetch();
  
  console.log('=== Academic Performance Report ===\n');
  
  // Basic metrics
  const gpa = grades.getGPA();
  const totalCredits = grades.getTotalEarnedCredits();
  
  console.log(`📊 Overall Performance:`);
  console.log(`   GPA: ${gpa.toFixed(2)}`);
  console.log(`   Credits Earned: ${totalCredits}`);
  
  // Performance categorization
  let performanceLevel = '';
  if (gpa >= 3.5) performanceLevel = 'Excellent (Honor Roll)';
  else if (gpa >= 3.0) performanceLevel = 'Good';
  else if (gpa >= 2.5) performanceLevel = 'Satisfactory';
  else if (gpa >= 2.0) performanceLevel = 'Needs Improvement';
  else performanceLevel = 'Poor';
  
  console.log(`   Performance Level: ${performanceLevel}\n`);
  
  // Additional analysis (if methods exist)
  const failedCourses = grades.getFailedCourses?.();
  if (failedCourses && failedCourses.length > 0) {
    console.log(`⚠️  Failed Courses: ${failedCourses.length}`);
    failedCourses.forEach(course => {
      console.log(`   - ${course.name}: ${course.grade}`);
    });
    console.log();
  }
  
  // Credit summary
  const creditSummary = grades.getCreditSummary?.();
  if (creditSummary) {
    console.log(`📚 Credit Summary:`);
    console.log(`   Required: ${creditSummary.required}`);
    console.log(`   Earned: ${creditSummary.earned}`);
    console.log(`   Remaining: ${creditSummary.required - creditSummary.earned}`);
    console.log(`   Progress: ${((creditSummary.earned / creditSummary.required) * 100).toFixed(1)}%`);
  }
}

await analyzeGrades();
```

### Grade Tracking Over Time

```typescript
import fs from 'fs';

async function trackGrades() {
  await unipa.account.login();
  const grades = await unipa.grades.fetch();
  
  const currentData = {
    date: new Date().toISOString(),
    gpa: grades.getGPA(),
    credits: grades.getTotalEarnedCredits(),
    timestamp: Date.now(),
  };
  
  // Load historical data
  let history = [];
  try {
    const historyData = fs.readFileSync('grade_history.json', 'utf8');
    history = JSON.parse(historyData);
  } catch {
    console.log('No previous grade history found, starting new tracking.');
  }
  
  // Add current data
  history.push(currentData);
  
  // Save updated history
  fs.writeFileSync('grade_history.json', JSON.stringify(history, null, 2));
  
  console.log('=== Grade Progress Tracking ===');
  console.log(`Current GPA: ${currentData.gpa}`);
  console.log(`Current Credits: ${currentData.credits}`);
  
  if (history.length > 1) {
    const previous = history[history.length - 2];
    const gpaChange = currentData.gpa - previous.gpa;
    const creditChange = currentData.credits - previous.credits;
    
    console.log(`\n📈 Changes since last check:`);
    console.log(`   GPA: ${gpaChange >= 0 ? '+' : ''}${gpaChange.toFixed(3)}`);
    console.log(`   Credits: ${creditChange >= 0 ? '+' : ''}${creditChange}`);
  }
  
  console.log(`\nData saved to grade_history.json`);
}

await trackGrades();
```

### Grade Report Generation

```typescript
async function generateGradeReport() {
  await unipa.account.login();
  const grades = await unipa.grades.fetch();
  
  const report = {
    generatedAt: new Date().toISOString(),
    student: {
      gpa: grades.getGPA(),
      totalCredits: grades.getTotalEarnedCredits(),
    },
    analysis: {
      isHonorRoll: grades.getGPA() >= 3.5,
      needsImprovement: grades.getGPA() < 2.5,
      graduationProgress: null, // Calculate based on degree requirements
    },
    recommendations: [],
  };
  
  // Generate recommendations
  if (report.student.gpa < 2.0) {
    report.recommendations.push('Consider academic counseling and tutoring services');
    report.recommendations.push('Review study habits and time management');
  } else if (report.student.gpa < 3.0) {
    report.recommendations.push('Focus on improving weaker subjects');
    report.recommendations.push('Consider study groups or additional office hours');
  } else if (report.student.gpa >= 3.5) {
    report.recommendations.push('Excellent work! Consider taking on more challenging courses');
    report.recommendations.push('Look into honor society membership opportunities');
  }
  
  // Save report
  fs.writeFileSync(
    `grade_report_${new Date().toISOString().split('T')[0]}.json`,
    JSON.stringify(report, null, 2)
  );
  
  console.log('=== Grade Report Generated ===');
  console.log(`GPA: ${report.student.gpa}`);
  console.log(`Credits: ${report.student.totalCredits}`);
  console.log('\nRecommendations:');
  report.recommendations.forEach(rec => console.log(`- ${rec}`));
}

await generateGradeReport();
```

## Data Structure

Grade data typically includes:

```typescript
interface CourseGrade {
  courseCode: string;    // e.g., "MATH101"
  courseName: string;    // e.g., "Calculus I"
  credits: number;       // Credit hours
  grade: string;         // Letter grade (A, B, C, D, F)
  gradePoints: number;   // Numeric grade points
  semester: string;      // e.g., "2024-1"
  year: number;          // Academic year
  category?: string;     // Course category (required, elective, etc.)
}

interface GradeData {
  courses: CourseGrade[];
  gpa: number;
  totalCredits: number;
  earnedCredits: number;
  qualityPoints: number;
}
```

## Calculation Methods

### GPA Calculation

```typescript
// Typical GPA calculation formula:
// GPA = Total Quality Points / Total Credit Hours Attempted

function calculateGPA(courses: CourseGrade[]): number {
  let totalQualityPoints = 0;
  let totalCreditHours = 0;
  
  courses.forEach(course => {
    totalQualityPoints += course.gradePoints * course.credits;
    totalCreditHours += course.credits;
  });
  
  return totalCreditHours > 0 ? totalQualityPoints / totalCreditHours : 0;
}
```

### Credit Summaries

```typescript
function getCreditSummary(courses: CourseGrade[]) {
  const summary = {
    total: 0,
    earned: 0,
    failed: 0,
    inProgress: 0,
  };
  
  courses.forEach(course => {
    summary.total += course.credits;
    if (course.grade !== 'F' && course.grade !== 'I') {
      summary.earned += course.credits;
    } else if (course.grade === 'F') {
      summary.failed += course.credits;
    } else if (course.grade === 'I') {
      summary.inProgress += course.credits;
    }
  });
  
  return summary;
}
```

## Error Handling

```typescript
async function safeGradeFetch() {
  try {
    await unipa.account.login();
    const grades = await unipa.grades.fetch();
    
    // Validate data
    const gpa = grades.getGPA();
    if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
      console.warn('Unusual GPA value detected:', gpa);
    }
    
    return grades;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        console.error('Authentication required for grade access');
      } else if (error.message.includes('parsing')) {
        console.error('Failed to parse grade data');
      } else if (error.message.includes('network')) {
        console.error('Network error accessing grades');
      } else {
        console.error('Grade fetch failed:', error.message);
      }
    }
    throw error;
  }
}
```

## Performance Tips

1. **Cache grade data** - Grades don't change frequently
2. **Batch operations** - Fetch grades once, perform multiple calculations
3. **Use calculated fields** - Store computed values rather than recalculating

## Best Practices

1. **Verify calculations** - Cross-check GPA with manual calculation
2. **Handle edge cases** - Account for incomplete grades, transfers, etc.
3. **Track changes** - Monitor grade updates over time
4. **Backup data** - Save grade information locally
5. **Respect privacy** - Secure grade data appropriately

## Related Controllers

- [AccountController](./account-controller) - Required for authentication
- [TimetableController](./timetable-controller) - Current course schedule
- [AttendanceController](./attendance-controller) - Attendance affects grades
- [NoticeController](./notice-controller) - Grade-related announcements