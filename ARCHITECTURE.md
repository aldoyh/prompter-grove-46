# Architecture - SQLite Edition

## Overview
This document describes the architecture of the Prompts Manager application after migration from Firebase to SQLite (sql.js).

## Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4

### Database Layer
- **SQLite (sql.js)**: Runs entirely in the browser
- **WASM**: WebAssembly module for performance
- **Persistence**: localStorage for database backups

### State Management
- **React Hooks**: useState, useEffect, useCallback
- **Custom Hooks**: usePrompts, useAuth

## Architecture Layers

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx       # Root layout with providers
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/             # Reusable UI components
│   ├── PromptCard.tsx   # Display prompt cards
│   ├── PromptEditor.tsx # Create/edit prompts
│   ├── SearchBar.tsx    # Search functionality
│   ├── TagsViewer.tsx  # Tag filtering
│   ├── ColorPicker.tsx # Color selection
│   ├── LanguageSwitcher.tsx # Language selection
│   └── ErrorBoundary.tsx # Error handling
├── hooks/                  # Custom React hooks
│   ├── usePrompts.tsx  # Prompt management
│   ├── useAuth.tsx     # Authentication
│   └── useAutoDirection.ts # Text direction
├── lib/                    # Library utilities
│   ├── sqlite/           # SQLite database layer
│   │   └── db.ts       # Database operations
│   ├── translations.ts  # i18n support
│   └── language-detection.ts # Auto RTL/LTR
├── data/                   # Repository layer
│   └── repository.ts    # Data access
└── domain/                 # Domain models
    ├── models/
    │   └── Prompt.ts    # Prompt model
    └── utils/
        └── errors.ts     # Error classes
```

## Data Flow

### Creating a Prompt
1. User enters prompt in `PromptEditor`
2. `usePrompts.create()` is called
3. `promptRepository.create()` is called
4. `db.createPrompt()` executes SQL INSERT
5. Database is saved to localStorage

### Reading Prompts
1. `usePrompts` hook initializes
2. `promptRepository.findByUser()` is called
3. `db.getUserPrompts()` executes SQL SELECT
4. Results are returned as Prompt objects
5. State is updated, UI re-renders

### Updating a Prompt
1. User edits prompt in `PromptEditor`
2. `usePrompts.update()` is called
3. `promptRepository.update()` is called
4. `db.updatePrompt()` executes SQL UPDATE
5. Database is saved to localStorage

## Database Schema

### Table: prompts
```sql
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  tags TEXT NOT NULL,  -- JSON array
  color TEXT,
  userId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)
```

### Table: users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
)
```

## Authentication

### Current Implementation (SQLite Edition)
- **localStorage-based**: User session stored in localStorage
- **Simple login**: Email-based identification
- **No external dependencies**: Works offline

### Future Enhancement
Can be extended with proper authentication (OAuth, JWT) if needed.

## Key Design Decisions

### 1. SQLite over Firebase
- **Offline-first**: Works without internet
- **No external dependencies**: Simpler deployment
- **Data privacy**: All data stays in browser
- **Easy migration**: Can export/import data

### 2. sql.js for Browser SQLite
- **WebAssembly**: High performance
- **Familiar API**: Standard SQL
- **Proven**: Used in many projects

### 3. Repository Pattern
- **Abstraction**: Database layer is abstracted
- **Testable**: Easy to mock for tests
- **Flexible**: Can switch database if needed

## Build & Deployment

### Build
```bash
pnpm build
```

### Development
The app runs automatically in the Quests app environment.

### Deployment
```bash
./deploy.sh deploy
```

## Performance Considerations

### Database
- **WASM module**: Fast SQL execution
- **localStorage**: Asynchronous saving
- **Indexed queries**: Fast lookups by userId

### Frontend
- **Code splitting**: Automatic with Next.js
- **Static generation**: Pre-rendered pages
- **Lazy loading**: Components loaded on demand

## Security

### Current (SQLite Edition)
- **Client-side only**: No server-side data storage
- **Data isolation**: Each browser has its own database
- **XSS prevention**: React escapes by default

### Future Enhancements
- Add server-side validation if adding backend
- Implement proper authentication if needed
- Add HTTPS enforcement for production

## Migration from Firebase

### What Changed
| Feature | Firebase | SQLite |
|---------|---------|--------|
| Database | Firestore | sql.js |
| Auth | Firebase Auth | localStorage |
| Hosting | Firebase | Cloudflare |
| Real-time | Firestore sync | Not needed |

### Benefits
1. **Simpler setup**: No Firebase configuration
2. **Offline-first**: Works without internet
3. **Data privacy**: Stays in browser
4. **Faster development**: No cloud dependencies

## Conclusion
The application has been successfully migrated from Firebase to SQLite. All functionality is preserved with the added benefits of offline support and simpler deployment.
