# Wedring Matrimony — MERN + Expo Stack

This repository contains the Wedring Matrimony application, featuring a Node.js/Express backend, an Admin Panel (Vite + React), and a Mobile App (React Native + Expo).

## Architecture
The project is divided into three main components:
- `backend/`: Node.js / Express API server. Connects to Supabase for Database and Authentication.
- `admin/`: React admin dashboard built with Vite and TailwindCSS. Manages users, distribution, payments, etc.
- `app/`: Mobile application built with React Native and Expo (SDK 54).

## Getting Started

### Prerequisites
- Node.js (v20+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase Project (for DB and Auth)
- Cloudflare R2 (for image storage)
- Razorpay Account (for payments)

### Setup Instructions

1. **Clone the repository**
2. **Backend Setup**
   - Navigate to `backend/`
   - Run `npm install`
   - Copy `.env.example` to `.env` and fill in your keys.
   - (Database Setup) You must create the `distribution_logs` table in Supabase. You can find the SQL script for this in `backend/src/data/distribution_logs.sql`.
   - Start the backend: `npm run dev`
3. **Admin Panel Setup**
   - Navigate to `admin/`
   - Run `npm install`
   - Start the dev server: `npm run dev`
4. **Mobile App Setup**
   - Navigate to `app/`
   - Run `npm install`
   - Start Expo: `npx expo start`

## Distribution System

The core feature of this platform is the "Distribution Engine", which automatically distributes matching profiles to premium users upon signup/upgrade (Initial Distribution) and daily at midnight (Daily Updates).

- Backend CRON jobs process this daily using `node-cron`.
- Admin panel can manually push distributions and view logs.

## Missing/Incomplete Parts (from Audit)
Note: As of the recent audit, some master data tables in the DB may need seeding (e.g., castes, cities, districts, states). You can find JSON seed files in `backend/src/data/`.
