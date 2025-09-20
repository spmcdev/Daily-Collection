# Authentication System Documentation

## Overview

The Daily Collection Loan Management System now includes a complete authentication and authorization system with role-based access control.

## User Roles

### Admin Role
- **Full Access**: Can view all features and data
- **User Management**: Can create users, reset passwords, manage roles
- **Data Access**: Full access to loans, payments, analytics, weekly collections
- **Navigation**: All menu items available

### User Role  
- **Limited Access**: Can only view their own borrower summary
- **No Admin Features**: Cannot access user management, loan creation, analytics
- **Restricted Data**: Can only see loans and payments associated with their borrower_id
- **Navigation**: Only "Borrower Summary" available

## Default Accounts

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`
- **Access**: Full system access

### Sample User Accounts
All sample users have the password: `user123`
- **B001** - John Smith
- **B002** - Jane Doe  
- **B003** - Mike Johnson
- **B004** - Sarah Wilson
- **B005** - David Brown

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,  -- Borrower ID for users
    password_hash VARCHAR(255) NOT NULL,   -- Bcrypt hashed password
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin' or 'user'
    borrower_name VARCHAR(255),           -- Display name
    is_active BOOLEAN DEFAULT true,       -- Account status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Session Table
```sql
CREATE TABLE session (
    sid VARCHAR NOT NULL PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
);
```

## API Endpoints

### Authentication
- `POST /api/auth` - Login/logout/check authentication
  - Actions: `login`, `logout`, `check`

### User Management (Admin Only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user, reset password, toggle status, update role
- `DELETE /api/users/:id` - Delete user

### Borrower Summary (Authenticated)
- `GET /api/borrower-summary?borrower_id=X` - Get borrower's loans and payments
  - Users can only access their own data
  - Admins can access any borrower's data

### Protected Routes
- `GET|POST|PUT|DELETE /api/loans` - Admin only
- `GET|POST|PUT|DELETE /api/payments` - Admin only

## Features

### Login System
- Session-based authentication using PostgreSQL session store
- Password hashing with bcryptjs
- Automatic redirection based on role
- "Remember me" functionality via persistent sessions

### Admin Panel (`/admin.html`)
- **Create Users**: Add new admin or user accounts
- **Password Reset**: Reset any user's password
- **User Management**: Activate/deactivate accounts
- **Role Management**: Change user roles between admin/user
- **Delete Users**: Remove users (with protection for last admin)

### Access Control
- **Route Protection**: Server-side route guards based on authentication and role
- **UI Adaptation**: Navigation and features shown/hidden based on role
- **Data Filtering**: Users automatically filtered to their own data

### Security Features
- Password strength requirements (minimum 6 characters)
- Protection against deleting the last admin user
- Session timeout and cleanup
- SQL injection protection through parameterized queries
- CORS configuration for secure API access

## User Workflows

### Admin Workflow
1. Login with `admin` / `admin123`
2. Access full dashboard with all loans and payments
3. Create new loans and record payments
4. Manage users via Admin Panel
5. View analytics and weekly collections

### User Workflow
1. Login with borrower ID (e.g., `B001`) / `user123`
2. Automatically redirected to borrower summary
3. View only their own loans and payment history
4. Cannot access other features or data

## File Structure

### New Files Added
```
/login.html                          # Login page
/admin.html                          # Admin user management
/api/auth-local.js                   # Authentication API
/api/users-local.js                  # User management API
/api/borrower-summary-local.js       # Filtered borrower data API
/database/init.sql                   # Updated with users and session tables
/database/seed.sql                   # Updated with default accounts
```

### Modified Files
```
/server.js                           # Added session middleware and auth routes
/package.json                        # Added auth dependencies
/index.html                          # Added auth checks and navigation
/borrower_summary.html               # Added role-based filtering
/.env.local                          # Added session secret
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```
New dependencies added:
- `bcryptjs` - Password hashing
- `express-session` - Session management  
- `connect-pg-simple` - PostgreSQL session store

### 2. Database Setup
The database schema includes new tables for users and sessions. Default accounts are automatically created when you run:
```bash
npm run db:up
```

### 3. Start Application
```bash
npm run dev
```

### 4. Access Application
- Visit: http://localhost:3000
- Will redirect to login page
- Use default admin credentials or any sample user account

## Development Notes

### Password Hashing
- Uses bcryptjs with salt rounds of 10
- Passwords are never stored in plain text
- Hash comparison is done server-side

### Session Management
- Sessions stored in PostgreSQL for persistence
- 24-hour session timeout
- Secure session configuration for production

### Role-Based Access
- Server-side enforcement prevents unauthorized API access
- Client-side UI adaptation for better user experience
- Data filtering ensures users only see their own information

### Error Handling
- Graceful handling of authentication failures
- Proper HTTP status codes (401 Unauthorized, 403 Forbidden)
- User-friendly error messages

## Production Considerations

### Security Enhancements
- Change `SESSION_SECRET` to a long, random string
- Enable HTTPS and set `cookie.secure = true`
- Implement rate limiting for login attempts
- Add password complexity requirements
- Consider implementing 2FA for admin accounts

### Performance
- Session cleanup job for expired sessions
- Database indexing on user lookup fields
- Consider Redis for session store in high-traffic scenarios

### Monitoring
- Log authentication events
- Monitor failed login attempts
- Track user activity for audit purposes

## Troubleshooting

### Common Issues
1. **Can't access admin features**: Ensure logged in as admin role
2. **User can't see their data**: Verify username matches borrower_id exactly
3. **Session not persisting**: Check database connection and session table
4. **Password reset not working**: Ensure user exists and is active

### Debug Tips
- Check browser console for API errors
- Verify session data in database session table
- Test API endpoints directly with tools like curl or Postman
- Review server logs for authentication errors