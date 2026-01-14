# Student Gig Platform - Task 11

A full-stack web application that enables students to offer their skills for short-term work while allowing peers to find quick, affordable help.

## Features

### Core Features
- **Real-time Gig/Task Board**: Browse and search tasks in real-time with Socket.io
- **Bidding System**: Bid on tasks based on price or time
- **Secure User Authentication**: JWT-based authentication system
- **Automatic Portfolio Update**: Portfolio automatically updates after task completion

### Additional Features
- User registration and login
- Task posting with categories, skills, budget, and deadline
- Real-time bid updates using Socket.io
- Task status management (open, in-progress, completed)
- User ratings and reviews
- Profile management with skills and bio
- Filter and search tasks by category, status, budget, etc.

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Socket.io for real-time features
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 18 with Vite
- React Router for navigation
- Axios for API calls
- Socket.io-client for real-time updates
- React Hot Toast for notifications

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Clone the repository**

2. **Setup Backend**
   ```bash
   cd Task11/SoruceCode/Server
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the Server directory:
   ```
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   JWT_EXPIRES_IN=7d
   ```

4. **Setup Frontend**
   ```bash
   cd Task11/SoruceCode/Client
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd Task11/SoruceCode/Server
   npm run dev
   ```

2. **Start the Frontend**
   ```bash
   cd Task11/SoruceCode/Client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout
- `GET /api/auth/portfolio/:userId` - Get user portfolio

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task (auth required)
- `PUT /api/tasks/:id` - Update task (auth required)
- `DELETE /api/tasks/:id` - Delete task (auth required)
- `GET /api/tasks/my/posted` - Get my posted tasks (auth required)
- `GET /api/tasks/my/assigned` - Get tasks assigned to me (auth required)

### Bids
- `GET /api/bids/task/:taskId` - Get bids for a task
- `POST /api/bids` - Place a bid (auth required)
- `GET /api/bids/my` - Get my bids (auth required)
- `PUT /api/bids/:id/accept` - Accept a bid (auth required)
- `PUT /api/bids/:id/complete` - Complete task (auth required)
- `PUT /api/bids/:id/withdraw` - Withdraw bid (auth required)

## Real-time Events

### Socket.io Events
- `newTask` - Emitted when a new task is created
- `taskUpdated` - Emitted when a task is updated
- `taskDeleted` - Emitted when a task is deleted
- `newBid` - Emitted when a new bid is placed
- `bidAccepted` - Emitted when a bid is accepted
- `taskCompleted` - Emitted when a task is completed

## Database Schema

### User
- name, email, password
- skills, bio, avatar
- portfolio (auto-updated on task completion)
- rating (average, count)
- completedTasks count

### Task
- title, description, category
- skills required
- budget (min, max, type)
- deadline, urgency
- status (open, in-progress, completed, cancelled)
- postedBy, assignedTo
- bids

### Bid
- task, bidder
- amount, deliveryTime
- proposal
- status (pending, accepted, rejected, withdrawn)
- bidType (price, time)

## License
ISC
