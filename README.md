# OpenUNIPA

- SIMPLE
- FAST
- EASY

## Installation

```bash
TODO//////$ yarn add open-unipa
```

## Usage

```ts
import { OpenUNIPA } from 'open-unipa';

const session = new UNIPA()

const ctx = await session.login({ id: "", plainPassword: "" })
const timetable = await ctx.timetable.fetch()
const json = timetable.json()
const csv  = timetable.csv()
```

## License

todo.