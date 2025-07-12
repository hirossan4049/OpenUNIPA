# TimetableController

The TimetableController manages timetable data retrieval and parsing from the UNIPA system.

## Methods

### `fetch()`

Retrieves the current timetable data from UNIPA.

```typescript
const timetable = await unipa.timetable.fetch();
```

**Parameters:** None

**Returns:** `Promise<TimetableData>`

**Requires:** Prior authentication via `unipa.account.login()`

## TimetableData Methods

The returned `TimetableData` object provides several methods for accessing and displaying timetable information.

### `print()`

Displays the timetable in a formatted table in the console.

```typescript
timetable.print();
```

**Output Example:**
```
┌─────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Time    │ Monday      │ Tuesday     │ Wednesday   │ Thursday    │ Friday      │
├─────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ 1限     │ 数学        │ 英語        │             │ 物理学      │ 化学        │
│ 9:00-   │ 講義室A101  │ 講義室B205  │             │ 講義室C301  │ 実験室D101  │
│ 10:30   │             │             │             │             │             │
├─────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ 2限     │             │ プログラミング│ 統計学      │             │ 物理学実験  │
│ 10:40-  │             │ PC教室E201  │ 講義室B301  │             │ 実験室D201  │
│ 12:10   │             │             │             │             │             │
└─────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### Additional Methods

While the exact methods may vary based on implementation, typical timetable operations include:

```typescript
// Get classes for a specific day
const mondayClasses = timetable.getClassesByDay('Monday');

// Get classes for a specific time period
const firstPeriodClasses = timetable.getClassesByPeriod('1限');

// Get all unique subjects
const subjects = timetable.getAllSubjects();

// Get classroom information
const classrooms = timetable.getAllClassrooms();
```

## Usage Examples

### Basic Timetable Fetch

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

try {
  await unipa.account.login();
  const timetable = await unipa.timetable.fetch();
  
  console.log('Current Timetable:');
  timetable.print();
} catch (error) {
  console.error('Failed to fetch timetable:', error);
}
```

### Timetable Analysis

```typescript
async function analyzeTimetable() {
  await unipa.account.login();
  const timetable = await unipa.timetable.fetch();
  
  // Display formatted timetable
  console.log('=== Weekly Timetable ===');
  timetable.print();
  
  // Additional analysis (if methods available)
  console.log('\n=== Timetable Analysis ===');
  
  // Example: Count classes per day
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  days.forEach(day => {
    const classes = timetable.getClassesByDay?.(day);
    if (classes) {
      console.log(`${day}: ${classes.length} classes`);
    }
  });
  
  // Example: List all subjects
  const subjects = timetable.getAllSubjects?.();
  if (subjects) {
    console.log(`\nTotal subjects: ${subjects.length}`);
    subjects.forEach(subject => console.log(`- ${subject}`));
  }
}

await analyzeTimetable();
```

### Save Timetable Data

```typescript
import fs from 'fs';

async function saveTimetable() {
  await unipa.account.login();
  const timetable = await unipa.timetable.fetch();
  
  // Convert timetable to JSON for storage
  const timetableData = {
    fetchedAt: new Date().toISOString(),
    data: timetable, // This will include all timetable data
  };
  
  // Save to file
  fs.writeFileSync(
    'timetable.json', 
    JSON.stringify(timetableData, null, 2)
  );
  
  console.log('Timetable saved to timetable.json');
  timetable.print();
}

await saveTimetable();
```

### Compare Timetables

```typescript
async function compareTimetables() {
  // Load saved timetable
  const savedData = JSON.parse(fs.readFileSync('timetable.json', 'utf8'));
  
  // Fetch current timetable
  await unipa.account.login();
  const currentTimetable = await unipa.timetable.fetch();
  
  console.log('=== Saved Timetable ===');
  console.log(`Fetched: ${savedData.fetchedAt}`);
  // Display saved timetable if structure allows
  
  console.log('\n=== Current Timetable ===');
  currentTimetable.print();
  
  // Manual comparison logic would go here
  console.log('\nComparison complete. Check for differences manually.');
}
```

## Data Structure

The timetable data typically includes:

```typescript
interface TimetableEntry {
  period: string;      // e.g., "1限", "2限"
  day: string;         // e.g., "Monday", "Tuesday"
  subject: string;     // Course name
  classroom?: string;  // Room/location
  timeSlot?: string;   // Time range (e.g., "9:00-10:30")
  instructor?: string; // Professor name
}
```

## Error Handling

```typescript
async function safeTimetableFetch() {
  try {
    await unipa.account.login();
    const timetable = await unipa.timetable.fetch();
    return timetable;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('authentication')) {
        console.error('Please login first');
      } else if (error.message.includes('network')) {
        console.error('Network error - check connection');
      } else if (error.message.includes('parsing')) {
        console.error('Failed to parse timetable data');
      } else {
        console.error('Timetable fetch failed:', error.message);
      }
    }
    throw error;
  }
}
```

## Performance Considerations

### Caching

```typescript
class TimetableCache {
  private cache: TimetableData | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutes

  async getTimetable(unipa: Session): Promise<TimetableData> {
    const now = Date.now();
    
    if (this.cache && (now - this.cacheTime) < this.CACHE_TTL) {
      console.log('Using cached timetable');
      return this.cache;
    }
    
    console.log('Fetching fresh timetable');
    this.cache = await unipa.timetable.fetch();
    this.cacheTime = now;
    return this.cache;
  }
}

const cache = new TimetableCache();
const timetable = await cache.getTimetable(unipa);
```

## Debug Mode

Enable debug features for troubleshooting:

```typescript
const unipa = OpenUNIPA({
  username: process.env.UNIPA_USER_ID!,
  password: process.env.UNIPA_PLAIN_PASSWORD!,
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
  DEBUG: {
    saveHTML: true,  // Save timetable HTML for inspection
  }
});

await unipa.account.login();
const timetable = await unipa.timetable.fetch();
// HTML will be saved to stub/ directory
```

## Best Practices

1. **Always authenticate first** before fetching timetable
2. **Cache timetable data** to avoid repeated requests
3. **Handle errors gracefully** with proper error messages
4. **Use the print() method** for quick visualization
5. **Save important timetables** to files for backup

## Related Controllers

- [AccountController](./account-controller) - Required for authentication
- [GradesController](./grades-controller) - Academic performance data
- [AttendanceController](./attendance-controller) - Class attendance tracking
- [NoticeController](./notice-controller) - Schedule-related announcements