# Debugging

OpenUNIPA provides several debugging features to help developers troubleshoot issues and understand the library's behavior.

## Debug Configuration

Enable debugging features through the `DEBUG` configuration object:

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    stub: false,       // Use stub data instead of real requests
    saveHTML: true,    // Save HTML responses for inspection
  }
});
```

## Debug Options

### `saveHTML`

When enabled, saves all HTML responses to the `stub/` directory for inspection:

```typescript
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    saveHTML: true,
  }
});

await unipa.account.login();
const timetable = await unipa.timetable.fetch();

// HTML files will be saved to:
// stub/login.html
// stub/timetable.html
// etc.
```

### `stub`

Use local stub files instead of making real network requests:

```typescript
const unipa = OpenUNIPA({
  username: 'test_user',      // Can be any value in stub mode
  password: 'test_password',  // Can be any value in stub mode
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    stub: true,
  }
});

// No authentication needed in stub mode
const timetable = await unipa.timetable.fetch();
timetable.print();
```

## Stub File Management

### File Naming Convention

Stub files are stored in the `stub/` directory with URL-encoded names:

```
stub/
├── login.html                    # Login page
├── timetable.html               # Timetable data
├── grades.html                  # Grade information
├── attendance.html              # Attendance records
├── notices.html                 # Notice listings
└── menu_*.html                  # Various menu pages
```

### Creating Stub Files

1. **Enable HTML saving** to capture real responses:

```typescript
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    saveHTML: true,
  }
});

await unipa.account.login();
await unipa.timetable.fetch();
await unipa.grades.fetch();
// HTML files saved to stub/ directory
```

2. **Use stub files** for testing:

```typescript
const unipa = OpenUNIPA({
  username: 'any_username',
  password: 'any_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    stub: true,
  }
});

// Uses saved HTML files instead of real requests
const timetable = await unipa.timetable.fetch();
```

## Error Debugging

### Common Error Scenarios

#### Authentication Errors

```typescript
try {
  await unipa.account.login();
} catch (error) {
  console.error('Login failed:', error.message);
  
  // Check for specific error types
  if (error.message.includes('invalid credentials')) {
    console.log('🔍 Debug: Check username and password');
  } else if (error.message.includes('CSRF token')) {
    console.log('🔍 Debug: Login form parsing issue');
    console.log('   → Check saved login.html for form structure');
  } else if (error.message.includes('network')) {
    console.log('🔍 Debug: Network connectivity issue');
    console.log('   → Check internet connection and UNIPA availability');
  }
}
```

#### Data Parsing Errors

```typescript
try {
  const timetable = await unipa.timetable.fetch();
} catch (error) {
  if (error.message.includes('parsing')) {
    console.error('Parsing error:', error.message);
    console.log('🔍 Debug: Check timetable.html structure');
    console.log('   → UNIPA may have changed their HTML format');
    console.log('   → Compare with working stub files');
  }
}
```

### Debugging Workflow

1. **Enable HTML saving** to capture responses
2. **Inspect saved HTML files** for structure changes
3. **Compare with working stub files** to identify differences
4. **Use stub mode** to test fixes without repeated network requests

```typescript
// Step 1: Capture current HTML
const debugUnipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: { saveHTML: true }
});

try {
  await debugUnipa.account.login();
  await debugUnipa.timetable.fetch();
} catch (error) {
  console.log('Error occurred, HTML saved for inspection');
}

// Step 2: Test with stub data
const stubUnipa = OpenUNIPA({
  username: 'test', password: 'test',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: { stub: true }
});

const timetable = await stubUnipa.timetable.fetch();
```

## Performance Debugging

### Request Timing

Monitor request performance:

```typescript
async function timedOperation() {
  console.time('UNIPA Operations');
  
  await unipa.account.login();
  console.timeLog('UNIPA Operations', 'Login complete');
  
  const timetable = await unipa.timetable.fetch();
  console.timeLog('UNIPA Operations', 'Timetable fetched');
  
  const grades = await unipa.grades.fetch();
  console.timeLog('UNIPA Operations', 'Grades fetched');
  
  console.timeEnd('UNIPA Operations');
}

await timedOperation();
```

**Example Output:**
```
UNIPA Operations: 1247.123ms Login complete
UNIPA Operations: 2891.456ms Timetable fetched
UNIPA Operations: 4102.789ms Grades fetched
UNIPA Operations: 4102.789ms
```

### Memory Usage

Track memory usage for large operations:

```typescript
function getMemoryUsage() {
  const used = process.memoryUsage();
  return {
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
  };
}

console.log('Memory before:', getMemoryUsage());

await unipa.account.login();
const data = await unipa.grades.fetch();

console.log('Memory after:', getMemoryUsage());
```

## Network Debugging

### Request Inspection

Enable detailed network logging (implementation-specific):

```typescript
// This would be implemented in the Request class
class DebugRequest extends Request {
  async fetch(url: string, options?: RequestInit) {
    console.log(`🌐 Request: ${options?.method || 'GET'} ${url}`);
    console.log(`   Headers:`, options?.headers);
    
    const response = await super.fetch(url, options);
    
    console.log(`✅ Response: ${response.status} ${response.statusText}`);
    console.log(`   Size: ${response.headers.get('content-length')} bytes`);
    
    return response;
  }
}
```

### Connection Testing

Test UNIPA connectivity:

```typescript
async function testConnection() {
  const univa = UnivList.KINDAI.HIGASHI_OSAKA;
  
  try {
    const response = await fetch(univa.baseURL);
    console.log(`✅ UNIPA accessible: ${response.status}`);
  } catch (error) {
    console.error(`❌ UNIPA not accessible:`, error.message);
    console.log('🔍 Check network connection and university URL');
  }
}

await testConnection();
```

## Debugging Tools

### Development Helper Script

Create a debugging helper script:

```typescript
// debug-helper.ts
import { OpenUNIPA, UnivList } from 'open-unipa';
import fs from 'fs';

export class DebugHelper {
  static async captureAllData() {
    const unipa = OpenUNIPA({
      username: process.env.UNIPA_USER_ID!,
      password: process.env.UNIPA_PLAIN_PASSWORD!,
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      DEBUG: { saveHTML: true }
    });

    console.log('🔧 Capturing all UNIPA pages...');
    
    try {
      await unipa.account.login();
      await unipa.timetable.fetch();
      await unipa.grades.fetch();
      await unipa.attendance.fetch();
      await unipa.notice.fetch();
      
      console.log('✅ All pages captured to stub/ directory');
    } catch (error) {
      console.error('❌ Capture failed:', error.message);
    }
  }

  static async compareStubFiles() {
    const stubDir = './stub';
    const files = fs.readdirSync(stubDir);
    
    console.log('📁 Available stub files:');
    files.forEach(file => {
      const stats = fs.statSync(`${stubDir}/${file}`);
      console.log(`   ${file} (${stats.size} bytes, ${stats.mtime.toISOString()})`);
    });
  }

  static async testWithStubs() {
    const unipa = OpenUNIPA({
      username: 'test', password: 'test',
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
      DEBUG: { stub: true }
    });

    console.log('🧪 Testing with stub data...');
    
    try {
      const timetable = await unipa.timetable.fetch();
      const grades = await unipa.grades.fetch();
      
      console.log('✅ Stub mode working correctly');
      console.log(`   GPA: ${grades.getGPA()}`);
      console.log(`   Timetable loaded successfully`);
    } catch (error) {
      console.error('❌ Stub test failed:', error.message);
    }
  }
}

// Usage
await DebugHelper.captureAllData();
await DebugHelper.compareStubFiles();
await DebugHelper.testWithStubs();
```

### Debug Information Collection

Collect comprehensive debug information:

```typescript
async function collectDebugInfo() {
  console.log('=== OpenUNIPA Debug Information ===\n');
  
  // Environment
  console.log('📊 Environment:');
  console.log(`   Node.js: ${process.version}`);
  console.log(`   Platform: ${process.platform}`);
  console.log(`   OpenUNIPA: ${require('open-unipa/package.json').version}`);
  console.log();
  
  // Configuration
  console.log('⚙️  Configuration:');
  console.log(`   University: ${UnivList.KINDAI.HIGASHI_OSAKA.baseURL}`);
  console.log(`   Debug mode: ${process.env.NODE_ENV === 'development'}`);
  console.log();
  
  // Connectivity
  console.log('🌐 Connectivity:');
  try {
    const start = Date.now();
    await fetch(UnivList.KINDAI.HIGASHI_OSAKA.baseURL);
    const latency = Date.now() - start;
    console.log(`   UNIPA reachable: ✅ (${latency}ms)`);
  } catch (error) {
    console.log(`   UNIPA reachable: ❌ (${error.message})`);
  }
  
  // Stub files
  console.log('📁 Stub files:');
  try {
    const files = fs.readdirSync('./stub');
    console.log(`   Available: ${files.length} files`);
    files.slice(0, 5).forEach(file => console.log(`   - ${file}`));
    if (files.length > 5) console.log(`   ... and ${files.length - 5} more`);
  } catch {
    console.log('   No stub directory found');
  }
}

await collectDebugInfo();
```

## Best Practices

1. **Always use stub mode** for development and testing
2. **Save HTML regularly** to track UNIPA changes
3. **Test edge cases** with different stub data
4. **Monitor performance** in production environments
5. **Keep debug logs** for troubleshooting
6. **Version control stub files** for consistent testing

## Common Issues

### HTML Structure Changes

UNIPA may update their HTML structure, breaking parsers:

1. **Capture new HTML** with `saveHTML: true`
2. **Compare with working versions** to identify changes
3. **Update selectors** in the parser code
4. **Test with stub data** before deployment

### Session Expiry

Long-running applications may encounter session expiry:

```typescript
async function robustOperation() {
  try {
    return await unipa.grades.fetch();
  } catch (error) {
    if (error.message.includes('authentication')) {
      console.log('Session expired, re-authenticating...');
      await unipa.account.login();
      return await unipa.grades.fetch();
    }
    throw error;
  }
}
```

### Rate Limiting

Avoid making too many requests in quick succession:

```typescript
async function respectfulFetching() {
  await unipa.account.login();
  
  const timetable = await unipa.timetable.fetch();
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
  
  const grades = await unipa.grades.fetch();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const attendance = await unipa.attendance.fetch();
}
```