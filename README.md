# Swiver Clone

A comprehensive business management platform built with React, Express, and Prisma.

## Features

- User and Admin authentication
- Dashboard with business metrics
- Client management
- Product management
- Invoice generation
- Quote management
- Expense tracking
- Reports generation
- AI assistant integration

## Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run setup
   ```

4. Start the application:
   ```bash
   npm run start
   ```

5. Open your browser and navigate to http://localhost:5173

## Login Credentials

### Test User
- Email: test@example.com
- Password: test123

### Admin
- Email: admin@swiver.com
- Password: admin123

You can also use the "Login as Test User" or "Login as Admin" buttons on the login page for quick access.

## Development

- Run the server in development mode: `npm run server:dev`
- Run the client in development mode: `npm run dev`
- Run both concurrently: `npm run start`

## Database Management

- Open Prisma Studio: `npm run db:studio`
- Generate Prisma Client: `npm run db:generate`
- Create migrations: `npm run db:migrate`

## Environment Variables

The application uses the following environment variables:

- `PORT`: Server port (default: 3001)
- `DATABASE_URL`: SQLite database URL
- `JWT_SECRET`: Secret for JWT token generation
- `JWT_EXPIRE`: JWT token expiration time
- `ADMIN_EMAIL`: Default admin email
- `ADMIN_PASSWORD`: Default admin password
- `TEST_USER_EMAIL`: Test user email
- `TEST_USER_PASSWORD`: Test user password

These are set in the `.env` file.

## License

This project is for educational purposes only.
