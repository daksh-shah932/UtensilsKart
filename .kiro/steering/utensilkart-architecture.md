---
inclusion: always
---

# UtensilKart — Architecture & Coding Rules

## Project Structure

```
d:/IPD/
├── frontend/          # Next.js 15 App Router (React 19, JS/JSX only — no TypeScript)
└── functions/         # Firebase Cloud Functions (Express.js v5, Node 22, JS only)
```

---

## Backend Rules (functions/)

### 1. Three-Tier Architecture — strict separation
- **Routes** (`src/routes/*.routes.js`): only define endpoints and attach middleware
- **Controllers** (`src/controllers/*.controller.js`): validate with Zod, extract identity from `req.user.uid`, delegate to service, return HTTP response
- **Services** (`src/services/*.service.js`): pure business logic + Firestore queries only — zero knowledge of `req`/`res`

### 2. Zod validation — always, never manual if-checks
- All incoming `req.body` / `req.query` MUST be validated with a Zod schema from `src/payloadValidators/`
- Use `schema.safeParse()` in the controller; on failure return `400` with `parsed.error.flatten().fieldErrors`
- Manual `if (!req.body.field)` validation chains are forbidden

### 3. Firestore collection constants — no raw strings
- All collection names live in `src/utils/collections.js` as `COLLECTIONS` export
- Import and use `COLLECTIONS.X` everywhere — never hardcode strings like `"products"`
- Adding a new model = add its key to `collections.js` first

### 4. Identity always from JWT
- Controllers must use `req.user.uid` (set by `requireAuth` middleware)
- Never trust `req.body.userId` or any client-supplied identity field

### 5. Cloud-only — no emulators
- All Firestore, Auth, and API calls hit live production Firebase
- No `127.0.0.1`, `localhost`, or emulator endpoints anywhere

---

## Frontend Rules (frontend/)

### 1. JS/JSX only — no TypeScript
- All files: `.js` (logic/utilities) or `.jsx` (components/pages)
- No `.ts` or `.tsx` files
- `jsconfig.json` handles path aliases (`@/*`)

### 2. Styling — Tailwind CSS v4 only
- Tailwind utility classes for all styling
- `style={{ ... }}` inline styles forbidden unless value is genuinely runtime-computed (e.g. a dynamic transform)
- Never hardcode hex/RGB values (`#1a1a1a`, `rgb(...)`) in components
- Always reference tokens from `app/globals.css` CSS variables: `bg-[var(--color-primary)]`, `text-[var(--color-text-secondary)]`, etc.
- Do not create component-level color constants (`const RED = '#e74c3c'`)
- If a new token is needed, add it to `globals.css` — do not invent local constants

### 3. All API calls through axiosClient
- Single instance: `lib/api/axiosClient.js`
- No ad-hoc `fetch()` or `axios.create()` anywhere in components or hooks
- API functions live in `lib/api/*.js` files and are called from pages/components

### 4. Auth token — memory only
- `accessToken` is stored in the axiosClient module variable and `AuthProvider` context
- Never write tokens to `localStorage`, `sessionStorage`, or cookies from the frontend
- Refresh token is an httpOnly cookie managed by the browser/backend

### 5. Forms — React Hook Form + Zod
- All forms use `react-hook-form` with `zodResolver`
- Zod schemas live in `lib/validators/*.schema.js`
- No manual `if` validation chains in form handlers

### 6. Loading and error states
- Every async widget needs a skeleton loading state matching final layout dimensions (no layout shift)
- Revenue-page widgets (Price Comparator) must return `null` silently on error/empty — no error banners
- Use the `.skeleton` CSS class from `globals.css` for shimmer effects

---

## Feature Reference

| Feature | Frontend entry | Backend endpoints |
|---|---|---|
| OTP Auth | `app/(auth)/login/page.jsx` | `POST /api/auth/otp/request|verify|resend` |
| Products | `app/products/page.jsx`, `app/products/[id]/page.jsx` | `GET /api/products`, `GET /api/products/:id` |
| Price Comparator | `components/product/PriceComparatorWidget.jsx` | `GET /api/products/:id/price-comparison` |
| Image Search | `components/search/ImageSearchModal.jsx` | `POST /api/search/image` |
| AR Visualizer | `components/product/ARViewerButton.jsx` | — (reads `product.arModelUrl` from product API) |

---

## Out of Scope (do not build)
- AI Shopping Assistant (chat widget, RAG, LLM calls)
- ML image embeddings or vector search
- Admin competitor-mapping UI
- Payment / checkout flow
