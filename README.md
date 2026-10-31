# UtensilKart - AI-Powered Kitchen E-Commerce Platform

A modern e-commerce platform for kitchen utensils and cookware with AI-powered shopping assistance, AR visualization, and intelligent product recommendations.

## 🚀 Features

### Core E-Commerce
- **Product Catalog** - Browse 100+ kitchen products across 5 categories (Cookware, Storage, Cutlery, Bakeware, Other)
- **Custom JWT Authentication** - OTP-based login system (dev mode: fixed OTP `123456`)
- **Shopping Cart** - Add to cart with inline quantity management
- **Checkout Flow** - Order placement with Razorpay integration (test mode)

### AI & Advanced Features
- **KitchenGenie AI Assistant** - Conversational shopping with Gemini AI
  - Personalized recommendations based on cooking habits, budget, family size
  - Priority-based product suggestions (High/Medium/Low)
  - Multi-turn dialogue with context awareness
- **Price Comparison Widget** - Real-time competitor price tracking
- **Image Search** - Upload product images to find similar items
- **AR Visualization** - View products in your space (AR-enabled items only)

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4
- **Backend**: Express.js v5 on Firebase Cloud Functions (Node 22)
- **Database**: Firestore (NoSQL)
- **AI**: Google Gemini 2.5 Flash
- **Auth**: Custom JWT (no Firebase Auth)
- **Payments**: Razorpay (test mode)

### Project Structure
```
d:/IPD/
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   │   ├── (auth)/       # Login/register pages
│   │   ├── products/     # Product catalog
│   │   ├── checkout/     # Checkout flow
│   │   └── assistant/    # AI shopping assistant
│   ├── components/       # React components
│   ├── lib/              # Utilities, API clients, providers
│   └── public/           # Static assets
│
└── functions/            # Express backend
    ├── src/
    │   ├── controllers/  # HTTP request handlers
    │   ├── services/     # Business logic
    │   ├── routes/       # API route definitions
    │   ├── middleware/   # Auth, validation
    │   └── payloadValidators/  # Zod schemas
    ├── server.js         # Local dev server
    └── seed-data.js      # Database seeding script
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 22+ (backend requires exactly v22)
- npm 10+
- Firebase project with Firestore enabled
- Gemini API key (free tier: https://aistudio.google.com/apikey)

### Backend Setup

1. **Navigate to functions directory**
   ```powershell
   cd d:/IPD/functions
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example` if provided)
   ```env
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:3000
   JWT_ACCESS_SECRET=your-secret-key-here
   JWT_REFRESH_SECRET=your-refresh-secret-here
   GCLOUD_PROJECT=your-firebase-project-id
   GEMINI_API_KEY=your-gemini-api-key
   INTERNAL_API_SECRET=your-internal-secret
   ```

4. **Add Firebase credentials**
   - Download `service-account.json` from Firebase Console
   - Place it in `functions/` directory
   - **Never commit this file!** (Already in `.gitignore`)

5. **Seed database**
   ```powershell
   node seed-data.js
   ```

6. **Start development server**
   ```powershell
   npm run dev
   # OR
   node server.js
   ```
   Backend runs on: **http://localhost:4001**

### Frontend Setup

1. **Navigate to frontend directory**
   ```powershell
   cd d:/IPD/frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Create `.env.local` file**
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4001
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_test_key
   ```

4. **Start development server**
   ```powershell
   npm run dev
   ```
   Frontend runs on: **http://localhost:3000**

## 📝 API Endpoints

### Authentication
- `POST /api/auth/otp/request` - Request OTP
- `POST /api/auth/otp/verify` - Verify OTP and get JWT
- `POST /api/auth/otp/resend` - Resend OTP
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Clear refresh token

### Products
- `GET /api/products` - List products (supports filters: category, brand, price range, search)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### AI Assistant
- `POST /api/ai/chat` - Send message to KitchenGenie
- `GET /api/ai/health` - Check AI service status
- `GET /api/ai/history?sessionId=xxx` - Get chat history

### Price Comparison
- `GET /api/products/:id/price-comparison` - Get competitor prices

### Image Search
- `POST /api/search/image` - Upload image and find similar products

## 🔧 Development Notes

### OTP Authentication (Development Mode)
In development (`NODE_ENV !== 'production'`), the OTP is hardcoded to `123456` for any phone number. No real SMS is sent.

### JWT Strategy
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry (httpOnly cookie)
- Tokens stored in memory on frontend
- No Firebase Auth used

### AI Assistant
- Uses Gemini 2.5 Flash model
- Catalog capped at 30 products per request (to avoid token limits)
- Supports priority recommendations (High/Medium/Low)
- Free tier: 20 requests/day per API key

### Firestore Collections
- `products` - Product catalog
- `users` - User profiles
- `otpVerifications` - OTP verification records
- `chatSessions` - AI chat history
- `orders` - Order records
- `priceComparisons` - Competitor price data

## 🚀 Deployment

### Backend (Firebase Functions)
```powershell
cd functions
firebase deploy --only functions
```

### Frontend (Vercel)
```powershell
cd frontend
vercel deploy --prod
```

Update environment variables in Vercel dashboard after deployment.

## 📦 Key Dependencies

### Backend
- `express` v5 - Web framework
- `firebase-admin` - Firestore & Auth
- `jsonwebtoken` - JWT generation
- `@google/generative-ai` - Gemini integration
- `zod` - Schema validation
- `axios` - HTTP client

### Frontend
- `next` v15 - React framework
- `react` v19 - UI library
- `tailwindcss` v4 - Styling
- `react-hook-form` - Form management
- `zustand` - State management
- `axios` - API client

## 🔐 Security Notes

- Never commit `.env` files or `service-account.json`
- JWT secrets should be changed before production
- Razorpay test keys only for development
- Enable CORS only for trusted origins in production

## 📄 License

Private project - All rights reserved

## 👤 Author

UtensilKart Team
