<div align="center">
  <img src="frontend/public/streamkart-logo-nav.png" alt="StreamKart Logo" width="480" />

  <br />
  
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.herokuapp.com?font=Inter&weight=800&size=24&duration=3000&pause=1000&color=5B4BFF&center=true&vCenter=true&width=650&lines=Next-Gen+Digital+Subscription+Marketplace;Instant+1-Click+Pass+Delivery;Escrow+Buyer+Protection+%26+Live+Verification;Real-Time+Buyer-Seller+Messaging" alt="StreamKart Typing SVG" />
  </a>

  <p align="center">
    <strong>A high-performance, full-stack digital asset and subscription pass marketplace with automated delivery, escrow settlement, and real-time Socket.IO communications.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 18" />
    <img src="https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Firebase_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  </p>

  <p align="center">
    <a href="#-about-streamkart">About</a> • 
    <a href="#-key-features">Key Features</a> • 
    <a href="#-architecture">Architecture</a> • 
    <a href="#-role-based-portals">Role Portals</a> • 
    <a href="#-tech-stack">Tech Stack</a> • 
    <a href="#-project-structure">Structure</a> • 
    <a href="#-getting-started">Getting Started</a> • 
    <a href="#-api-reference">API Docs</a>
  </p>
</div>

---

## 🌟 About StreamKart

**StreamKart** is a state-of-the-art multi-vendor digital marketplace engineered for frictionless trading of verified digital passes, software licenses, OTT subscriptions, VPN keys, AI tools, and gaming access tiers.

Built with a modern **React 18 + Vite** client and a robust **Node.js / Express / TypeScript** backend, StreamKart provides automated instant credential delivery, manual UPI payment verification with live countdown timers, escrow fund protection, and a unified order-based chat engine powered by **Socket.IO**.

---

## ⚡ Key Features

<table>
  <thead>
    <tr>
      <th width="30%">Core Pillar</th>
      <th width="70%">Capability Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>🎨 <strong>Modern ReactBits Design</strong></td>
      <td>Stunning responsive light/dark interface featuring animated <code>ShapeGrid</code> canvas, <code>AuroraBackground</code> with geometric tech lattice, glowing <code>BorderBeam</code> accents, <code>SpotlightCard</code> micro-interactions, and fluid typography.</td>
    </tr>
    <tr>
      <td>🔐 <strong>Enterprise Multi-Auth</strong></td>
      <td>Seamless authentication via Google 1-Tap, Phone OTP, and Email/Password using Firebase Auth with email verification gates and custom MongoDB role synchronization.</td>
    </tr>
    <tr>
      <td>💳 <strong>UPI Payment & Verification Pipeline</strong></td>
      <td>Smart checkout modal featuring automated UPI QR generation, dynamic copyable VPA, transaction screenshot proof upload, and a synchronized 5-minute persistent verification timer.</td>
    </tr>
    <tr>
      <td>🛡️ <strong>Live Admin Approval & Rejection Modal</strong></td>
      <td>Dedicated Admin Payment Verification Portal with live screenshot review. Approvals trigger real-time 3-second countdown redirects for buyers. Rejections emit live modal pop-ups with reason codes and a 1-click re-upload workflow.</td>
    </tr>
    <tr>
      <td>💬 <strong>Real-Time Order Chat System</strong></td>
      <td>Shared buyer-seller chat linked directly to <code>orderId</code>. Features instant Socket.IO messaging, unread badges, timestamped bubbles, attachment previews, and auto-sorted conversations.</td>
    </tr>
    <tr>
      <td>📦 <strong>Multi-Tier Bundles & Product Requests</strong></td>
      <td>Sellers can publish standalone subscription passes or curate discounted multi-product bundles. Buyers can post custom digital product requests that certified sellers bid on and fulfill.</td>
    </tr>
    <tr>
      <td>💰 <strong>Dual Wallet & Automated Settlement</strong></td>
      <td>Integrated Buyer Wallet for instant purchases and Seller Wallet with escrow holds, automated release upon buyer verification, and manual payout request management.</td>
    </tr>
    <tr>
      <td>🚀 <strong>High-Performance Infrastructure</strong></td>
      <td>Engineered with Vite code-splitting, lazy-loaded route chunks with dynamic import retry guards, TanStack Query caching, and Zustand global state stores.</td>
    </tr>
  </tbody>
</table>

---

## 📂 Architecture

```mermaid
flowchart TD
    %% Layer 1: Client Interfaces
    subgraph L1 ["🖥️ CLIENT LAYER (React 18 + Vite + Tailwind)"]
        UI_Buyer["🛒 Buyer Marketplace & Checkout"]
        UI_Seller["📊 Seller Management & Bundles"]
        UI_Admin["🛡️ Super Admin Control Center"]
        UI_Chat["💬 Real-Time Shared Chat Engine"]
        UI_Components["✨ ReactBits (ShapeGrid, Aurora, BorderBeam)"]
    end

    %% Layer 2: API Gateway & Socket Server
    subgraph L2 ["⚙️ SERVER & REAL-TIME LAYER (Node.js + Express + TypeScript)"]
        API_Gateway["🔐 API Gateway & JWT / Firebase Auth Middleware"]
        Ctrl_Payment["💳 Payment Verification Controller"]
        Ctrl_Order["📦 Order & Bundle Lifecycle Engine"]
        Ctrl_Chat["✉️ Chat & Notification Controller"]
        Ctrl_Wallet["💰 Wallet & Escrow Ledger Controller"]
        Socket_Server["⚡ Socket.IO Event Engine (Rooms: orderId & userId)"]
    end

    %% Layer 3: Data & Cloud Infrastructure
    subgraph L3 ["🗄️ DATA, CLOUD & INTEGRATION LAYER"]
        Mongo_DB[("Database (MongoDB Atlas)
        Users | Products | Orders | Payments | Bundles | Messages")]
        Firebase_Auth["Firebase Admin SDK & Auth"]
        Cloud_Storage["Firebase Cloud Storage (Screenshots & Proofs)"]
        Push_Service["Web Push & FCM Notification Dispatcher"]
    end

    %% Flow Connections
    UI_Buyer -->|HTTP REST| API_Gateway
    UI_Seller -->|HTTP REST| API_Gateway
    UI_Admin -->|HTTP REST| API_Gateway
    UI_Chat <-->|WebSockets| Socket_Server

    API_Gateway --> Ctrl_Payment
    API_Gateway --> Ctrl_Order
    API_Gateway --> Ctrl_Chat
    API_Gateway --> Ctrl_Wallet

    Ctrl_Payment <--> Mongo_DB
    Ctrl_Order <--> Mongo_DB
    Ctrl_Chat <--> Mongo_DB
    Ctrl_Wallet <--> Mongo_DB

    Ctrl_Payment -->|Emit Approval / Rejection Events| Socket_Server
    Ctrl_Chat -->|Broadcast Instant Message Events| Socket_Server
    Socket_Server -->|Push Live Updates| UI_Buyer
    Socket_Server -->|Push Live Updates| UI_Seller
    Socket_Server -->|Push Live Updates| UI_Admin

    API_Gateway -->|Token Verification| Firebase_Auth
    Ctrl_Payment -->|Store Payment Receipts| Cloud_Storage
    Ctrl_Order -->|Trigger Alerts| Push_Service
```

---

## 👥 Role-Based Portals

### 🛒 Buyer Experience
- **Catalog & Search**: Live fuzzy search, multi-category filters (OTT, AI, VPN, Music, Gaming), price sliders, and warranty tier tags.
- **1-Click Checkout**: Direct purchase or add-to-cart with automated bundle discounts and coupon validation.
- **Escrow Protection**: Payment is held safely in escrow until the buyer confirms working credentials or the warranty window expires.
- **Order Tracking & Chat**: Access purchased keys/credentials, trigger return/refund requests, and chat directly with sellers.

### 📊 Seller Hub
- **Product Management**: List digital credentials, license keys, or shared passes with custom warranty periods and stock counts.
- **Bundle Creator**: Bundle complementary products together with custom bundle discounts.
- **Product Request Pipeline**: Browse custom product requests from buyers and submit fulfillment offers.
- **Seller Wallet & Payouts**: Real-time sales analytics, revenue graphs, escrow clearance schedules, and UPI/Bank payout requests.

### 🛡️ Super Admin Control Center
- **Payment Verification Hub (`ManagePayments`)**: View uploaded UPI payment screenshots, verify transaction IDs, and approve or reject transactions with automated Socket.IO triggers.
- **Seller KYC Applications**: Review and approve or reject seller merchant onboarding applications.
- **Refund Dispute Resolution**: Arbitrate buyer-seller disputes and issue wallet or original payment refunds.
- **Platform Analytics**: Total GMV, active users, platform commission breakdown, and server health.

---

## 🛠 Tech Stack

### Frontend
- **Core**: React 18, Vite 5, JavaScript (ES6+)
- **Styling**: Tailwind CSS v3, PostCSS, Custom Design System Tokens
- **Interactive UI (ReactBits)**: `ShapeGrid`, `AuroraBackground`, `BorderBeam`, `SpotlightCard`, `ShinyText`, `CountUp`, `Magnet`
- **State & Data**: Zustand, TanStack React Query v5, Axios
- **Animations**: Framer Motion
- **Icons**: React Icons (Heroicons, FontAwesome, Remix Icons)
- **Real-time Client**: Socket.io Client

### Backend
- **Runtime**: Node.js v18+ with Express.js
- **Language**: TypeScript with strict typing
- **Database**: MongoDB Atlas with Mongoose ODM
- **Real-time Engine**: Socket.IO (Event Rooms & User Direct Messaging)
- **Cloud & Auth**: Firebase Admin SDK, Firebase Storage
- **Security**: Helmet, CORS, Rate Limiting, Express Validator

---

## 📁 Project Structure

```
streamkart/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Firebase & Environment config
│   │   ├── controllers/     # Route controllers (Auth, Order, Payment, Chat, etc.)
│   │   ├── middleware/      # Auth, Role, Validation, and Error middleware
│   │   ├── models/          # Mongoose Schemas (User, Product, Order, Payment, Chat)
│   │   ├── routes/          # Express API route declarations
│   │   ├── services/        # Business logic & 3rd-party service integrations
│   │   ├── utils/           # Helper utilities, logger, and formatters
│   │   ├── app.ts           # Express application initialization
│   │   ├── server.ts        # HTTP server entry point
│   │   └── socket.ts        # Socket.IO event handler & room manager
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── public/              # Static assets, icons, and logos
│   ├── src/
│   │   ├── assets/          # Images, illustrations, and media
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Navbar, Footer, CategoryFilter, SearchBar
│   │   │   ├── layouts/     # MainLayout, AuthLayout, DashboardLayout
│   │   │   ├── reactbits/   # ShapeGrid, AuroraBackground, BorderBeam, etc.
│   │   │   └── ui/          # Button, Input, Modal, Badge, Dropdown
│   │   ├── context/         # React Context providers (AuthContext, SocketContext)
│   │   ├── hooks/           # Custom React hooks (useAuth, useSocket, useDebounce)
│   │   ├── pages/           # Application views
│   │   │   ├── admin/       # Super Admin portal views
│   │   │   ├── auth/        # Login, Register, PhoneLogin, ForgotPassword
│   │   │   ├── dashboard/   # Buyer & Seller dashboard views
│   │   │   ├── marketplace/ # Home, ProductList, ProductDetail, Checkout, Cart
│   │   │   └── public/      # About, Contact, Terms, Privacy, Maintenance
│   │   ├── routes/          # AppRouter with safeLazy route guards & role gates
│   │   ├── services/        # Axios API client services
│   │   ├── store/           # Zustand global state stores (cart, auth, theme)
│   │   ├── App.jsx          # Root component
│   │   ├── index.css        # Global Tailwind CSS & custom design tokens
│   │   └── main.jsx         # React DOM entry point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
Make sure your development machine has:
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** / **pnpm**
- **MongoDB** (Local instance or free MongoDB Atlas cluster)
- **Firebase Account** (Authentication & Storage enabled)

---

### 1. Clone the Repository

```bash
git clone https://github.com/bhumitsoni20/Prime-net.git streamkart
cd streamkart
```

---

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env

# Start backend dev server (Defaults to http://localhost:5000)
npm run dev
```

---

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment configuration
cp .env.example .env

# Start Vite dev server (Defaults to http://localhost:5173)
npm run dev
```

---

## 🔒 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `PORT` | No | API Server port | `5000` |
| `MONGODB_URI` | **Yes** | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | **Yes** | Secret for signing auth tokens | `your_super_jwt_secret_key` |
| `ADMIN_EMAIL` | **Yes** | Super Admin email for admin privileges | `admin@streamkart.com` |
| `FIREBASE_PROJECT_ID` | **Yes** | Firebase Project ID | `streamkart-auth` |
| `FIREBASE_CLIENT_EMAIL` | **Yes** | Firebase Service Account Email | `firebase-adminsdk@...` |
| `FIREBASE_PRIVATE_KEY` | **Yes** | Firebase Private Key | `"-----BEGIN PRIVATE KEY-----\n..."` |
| `CLIENT_URL` | No | Allowed frontend origin for CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
|---|---|---|---|
| `VITE_API_URL` | **Yes** | Backend REST API endpoint | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | **Yes** | Backend Socket.IO endpoint | `http://localhost:5000` |
| `VITE_FIREBASE_API_KEY` | **Yes** | Firebase Web Client API Key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN`| **Yes** | Firebase Auth Domain | `streamkart.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | **Yes** | Firebase Project ID | `streamkart-auth` |
| `VITE_FIREBASE_STORAGE_BUCKET`| **Yes** | Firebase Storage Bucket | `streamkart.appspot.com` |

---

## 📡 Real-Time Socket.IO Events

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `join_order_chat` | Client $\rightarrow$ Server | `{ orderId, userId }` | Joins private room for order-specific conversation |
| `send_message` | Client $\rightarrow$ Server | `{ orderId, senderId, text, attachment }` | Emits message to order room participants |
| `receive_message` | Server $\rightarrow$ Client | `MessageObject` | Receives new incoming chat message in real time |
| `payment_submitted` | Client $\rightarrow$ Server | `{ paymentId, orderId, buyerId }` | Notifies admins of a newly submitted UPI proof |
| `payment_approved` | Server $\rightarrow$ Client | `{ paymentId, orderId }` | Triggers live 3s countdown & instant redirect |
| `payment_rejected` | Server $\rightarrow$ Client | `{ paymentId, reason, canRetry }` | Triggers live rejection pop-up with retry button |

---

## 📜 Available Scripts

### Backend (`backend/package.json`)
- `npm run dev` — Starts TypeScript compiler with hot-reloading using `tsx` / `nodemon`
- `npm run build` — Compiles TypeScript into production JavaScript in `dist/`
- `npm run start` — Runs the compiled production server
- `npm run lint` — Runs ESLint across backend source files

### Frontend (`frontend/package.json`)
- `npm run dev` — Starts the Vite development server with HMR
- `npm run build` — Builds optimized production bundle with Gzip & Brotli compression
- `npm run preview` — Locally previews production build
- `npm run lint` — Runs ESLint across frontend components

---

## 🛡️ Security & Escrow Guarantee

- **Escrow Settlement**: All buyer funds remain in safe escrow custody until access credentials are confirmed active.
- **Zero Raw Credentials Storage**: Sensitive pass credentials and tokens are encrypted with AES-256 before persistence.
- **Admin Verification Audit Trail**: Every payment approval or rejection is immutably timestamped with the acting admin ID and reason notes.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=5B4BFF&height=100&section=footer" width="100%" alt="Footer Wave" />
  <p>© 2026 StreamKart Inc. All rights reserved.</p>
</div>