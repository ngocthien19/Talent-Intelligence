# AI-Powered Talent Intelligence Platform

This project is a full-stack platform that combines AI-driven talent analysis, HR management, candidate tracking, and recruitment workflow support. It includes a Node.js backend and a React frontend, designed to help HR teams evaluate candidate profiles, automate hiring workflows, and improve talent matching.

## Production deployment

The frontend is currently deployed on Vercel:

- https://talent-intel-platform.vercel.app/

Use this URL to access the live app in production mode.

## Overview

The platform is divided into two main parts:

- Backend: API_AI_Powered_TI
- Frontend: WEB_AI_Powered_TI

The system supports:

- Candidate registration and login
- HR dashboard and candidate management
- Job posting and job matching
- Resume parsing and enrichment
- AI-based analysis and report generation
- Semantic search and comparison
- Interview scheduling with Google Calendar
- Real-time notifications
- Rediscovery features for talent re-engagement

## Main stack

### Backend

- Node.js
- Express.js
- PostgreSQL
- Redis
- BullMQ
- Socket.IO
- JWT authentication
- Passport.js with Google OAuth
- Google Gemini AI
- Cloudinary
- Nodemailer / Brevo

### Frontend

- React
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- i18next
- Axios
- React Toastify

## Project structure

```text
AI-Powered_Talent_Intelligence_Platform/
├── API_AI_Powered_TI/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── service-account-key.json
├── WEB_AI_Powered_TI/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── README.md
└── .git/
```

## Requirements

Before running the project, make sure you have installed:

- Node.js 18 or higher
- npm or yarn
- PostgreSQL
- Redis
- A Google Gemini API key
- Cloudinary credentials
- Google OAuth credentials
- Email provider credentials such as Brevo

## Environment configuration

Create a .env file in the backend folder: API_AI_Powered_TI/.env

Example:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=talent_intelligence

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_KEY=your_gemini_api_key

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email
BREVO_SENDER_NAME=Talent Intelligence Platform

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRE=1h
JWT_REFRESH_EXPIRE=14 days

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

GOOGLE_SERVICE_ACCOUNT_KEY=./service-account-key.json
GOOGLE_CALENDAR_ID=your_calendar_id

FRONTEND_URL=http://localhost:5173
```

For the frontend, create a .env file in WEB_AI_Powered_TI/.env if needed:

```env
VITE_API_URL=http://localhost:3000
```

## Install dependencies

### Backend

```bash
cd API_AI_Powered_TI
npm install
```

### Frontend

```bash
cd WEB_AI_Powered_TI
npm install
```

## Run the project

### Start backend

```bash
cd API_AI_Powered_TI
npm run dev
```

The backend will run at:

- http://localhost:3000

### Start frontend

```bash
cd WEB_AI_Powered_TI
npm run dev
```

The frontend will run at:

- http://localhost:5173

## Basic usage

### Production environment

Open the deployed app here:

- https://talent-intel-platform.vercel.app/

### Local environment

After starting both services, open the frontend in the browser:

- http://localhost:5173

You can use the following test HR account:

- Email: nhuyhay2005@gmail.com
- Password: 123456

## Vercel deployment notes

- Frontend is deployed on Vercel.
- Set the environment variable VITE_API_URL in Vercel to the live backend URL.
- Example:

```env
VITE_API_URL=https://your-backend-domain.com
```

If the API is hosted separately, make sure the frontend uses the correct production API endpoint for authentication and requests.

## Main features

### HR features

- Dashboard overview
- Candidate analysis and evaluation
- Job description management
- Report generation
- Comparison between candidates
- Resume enrichment
- Semantic talent search
- Candidate shortlist management
- Calendar / interview scheduling
- Notifications and alerts
- Rediscovery of previous applicants

### Candidate features

- Register and login
- Profile management
- Job search and viewing
- Favorite jobs
- AI mock interview
- Candidate status tracking
- Notification updates

## Notes

- The backend uses PostgreSQL and Redis, so both services must be running before the app starts properly.
- The AI features depend on Google Gemini API and related service credentials.
- Some features such as Google Calendar and OAuth require valid credentials in the environment file.
- The project is designed for development and local testing, but can be extended for deployment with Docker or a production environment.

## Useful scripts

### Backend

```bash
npm run dev
npm run build
npm run start
npm run lint
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Support

This project is intended for internal use and project demonstration. If you need to extend features or deploy to production, configure the environment variables and infrastructure services for your target environment.
