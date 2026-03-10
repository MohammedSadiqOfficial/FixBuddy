# FixBuddy Backend

The core API service for the FixBuddy platform, handling authentication, data management, and real-time communication.

## 🛠 Tech Stack
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: PostgreSQL with Prisma ORM
-   **Messaging**: Socket.io for real-time chat and updates
-   **Communication**: Twilio SMS for OTP and job notifications
-   **Media**: Cloudinary SDK for image processing

## 📁 Key Directories
-   `src/controllers/`: Business logic for Auth, Users, Captains, and Jobs.
-   `src/routes/`: API endpoint definitions.
-   `src/utils/`: Shared utilities (SMS, Cloudinary, JWT, Validators).
-   `src/sockets/`: WebSocket event handling.
-   `prisma/`: Database schema and migration tracking.

## ⚙️ Environment Variables (`.env`)
```env
PORT=5000
DATABASE_URL="your-postgresql-url"
DIRECT_URL="your-direct-postgresql-url"
JWT_SECRET="your-secure-secret"

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## 🚀 Running Locally
1.  `npm install`
2.  `npx prisma generate`
3.  `npm run dev`

---
API Documentation is available via the source routes.
