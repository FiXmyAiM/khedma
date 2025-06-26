import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Ensure prisma directory exists
if (!fs.existsSync('prisma')) {
  fs.mkdirSync('prisma');
}

// Check if schema.prisma exists
if (!fs.existsSync(path.join('prisma', 'schema.prisma'))) {
  console.log('Creating Prisma schema file...');
  // Copy the schema.prisma file from the existing one if it exists
  try {
    const schemaContent = fs.readFileSync(path.join('prisma', 'schema.prisma'), 'utf8');
    console.log('Prisma schema file already exists.');
  } catch (error) {
    console.log('Creating new Prisma schema file...');
    // Create a basic schema.prisma file if it doesn't exist
    const schemaContent = `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// User Management
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  firstName     String
  lastName      String
  company       String?
  phone         String?
  country       String?
  plan          Plan      @default(FREE)
  status        UserStatus @default(ACTIVE)
  trialEndsAt   DateTime?
  paidUntil     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("users")
}

model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      AdminRole @default(ADMIN)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("admins")
}

// Enums
enum Plan {
  FREE
  ECONOMIC
  PREMIUM
  VIP
}

enum UserStatus {
  ACTIVE
  TRIAL
  SUSPENDED
  EXPIRED
}

enum AdminRole {
  SUPER_ADMIN
  ADMIN
  SUPPORT
}`;
    
    fs.writeFileSync(path.join('prisma', 'schema.prisma'), schemaContent);
    console.log('Created new Prisma schema file.');
  }
}

try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generated successfully.');
  
  console.log('Creating database migrations...');
  execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
  console.log('Database migrations created successfully.');
} catch (error) {
  console.error('Error setting up database:', error.message);
  process.exit(1);
} 