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
await unipa.login()

const timetable = await unipa.timetable.fetch()
timetable.csv()
timetable.json()
```

## License

todo.