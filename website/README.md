# OpenUNIPA Documentation Website

This is the official documentation website for OpenUNIPA, built using [Docusaurus](https://docusaurus.io/).

## Overview

The documentation covers:

- **Getting Started** - Quick start guide and basic usage
- **Installation** - Package installation and setup
- **Configuration** - Detailed configuration options
- **API Reference** - Complete documentation for all controllers:
  - AccountController (authentication)
  - TimetableController (schedule management)
  - GradesController (grade tracking and GPA calculation)
  - AttendanceController (attendance monitoring)
  - NoticeController (university notices and announcements)
- **Examples** - Practical code examples and use cases
- **Advanced Topics** - Debugging, stub mode, and error handling

## Development

### Installation

```bash
yarn install
```

### Local Development

```bash
yarn start
```

This starts a local development server and opens the website in your browser. Most changes are reflected live without needing to restart the server.

### Build

```bash
yarn build
```

This generates static content into the `build` directory for production deployment.

## Documentation Structure

```
docs/
├── getting-started.md          # Quick start guide
├── installation.md             # Installation instructions
├── configuration.md            # Configuration options
├── examples.md                 # Practical examples
├── api/
│   ├── overview.md            # API overview
│   ├── account-controller.md   # Authentication API
│   ├── timetable-controller.md # Timetable API
│   ├── grades-controller.md    # Grades API
│   ├── attendance-controller.md # Attendance API
│   └── notice-controller.md    # Notices API
└── advanced/
    ├── debugging.md           # Debug features
    ├── stub-mode.md           # Testing with stubs
    └── error-handling.md      # Error handling patterns
```

## Deployment

The website can be deployed to any static hosting service. For GitHub Pages:

```bash
# Using SSH
USE_SSH=true yarn deploy

# Using HTTPS
GIT_USER=<Your GitHub username> yarn deploy
```

## Contributing

To contribute to the documentation:

1. Edit the relevant `.md` files in the `docs/` directory
2. Test locally with `yarn start`
3. Build to verify with `yarn build`
4. Submit a pull request

## Configuration

The site configuration is in `docusaurus.config.ts` and includes:

- OpenUNIPA-specific branding and metadata
- Navigation structure
- GitHub integration
- Search functionality

The sidebar structure is defined in `sidebars.ts` with organized sections for easy navigation.
