# Error Handling

OpenUNIPA provides comprehensive error handling mechanisms to help you build robust applications that gracefully handle various failure scenarios.

## Error Types

OpenUNIPA can encounter several types of errors during operation:

### Authentication Errors

**Invalid Credentials**
```typescript
try {
  await unipa.account.login();
} catch (error) {
  if (error.message.includes('invalid credentials')) {
    console.error('Login failed: Check username and password');
    // Handle credential error
  }
}
```

**Session Expiry**
```typescript
try {
  const grades = await unipa.grades.fetch();
} catch (error) {
  if (error.message.includes('authentication required')) {
    console.log('Session expired, re-authenticating...');
    await unipa.account.login();
    const grades = await unipa.grades.fetch();
  }
}
```

### Network Errors

**Connection Issues**
```typescript
try {
  await unipa.account.login();
} catch (error) {
  if (error.message.includes('network') || error.name === 'NetworkError') {
    console.error('Network error: Check internet connection');
    // Implement retry logic or offline mode
  }
}
```

**Timeout Errors**
```typescript
try {
  const attendance = await unipa.attendance.fetch();
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Request timed out: UNIPA may be slow');
    // Retry with longer timeout or try again later
  }
}
```

### Parsing Errors

**HTML Structure Changes**
```typescript
try {
  const timetable = await unipa.timetable.fetch();
} catch (error) {
  if (error.message.includes('parsing') || error.message.includes('selector')) {
    console.error('Parsing failed: UNIPA structure may have changed');
    // Log error details for debugging
    console.error('Error details:', error);
  }
}
```

**Missing Data**
```typescript
try {
  const notices = await unipa.notice.fetch();
} catch (error) {
  if (error.message.includes('no data') || error.message.includes('empty')) {
    console.warn('No data available');
    // Handle empty state gracefully
  }
}
```

## Error Handling Patterns

### Basic Try-Catch

```typescript
async function basicErrorHandling() {
  const unipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  });

  try {
    await unipa.account.login();
    const grades = await unipa.grades.fetch();
    console.log(`GPA: ${grades.getGPA()}`);
  } catch (error) {
    console.error('Operation failed:', error.message);
    
    // Log additional context for debugging
    console.error('Error occurred at:', new Date().toISOString());
    console.error('Stack trace:', error.stack);
  }
}
```

### Categorized Error Handling

```typescript
async function categorizedErrorHandling() {
  const unipa = OpenUNIPA({
    username: process.env.UNIPA_USER_ID!,
    password: process.env.UNIPA_PLAIN_PASSWORD!,
    univ: UnivList.KINDAI.HIGASHI_OSAKA,
  });

  try {
    await unipa.account.login();
    const grades = await unipa.grades.fetch();
    return grades;
  } catch (error) {
    // Categorize and handle different error types
    if (error.message.includes('invalid credentials')) {
      throw new Error('CREDENTIAL_ERROR: Invalid username or password');
    } else if (error.message.includes('network')) {
      throw new Error('NETWORK_ERROR: Check internet connection');
    } else if (error.message.includes('parsing')) {
      throw new Error('PARSING_ERROR: UNIPA structure changed');
    } else if (error.message.includes('timeout')) {
      throw new Error('TIMEOUT_ERROR: Request took too long');
    } else {
      throw new Error(`UNKNOWN_ERROR: ${error.message}`);
    }
  }
}
```

### Retry Logic

```typescript
class RetryableUNIPA {
  constructor(private config: any, private maxRetries = 3) {}

  async withRetry<T>(operation: () => Promise<T>, retryDelay = 1000): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry certain errors
        if (error.message.includes('invalid credentials') ||
            error.message.includes('parsing')) {
          throw error;
        }
        
        console.log(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Exponential backoff
        }
      }
    }
    
    throw new Error(`All ${this.maxRetries} attempts failed. Last error: ${lastError.message}`);
  }

  async login() {
    const unipa = OpenUNIPA(this.config);
    return this.withRetry(() => unipa.account.login());
  }

  async fetchGrades() {
    const unipa = OpenUNIPA(this.config);
    await this.login();
    return this.withRetry(() => unipa.grades.fetch());
  }
}

// Usage
const retryableUnipa = new RetryableUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

try {
  const grades = await retryableUnipa.fetchGrades();
  console.log(`GPA: ${grades.getGPA()}`);
} catch (error) {
  console.error('All retry attempts failed:', error.message);
}
```

### Circuit Breaker Pattern

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.recoveryTimeout) {
        throw new Error('Circuit breaker is OPEN');
      } else {
        this.state = 'HALF_OPEN';
      }
    }

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      this.failures = 0;
      this.state = 'CLOSED';
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= this.failureThreshold) {
        this.state = 'OPEN';
        console.log('Circuit breaker opened due to repeated failures');
      }
      
      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

class RobustUNIPA {
  private circuitBreaker = new CircuitBreaker();
  
  constructor(private config: any) {}

  async safeOperation<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await this.circuitBreaker.execute(operation);
    } catch (error) {
      const breakerState = this.circuitBreaker.getState();
      
      if (error.message.includes('Circuit breaker is OPEN')) {
        console.error('Service temporarily unavailable due to repeated failures');
        console.log(`Circuit breaker state:`, breakerState);
      }
      
      throw error;
    }
  }

  async fetchGrades() {
    return this.safeOperation(async () => {
      const unipa = OpenUNIPA(this.config);
      await unipa.account.login();
      return unipa.grades.fetch();
    });
  }
}
```

## Advanced Error Handling

### Error Aggregation

```typescript
class UNIPAErrorAggregator {
  private errors: Array<{operation: string, error: Error, timestamp: Date}> = [];

  async executeWithLogging<T>(operation: string, fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.errors.push({
        operation,
        error: error as Error,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  async fetchAllData() {
    const unipa = OpenUNIPA({
      username: process.env.UNIPA_USER_ID!,
      password: process.env.UNIPA_PLAIN_PASSWORD!,
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
    });

    const results: any = {};
    
    // Try each operation independently
    try {
      await this.executeWithLogging('login', () => unipa.account.login());
    } catch (error) {
      console.error('Login failed, cannot proceed');
      return { errors: this.getErrorSummary() };
    }

    // Continue with data fetching even if some fail
    try {
      results.timetable = await this.executeWithLogging('timetable', () => unipa.timetable.fetch());
    } catch (error) {
      console.warn('Timetable fetch failed, continuing...');
    }

    try {
      results.grades = await this.executeWithLogging('grades', () => unipa.grades.fetch());
    } catch (error) {
      console.warn('Grades fetch failed, continuing...');
    }

    try {
      results.attendance = await this.executeWithLogging('attendance', () => unipa.attendance.fetch());
    } catch (error) {
      console.warn('Attendance fetch failed, continuing...');
    }

    try {
      results.notices = await this.executeWithLogging('notices', () => unipa.notice.fetch());
    } catch (error) {
      console.warn('Notices fetch failed, continuing...');
    }

    results.errors = this.getErrorSummary();
    return results;
  }

  getErrorSummary() {
    return {
      total: this.errors.length,
      byOperation: this.errors.reduce((acc, {operation}) => {
        acc[operation] = (acc[operation] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recent: this.errors.slice(-5).map(({operation, error, timestamp}) => ({
        operation,
        message: error.message,
        timestamp: timestamp.toISOString(),
      })),
    };
  }
}

// Usage
const aggregator = new UNIPAErrorAggregator();
const results = await aggregator.fetchAllData();

console.log('Fetched data:', Object.keys(results).filter(k => k !== 'errors'));
if (results.errors.total > 0) {
  console.log('Errors encountered:', results.errors);
}
```

### Graceful Degradation

```typescript
class GracefulUNIPA {
  constructor(private config: any) {}

  async getAcademicSummary() {
    const summary: any = {
      timestamp: new Date().toISOString(),
      available: [],
      unavailable: [],
      partial: false,
    };

    const unipa = OpenUNIPA(this.config);
    
    try {
      await unipa.account.login();
      summary.available.push('authentication');
    } catch (error) {
      summary.unavailable.push('authentication');
      console.error('Cannot authenticate, using cached/default data');
      return this.getFallbackSummary(summary);
    }

    // Try to fetch grades
    try {
      const grades = await unipa.grades.fetch();
      summary.gpa = grades.getGPA();
      summary.credits = grades.getTotalEarnedCredits();
      summary.available.push('grades');
    } catch (error) {
      summary.gpa = 'unavailable';
      summary.credits = 'unavailable';
      summary.unavailable.push('grades');
      summary.partial = true;
    }

    // Try to fetch attendance
    try {
      const attendance = await unipa.attendance.fetch();
      summary.attendanceRate = attendance.getOverallAttendanceRate();
      summary.available.push('attendance');
    } catch (error) {
      summary.attendanceRate = 'unavailable';
      summary.unavailable.push('attendance');
      summary.partial = true;
    }

    // Try to fetch notices
    try {
      const notices = await unipa.notice.fetch();
      summary.unreadNotices = notices.getUnreadNotices().length;
      summary.urgentDeadlines = notices.getUpcomingDeadlines(7).length;
      summary.available.push('notices');
    } catch (error) {
      summary.unreadNotices = 'unavailable';
      summary.urgentDeadlines = 'unavailable';
      summary.unavailable.push('notices');
      summary.partial = true;
    }

    return summary;
  }

  private getFallbackSummary(baseSummary: any) {
    return {
      ...baseSummary,
      gpa: 'login required',
      credits: 'login required',
      attendanceRate: 'login required',
      unreadNotices: 'login required',
      urgentDeadlines: 'login required',
      fallback: true,
    };
  }
}

// Usage
const gracefulUnipa = new GracefulUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

const summary = await gracefulUnipa.getAcademicSummary();

console.log('=== Academic Summary ===');
console.log(`Status: ${summary.partial ? 'Partial' : 'Complete'}`);
console.log(`Available: ${summary.available.join(', ')}`);
if (summary.unavailable.length > 0) {
  console.log(`Unavailable: ${summary.unavailable.join(', ')}`);
}
console.log(`GPA: ${summary.gpa}`);
console.log(`Attendance: ${summary.attendanceRate}%`);
```

## Error Recovery Strategies

### Automatic Session Recovery

```typescript
class SessionManager {
  private session: any = null;
  private isAuthenticated = false;

  constructor(private config: any) {}

  async ensureAuthenticated() {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }
  }

  async authenticate() {
    try {
      this.session = OpenUNIPA(this.config);
      await this.session.account.login();
      this.isAuthenticated = true;
      console.log('✅ Authentication successful');
    } catch (error) {
      this.isAuthenticated = false;
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async executeWithRecovery<T>(operation: (session: any) => Promise<T>): Promise<T> {
    await this.ensureAuthenticated();
    
    try {
      return await operation(this.session);
    } catch (error) {
      if (error.message.includes('authentication') || error.message.includes('session')) {
        console.log('🔄 Session expired, re-authenticating...');
        this.isAuthenticated = false;
        await this.ensureAuthenticated();
        return await operation(this.session);
      }
      throw error;
    }
  }

  async getGrades() {
    return this.executeWithRecovery(session => session.grades.fetch());
  }

  async getAttendance() {
    return this.executeWithRecovery(session => session.attendance.fetch());
  }
}

// Usage
const sessionManager = new SessionManager({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

try {
  const grades = await sessionManager.getGrades();
  console.log(`GPA: ${grades.getGPA()}`);
} catch (error) {
  console.error('Failed to get grades:', error.message);
}
```

### Offline Mode with Caching

```typescript
import fs from 'fs';
import path from 'path';

class CachedUNIPA {
  private cacheDir = './unipa-cache';

  constructor(private config: any) {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getCacheFile(operation: string): string {
    return path.join(this.cacheDir, `${operation}.json`);
  }

  private async saveToCache(operation: string, data: any) {
    const cacheFile = this.getCacheFile(operation);
    const cacheData = {
      timestamp: Date.now(),
      data: data,
    };
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  }

  private loadFromCache(operation: string, maxAge = 24 * 60 * 60 * 1000): any | null {
    const cacheFile = this.getCacheFile(operation);
    
    if (!fs.existsSync(cacheFile)) {
      return null;
    }

    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      const age = Date.now() - cached.timestamp;
      
      if (age <= maxAge) {
        console.log(`📁 Using cached data for ${operation} (${Math.round(age / 1000)}s old)`);
        return cached.data;
      } else {
        console.log(`⏰ Cache expired for ${operation} (${Math.round(age / 1000)}s old)`);
        return null;
      }
    } catch {
      return null;
    }
  }

  async fetchWithCache<T>(
    operation: string,
    fetcher: () => Promise<T>,
    maxAge?: number
  ): Promise<T> {
    // Try cache first
    const cached = this.loadFromCache(operation, maxAge);
    if (cached) {
      return cached;
    }

    // Try live fetch
    try {
      console.log(`🌐 Fetching live data for ${operation}...`);
      const data = await fetcher();
      await this.saveToCache(operation, data);
      return data;
    } catch (error) {
      console.error(`❌ Live fetch failed for ${operation}:`, error.message);
      
      // Try stale cache as fallback
      const staleCache = this.loadFromCache(operation, Infinity);
      if (staleCache) {
        console.log(`📁 Using stale cache for ${operation} as fallback`);
        return staleCache;
      }
      
      throw error;
    }
  }

  async getGrades() {
    return this.fetchWithCache('grades', async () => {
      const unipa = OpenUNIPA(this.config);
      await unipa.account.login();
      return unipa.grades.fetch();
    });
  }

  async getAttendance() {
    return this.fetchWithCache('attendance', async () => {
      const unipa = OpenUNIPA(this.config);
      await unipa.account.login();
      return unipa.attendance.fetch();
    });
  }
}

// Usage
const cachedUnipa = new CachedUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

try {
  const grades = await cachedUnipa.getGrades();
  console.log(`GPA: ${grades.getGPA()}`);
} catch (error) {
  console.error('No data available (live or cached):', error.message);
}
```

## Best Practices

### 1. Always Handle Errors

Never leave async operations without error handling:

```typescript
// ❌ Bad - no error handling
const grades = await unipa.grades.fetch();

// ✅ Good - proper error handling
try {
  const grades = await unipa.grades.fetch();
} catch (error) {
  console.error('Failed to fetch grades:', error.message);
  // Handle the error appropriately
}
```

### 2. Provide Meaningful Error Messages

```typescript
// ❌ Bad - generic error
throw new Error('Something went wrong');

// ✅ Good - specific error context
throw new Error(`Failed to parse timetable: ${selector} not found in HTML`);
```

### 3. Log Errors with Context

```typescript
try {
  const result = await operation();
} catch (error) {
  console.error('Operation failed:', {
    operation: 'fetchGrades',
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    config: { /* relevant config */ },
  });
}
```

### 4. Implement Appropriate Recovery

Choose the right recovery strategy for each error type:

- **Authentication errors**: Re-authenticate
- **Network errors**: Retry with backoff
- **Parsing errors**: Log and investigate
- **Timeout errors**: Increase timeout or retry
- **Rate limiting**: Wait and retry

### 5. Test Error Scenarios

Test your error handling with different scenarios:

```typescript
// Test with invalid credentials
// Test with network disconnection
// Test with malformed HTML
// Test with empty responses
```

Proper error handling makes your OpenUNIPA applications robust and reliable, providing a better experience for users even when things go wrong.