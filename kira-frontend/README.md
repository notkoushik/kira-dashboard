# KIRA Frontend - Modern Refactored Architecture

This is the refactored KIRA Dashboard frontend, built from a monolithic 2,633-line HTML file into a clean, modular TypeScript + Vite architecture.

## 🚀 Quick Start

### Installation

```bash
cd kira-frontend
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Outputs optimized build to `dist/`

### Preview Production Build

```bash
npm run preview
```

### Testing

```bash
# Unit tests
npm run test

# Unit tests with UI
npm run test:ui

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## 📁 Project Structure

```
src/
├── config/          # Environment & constants
├── services/        # API client, state, auth, domain logic
├── components/      # UI components (tabs, modals, nav)
├── utils/           # Helper functions (string, color, DOM, data)
├── styles/          # Modular CSS with design tokens
├── types/           # TypeScript definitions
├── App.ts          # Main app component (Phase 5)
├── main.ts         # Entry point
└── index.css       # Global styles

public/
└── index.html      # Minimal HTML entry point

```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in `kira-frontend/`:

```bash
# API Configuration
VITE_API_BASE=https://kira-dashboard-omega.vercel.app/api/v1

# For local development:
# VITE_API_BASE=http://localhost:3002/api/v1

# Error Monitoring (optional)
VITE_ENABLE_SENTRY=false
VITE_SENTRY_DSN=
```

See `.env.example` for all options.

## 📊 Implementation Status

- ✅ **Phase 1: Setup** — Build tooling, TypeScript, config, entry point
- ⏳ **Phase 2: Services** — API client, state management, domain services
- ⏳ **Phase 3: Components** — UI components (tabs, modals, nav)
- ⏳ **Phase 4: Styling** — Modular CSS with design system
- ⏳ **Phase 5: App Shell** — Integration and initialization
- ⏳ **Phase 6: Deployment** — Vercel config updates
- ⏳ **Phase 7: Testing** — Unit & E2E test suite

## 🔧 Tech Stack

- **TypeScript 5.4** — Type safety
- **Vite 5.2** — Fast build tool & dev server
- **Vanilla TypeScript** — No heavy framework
- **CSS with Design Tokens** — Modular, maintainable styling
- **Vitest 1.6** — Unit testing
- **Playwright 1.44** — E2E testing

## 📚 Architecture Principles

1. **Modular** — Small, focused files with single responsibilities
2. **Type-Safe** — Full TypeScript coverage
3. **Performant** — Tree-shaking, code splitting, minimal bundle
4. **Testable** — Clear boundaries for unit and E2E tests
5. **Maintainable** — CSS variables, consistent patterns, clean code
6. **Accessible** — Semantic HTML, ARIA labels, keyboard navigation

## 🎯 Design System

All design tokens (colors, spacing, typography, shadows) are defined in `src/styles/variables.css`.

Update the `:root` CSS variables to change the entire app theme.

## 📦 Build Optimization

- **Tree-shaking** — Unused exports removed
- **Code splitting** — Vendor bundle separated for caching
- **Minification** — Terser for smaller output
- **Source maps** — Disabled in production (can be enabled if needed)

## 🚢 Deployment to Vercel

The frontend builds automatically when pushed to `main` if `kira-frontend/package.json` is detected.

**Build Command:** `npm run build`  
**Output Directory:** `dist/`

Environment variables are configured in Vercel dashboard:
- `VITE_API_BASE` → Set to your backend URL

## 🔗 API Integration

The API client automatically uses:
```typescript
import { config } from './config/env';
const apiBase = config.api.base; // From VITE_API_BASE env var
```

All API calls go through centralized service layer (Phase 2):
- `src/services/api.ts` — HTTP client
- `src/services/auth.ts` — Authentication
- `src/services/jobs.ts`, `hrcontacts.ts`, etc. — Domain services

## 📋 Next Steps

1. **Phase 2** — Extract services from old HTML (api, auth, state, domain logic)
2. **Phase 3** — Build UI components (tabs, modals, forms)
3. **Phase 4** — Apply existing design system
4. **Phase 5** — Wire everything together in App.ts
5. **Phase 6** — Update Vercel deployment config
6. **Phase 7** — Add unit & E2E tests

## 📖 Documentation

- [Vite Docs](https://vitejs.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [Vitest Docs](https://vitest.dev)
- [Playwright Docs](https://playwright.dev)

## 💡 Tips

- Use `npm run lint` to check TypeScript errors before committing
- Keep services in `src/services/` with focused responsibilities
- Add component subtypes in `src/components/` folders (tabs/, modals/)
- Extend design tokens in `src/styles/variables.css`
- Test complex logic with Vitest, UI flows with Playwright

## 🤝 Contributing

Follow the modular patterns established in this architecture:
- One component per file
- Services are singletons or factories
- CSS scoped by class names (no CSS-in-JS)
- Full TypeScript coverage (strict mode)
- Test critical paths
