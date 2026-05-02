# WMS Pro — Warehouse Management System

A full-stack Warehouse Management System built with **React**, **Node.js**, **Express**, and **MongoDB**.

## Features

- Multi-warehouse inventory management
- Inbound shipments (GRN) with receiving & verification flow
- Outbound orders with full status tracking (pending → delivered)
- Stock movement audit trail
- Role-based access control (6 roles)
- Real-time notifications via Socket.IO
- Reports & analytics dashboard
- Audit logs for every critical action

## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 19, Vite, Tailwind CSS, Recharts  |
| Backend  | Node.js, Express 5, Socket.IO           |
| Database | MongoDB (Mongoose)                      |
| Auth     | JWT + bcrypt                            |

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/intsurjeetkaran-droid/WMS.git
cd WMS
```

### 2. Set up environment variables

**Backend** — create `backend/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=WMS Pro
```

### 3. Install dependencies

```bash
npm run install:all
```

### 4. Seed the database

```bash
npm run seed
```

### 5. Run in development

```bash
# Terminal 1 — backend
npm run dev:backend

# Terminal 2 — frontend
npm run dev:frontend
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api

## Build for Production

```bash
npm run build
```

Builds the frontend into `frontend/dist/`. Serve the backend with `npm start`.

## Login Credentials (after seeding)

| Role              | Email                | Password       |
|-------------------|----------------------|----------------|
| Super Admin       | admin@wms.com        | Admin@123      |
| Warehouse Manager | manager@wms.com      | Manager@123    |
| Inventory Manager | inventory@wms.com    | Inventory@123  |
| Staff             | staff@wms.com        | Staff@123      |
| Dispatch Staff    | dispatch@wms.com     | Dispatch@123   |
| Viewer            | viewer@wms.com       | Viewer@123     |

## Deployment

The frontend builds to a static `dist/` folder and can be deployed to **Vercel**, **Netlify**, or any static host.  
The backend is a standard Node.js/Express app deployable to **Render**, **Railway**, **Heroku**, or any Node host.

Set the production environment variables on your hosting platform before deploying.

## Developer

**Surjeet Karan**  
Full Stack Developer  
GitHub: [@intsurjeetkaran-droid](https://github.com/intsurjeetkaran-droid)
