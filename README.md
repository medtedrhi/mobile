# Costume Rental Mobile App

A full-stack mobile application for renting and managing costumes. This project includes a React Native mobile frontend and a Laravel REST API backend with JWT authentication.
for the backend source code " https://github.com/AyoubYousri/backend-costum.git "


## Project Overview


- Browse and search for available costumes
- Make and manage costume reservations
- Handle user authentication and account management
- Manage inventory (for sellers and admins)


##Roles
- **Sellers**: Manage their costume inventory and view reservations
- **Admins**: Manage users, costumes, and system settings

## Tech Stack

### Frontend (Mobile)
- **React Native** 0.82.1


### Backend (API)
- **Laravel** 12.0 (PHP 8.2+)
- **JWT Authentication** (tymon/jwt-auth)
- **MySQL/SQLite** database


### Build & Development Tools
- **React Native CLI** for mobile development
- **Gradle** for Android builds
- **Composer** for PHP dependencies
- **npm** for JavaScript dependencies

## Features

### Admin Features
- User management (create, edit, delete)
- Costume inventory management

### Seller Features
- Manage personal costume inventory
- add customer reservations
- Add/edit/delete costumes

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


### Android Development

```bash
# Build and run on Android emulator or device
npm run android

# Or use Gradle directly
cd android
./gradlew assembleDebug
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

#### Catalogue Screen
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/b19ea829-906a-476f-b99e-4ce18fbb4910" />


#### Costume Details
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/004fa874-cee7-400a-9a0c-d56de6996ce3" />


#### Filter
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/889e1e2b-1150-4eb8-bb62-61db88ee3261" />


#### Login Screen
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/78ee457c-c0ea-4098-bbc8-7491536b1183" />


#### Register Screen
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/1d68bc98-1198-4340-9d10-25b5b08412a5" />


#### Seller Dashboard
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/d34edfc1-e474-42d5-b217-8b0262ace6a3" />


#### Client's Reservations
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/39546e1d-c616-4b66-be9e-702fbe995c91" />


#### Adding a costume
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/d283cb4e-e02d-45bd-9c23-edc530dcec8c" />


#### reserving page
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/89f075ff-9870-4703-b62a-de6e0d744554" />


#### Adding a costume page
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/1b03f6e8-53b4-48b7-b062-175d542744ef" />


#### Admin Dashboard
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/1c9b1af8-7628-4402-8387-713507f4de6d" />


#### Admin sellers Management
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/057b6806-10fe-4c7f-9e2e-03f474312a1a" />


#### Admin Costume Management
<img width="602" height="1280" alt="image" src="https://github.com/user-attachments/assets/9caa0fe8-0e32-4dad-a502-5d0d9af76d59" />




---

