# AccountController

The AccountController handles authentication and login operations for the UNIPA system.

## Methods

### `login()`

Authenticates with the UNIPA system using the provided credentials.

```typescript
await unipa.account.login();
```

**Parameters:** None

**Returns:** `Promise<void>`

**Throws:** 
- Authentication errors if credentials are invalid
- Network errors if connection fails
- CSRF token errors if the login form cannot be parsed

## Usage Examples

### Basic Login

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

try {
  await unipa.account.login();
  console.log('Successfully logged in!');
} catch (error) {
  console.error('Login failed:', error);
}
```

### Login with Error Handling

```typescript
async function authenticateUser() {
  try {
    await unipa.account.login();
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('invalid credentials')) {
        console.error('Invalid username or password');
      } else if (error.message.includes('network')) {
        console.error('Network connection failed');
      } else {
        console.error('Login failed:', error.message);
      }
    }
    return false;
  }
}

const isAuthenticated = await authenticateUser();
if (isAuthenticated) {
  // Proceed with other operations
  const timetable = await unipa.timetable.fetch();
}
```

### Session Management

```typescript
class UNIPASession {
  private unipa: Session;
  private isLoggedIn = false;

  constructor(credentials: { username: string; password: string }) {
    this.unipa = OpenUNIPA({
      ...credentials,
      univ: UnivList.KINDAI.HIGASHI_OSAKA,
    });
  }

  async ensureAuthenticated() {
    if (!this.isLoggedIn) {
      await this.unipa.account.login();
      this.isLoggedIn = true;
    }
  }

  async getTimetable() {
    await this.ensureAuthenticated();
    return this.unipa.timetable.fetch();
  }

  async getGrades() {
    await this.ensureAuthenticated();
    return this.unipa.grades.fetch();
  }
}
```

## Authentication Flow

The login process involves several steps:

1. **Request Login Page**: Fetch the login form
2. **Extract CSRF Token**: Parse the form for security tokens
3. **Submit Credentials**: POST username and password with CSRF token
4. **Verify Success**: Check for successful authentication
5. **Store Session**: Maintain cookies for subsequent requests

```typescript
// This is handled internally by login()
await unipa.account.login();

// Session is now active for other operations
const timetable = await unipa.timetable.fetch();
const grades = await unipa.grades.fetch();
```

## Security Considerations

### Credential Storage

Never hardcode credentials in your source code:

```typescript
// ❌ Bad - credentials in source code
const unipa = OpenUNIPA({
  username: 'myusername',
  password: 'mypassword',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

// ✅ Good - credentials from environment
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});
```

### Session Persistence

Sessions are maintained automatically through cookies:

```typescript
// Login once
await unipa.account.login();

// Multiple operations use the same session
const timetable = await unipa.timetable.fetch();
const grades = await unipa.grades.fetch();
const attendance = await unipa.attendance.fetch();
```

## Error Types

### Common Errors

1. **Invalid Credentials**
   ```typescript
   // Error: Authentication failed - invalid username or password
   ```

2. **Network Errors**
   ```typescript
   // Error: Network request failed - check connection
   ```

3. **CSRF Token Errors**
   ```typescript
   // Error: Could not extract CSRF token from login form
   ```

4. **University Configuration Errors**
   ```typescript
   // Error: Invalid university configuration
   ```

## Debugging

Enable debug mode to troubleshoot authentication issues:

```typescript
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    saveHTML: true,  // Save login page HTML for inspection
  }
});

await unipa.account.login();
```

## Best Practices

1. **Always authenticate first** before other operations
2. **Handle errors gracefully** with try-catch blocks
3. **Use environment variables** for credentials
4. **Implement session management** for long-running applications
5. **Respect rate limits** - don't login repeatedly

## Related Controllers

After successful login, you can use:

- [TimetableController](./timetable-controller) - Fetch schedule data
- [GradesController](./grades-controller) - Access grade information
- [AttendanceController](./attendance-controller) - Check attendance
- [NoticeController](./notice-controller) - Read notices