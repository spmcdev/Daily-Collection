# Daily Collection - Loan Management System

A comprehensive web application for managing loans and tracking weekly payments, designed for micro-finance and daily collection businesses.

## Features

- **Loan Management**: Create, edit, and track loans with borrower details
- **Payment Tracking**: Record weekly payments and monitor completion status
- **Analytics Dashboard**: View loan summaries, payment statistics, and completion rates
- **Borrower Summaries**: Individual borrower loan and payment history
- **Weekly Collections**: Track due payments and collection schedules
- **Data Export**: Export data to CSV and JSON formats
- **Multi-environment Support**: Staging and production deployments

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js with Express (local) / Vercel Serverless Functions (production)
- **Database**: PostgreSQL (local) / Supabase (production)
- **Deployment**: Vercel
- **Development**: Docker Compose

## Local Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm

### Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the database:**
   ```bash
   npm run db:up
   ```
   This will start PostgreSQL in Docker with pre-configured schema and sample data.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Main app: http://localhost:3000
   - Database admin: http://localhost:8080
     - System: PostgreSQL
     - Server: postgres (from adminer container)
     - Username: loan_user
     - Password: loan_password
     - Database: loan_app

### Database Management

- **Reset database:** `npm run db:reset` (destroys all data)
- **Stop database:** `npm run db:down`
- **View logs:** `docker-compose logs postgres`

### Development Commands

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Database commands
npm run db:up     # Start PostgreSQL in Docker
npm run db:down   # Stop database
npm run db:reset  # Reset database with fresh schema and sample data
```

## Database Schema

### Loans Table
- `id`: Auto-incrementing primary key
- `borrower_id`: Unique borrower identifier
- `borrower`: Borrower name
- `amount`: Loan principal amount
- `interest`: Interest percentage
- `weeks`: Total loan duration in weeks
- `start_date`: Loan start date
- `created_at`, `updated_at`: Timestamps

### Payments Table
- `id`: Auto-incrementing primary key
- `loan_id`: Foreign key to loans table
- `week`: Payment week number (1, 2, 3...)
- `amount`: Payment amount
- `date`: Payment date
- `created_at`, `updated_at`: Timestamps

## API Endpoints

### Loans
- `GET /api/loans` - List all loans
- `POST /api/loans` - Create new loan
- `PUT /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan

### Payments
- `GET /api/payments` - List all payments
- `POST /api/payments` - Record payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

## Application Pages

- **Dashboard** (`/`) - Overview of loans and payments
- **New Loan** (`/newloan.html`) - Create new loans
- **Analysis** (`/analysis.html`) - Detailed analytics and reports
- **Weekly Payments** (`/weekly.html`) - Weekly collection interface
- **Borrower Summary** (`/borrower_summary.html`) - Individual borrower details

## Sample Data

The development database includes sample loans and payments for testing:
- 5 borrowers with varying loan amounts and payment schedules
- Mix of completed, partially paid, and new loans
- Realistic payment amounts based on loan calculations
