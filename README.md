# FixBuddy - Professional Service Marketplace

FixBuddy (formerly Fixxr) is a modern platform that connects users with skilled professionals (Captains) for various service needs. Inspired by apps like Uber but for handyman services, it features real-time tracking, chat, and an integrated payment flow.

## 🚀 Project Overview

Everything you need to run, manage, and scale a service-based marketplace.

### Tech Stack
-   **Frontend**: React.js (Vite), TailwindCSS, Shadcn UI
-   **Backend**: Node.js, Express, Prisma (PostgreSQL), Socket.io
-   **Services**: Twilio (SMS), Cloudinary (Images), Neon (Database)

## 📁 Repository Structure

```text
FixBuddy/
├── root/               # Project orchestration
├── backend/            # Express API, Prisma Schema, Socket.io logic
├── user/               # Customer Frontend (React)
├── captain/            # Service Provider Frontend (React)
└── admin/              # Dashboard for Platform Management (React)
```

## 🛠 Getting Started

### Prerequisites
-   Node.js (v18+)
-   PostgreSQL (or Neon.tech account)
-   Cloudinary Account
-   Twilio Account

### Installation

1.  **Clone the Repo**:
    ```bash
    git clone <repo-url>
    cd FixBuddy
    ```

2.  **Environment Setup**:
    Each folder (`backend`, `user`, `captain`, `admin`) contains its own `.env` requirements. See individual folder READMEs for details.

3.  **Install Dependencies**:
    ```bash
    # Root (if applicable)
    npm install

    # Component folders
    cd backend && npm install
    cd ../user && npm install
    # ... repeat for captain and admin
    ```

4.  **Database Migration**:
    ```bash
    cd backend
    npx prisma migrate dev
    npx prisma generate
    ```

5.  **Run Development Servers**:
    Each component can be started with `npm run dev`.

## 📜 Key Features
-   **OTP Authentication**: Secure login/signup via Twilio SMS.
-   **Real-time Chat**: Direct communication between Users and Captains.
-   **Job Lifecycle**: Request -> Acceptance -> Ongoing -> Completion.
-   **Professional Profiles**: Verified skills, ratings, and portfolios.
-   **Admin Dashboard**: Manage users, captains, and service requests.

---
Built with ❤️ by the FixBuddy Team.
