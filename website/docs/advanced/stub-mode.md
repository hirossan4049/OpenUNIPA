# Stub Mode

Stub mode allows you to test and develop with OpenUNIPA using local HTML files instead of making real network requests to UNIPA. This is essential for development, testing, and demonstrations.

## What is Stub Mode?

Stub mode uses pre-saved HTML files that contain sample UNIPA responses. When enabled, OpenUNIPA reads from these local files instead of making HTTP requests to the actual UNIPA system.

### Benefits

- **No network dependency** - Work offline or with poor connectivity
- **Consistent test data** - Reproducible results for testing
- **Faster development** - No waiting for network requests
- **No authentication required** - Test without real credentials
- **Safe experimentation** - No risk of affecting real data

## Enabling Stub Mode

Set the `stub` option to `true` in the DEBUG configuration:

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: 'any_value',      // Can be anything in stub mode
  password: 'any_value',      // Can be anything in stub mode
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    stub: true,
  }
});

// No need to login in stub mode
const timetable = await unipa.timetable.fetch();
const grades = await unipa.grades.fetch();
```

## Stub File Structure

Stub files are stored in the `stub/` directory with specific naming conventions:

```
stub/
├── login.html                    # Login page HTML
├── timetable.html               # Timetable data
├── grades.html                  # Grade information  
├── attendance.html              # Attendance records
├── notices.html                 # Notice listings
├── menu_student.html            # Student menu
├── menu_academic.html           # Academic menu
└── other_pages.html             # Additional pages
```

### File Naming Rules

Files are named based on the URL path and parameters:

- Base pages: `{page}.html` (e.g., `timetable.html`)
- Menu pages: `menu_{type}.html` (e.g., `menu_student.html`)
- Special characters in URLs are encoded or replaced

## Creating Stub Files

### Method 1: HTML Saving Mode

Use the `saveHTML` option to automatically capture real UNIPA responses:

```typescript
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    saveHTML: true,  // Save all responses to stub/
  }
});

// Perform operations to capture HTML
await unipa.account.login();        // Saves login.html
await unipa.timetable.fetch();      // Saves timetable.html
await unipa.grades.fetch();         // Saves grades.html
await unipa.attendance.fetch();     // Saves attendance.html
await unipa.notice.fetch();         // Saves notices.html
```

### Method 2: Manual Creation

Create stub files manually for custom test scenarios:

```typescript
// Create custom test data
import fs from 'fs';

const customTimetableHTML = `
<html>
<body>
  <table class="timetable">
    <tr>
      <td class="time">1限</td>
      <td class="monday">数学</td>
      <td class="tuesday">英語</td>
      <!-- ... more cells ... -->
    </tr>
  </table>
</body>
</html>
`;

fs.writeFileSync('./stub/timetable.html', customTimetableHTML);
```

## Usage Examples

### Basic Stub Testing

```typescript
// Simple stub mode test
const unipa = OpenUNIPA({
  username: 'test_user',
  password: 'test_pass',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: { stub: true }
});

console.log('🧪 Testing with stub data...');

const timetable = await unipa.timetable.fetch();
timetable.print();

const grades = await unipa.grades.fetch();
console.log(`Test GPA: ${grades.getGPA()}`);
console.log(`Test Credits: ${grades.getTotalEarnedCredits()}`);
```

### Development Workflow

```typescript
// Development workflow combining both modes
class DevelopmentHelper {
  static async captureStubs() {
    // First, capture real data
    const realUnipa = OpenUNIPA({
      username: process.env.UNIPA_USER_ID!,
      password: process.env.UNIPA_PLAIN_PASSWORD!,
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      DEBUG: { saveHTML: true }
    });

    console.log('📥 Capturing real UNIPA data...');
    await realUnipa.account.login();
    await realUnipa.timetable.fetch();
    await realUnipa.grades.fetch();
    console.log('✅ Stubs captured');
  }

  static async testWithStubs() {
    // Then test with captured data
    const stubUnipa = OpenUNIPA({
      username: 'dev_user',
      password: 'dev_pass',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      DEBUG: { stub: true }
    });

    console.log('🧪 Testing with stub data...');
    const grades = await stubUnipa.grades.fetch();
    const attendance = await stubUnipa.attendance.fetch();
    
    console.log(`GPA: ${grades.getGPA()}`);
    console.log(`Attendance: ${attendance.getOverallAttendanceRate()}%`);
  }
}

// Development workflow
await DevelopmentHelper.captureStubs();
await DevelopmentHelper.testWithStubs();
```

### Testing Different Scenarios

Create multiple stub file sets for different test scenarios:

```typescript
import fs from 'fs';
import path from 'path';

class StubManager {
  static scenarios = {
    'good-student': {
      gpa: '3.8',
      attendance: '95%',
      notices: 'few-unread'
    },
    'struggling-student': {
      gpa: '2.1', 
      attendance: '65%',
      notices: 'many-urgent'
    },
    'empty-data': {
      gpa: 'N/A',
      attendance: 'no-data',
      notices: 'none'
    }
  };

  static async loadScenario(scenarioName: string) {
    const scenarioDir = `./stubs/${scenarioName}`;
    const stubDir = './stub';

    // Copy scenario files to active stub directory
    if (fs.existsSync(scenarioDir)) {
      fs.readdirSync(scenarioDir).forEach(file => {
        fs.copyFileSync(
          path.join(scenarioDir, file),
          path.join(stubDir, file)
        );
      });
      console.log(`📁 Loaded scenario: ${scenarioName}`);
    } else {
      throw new Error(`Scenario not found: ${scenarioName}`);
    }
  }

  static async testScenario(scenarioName: string) {
    await this.loadScenario(scenarioName);
    
    const unipa = OpenUNIPA({
      username: 'test', password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      DEBUG: { stub: true }
    });

    console.log(`\n=== Testing Scenario: ${scenarioName} ===`);
    
    const grades = await unipa.grades.fetch();
    const attendance = await unipa.attendance.fetch();
    const notices = await unipa.notice.fetch();

    console.log(`GPA: ${grades.getGPA()}`);
    console.log(`Attendance: ${attendance.getOverallAttendanceRate()}%`);
    console.log(`Unread Notices: ${notices.getUnreadNotices().length}`);
  }
}

// Test all scenarios
for (const scenario of Object.keys(StubManager.scenarios)) {
  await StubManager.testScenario(scenario);
}
```

## Advanced Stub Techniques

### Dynamic Stub Generation

Create stubs programmatically for specific test cases:

```typescript
class StubGenerator {
  static generateGradeHTML(courses: Array<{name: string, grade: string, credits: number}>) {
    const rows = courses.map(course => `
      <tr>
        <td>${course.name}</td>
        <td>${course.grade}</td>
        <td>${course.credits}</td>
      </tr>
    `).join('');

    return `
      <html>
        <body>
          <table class="grades">
            <thead>
              <tr><th>Course</th><th>Grade</th><th>Credits</th></tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  static generateAttendanceHTML(subjects: Array<{name: string, attended: number, total: number}>) {
    const rows = subjects.map(subject => `
      <tr>
        <td>${subject.name}</td>
        <td>${subject.attended}</td>
        <td>${subject.total}</td>
        <td>${((subject.attended / subject.total) * 100).toFixed(1)}%</td>
      </tr>
    `).join('');

    return `
      <html>
        <body>
          <table class="attendance">
            <thead>
              <tr><th>Subject</th><th>Attended</th><th>Total</th><th>Rate</th></tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  static async createTestStubs() {
    // Create stub for high-performing student
    const goodGrades = [
      { name: '数学', grade: 'A', credits: 3 },
      { name: '英語', grade: 'A-', credits: 2 },
      { name: '物理学', grade: 'B+', credits: 3 },
    ];

    const goodAttendance = [
      { name: '数学', attended: 14, total: 15 },
      { name: '英語', attended: 13, total: 14 },
      { name: '物理学', attended: 12, total: 13 },
    ];

    fs.writeFileSync('./stub/grades.html', this.generateGradeHTML(goodGrades));
    fs.writeFileSync('./stub/attendance.html', this.generateAttendanceHTML(goodAttendance));
    
    console.log('✅ Test stubs generated');
  }
}

await StubGenerator.createTestStubs();
```

### Stub Validation

Verify that stub files contain expected data:

```typescript
class StubValidator {
  static async validateStubs() {
    const requiredFiles = [
      'login.html',
      'timetable.html', 
      'grades.html',
      'attendance.html',
      'notices.html'
    ];

    console.log('🔍 Validating stub files...');

    for (const file of requiredFiles) {
      const filePath = `./stub/${file}`;
      
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Missing: ${file}`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const size = (content.length / 1024).toFixed(1);
      
      // Basic content validation
      if (content.includes('<html') && content.includes('</html>')) {
        console.log(`✅ ${file} (${size}KB) - Valid HTML`);
      } else {
        console.log(`⚠️  ${file} (${size}KB) - Invalid HTML structure`);
      }

      // File-specific validation
      if (file === 'grades.html' && !content.includes('grade')) {
        console.log(`⚠️  ${file} - May not contain grade data`);
      }
      
      if (file === 'timetable.html' && !content.includes('table')) {
        console.log(`⚠️  ${file} - May not contain timetable data`);
      }
    }
  }

  static async testStubParsing() {
    console.log('\n🧪 Testing stub parsing...');
    
    const unipa = OpenUNIPA({
      username: 'test', password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      DEBUG: { stub: true }
    });

    try {
      const grades = await unipa.grades.fetch();
      const gpa = grades.getGPA();
      
      if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
        console.log(`⚠️  Unusual GPA value: ${gpa}`);
      } else {
        console.log(`✅ GPA parsing: ${gpa}`);
      }
    } catch (error) {
      console.log(`❌ Grade parsing failed: ${error.message}`);
    }

    try {
      const attendance = await unipa.attendance.fetch();
      const rate = attendance.getOverallAttendanceRate();
      
      if (isNaN(rate) || rate < 0 || rate > 100) {
        console.log(`⚠️  Unusual attendance rate: ${rate}%`);
      } else {
        console.log(`✅ Attendance parsing: ${rate}%`);
      }
    } catch (error) {
      console.log(`❌ Attendance parsing failed: ${error.message}`);
    }
  }
}

await StubValidator.validateStubs();
await StubValidator.testStubParsing();
```

## Best Practices

### 1. Maintain Multiple Stub Sets

Keep different stub files for various scenarios:

```
stubs/
├── production/          # Real captured data
├── development/         # Development test data
├── edge-cases/         # Edge case scenarios
├── performance/        # Large datasets
└── minimal/           # Minimal valid data
```

### 2. Version Control Stub Files

Include stub files in version control for consistent testing:

```gitignore
# Include essential stubs
stub/*.html

# But exclude personal data
stub/real-*.html
```

### 3. Regular Stub Updates

Update stubs regularly to match current UNIPA structure:

```typescript
// Automated stub refresh
async function refreshStubs() {
  const date = new Date().toISOString().split('T')[0];
  console.log(`📅 Refreshing stubs: ${date}`);
  
  // Backup current stubs
  fs.mkdirSync(`./stub-backups/${date}`, { recursive: true });
  fs.readdirSync('./stub').forEach(file => {
    fs.copyFileSync(`./stub/${file}`, `./stub-backups/${date}/${file}`);
  });
  
  // Capture fresh stubs
  const unipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
    DEBUG: { saveHTML: true }
  });
  
  await unipa.account.login();
  await unipa.timetable.fetch();
  await unipa.grades.fetch();
  
  console.log('✅ Stubs refreshed and backed up');
}

// Run weekly
await refreshStubs();
```

### 4. Test Both Modes

Always test both stub and real modes:

```typescript
async function comprehensiveTest() {
  console.log('🧪 Testing stub mode...');
  const stubUnipa = OpenUNIPA({
    username: 'test', password: 'test',
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
    DEBUG: { stub: true }
  });
  
  const stubGrades = await stubUnipa.grades.fetch();
  console.log(`Stub GPA: ${stubGrades.getGPA()}`);
  
  console.log('🌐 Testing real mode...');
  const realUnipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  });
  
  await realUnipa.account.login();
  const realGrades = await realUnipa.grades.fetch();
  console.log(`Real GPA: ${realGrades.getGPA()}`);
}
```

### 5. Document Stub Contents

Document what each stub file contains:

```typescript
// stub-manifest.json
{
  "generated": "2024-01-15T10:30:00Z",
  "files": {
    "grades.html": {
      "description": "Sample grades with 3.8 GPA, 15 courses",
      "scenario": "high-performing student",
      "courses": 15,
      "gpa": 3.8
    },
    "attendance.html": {
      "description": "95% overall attendance, 5 subjects",
      "scenario": "good attendance record",
      "subjects": 5,
      "rate": 95
    }
  }
}
```

Stub mode is essential for reliable development and testing with OpenUNIPA. Use it extensively during development, and maintain good stub hygiene for consistent results.