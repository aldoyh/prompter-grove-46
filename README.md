# Prompts Manager - SQLite Edition

## 🎯 Overview

A beautiful, production-ready prompt management platform built with Next.js and SQLite (sql.js). This application allows you to save, organize, and search your prompts with a modern, responsive interface.

## 🚀 Features

### Core Features
- **Prompt Management**: Create, edit, delete, and organize prompts
- **Real-time Search**: Instant search across titles, content, and tags
- **Tag System**: Multi-tag organization with filtering
- **Color Coding**: Visual categorization with 8 color themes
- **Internationalization**: English and Arabic with RTL support
- **Data Persistence**: SQLite database with localStorage backup

### Advanced Features
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **TypeScript Safety**: Full type safety throughout
- **Server-Side Rendering**: SEO optimized
- **Code Splitting**: Fast page loads

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript 5
- **Database**: SQLite (sql.js) - runs in browser
- **Styling**: Tailwind CSS 4
- **State Management**: React hooks
- **Deployment**: Cloudflare Workers

### Architecture Layers
```
src/
├── app/                 # Next.js pages and layouts
├── components/          # Reusable UI components
├── hooks/              # Custom hooks (usePrompts, useAuth)
├── lib/                # Library utilities
│   ├── sqlite/        # SQLite database layer
│   └── (utils)
├── data/               # Repository layer
├── domain/             # Domain models and services
└── styles/             # Global styles
```

## 📦 Installation

### Prerequisites
- Node.js v16+
- pnpm (recommended) or npm

### Setup
```bash
# 1. Install dependencies
pnpm install

# 2. Run development server
pnpm dev
```

## 🚀 Deployment

### Build for Production
```bash
# Build application
pnpm build

# Start production server
pnpm start
```

### Cloudflare Deployment
```bash
# One-time setup
./deploy.sh setup

# Deploy to production
./deploy.sh deploy

# Deploy to staging
./deploy.sh deploy --env staging
```

## 📊 Usage

### Creating a Prompt
1. Click "Create New Prompt"
2. Enter your prompt content
3. Add relevant tags (comma-separated)
4. Select a color theme
5. Click Save

### Searching Prompts
- Use the search bar to find prompts by title, content, or tags
- Filter by specific tags using the tags panel
- Clear filters with the "Clear Filter" button

### Managing Prompts
- **Edit**: Click the edit button on any prompt
- **Delete**: Click the delete button (confirmation required)
- **Color**: Change color using the color picker
- **Tags**: Add or remove tags as needed

### Language Switching
- Use the language switcher in the header
- Supports English and Arabic (with RTL support)
- Automatic direction (LTR/RTL) based on language

## 🔧 Configuration

### Environment Variables
No environment variables are required! This version uses SQLite (sql.js) running in the browser with localStorage for persistence.

### Database
- **SQLite (sql.js)**: Runs entirely in the browser
- **Persistence**: Data is saved to localStorage automatically
- **WASM**: SQL.js uses a WebAssembly module for performance

## 🌐 Internationalization

### Supported Languages
- English (en)
- Arabic (ar) with full RTL support

### Adding New Languages
1. Add translations to `src/lib/translations.ts`
2. Update the Language type
3. Test RTL/LTR support
4. Verify text direction

## 📝 Development

### Available Scripts
```bash
pnpm run dev        # Development server
pnpm run build      # Build for production
pnpm run start      # Production server
pnpm run lint       # Code linting
```

### Code Quality
- ESLint with Next.js rules
- TypeScript strict mode
- Prettier formatting

## 🎨 Design System

### Components
- Prompt Cards: Display prompts with metadata
- Prompt Editor: Create and edit prompts
- Search Bar: Real-time search
- Tags Viewer: Filter by tags
- Language Switcher: Language selection
- Color Picker: Theme selection

### Design Tokens
- Color palette: 8 themes
- Typography: System fonts with Tajawal for Arabic
- Spacing: 4px grid
- Breakpoints: Mobile, tablet, desktop

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Documentation: Check the `/docs` folder
- Issues: GitHub Issues
- Discussions: GitHub Discussions

## 🎉 Version

**Current Version**: 3.0.0 (SQLite Edition)
**Previous Version**: 2.0.0 (Firebase Edition)

---

*Built with ❤️ for modern web development*
*Powered by Next.js, SQLite, and TypeScript*
