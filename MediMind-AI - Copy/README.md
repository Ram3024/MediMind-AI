# 🏥 MediMind AI — Intelligent Healthcare Platform

> **AI-powered healthcare companion** — Analyze symptoms, consult doctors, order medicines, and track your health in one premium app.

![MediMind AI](https://img.shields.io/badge/MediMind-AI%20Healthcare-14b8a6?style=for-the-badge&logo=heart)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06b6d4?style=for-the-badge&logo=tailwind-css)

---

## ✨ Features

### 🤖 AI Health Assistant
- Symptom analysis with AI (Gemini API)
- Voice input/output (Hindi + English)
- Emergency detection (chest pain, unconsciousness)
- Multilingual — Hindi & English
- Streaming responses with typing animation

### 💊 Medicine Store
- Search 1800+ medicines instantly
- Prescription upload & OCR
- Add to cart, checkout
- Live order tracking with animations
- Medicine details: uses, dosage, side effects

### 👨‍⚕️ Doctor Consultation
- 6+ specialist doctors (Cardiologist, Neurologist, Dermatologist etc.)
- Video call UI
- Appointment booking with date/time selection
- Payment integration (Razorpay-ready)
- Doctor ratings & reviews

### ❤️ Health Tracker
- Heart rate, blood pressure, BMI
- Daily steps, water intake, sleep tracker
- Blood sugar logs
- Animated charts (Recharts)
- Editable metrics

### 🎨 Premium UI/UX
- Glassmorphism design
- Framer Motion animations
- Dark/Light mode
- Voice wave animations
- Typing indicator
- Floating AI orb
- Responsive mobile-first layout

### 🔐 Authentication
- Email/Password login
- Google OAuth
- OTP verification
- Profile management

### 📊 Admin Panel
- User management
- Doctor management  
- Medicine inventory
- Revenue analytics
- Order management

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm / yarn

### Installation

```bash
# Clone the project
cd medimind-ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini AI API key | Optional (mock fallback) |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `NEXTAUTH_URL` | App URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | Optional |
| `MONGODB_URI` | MongoDB connection string | Optional |
| `RAZORPAY_KEY_ID` | Razorpay payment key | Optional |

> **Note**: The app works fully with mock data without any API keys. Add `GEMINI_API_KEY` for real AI responses.

---

## 📁 Project Structure

```
medimind-ai/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Protected app pages
│   │   ├── dashboard/            # Home dashboard
│   │   ├── chat/                 # AI chat assistant
│   │   ├── symptom-checker/      # AI symptom analysis
│   │   ├── medicines/            # Medicine store
│   │   ├── doctors/              # Doctor consultation
│   │   ├── health-tracker/       # Health metrics
│   │   ├── profile/              # User profile
│   │   └── settings/             # App settings
│   ├── admin/                    # Admin dashboard
│   ├── login/                    # Auth pages
│   ├── register/
│   ├── onboarding/               # User onboarding
│   └── page.tsx                  # Landing/Splash page
├── components/                   # Reusable components
│   ├── AuthPages.tsx             # Login/Register pages
│   └── Providers.tsx             # Theme & context providers
├── lib/                          # Utilities & data
│   ├── ai.ts                     # Gemini AI integration
│   ├── mockData.ts               # All mock data
│   └── utils.ts                  # Helper functions
├── store/                        # Zustand state management
│   ├── cartStore.ts              # Shopping cart state
│   └── chatStore.ts              # Chat history state
└── public/                       # Static assets
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Custom CSS |
| Animations | Framer Motion |
| State | Zustand (with persistence) |
| Charts | Recharts |
| Icons | Lucide React |
| AI | Google Gemini API (with mock fallback) |
| Auth | NextAuth.js |
| Fonts | Google Fonts (Inter + Outfit) |

---

## 📱 Pages

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Splash + hero page |
| Onboarding | `/onboarding` | 3-step onboarding |
| Login | `/login` | Email + Google auth |
| Register | `/register` | OTP verification |
| Dashboard | `/dashboard` | Health summary |
| AI Chat | `/chat` | AI health assistant |
| Symptoms | `/symptom-checker` | AI symptom analysis |
| Medicines | `/medicines` | Medicine store |
| Doctors | `/doctors` | Video consultation |
| Health | `/health-tracker` | Health metrics |
| Profile | `/profile` | User profile |
| Settings | `/settings` | App preferences |
| Admin | `/admin` | Admin dashboard |

---

## 🌟 AI Features

- **Gemini API Integration** — Real AI when API key is set
- **Smart Fallback** — Intelligent mock responses without API key
- **Emergency Detection** — Detects life-threatening symptoms
- **Hindi + English** — Full bilingual support
- **Voice AI** — Web Speech API for input/output
- **Streaming** — Word-by-word response streaming
- **Context Memory** — Conversation history maintained

---

## ⚠️ Medical Disclaimer

> MediMind AI is for **informational purposes only** and does not constitute medical advice. Always consult a qualified healthcare professional for medical diagnosis and treatment. In case of medical emergency, call **112** (India Emergency) immediately.

---

## 📄 License

MIT License — Built with ❤️ for better healthcare access.

---

*MediMind AI — Making healthcare intelligent, accessible, and affordable.*
