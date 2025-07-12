# Configuration

## Basic Configuration

The OpenUNIPA factory function accepts a configuration object with the following properties:

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: 'your_username',
  password: 'your_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  // Optional debug settings
  DEBUG: {
    stub: false,
    saveHTML: false,
  }
});
```

## Required Parameters

### `username`
- **Type**: `string`
- **Description**: Your UNIPA username/student ID

### `password`
- **Type**: `string`
- **Description**: Your UNIPA password

### `univ`
- **Type**: `University`
- **Description**: University configuration object

## University Configuration

### Supported Universities

#### Kindai University

```typescript
// Higashi-Osaka Campus
UnivList.KINDAI.HIGASHI_OSAKA

// Osaka-Sayama Campus
UnivList.KINDAI.OSAKA_SAYAMA
```

### University Object Structure

Each university configuration contains:

```typescript
interface University {
  baseURL: string;     // Base URL for UNIPA instance
  loginPath: string;   // Path to login page
  campusId?: string;   // Campus identifier (if applicable)
}
```

## Debug Configuration

The `DEBUG` object supports development and testing features:

```typescript
interface DebugOptions {
  stub?: boolean;      // Use local stub files instead of live requests
  saveHTML?: boolean;  // Save HTML responses as stub files
}
```

### Stub Mode

Enable stub mode for testing without making actual network requests:

```typescript
const unipa = OpenUNIPA({
  username: 'test_user',
  password: 'test_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    stub: true,  // Use stub data
  }
});
```

### Save HTML Mode

Capture HTML responses for creating stub files:

```typescript
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    saveHTML: true,  // Save responses to stub/ directory
  }
});
```

## Environment Variables

### Required Variables

```env
UNIPA_USER_ID=your_unipa_username
UNIPA_PLAIN_PASSWORD=your_unipa_password
```

### Optional Variables

```env
# Debug settings
UNIPA_DEBUG_STUB=true
UNIPA_DEBUG_SAVE_HTML=false

# Custom timeout (milliseconds)
UNIPA_TIMEOUT=30000
```

### Loading Environment Variables

```typescript
import 'dotenv/config';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    stub: process.env.UNIPA_DEBUG_STUB === 'true',
    saveHTML: process.env.UNIPA_DEBUG_SAVE_HTML === 'true',
  }
});
```

## Session Management

The OpenUNIPA factory returns a session object containing:

```typescript
interface Session {
  account: AccountController;      // Authentication
  timetable: TimetableController;  // Timetable data
  grades: GradesController;        // Grade information
  attendance: AttendanceController; // Attendance records
  notice: NoticeController;        // University notices
  menu: MenuController;            // Menu navigation
  fs: FSController;                // File system operations
}
```

## Request Configuration

### Timeout Settings

Requests have default timeouts, but you can configure them:

```typescript
// Note: Timeout configuration is handled internally
// For custom timeout, modify the Request class configuration
```

### Cookie Management

Session cookies are automatically managed by the Request class:

- Cookies are stored in memory during the session
- CSRF tokens are automatically extracted and included
- Session persistence across requests

## Error Handling

Configure error handling behavior:

```typescript
try {
  await unipa.account.login();
  const timetable = await unipa.timetable.fetch();
} catch (error) {
  console.error('UNIPA operation failed:', error);
}
```

## Best Practices

1. **Environment Variables**: Always use environment variables for credentials
2. **Error Handling**: Wrap API calls in try-catch blocks
3. **Rate Limiting**: Avoid rapid successive requests to prevent blocking
4. **Stub Mode**: Use stub mode for development and testing
5. **Secure Storage**: Never commit credentials to version control

## Advanced Configuration

For advanced use cases, you can extend the configuration:

```typescript
import { OpenUNIPA, UnivList, type University } from 'open-unipa';

// Custom university configuration
const customUniv: University = {
  baseURL: 'https://custom-unipa.example.com',
  loginPath: '/login',
  campusId: 'custom-campus',
};

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: customUniv,
});
```