# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenUNIPA is a TypeScript library for interacting with Kindai University's UNIPA system. It provides programmatic access to student services like timetables, grades, and account management through web scraping.

## Development Commands

- **Build**: `yarn build` or `tsc` - Compiles TypeScript to JavaScript in `dist/`
- **Test**: `yarn test` or `vitest run` - Runs the test suite using Vitest
- **Development**: `yarn dev` - Builds and runs the main script with timing
- **Package**: `yarn pack` - Creates a package tarball for distribution
- **Release**: `yarn release` - Packages and publishes to npm

## Architecture

### Core Components

- **OpenUNIPA** (`src/openunipa.ts`): Main factory function that creates a session object with all controllers
- **Request** (`src/Request.ts`): HTTP client that handles cookies, CSRF tokens, and HTML parsing. Supports stub mode for testing
- **Session**: Central object containing user credentials, university config, debug options, and all controller instances

### Controller Pattern

The codebase uses a controller-based architecture where each feature area has its own controller:

- **AccountController**: Handles login/authentication
- **TimetableController**: Fetches and parses student timetables  
- **GradesController**: Manages grade information
- **MenuController**: Navigates UNIPA's menu system
- **FSController**: File system operations for debug/stub functionality

All controllers extend `BaseController` and receive a `Session` object.

### University Configuration

Universities are defined in `src/types/UnivList.ts` with:
- Base URL for the UNIPA instance
- Login path
- Campus-specific identifiers

Currently supports Kindai University (Higashi-Osaka and Osaka-Sayama campuses).

### Debug/Stub System

The library includes a comprehensive stub system for testing:
- `DEBUG.stub`: Uses local HTML files instead of live requests
- `DEBUG.saveHTML`: Saves responses as stub files
- Stub files stored in `stub/` directory with URL-encoded names

### HTML Parsing

Uses `node-html-parser` to:
- Extract CSRF tokens from forms
- Parse timetable data from table elements
- Navigate menu structures
- Extract user account information

## Key Implementation Details

- **Authentication**: Form-based login with CSRF token extraction
- **Session Management**: Cookie-based session persistence across requests
- **Error Handling**: WindowState enum for request status tracking
- **Data Extraction**: CSS selectors and text parsing for structured data from HTML

## Testing

- Uses Vitest as the test framework
- Test files should be named `*.test.ts` or `*.spec.ts`
- Tests are excluded from TypeScript compilation
- Globals are enabled in Vitest configuration

## TypeScript Configuration

- Target: ES2021
- Module: CommonJS
- Strict mode enabled
- Declaration files generated for library distribution
- Source maps enabled for debugging