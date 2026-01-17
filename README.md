# SIST - Sistem Manajemen Usaha & Keuangan Terintegrasi

SIST is an integrated business and financial management system designed to streamline operations for small to medium-sized enterprises. It combines Point of Sale (POS), Inventory Management, Financial Reporting, and Investor Relations into a single, cohesive dashboard.

## 🚀 Features

*   **Dashboard & Analysis**: Real-time overview of sales, expenses, and net profit with visual charts.
*   **Point of Sale (POS)**: Efficient transaction processing with product selection and cart management.
*   **Inventory Management**: Track stock levels, manage products (Goods/Services), and handle supplier restocking.
*   **Financial Reporting**: Automated Income Statements, Capital Changes, and detailed Transaction Logs.
*   **Investor Relations**: Manage investor profiles, track capital injections, and distribute dividends with automated calculations.
*   **Activity Log**: Comprehensive audit trail of all system actions (Login, Create, Update, Delete) for security and accountability.
*   **User Management**: Role-based access control (Admin, Cashier, Investor, etc.).
*   **Assets & Expenses**: Track fixed assets and managed recurring operational expenses.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: Heroicons & Lucide React
*   **Charts**: Recharts
*   **State Management**: React Context API

### Backend
*   **Framework**: [NestJS](https://nestjs.com/)
*   **Database ORM**: [Prisma](https://www.prisma.io/)
*   **Database**: SQLite (Dev) / PostgreSQL (Production ready)
*   **Authentication**: JWT (JSON Web Tokens) with Passport strategy

## 📋 Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   npm or yarn

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/maulido/SIST-Internal.git
cd SIST-Internal
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

**Environment Variables:**
Create a `.env` file in the `backend` folder:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="YOUR_SECRET_KEY_HERE"
PORT=3000
FRONTEND_URL="http://localhost:3001"
```

**Database Migration:**
Initialize the database:
```bash
npx prisma db push
```

**Start Server:**
```bash
npm run start:dev
```
The backend runs on `http://localhost:3000`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory:

```bash
cd frontend
npm install
```

**Environment Variables:**
Create a `.env.local` file in the `frontend` folder:
```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

**Start Client:**
```bash
npm run dev
```
The frontend runs on `http://localhost:3001`.

## 📦 Deployment

For production deployment instructions using PM2 and Nginx, please refer to [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
