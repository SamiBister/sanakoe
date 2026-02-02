# Sanakoe - Language Quiz for Kids

A kid-friendly web application to practice vocabulary for school language tests (ages 9–13). Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Dual Input Methods**: Upload CSV files or manually enter vocabulary words
- **Gamified Quiz**: Engaging quiz experience with normal and practice modes
- **Personal Records**: Track best performance (tries and time)
- **Bilingual UI**: Support for Finnish and English
- **Global Word List**: View word status at any time
- **Kid-Friendly Design**: Encouraging feedback and playful visual elements

## 📋 Prerequisites

- Node.js 18+
- npm 9+

## 🛠️ Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd sanakoe
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file (optional):

```bash
cp .env.local.example .env.local
```

## 🏃 Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Building

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📝 Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## 🏗️ Project Structure

```
sanakoe/
├── docs/
│   └── plan/          # Project documentation and planning
├── src/
│   ├── app/           # Next.js App Router pages
│   ├── components/    # React components
│   │   └── ui/        # Reusable UI components
│   ├── lib/           # Utility functions and core logic
│   ├── hooks/         # Custom React hooks
│   └── messages/      # i18n translation files
├── public/            # Static assets
│   └── icons/         # SVG icons
└── ...config files
```

## 🎨 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **i18n**: next-intl
- **Storage**: localStorage (browser)

## 📖 Documentation

- [Specification](docs/plan/sanakoe.md) - Detailed product specification
- [Implementation Plan](docs/plan/sanakoe-plan.md) - Development roadmap

## 🧪 Testing

The project uses Jest for unit testing with full TypeScript support.

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Coverage:**

- CSV Parser: 27 tests, 98.71% coverage ✅
- Answer Matcher: 37 tests, 100% coverage ✅
- localStorage Utilities: 41 tests, 90.99% coverage ✅
- List Fingerprinting: 45 tests, 100% coverage ✅
- Zustand Quiz Store: 58 tests, 94.33% coverage ✅
- **Total**: 208 tests, all passing ✅

## 🚢 Deployment

The application can be deployed to:

- **Vercel** (recommended) - Optimized for Next.js
- **Netlify** - Alternative with similar features
- **Static Hosting** - Enable `output: 'export'` in `next.config.js`

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please read the specification and implementation plan before contributing.

## ✨ Status

**Current Phase**: State Management (Phase 3) 🚧

**Completed:**

- ✅ **Phase 1**: Project Setup & Infrastructure
  - Task 1.1: Project Setup Complete
  - Task 1.2: i18n System Configured
- ✅ **Phase 2**: Core Data Types & Utilities
  - Task 2.1: TypeScript Types Defined
  - Task 2.2: CSV Parser Implemented (98.71% coverage)
  - Task 2.3: Answer Matcher Implemented (100% coverage)
  - Task 2.4: localStorage Utilities Implemented (90.99% coverage)
  - Task 2.5: List Fingerprinting Implemented (100% coverage)
- 🚧 **Phase 3**: State Management
  - Task 3.1: Zustand Quiz Store Implemented (94.33% coverage) ✅
  - Task 3.2: Timer Hook (In Progress)

**Next Steps**:

- Complete timer hook (Task 3.2)
- Build UI component library (Phase 4)
- Implement word list input components (Phase 5)

**i18n Features Implemented:**

- ✅ Locale-based routing (`/fi/*`, `/en/*`)
- ✅ Finnish and English translations
- ✅ Language selector component
- ✅ next-intl middleware for automatic locale detection
- ✅ Comprehensive translation keys for all screens

**Test the Application:**

- Visit: `http://localhost:3000` (redirects to `/fi`)
- English: `http://localhost:3000/en`
- Finnish: `http://localhost:3000/fi`

---

**Built with ❤️ for young learners**
