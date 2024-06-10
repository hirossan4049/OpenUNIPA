<h1 align="center">
  OpenUNIPA
</h1>

- SIMPLE
- FAST
- EASY

| Node.js | Swift | C | C++ | Java |
| --- | --- | --- | --- | --- |
| 🚧  | ✗   | ✗   | ✗  | ✗   |

## Requirements
- node20
- yarn v4

## Installation

```bash
TODO//////$ yarn add open-unipa
```

## Usage

```ts
import { OpenUNIPA } from 'open-unipa';

const unipa = new OpenUNIPA({
  username: "2412110000a",
  password: "password",
  univ: UnivList.KINDAI.HIGASHI_OSAKA,
})
await unipa.account.login()

const timetable = await unipa.timetable.fetch()
timetable.print()
console.log(timetable.items)
// [{
//   week: 0, // 0: 月曜日, 1: 火曜日...
//   period: 1, // 0: 1限目, 1: 2限目...
//   subject: '基礎線形代数学１', // 科目名
//   class: 'Aクラス', // クラス名?
//   teacher: '山田 武士', // 教員名?
//   room: 'E-101', // 教室名?
//   syllabus: { year: '2024', id: 'N1124C0218' } // シラバス情報
// },
```

## License

todo.