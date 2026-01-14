# Campus Hub - Resource Booking System

A modern, minimalistic campus resource management system that allows students, faculty, and staff to discover and book campus facilities like labs, halls, equipment, and more.

## Features

### Core Functionality
- **Searchable Resource Catalog**: Browse and search campus facilities with real-time availability
- **Interactive Booking Calendar**: Visual calendar with time slot selection
- **Conflict Prevention**: Backend validation to prevent double-booking
- **Admin Dashboard**: Complete CRUD operations for facilities and booking approvals
- **Email Notifications**: Automated notifications for booking status updates

### User Features
- User registration and authentication
- Browse facilities by category (Labs, Halls, Equipment, Sports, Meeting Rooms, Auditoriums)
- View real-time availability calendars
- Book time slots with custom durations
- Track booking status (Pending, Approved, Declined)
- Cancel bookings

### Admin Features
- Dashboard with booking statistics
- Approve/Decline booking requests with remarks
- Create, update, and delete facilities
- Manage user accounts and roles
- View all bookings and filter by status

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Nodemailer for email notifications

### Frontend
- React 18 with Vite
- React Router for navigation
- Axios for API calls
- Lucide React for icons
- React Hot Toast for notifications

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or Atlas)

### Backend Setup

1. Navigate to the Server directory:
   ```bash
   cd SoruceCode/Server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   
   # Email Configuration (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

4. Seed the database with sample data:
   ```bash
   node src/utils/seed.js
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the Client directory:
   ```bash
   cd SoruceCode/Client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Demo Credentials

After running the seed script, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@campushub.edu | admin123 |
| Student | rahul@student.edu | password123 |
| Faculty | priya@faculty.edu | password123 |

## API Endpoints

### Authentication
- `POST /api/members/register` - Register new user
- `POST /api/members/login` - User login
- `GET /api/members/profile` - Get current user profile

### Facilities
- `GET /api/facilities` - List all facilities (with search & filter)
- `GET /api/facilities/:id` - Get facility details
- `GET /api/facilities/:id/availability` - Get availability for a date
- `POST /api/facilities` - Create facility (Admin)
- `PUT /api/facilities/:id` - Update facility (Admin)
- `DELETE /api/facilities/:id` - Delete facility (Admin)

### Reservations
- `POST /api/reservations` - Create booking
- `GET /api/reservations/my-bookings` - Get user's bookings
- `PUT /api/reservations/:id/cancel` - Cancel booking
- `GET /api/reservations/admin/all` - All bookings (Admin)
- `PUT /api/reservations/admin/:id/status` - Update status (Admin)

## Project Structure

```
Task09/
├── SoruceCode/
│   ├── Server/
│   │   ├── src/
│   │   │   ├── config/          # Database configuration
│   │   │   ├── controllers/     # Route handlers
│   │   │   ├── middlewares/     # Auth & validation
│   │   │   ├── models/          # Mongoose schemas
│   │   │   ├── routes/          # API routes
│   │   │   ├── services/        # Email service
│   │   │   ├── utils/           # Seed script
│   │   │   ├── app.js           # Express app
│   │   │   └── index.js         # Entry point
│   │   ├── .env
│   │   └── package.json
│   │
│   └── Client/
│       ├── src/
│       │   ├── components/      # Reusable components
│       │   ├── context/         # Auth context
│       │   ├── pages/           # Page components
│       │   ├── services/        # API service
│       │   ├── config/          # Configuration
│       │   ├── App.jsx          # Main app
│       │   ├── App.css          # Styles
│       │   └── main.jsx         # Entry point
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
│
└── README.md
```

## Screenshots

### Home Page
Clean landing page with feature highlights and quick access to facilities.

### Facility Catalog
Browse facilities with category filters and search functionality.

### Booking Interface
Interactive calendar with time slot picker and booking form.

### Admin Dashboard
Statistics overview, booking management, and facility CRUD operations.

## Design Philosophy

Campus Hub follows a **minimalistic design approach** with:
- Clean, uncluttered interface
- Subtle shadows and borders
- Consistent spacing and typography
- Responsive design for all devices
- Intuitive navigation

## License

MIT License - Feel free to use and modify for your campus needs.

---

Built with ❤️ for better campus resource management
