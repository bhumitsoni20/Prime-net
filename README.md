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
    <a href="#-architecture">Architecture</a> • 
    <a href="#-getting-started">Getting Started</a>
  </p>
</div>

---

## 🌟 About StreamKart

**StreamKart** is a cutting-edge platform designed to revolutionize the way digital subscriptions and access tiers are traded. It provides a seamless, high-performance ecosystem bridging the gap between digital merchants and buyers. Built with a stunning, modern glassmorphic UI, StreamKart offers manual UPI payment verification, real-time Socket.IO buyer-seller communications, and instant digital credential delivery.

---

## ⚡ Key Features

<table>
  <tr>
    <td>🎨 <strong>Premium UI/UX</strong></td>
    <td>State-of-the-art design system featuring responsive glassmorphism, dynamic product cards, fluid typography, and micro-animations powered by Framer Motion.</td>
  </tr>
  <tr>
    <td>🔐 <strong>Robust Authentication</strong></td>
    <td>Secure, multi-provider login (Google, Phone OTP, Email) powered by Firebase Auth, with strict role-based access control (Admin, Seller, User).</td>
  </tr>
  <tr>
    <td>💳 <strong>Manual UPI Payment Verification</strong></td>
    <td>Buyer checkout with UPI QR code generation, copyable UPI ID, screenshot proof upload, and a 5-minute persistent verification timer.</td>
  </tr>
  <tr>
    <td>🛡️ <strong>Admin Verification & Rejection Modal</strong></td>
    <td>Dedicated Admin Payment Portal (`ManagePayments`) for verifying screenshots. Admin approvals trigger real-time 3-second countdown redirects. Rejections emit live pop-ups with reason details and one-click "Try Again / Re-upload" checkout mode.</td>
  </tr>
  <tr>
    <td>💬 <strong>Shared Buyer-Seller Chat System</strong></td>
    <td>Order-based (`orderId`) unified chat system between buyers and sellers with real-time Socket.IO synchronization, unread badges, and auto-sorted recent conversations.</td>
  </tr>
  <tr>
    <td>🛒 <strong>Seller Dashboard & Bundles</strong></td>
    <td>Comprehensive analytics, real-time sales tracking, financial reporting, and auto-populated multi-product bundle cards.</td>
  </tr>
  <tr>
    <td>🚀 <strong>Performance Optimized</strong></td>
    <td>Built on Vite with intelligent code-splitting, lazy loading, TanStack Query caching/polling, and Zustand state management.</td>
  </tr>
</table>

---

## 🛠 Tech Stack

<details>
<summary><strong>🖥 Frontend Architecture</strong></summary>

- **Framework**: [React 18](https://reactjs.org/) (Vite)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) & [TanStack Query](https://tanstack.com/query)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Real-time WebSockets**: Socket.io Client
- **Routing**: React Router v6
</details>

<details>
<summary><strong>⚙️ Backend Infrastructure</strong></summary>

- **Server Environment**: Node.js & Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas with Mongoose ORM
- **Real-time WebSockets**: Socket.IO
</details>

<details>
<summary><strong>🔌 Third-Party Services</strong></summary>

- **Authentication**: Firebase Auth
- **Cloud Storage**: Firebase Cloud Storage
- **Push Notifications**: Web Push / FCM
</details>

---

## 📂 Architecture

```mermaid
flowchart TD
    %% Layer 1: Client Interfaces
    subgraph L1 ["🖥️ CLIENT LAYER (React 18 + Vite)"]
        UI_Buyer["🛒 Buyer Marketplace & Checkout"]
        UI_Seller["📊 Seller Dashboard & Bundles"]
        UI_Admin["🛡️ Admin Payment Verification"]
        UI_Chat["💬 Live Shared Chat Engine"]
    end

    %% Layer 2: Server Infrastructure
    subgraph L2 ["⚙️ SERVER & REAL-TIME LAYER (Express + TypeScript)"]
        API_Gateway["🔐 API Gateway & Auth Middleware"]
        Ctrl_Payment["💳 Payment Verification Controller"]
        Ctrl_Order["📦 Order & Bundle Controller"]
        Ctrl_Chat["✉️ Chat & Messaging Controller"]
        Socket_Server["⚡ Socket.IO Event Engine"]
    end

    %% Layer 3: Data & Services
    subgraph L3 ["🗄️ DATA & CLOUD LAYER"]
        Mongo_DB[("Database (MongoDB Atlas)
        Users | Orders | Verification | Messages")]
        Firebase_Cloud["Firebase Auth & Cloud Storage"]
        Push_Service["Web Push Notification Service"]
    end

    %% Flow Connections
    UI_Buyer -->|HTTP REST| API_Gateway
    UI_Seller -->|HTTP REST| API_Gateway
    UI_Admin -->|HTTP REST| API_Gateway
    UI_Chat <-->|WebSockets| Socket_Server

    API_Gateway --> Ctrl_Payment
    API_Gateway --> Ctrl_Order
    API_Gateway --> Ctrl_Chat

    Ctrl_Payment <--> Mongo_DB
    Ctrl_Order <--> Mongo_DB
    Ctrl_Chat <--> Mongo_DB

    Ctrl_Payment -->|Emit Redirect / Rejection| Socket_Server
    Ctrl_Chat -->|Emit Live Messages| Socket_Server
    Socket_Server -->|Push Real-time Events| UI_Buyer

    API_Gateway -->|Verify Tokens| Firebase_Cloud
    Ctrl_Payment -->|Send Push Notifications| Push_Service
```

---

## 🚀 Getting Started

Follow these instructions to set up StreamKart locally for development and testing.

### Prerequisites

Ensure your local environment meets the following requirements:
- Node.js (v18.0.0 or higher)
- npm or yarn package manager
- A MongoDB Atlas Cluster (or Local MongoDB instance)
- A Firebase Project (with Auth and Storage enabled)

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

To run this project securely, add the following environment variables to your respective `.env` files. 

> **Warning:** Never commit your `.env` files to version control. Reference the provided `.env.example` files in the repository.

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `PORT` | API Server port (e.g., 5000) |
| `MONGODB_URI` | MongoDB Connection String |
| `ADMIN_EMAIL` | Super Admin Email for Admin role assignment |
| `FIREBASE_PROJECT_ID` | Firebase Admin SDK Project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase Admin SDK Service Account Email |
| `FIREBASE_PRIVATE_KEY` | Firebase Admin SDK Private Key |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:5000/api`) |
| `VITE_SOCKET_URL` | Socket.IO Server URL (e.g., `http://localhost:5000`) |
| `VITE_FIREBASE_API_KEY` | Firebase Client API Key |

---

<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=5B4BFF&height=100&section=footer" width="100%" alt="Footer Wave" />
</div>