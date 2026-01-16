# Deployment Guide for SIST

This guide details how to deploy the SIST (Sistem Manajemen Usaha & Keuangan Terintegrasi) application to a production environment (VPS or Cloud).

## Prerequisites
-   Node.js v18 or later
-   NPM or Yarn
-   Database (SQLite is default, but PostgreSQL is recommended for production)
-   Process Manager (PM2)

## 1. Backend Setup

1.  **Navigate to backend**:
    ```bash
    cd backend
    ```

2.  **Install Production Dependencies**:
    ```bash
    npm install --omit=dev
    npm install pm2 -g
    ```

3.  **Environment Variables**:
    Create a `.env` file based on `.env.example`:
    ```env
    DATABASE_URL="file:./prod.db"
    JWT_SECRET="YOUR_SECURE_SECRET_KEY"
    PORT=3000
    FRONTEND_URL="http://your-domain.com"
    ```

4.  **Database Migration**:
    ```bash
    npx prisma db push
    # Or for better migration tracking:
    # npx prisma migrate deploy
    ```

5.  **Build**:
    ```bash
    npm run build
    ```

6.  **Start with PM2**:
    ```bash
    pm2 start dist/main.js --name "sist-backend"
    pm2 save
    ```

## 2. Frontend Setup

1.  **Navigate to frontend**:
    ```bash
    cd frontend
    ```

2.  **Environment Variables**:
    Create `.env.local`:
    ```env
    NEXT_PUBLIC_API_URL="http://your-domain.com/api" 
    # Use localhost:3000/api if on same server and using reverse proxy, 
    # or the full public domain of the backend.
    ```

3.  **Build**:
    ```bash
    npm run build
    ```

4.  **Start with PM2**:
    ```bash
    pm2 start npm --name "sist-frontend" -- start -- -p 3001
    pm2 save
    ```

## 3. Reverse Proxy (Nginx) - Optional but Recommended

Set up Nginx to serve port 80/443 and forward to:
-   `your-domain.com` -> `localhost:3001` (Frontend)
-   `your-domain.com/api` -> `localhost:3000` (Backend)

## 4. Troubleshooting

**Database Locked / EPERM Error**:
If you encounter file lock errors (common with SQLite on Windows/Dev), **stop all running node processes** before running Prisma commands.
```bash
npx kill-port 3000
```

**Recurring Expenses Not Triggering**:
Ensure the backend process is running continuously. The Cron job runs at `00:00` server time. System timezone matters.
