<div align="center">
  <img src="frontend/public/streamkart-logo-nav.png" alt="StreamKart Logo" width="450" />

  <br />
  
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=800&size=24&duration=3000&pause=1000&color=5B4BFF&center=true&vCenter=true&width=600&lines=Your+Premium+Digital+Marketplace;Buy+%26+Sell+Digital+Subscriptions;OTT%2C+AI+Tools%2C+VPNs+%26+More" alt="Typing SVG" />
  </a>

  <p align="center">
    <strong>A next-generation, full-stack digital subscription and access tier marketplace.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  </p>

  <p align="center">
    <a href="#-about-streamkart">About</a> • 
    <a href="#-key-features">Features</a> • 
    <a href="#-tech-stack">Tech Stack</a> • 
    <a href="#-getting-started">Getting Started</a> • 
    <a href="#-architecture">Architecture</a>
  </p>
</div>

---

## 🌟 About StreamKart

StreamKart provides a seamless, high-performance ecosystem for managing, distributing, and purchasing digital access tiers and subscriptions. Designed with a stunning, modern glassmorphic UI, it bridges the gap between digital merchants and buyers, offering integrated payment solutions, real-time communications, and instant digital delivery.

---

## ⚡ Key Features

- 🎨 **Premium UI/UX**: State-of-the-art design system featuring responsive glassmorphism, fluid typography, and micro-animations powered by Framer Motion.
- 🔐 **Robust Authentication**: Secure, multi-provider login (Google, Phone OTP, Email) powered by Firebase Auth, with role-based access control (Admin, Seller, User).
- 🛒 **Seller Dashboard**: Comprehensive analytics, real-time sales tracking, financial reporting, and streamlined inventory management.
- 💳 **Secure Payments**: Frictionless checkout using integrated payment gateways (Stripe & Razorpay) with automated invoice generation.
- 💬 **Live Order Chat**: Real-time Socket.IO communication between buyers and sellers to securely coordinate digital delivery and resolve issues.
- 🚀 **Performance Optimized**: Built on Vite with intelligent code-splitting, lazy loading, and optimized global state management using Zustand.

---

## 🛠 Tech Stack

### Frontend Architecture
- **Framework**: [React 18](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) & [TanStack Query](https://tanstack.com/query)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Routing**: React Router v6

### Backend Infrastructure
- **Server Environment**: Node.js & Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas with Mongoose ORM
- **Real-time WebSockets**: Socket.IO

### Third-Party Services
- **Authentication**: Firebase Auth
- **Payment Processing**: Stripe, Razorpay
- **Cloud Storage**: Firebase Cloud Storage

---

## 🚀 Getting Started

Follow these instructions to set up StreamKart locally for development and testing.

### Prerequisites

Ensure your local environment meets the following requirements:
- Node.js (v18.0.0 or higher)
- npm or yarn package manager
- A MongoDB Atlas Cluster (or Local MongoDB instance)
- A Firebase Project (with Auth and Storage enabled)
- Stripe / Razorpay Developer Accounts

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env

# Start the development server (Defaults to port 5000)
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env

# Start the Vite development server (Defaults to port 5173)
npm run dev
```

---

## 🔒 Environment Variables

To run this project securely, add the following environment variables to your respective `.env` files. Reference the provided `.env.example` files in the repository.

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | API Server port (e.g., 5000) |
| `MONGO_URI` | MongoDB Connection String |
| `JWT_SECRET` | Secret key for signing JWTs |
| `STRIPE_SECRET_KEY` | Stripe API Secret Key |
| `RAZORPAY_KEY_SECRET`| Razorpay API Secret |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |
| `VITE_FIREBASE_API_KEY` | Firebase Client API Key |
| `VITE_STRIPE_PUBLIC_KEY`| Stripe Publishable Key |

---

## 📂 Architecture

```text
StreamKart/
├── backend/                  # API Server (Node/Express/TS)
│   ├── src/
│   │   ├── controllers/      # Route logic and request handlers
│   │   ├── middlewares/      # Auth, Error, and Validation guards
│   │   ├── models/           # Mongoose database schemas
│   │   ├── routes/           # RESTful API endpoints
│   │   ├── services/         # Core business logic and integrations
│   │   └── server.ts         # Server entry point
│   └── package.json
└── frontend/                 # Client App (React/Vite)
    ├── src/
    │   ├── components/       # Reusable, atomic UI elements
    │   ├── layouts/          # Page wrappers (Auth, Dashboard, Public)
    │   ├── pages/            # View components
    │   ├── services/         # API integration methods (Axios)
    │   ├── store/            # Zustand global state slices
    │   └── main.jsx          # Client entry point
    └── package.json
```

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=5B4BFF&height=100&section=footer" width="100%" alt="Footer Wave" />
</div>