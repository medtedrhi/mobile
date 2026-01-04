# Costume Rental Mobile App

A full-stack mobile application for renting and managing costumes. This project includes a React Native mobile frontend and a Laravel REST API backend with JWT authentication.
for the backend source code " https://github.com/AyoubYousri/backend-costum.git "

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

This is a comprehensive costume rental platform that allows users to:
- Browse and search for available costumes
- Make and manage costume reservations
- Handle user authentication and account management
- Manage inventory (for sellers and admins)

The application supports multiple user roles:
- **Regular Users**: Browse and reserve costumes
- **Sellers**: Manage their costume inventory and view reservations
- **Admins**: Manage users, costumes, and system settings

## Tech Stack

### Frontend (Mobile)
- **React Native** 0.82.1
- **React** 19.1.1
- **TypeScript** 5.8.3
- **React Navigation** 7.1.22 (stack navigation)
- **Async Storage** for local data persistence
- **React Native Image Crop Picker** for image selection
- **Jest** for testing

### Backend (API)
- **Laravel** 12.0 (PHP 8.2+)
- **JWT Authentication** (tymon/jwt-auth)
- **MySQL/SQLite** database
- **Vite** for frontend assets
- **PHPUnit** for testing

### Build & Development Tools
- **Expo / React Native CLI** for mobile development
- **Gradle** for Android builds
- **CocoaPods** for iOS dependencies
- **Composer** for PHP dependencies
- **npm** for JavaScript dependencies

## Features

### User Features
- User authentication (login/registration)
- Browse costume catalogue
- View detailed costume information
- Create and manage reservations
- Search and filter costumes

### Admin Features
- User management (create, edit, delete)
- Costume inventory management
- Dashboard and analytics
- System configuration and settings

### Seller Features
- Manage personal costume inventory
- View customer reservations
- Add/edit/delete costumes
- Sales and rental tracking

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components for different app pages
│   │   ├── CatalogueScreen.tsx
│   │   ├── CostumeDetail.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminHome.tsx
│   │   ├── AdminCostumes.tsx
│   │   ├── SellerHome.tsx
│   │   ├── MyReservationsScreen.tsx
│   │   └── ...
│   ├── components/       # Reusable UI components
│   │   ├── CostumeCard.tsx
│   │   ├── AdminHeader.tsx
│   │   └── ...
│   ├── context/          # React context for state management
│   │   └── AuthContext.tsx
│   ├── api/              # API client and utilities
│   └── config.ts         # Configuration file
├── android/              # Android native code
├── ios/                  # iOS native code
├── App.tsx              # Root application component
├── package.json         # Node dependencies
└── tsconfig.json        # TypeScript configuration

api/
├── app/
│   ├── Models/          # Laravel models
│   ├── Http/
│   │   ├── Controllers/ # API controllers
│   │   └── Requests/    # Form requests
│   └── Exceptions/      # Custom exceptions
├── routes/
│   └── api.php          # API routes
├── database/
│   ├── migrations/      # Database migrations
│   ├── factories/       # Database factories
│   └── seeders/         # Database seeders
├── config/              # Configuration files
├── composer.json        # PHP dependencies
└── phpunit.xml         # PHPUnit configuration

api-1/                   # Alternative API setup (same structure as api/)
```

## Prerequisites

- **Node.js** >= 20
- **npm** or **yarn**
- **PHP** >= 8.2
- **Composer**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development on macOS)
- **MySQL** or **SQLite** (for database)
- **Git**

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/costume-rental-app.git
cd costume-rental-app
```

### 2. Install Mobile Dependencies

```bash
# Install Node dependencies
npm install

# For iOS (macOS only)
cd ios
bundle install
bundle exec pod install
cd ..
```

### 3. Install Backend Dependencies

```bash
cd api

# Install PHP dependencies
composer install

# Install Node dependencies for Vite
npm install

cd ..
```

### 4. Setup Environment Variables

#### Mobile Configuration
Edit `src/config.ts` to set your API endpoint:

```typescript
// Android emulator:   "http://10.0.2.2:8000/api"
// iOS simulator:       "http://localhost:8000/api"
// Physical device:     "http://192.168.1.10:8000/api" (use your machine IP)

export const API_BASE_URL = 'http://localhost:8000/api';
```

#### Backend Configuration
```bash
cd api

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Set JWT secret
php artisan jwt:secret

# Run migrations
php artisan migrate

# (Optional) Seed sample data
php artisan db:seed
```

## Running the Application

### Development Server

#### Start Backend API

```bash
cd api

# Quick start with concurrently running all services
npm run dev

# Or manually start services:
# Terminal 1: PHP development server
php artisan serve

# Terminal 2: Queue listener (optional)
php artisan queue:listen --tries=1

# Terminal 3: Logs viewer (optional)
php artisan pail --timeout=0

# Terminal 4: Vite dev server
npm run dev
```

The API will be available at `http://localhost:8000`

#### Start Mobile App

```bash
# Terminal from project root
npm start

# Run on Android
npm run android

# Run on iOS (macOS)
npm run ios
```

### Android Development

```bash
# Build and run on Android emulator or device
npm run android

# Or use Gradle directly
cd android
./gradlew assembleDebug
```

### iOS Development

```bash
# Build and run on iOS simulator
npm run ios

# Update Pods after dependency changes
cd ios
bundle exec pod install
cd ..
```

## Testing

### Mobile Tests

```bash
# Run Jest tests
npm test

# Run with coverage
npm test -- --coverage
```

### Backend Tests

```bash
cd api

# Run PHPUnit tests
composer test

# Or using PHP directly
php artisan test
```

## API Documentation

The backend provides a RESTful API with the following main endpoints:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Costumes
- `GET /api/costumes` - List all costumes
- `GET /api/costumes/{id}` - Get costume details
- `POST /api/costumes` - Create costume (admin/seller)
- `PUT /api/costumes/{id}` - Update costume
- `DELETE /api/costumes/{id}` - Delete costume

### Reservations
- `GET /api/reservations` - List user reservations
- `POST /api/reservations` - Create reservation
- `PUT /api/reservations/{id}` - Update reservation
- `DELETE /api/reservations/{id}` - Cancel reservation

### Users (Admin)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

**Authentication**: JWT tokens are required for most endpoints. Include the token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Screenshots

Add your app screenshots below:

### Mobile App Screenshots

#### Catalogue Screen
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/b19ea829-906a-476f-b99e-4ce18fbb4910" />


#### Costume Details
![Costume Details](./screenshots/costume-detail.png)

#### Login Screen
![Login Screen](./screenshots/login.png)

#### User Reservations
![My Reservations](./screenshots/my-reservations.png)

#### Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)

#### Admin Costume Management
![Admin Costumes](./screenshots/admin-costumes.png)

#### Seller Dashboard
![Seller Dashboard](./screenshots/seller-dashboard.png)

---

