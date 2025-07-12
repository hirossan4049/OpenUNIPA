# TypeScript Examples

This directory contains TypeScript examples demonstrating how to use each controller in the OpenUNIPA library.

## Available Examples

### 1. Account Controller (`account-example.ts`)
Demonstrates basic login functionality.
```bash
npx tsx account-example.ts
```

### 2. Grades Controller (`grades-example.ts`)
Shows how to fetch and display grade information using `console.table`.
```bash
npx tsx grades-example.ts
```

### 3. Timetable Controller (`timetable-example.ts`)
Displays class schedule information in a structured table format.
```bash
npx tsx timetable-example.ts
```

### 4. Menu Controller (`menu-example.ts`)
Shows navigation through the UNIPA menu system.
```bash
npx tsx menu-example.ts
```

### 5. Attendance Controller (`attendance-example.ts`)
Example of attendance tracking functionality.
```bash
npx tsx attendance-example.ts
```

## Setup

1. Copy the environment file:
   ```bash
   cp ../.env.example ../.env
   ```

2. Edit `../.env` and add your credentials:
   ```
   UNIPA_USER_ID=your_username
   UNIPA_PLAIN_PASSWORD=your_password
   ```

## Running Examples

### Stub Mode (Default)
If no credentials are provided in `.env`, examples will run in stub mode using local test data:
```bash
npx tsx [example-name].ts
```

### Real API Mode
With credentials configured in `.env`, examples will connect to the actual UNIPA system:
```bash
npx tsx [example-name].ts
```

## Features

- **Console.table Output**: All examples use `console.table` for clean, structured data display
- **Automatic Mode Detection**: Examples automatically switch between stub and real API mode
- **Performance Timing**: Each example shows execution time for operations
- **Error Handling**: Proper error messages and exit codes

## Notes

- Stub mode uses pre-saved HTML files for testing without real API access
- Real API mode requires valid UNIPA credentials
- All data is displayed using `console.table` for better readability