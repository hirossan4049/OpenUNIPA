<h1 align="center">
  OpenUNIPA
</h1>

<a href="https://pkg-size.dev/open-unipa"><img src="https://pkg-size.dev/badge/install/1358184" title="Install size for open-unipa"></a>

- SIMPLE
- FAST
- EASY

| Node.js | Swift | C | C++ | Java |
| --- | --- | --- | --- | --- |
| 🚧  | ✗   | ✗   | ✗  | ✗   |

## Requirements
- node20
- yarn@3.4.1

## Installation

```bash
$ yarn add open-unipa
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

## 計測

<table><thead>
  <tr>
    <th rowspan="2">計測方法<br></th>
    <th colspan="2">stub</th>
    <th colspan="2">real(有線)<br></th>
    <th colspan="2">real(大学WiFi)</th>
  </tr>
  <tr>
    <th>time bun run</th>
    <th>console.time</th>
    <th>time bun run</th>
    <th>console.time</th>
    <th>time bun run</th>
    <th>console.time</th>
  </tr></thead>
<tbody>
  <tr>
    <td>login -&gt; timetable</td>
    <td>0.2s<br></td>
    <td>86.47ms<br></td>
    <td></td>
    <td></td>
    <td>1.897s</td>
    <td></td>
  </tr>
</tbody>
</table>

## License

todo.