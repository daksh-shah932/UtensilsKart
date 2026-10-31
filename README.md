# UtensilKart - AI-Powered Kitchen E-Commerce Platform

A modern full-stack e-commerce platform for kitchen utensils and cookware with AI-powered shopping assistance, AR visualization, and intelligent product recommendations.

![Tech Stack](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-22-green?logo=node.js)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation Guide](#-installation-guide)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Development Guidelines](#-development-guidelines)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)

---

## 🚀 Features

### Core E-Commerce
- **Product Catalog** - Browse 100+ kitchen products across 5 categories
  - Cookware (Pressure Cookers, Pans, Kadhai, etc.)
  - Storage (Containers, Dabbas, Bottles)
  - Cutlery (Knives, Spatulas, Cutting Boards)
  - Bakeware (Trays, Molds, Mats)
  - Other (Appliances, Graters, Scales)
- **Custom JWT Authentication** - OTP-based login system
- **Shopping Cart** - Add to cart with inline quantity management (+/- controls)
- **Checkout Flow** - Complete order placement with Razorpay integration
- **Product Search & Filters** - Category, brand, price range, stock status

### AI & Advanced Features
- **KitchenGenie AI Assistant** - Conversational shopping powered by Google Gemini
  - Personalized recommendations based on cooking habits, budget, family size
  - Priority-based product suggestions (High/Medium/Low urgency)
  - Multi-turn dialogue with context awareness
  - Chat history persistence
- **Price Comparison Widget** - Real-time competitor price tracking
- **Image Search** - Upload product images to find similar items
- **AR Visualization** - View 3D models of products in your space (WebXR)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **State Management:** Zustand (cart), React Context (auth)
- **Form Handling:** React Hook Form + Zod validation
- **HTTP Client:** Axios

### Backend
- **Runtime:** Node.js 22
- **Framework:** Express.js v5
- **Hosting:** Firebase Cloud Functions (or local server for dev)
- **Database:** Firestore (NoSQL)
- **Authentication:** Custom JWT (jsonwebtoken)
- **Validation:** Zod schemas
- **AI:** Google Gemini 2.5 Flash

### Third-Party Services
- **Firebase:** Firestore database, Cloud Functions
- **Google Gemini:** AI chat assistant
- **Razorpay:** Payment gateway (test mode)
- **Unsplash:** Product placeholder images

---

## 🏗️ Architecture

### Three-Tier Backend Architecture
```
routes/ → controllers/ → services/
  ↓           ↓              ↓
Define     Validate      Business
endpoints  with Zod      logic +
           Extract       Firestore
           identity      queries
```

**Key Principles:**
- Routes define endpoints and attach middleware
- Controllers validate requests, extract `req.user.uid`, return HTTP responses
- Services contain pure business logic with zero knowledge of HTTP

### Frontend Structure
```
app/                    # Next.js App Router pages
├── (auth)/            # Login/register (route group)
├── products/          # Product catalog + detail pages
├── checkout/          # Checkout flow
└── assistant/         # AI shopping assistant

components/            # Reusable React components
├── ai/               # Chat UI components
├── auth/             # OTP forms
├── cart/             # Cart drawer
├── product/          # Product cards, AR viewer, price widget
└── layout/           # Navbar

lib/                   # Utilities and providers
├── api/              # API client functions (axios)
├── auth/             # Auth context provider
├── providers/        # Cart, query providers
└── validators/       # Zod schemas
```

---

## ✅ Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Required Version | Check Command |
|------|-----------------|---------------|
| **Node.js** | 22.x or higher | `node --version` |
| **npm** | 10.x or higher | `npm --version` |
| **Git** | Any recent version | `git --version` |

### Required Accounts & Keys
1. **Firebase Project** - [console.firebase.google.com](https://console.firebase.google.com)
   - Firestore database enabled
   - Service account key downloaded
2. **Google Gemini API Key** - [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
   - Free tier: 20 requests/day
3. **Razorpay Test Account** (optional for payments) - [dashboard.razorpay.com](https://dashboard.razorpay.com)

---

## 📦 Installation Guide

### Step 1: Clone the Repository

```powershell
git clone https://github.com/daksh-shah932/UtensilsKart.git
cd UtensilsKart
```

### Step 2: Backend Setup

#### 2.1 Install Backend Dependencies

```powershell
cd functions
npm install
```

**Expected output:**
```
added 289 packages, and audited 290 packages in 15s
```

#### 2.2 Configure Firebase

1. **Download Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to **Project Settings** → **Service Accounts**
   - Click **"Generate New Private Key"**
   - Save the JSON file as `service-account.json`

2. **Place the file in the `functions/` directory:**
   ```
   functions/
   ├── service-account.json  ← Place here
   ├── package.json
   └── ...
   ```

   ⚠️ **IMPORTANT:** This file contains sensitive credentials. Never commit it to git!

#### 2.3 Create Backend Environment Variables

Create a file named `.env` in the `functions/` directory:

```powershell
cd functions
New-Item -Name .env -ItemType File
```

Add the following content to `functions/.env`:

```env
# Node environment
NODE_ENV=development

# Allowed CORS origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Custom JWT secrets — CHANGE THESE before deploying to production!
JWT_ACCESS_SECRET=your-random-secret-key-here-change-me
JWT_REFRESH_SECRET=your-random-refresh-secret-key-here-change-me

# Secret for the internal price-comparison refresh endpoint
INTERNAL_API_SECRET=your-internal-secret-change-me

# Firebase project ID (find this in Firebase Console)
GCLOUD_PROJECT=your-firebase-project-id

# Google Gemini AI API Key (get from https://aistudio.google.com/apikey)
GEMINI_API_KEY=your-gemini-api-key-here
```

**How to fill these values:**

| Variable | How to Get It | Example |
|----------|---------------|---------|
| `GCLOUD_PROJECT` | Firebase Console → Project Settings → Project ID | `utensilkart-prod` |
| `GEMINI_API_KEY` | Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → Create API Key | `AIza...` |
| `JWT_ACCESS_SECRET` | Generate random string (32+ chars) | Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Generate random string (32+ chars) | Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `INTERNAL_API_SECRET` | Generate random string (32+ chars) | Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

#### 2.4 Seed the Database

Populate Firestore with initial product data:

```powershell
cd functions
node seed-data.js
```

**Expected output:**
```
🌱 Seeding comprehensive product data to Firestore...
   ✅ Queued: Prestige Non-Stick Frying Pan
   ✅ Queued: Hawkins Stainless Steel Pressure Cooker
   ...
✅ Successfully seeded 21 products!
```

### Step 3: Frontend Setup

#### 3.1 Install Frontend Dependencies

```powershell
cd ../frontend
npm install
```

**Expected output:**
```
added 490 packages, and audited 491 packages in 22s
```

#### 3.2 Create Frontend Environment Variables

Create a file named `.env.local` in the `frontend/` directory:

```powershell
cd frontend
New-Item -Name .env.local -ItemType File
```

Add the following content to `frontend/.env.local`:

```env
# Backend API base URL (local development)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4001

# Razorpay Test Key (optional - for payment testing)
# Get from: https://dashboard.razorpay.com/app/website-app-settings/api-keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_here
```

**Note:** If you don't have a Razorpay key yet, leave it blank. Checkout will show a mock UI.

---

## 🔧 Environment Setup

### File Structure After Setup

```
UtensilsKart/
├── functions/
│   ├── .env                    ← YOU CREATED THIS
│   ├── service-account.json    ← YOU DOWNLOADED THIS
│   ├── node_modules/           ← npm install created this
│   ├── package.json
│   └── src/
│
├── frontend/
│   ├── .env.local              ← YOU CREATED THIS
│   ├── node_modules/           ← npm install created this
│   ├── package.json
│   └── app/
│
├── .gitignore                  ← Prevents committing secrets
└── README.md
```

### Verify Setup

Check that sensitive files are NOT tracked by git:

```powershell
cd ..  # Go back to project root
git status
```

**You should NOT see:**
- ❌ `functions/.env`
- ❌ `functions/service-account.json`
- ❌ `frontend/.env.local`
- ❌ `node_modules/`

If you see any of these, they're already in `.gitignore` and safe.

---

## 🚀 Running the Application

### Development Mode (Recommended)

#### Terminal 1: Start Backend

```powershell
cd functions
npm run dev
# OR
node server.js
```

**Expected output:**
```
✅  UtensilKart API running at http://localhost:4001
   Health check: http://localhost:4001/health
```

**Test the backend:**
```powershell
# In a new terminal
Invoke-RestMethod http://localhost:4001/health
```

Expected response: `{ "status": "ok", "timestamp": "..." }`

#### Terminal 2: Start Frontend

```powershell
cd frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 15.2.4
- Local:        http://localhost:3000
- Network:      http://10.x.x.x:3000

✓ Starting...
✓ Ready in 5.6s
```

### Access the Application

Open your browser and navigate to:
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4001](http://localhost:4001)
- **AI Assistant:** [http://localhost:3000/assistant](http://localhost:3000/assistant)

### Test Login (Development Mode)

The OTP is hardcoded in development for testing:

1. Go to [http://localhost:3000/login](http://localhost:3000/login)
2. Enter any 10-digit phone number (e.g., `9876543210`)
3. Click **"Send OTP"**
4. Enter OTP: **`123456`**
5. Click **"Verify"**

You'll be logged in with a JWT token stored in memory.

---

## 📁 Project Structure

### Backend (`functions/`)

```
functions/
├── src/
│   ├── controllers/           # HTTP request handlers
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── ai.controller.js
│   │   ├── priceComparison.controller.js
│   │   └── search.controller.js
│   │
│   ├── services/              # Business logic + Firestore queries
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── aiService.js
│   │   └── priceComparison.service.js
│   │
│   ├── routes/                # API route definitions
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── ai.routes.js
│   │   └── ...
│   │
│   ├── middleware/            # Authentication & validation
│   │   ├── requireAuth.js     # JWT verification
│   │   └── requireAdmin.js    # Admin role check
│   │
│   ├── payloadValidators/     # Zod validation schemas
│   │   ├── auth.validator.js
│   │   └── product.validator.js
│   │
│   ├── utils/                 # Helper functions
│   │   └── collections.js     # Firestore collection constants
│   │
│   ├── config/                # Configuration
│   │   └── firebase.js        # Firebase Admin SDK init
│   │
│   ├── app.js                 # Express app setup
│   └── index.js               # Firebase Cloud Function export
│
├── server.js                  # Local development server
├── seed-data.js               # Database seeding script
├── package.json
└── .env                       # Environment variables (YOU CREATE THIS)
```

### Frontend (`frontend/`)

```
frontend/
├── app/                       # Next.js App Router
│   ├── (auth)/               # Auth routes (route group)
│   │   └── login/
│   │       └── page.jsx
│   │
│   ├── products/             # Product pages
│   │   ├── page.jsx         # Product listing
│   │   └── [id]/
│   │       └── page.jsx     # Product detail
│   │
│   ├── checkout/
│   │   └── page.jsx
│   │
│   ├── assistant/            # AI chat assistant
│   │   └── page.jsx
│   │
│   ├── layout.jsx            # Root layout
│   ├── page.jsx              # Homepage
│   └── globals.css           # Global styles + Tailwind
│
├── components/               # React components
│   ├── ai/
│   │   ├── ChatWindow.jsx
│   │   ├── MessageBubble.jsx
│   │   └── InputArea.jsx
│   │
│   ├── product/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── PriceComparatorWidget.jsx
│   │   └── ARViewerButton.jsx
│   │
│   ├── cart/
│   │   └── CartDrawer.jsx
│   │
│   └── layout/
│       └── Navbar.jsx
│
├── lib/                      # Utilities & helpers
│   ├── api/                  # API client functions
│   │   ├── axiosClient.js   # Configured axios instance
│   │   ├── authApi.js
│   │   └── productApi.js
│   │
│   ├── auth/
│   │   └── AuthProvider.jsx # Auth context
│   │
│   ├── providers/
│   │   └── CartProvider.jsx # Shopping cart state
│   │
│   └── validators/
│       └── auth.schema.js   # Zod schemas
│
├── public/                   # Static assets
├── next.config.js
├── tailwind.config.js
├── package.json
└── .env.local               # Environment variables (YOU CREATE THIS)
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Request OTP
```http
POST http://localhost:4001/api/auth/otp/request
Content-Type: application/json

{
  "identifier": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "expiresAt": "2026-08-05T12:34:56.789Z"
}
```

#### Verify OTP
```http
POST http://localhost:4001/api/auth/otp/verify
Content-Type: application/json

{
  "identifier": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "OTP verified successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "uid": "user_abc123",
    "identifier": "9876543210",
    "role": "customer"
  }
}
```

### Product Endpoints

#### List Products
```http
GET http://localhost:4001/api/products?category=cookware&limit=20
```

**Query Parameters:**
- `category` - Filter by category (cookware, storage, cutlery, bakeware, other)
- `brand` - Filter by brand
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `inStock` - true/false
- `search` - Search by name, description, tags
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 50)

**Response:**
```json
{
  "products": [
    {
      "id": "RASdM8DC8GYavvj62C9y",
      "name": "Prestige Non-Stick Frying Pan",
      "brand": "Prestige",
      "price": 899,
      "category": "cookware",
      "images": ["https://..."],
      "inStock": true
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

#### Get Single Product
```http
GET http://localhost:4001/api/products/{productId}
```

### AI Assistant

#### Chat with KitchenGenie
```http
POST http://localhost:4001/api/ai/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "I need a pressure cooker for a family of 4" }
  ],
  "sessionId": "session_abc123",
  "chatId": "chat_xyz789"
}
```

**Response:**
```json
{
  "reply": "For a family of 4, I'd recommend a 5L pressure cooker...",
  "recommended_products": [
    {
      "id": "nPwH9AdcSg9pYfl8VwmX",
      "name": "Hawkins Stainless Steel Pressure Cooker",
      "_priority": "high"
    }
  ]
}
```

### Price Comparison

#### Get Competitor Prices
```http
GET http://localhost:4001/api/products/{productId}/price-comparison
```

**Response:**
```json
{
  "productId": "RASdM8DC8GYavvj62C9y",
  "ourPrice": 899,
  "competitors": [
    {
      "platform": "Amazon",
      "price": 1099,
      "url": "https://amazon.in/..."
    }
  ]
}
```

---

## 👨‍💻 Development Guidelines

### Code Style

**Backend:**
- Use 3-tier architecture strictly (routes → controllers → services)
- Always validate with Zod schemas in controllers
- Services should have zero knowledge of `req`/`res`
- Collection names via `COLLECTIONS` constants only

**Frontend:**
- All files: `.js` (utilities) or `.jsx` (components) — **no TypeScript**
- Tailwind utility classes for styling — avoid inline styles
- Use CSS variables from `globals.css` for colors
- API calls through `lib/api/` functions only

### Authentication Flow

```
1. User enters phone number
2. Backend generates OTP (dev: hardcoded 123456)
3. User verifies OTP
4. Backend returns:
   - accessToken (15min expiry, sent in JSON)
   - refreshToken (7 days, httpOnly cookie)
5. Frontend stores accessToken in memory
6. On app mount, frontend calls /api/auth/refresh to restore session
```

### Adding a New Feature

#### 1. Backend API

```powershell
# 1. Define Zod schema
functions/src/payloadValidators/feature.validator.js

# 2. Create service (business logic)
functions/src/services/feature.service.js

# 3. Create controller (HTTP handler)
functions/src/controllers/feature.controller.js

# 4. Define routes
functions/src/routes/feature.routes.js

# 5. Register routes in app.js
functions/src/app.js
```

#### 2. Frontend Integration

```powershell
# 1. Create API client function
frontend/lib/api/featureApi.js

# 2. Create UI component
frontend/components/feature/FeatureName.jsx

# 3. Create page (if needed)
frontend/app/feature/page.jsx
```

---

## 🐛 Troubleshooting

### Backend Issues

#### Error: "ENOENT: no such file or directory, open 'service-account.json'"

**Solution:** Download the service account key from Firebase Console and place it in `functions/` directory.

```powershell
cd functions
# Place service-account.json here
ls service-account.json  # Should show the file
```

#### Error: "GEMINI_API_KEY is not set"

**Solution:** Add the Gemini API key to `functions/.env`:

```env
GEMINI_API_KEY=your-actual-key-here
```

Get a key from: https://aistudio.google.com/apikey

#### Error: "Port 4001 already in use"

**Solution:** Kill the existing process:

```powershell
Get-Process node | Stop-Process -Force
```

Then restart the server.

#### Error: "The query requires an index"

**Solution:** Deploy Firestore indexes:

```powershell
cd functions
firebase login
firebase deploy --only firestore:indexes
```

Wait 3-5 minutes for indexes to build.

### Frontend Issues

#### Error: "Cannot find module '@tailwindcss/postcss'"

**Solution:** Reinstall Tailwind CSS v4:

```powershell
cd frontend
npm install tailwindcss@next @tailwindcss/postcss@next
```

#### Error: "Hostname not configured under images"

**Solution:** Add the hostname to `next.config.js`:

```javascript
module.exports = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};
```

#### Error: "Failed to fetch" when calling API

**Checklist:**
1. Is backend running? Check: `http://localhost:4001/health`
2. Is `NEXT_PUBLIC_API_BASE_URL` correct in `.env.local`?
3. Check browser console for CORS errors
4. Verify `ALLOWED_ORIGINS` in backend `.env` includes `http://localhost:3000`

### AI Assistant Issues

#### "AI is temporarily rate-limited"

**Cause:** Free tier Gemini API allows 20 requests/day.

**Solutions:**
1. **Get a new free API key:** https://aistudio.google.com/apikey
2. **Enable billing:** $10/month credit (essentially free for dev)
3. **Wait 10+ hours** for quota reset

Update `functions/.env` with new key and restart backend.

---

## 🚀 Deployment

### Backend (Firebase Cloud Functions)

#### 1. Install Firebase CLI

```powershell
npm install -g firebase-tools
firebase login
```

#### 2. Configure Firebase Project

```powershell
cd functions
firebase use your-project-id
```

#### 3. Set Environment Variables

```powershell
firebase functions:config:set \
  jwt.access_secret="your-secret" \
  jwt.refresh_secret="your-secret" \
  gemini.api_key="your-key"
```

#### 4. Deploy

```powershell
firebase deploy --only functions
```

**Deployed URL:** `https://us-central1-your-project.cloudfunctions.net/api`

### Frontend (Vercel)

#### 1. Install Vercel CLI

```powershell
npm install -g vercel
```

#### 2. Deploy

```powershell
cd frontend
vercel deploy --prod
```

#### 3. Set Environment Variables in Vercel Dashboard

Go to: `https://vercel.com/your-team/your-project/settings/environment-variables`

Add:
```
NEXT_PUBLIC_API_BASE_URL=https://us-central1-your-project.cloudfunctions.net/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key
```

---

## 📄 License

Private project - All rights reserved

---

## 👥 Team

**UtensilKart Development Team**

For questions or issues, please open a GitHub issue or contact the team.

---

## 🙏 Acknowledgments

- **Firebase** - Backend infrastructure
- **Google Gemini** - AI assistant capabilities
- **Vercel** - Frontend hosting
- **Unsplash** - Product images
- **Razorpay** - Payment integration

---

**Last Updated:** August 2026
