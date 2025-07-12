# OpenUNIPA

<div align="center">

**Fast, lightweight TypeScript library for Kindai University UNIPA**

[![npm](https://img.shields.io/npm/v/open-unipa)](https://www.npmjs.com/package/open-unipa)
[![size](https://pkg-size.dev/badge/bundle/260109)](https://pkg-size.dev/open-unipa)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[Documentation](https://hirossan4049.github.io/OpenUNIPA/) • [Examples](#examples) • [API](#api)

</div>

## Features

- **Fast** - ~86ms stub mode, ~1.2s real API
- **Simple** - Clean, intuitive API
- **Type-safe** - Full TypeScript support
- **Comprehensive** - Timetable, grades, attendance, notices

## Install

```bash
npm install open-unipa
```

## Usage

```typescript
import { OpenUNIPA, UnivList } from 'open-unipa';

const unipa = OpenUNIPA({
  username: 'your_username',
  password: 'your_password',
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
});

await unipa.account.login();
const timetable = await unipa.timetable.fetch();
timetable.print();
```

## Examples

### Grades & GPA

```typescript
const grades = await unipa.grades.fetch();
console.log(`GPA: ${grades.getGPA()}`);
console.log(`Credits: ${grades.getTotalEarnedCredits()}`);
```

### Attendance tracking

```typescript
const attendance = await unipa.attendance.fetch();
console.log(`Rate: ${attendance.getOverallAttendanceRate()}%`);

const low = attendance.getLowAttendanceSubjects(70);
low.forEach(s => console.log(`${s.name}: ${s.attendanceRate}%`));
```

### Notice management

```typescript
const notices = await unipa.notice.fetch();
const unread = notices.filter({ priority: 'high', isRead: false });
console.log(`Unread: ${unread.length}`);
```

## API

| Controller | Description |
|------------|-------------|
| `account` | Authentication & login |
| `timetable` | Class schedules |
| `grades` | Grade data & GPA |
| `attendance` | Attendance tracking |
| `notice` | Announcements & notices |
| `menu` | UNIPA navigation |

## Requirements

- Node.js 18+
- Kindai University UNIPA account

## License

MIT