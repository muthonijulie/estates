# WeRent Backend API - Complete Structure

## Installation

```bash
npm init -y
npm install express mysql2 cors dotenv joi nodemailer helmet express-rate-limit bcryptjs jsonwebtoken
npm install -D nodemon
```

## Complete Project Structure

```
werent-backend/
├── server.js                          # Main entry point, starts server
├── package.json
├── .env
├── config/
│   ├── database.js                    # MySQL connection pool setup
│   ├── email.js                       # Email service configuration  
│   └── constants.js                   # App constants and enums
├── controllers/
│   ├── propertyController.js          # Get properties, filters, search
│   ├── rentalController.js            # Handle rental bookings
│   ├── saleController.js              # Handle sale viewings
│   ├── contactController.js           # Contact form submissions
│   ├── availabilityController.js     # Property availability calendar
│   └── serviceController.js           # Services page data
├── routes/
│   ├── index.js                       # Main router, combines all routes
│   ├── propertyRoutes.js              # /api/properties routes
│   ├── rentalRoutes.js                # /api/rentals routes  
│   ├── saleRoutes.js                  # /api/sales routes
│   ├── contactRoutes.js               # /api/contact routes
│   ├── availabilityRoutes.js          # /api/availability routes
│   └── serviceRoutes.js               # /api/services routes
├── middleware/
│   ├── validation.js                  # Request validation schemas
│   ├── errorHandler.js                # Global error handling
│   ├── rateLimiter.js                 # Rate limiting configuration
│   └── cors.js                        # CORS configuration
├── services/
│   ├── propertyService.js             # Property database operations
│   ├── bookingService.js              # Booking database operations
│   ├── viewingService.js              # Viewing database operations
│   ├── emailService.js                # Send emails (confirmations, notifications)
│   ├── calendarService.js             # Availability calendar logic
│   └── uploadService.js               # File upload handling
├── database/
│   ├── schema.sql                     # Database table creation scripts
│   ├── seeders.sql                    # Sample data insertion
│   └── migrations/                    # Database version migrations
│       ├── 001_create_properties.sql
│       ├── 002_create_bookings.sql
│       └── 003_create_viewings.sql
├── utils/
│   ├── responseHandler.js             # Standardized API responses
│   ├── dateHelper.js                  # Date formatting and validation
│   ├── validator.js                   # Custom validation functions
│   └── logger.js                      # Application logging
└── uploads/                           # Property images storage
    └── properties/
```

## File Purposes Breakdown

### Core Files
- **server.js** - Starts the Express server, connects to database
- **app.js** - Express app setup, middleware, routes mounting
- **.env** - Environment variables (database, email, etc.)

### Config Files
- **config/database.js** - MySQL connection pool, connection handling
- **config/email.js** - Nodemailer setup for sending emails
- **config/constants.js** - Property types, booking statuses, etc.

### Controllers (Handle HTTP Requests)
- **propertyController.js** - Get all properties, filter by type/location/price
- **rentalController.js** - Create rental bookings, get booking details
- **saleController.js** - Schedule property viewings, get viewing details  
- **contactController.js** - Handle contact form submissions
- **availabilityController.js** - Get property availability calendar
- **serviceController.js** - Return services information for frontend

### Routes (API Endpoints)
- **propertyRoutes.js** - GET /api/properties, GET /api/properties/:id
- **rentalRoutes.js** - POST /api/rentals/book, GET /api/rentals/:id
- **saleRoutes.js** - POST /api/sales/viewing, GET /api/sales/viewings
- **contactRoutes.js** - POST /api/contact
- **availabilityRoutes.js** - GET /api/availability/:propertyId
- **serviceRoutes.js** - GET /api/services

### Services (Database Operations)
- **propertyService.js** - SQL queries for properties table
- **bookingService.js** - SQL queries for bookings table
- **viewingService.js** - SQL queries for viewings table
- **emailService.js** - Send booking confirmations, viewing confirmations
- **calendarService.js** - Calculate available/booked dates
- **uploadService.js** - Handle property image uploads

### Middleware
- **validation.js** - Joi schemas for request validation
- **errorHandler.js** - Catch and format errors
- **rateLimiter.js** - Prevent API abuse
- **cors.js** - Handle cross-origin requests

### Database
- **schema.sql** - CREATE TABLE statements for all tables
- **seeders.sql** - INSERT sample properties and data
- **migrations/** - Database version control scripts

### Utils
- **responseHandler.js** - Consistent API response format
- **dateHelper.js** - Date validation and formatting
- **validator.js** - Custom validation logic
- **logger.js** - Log requests and errors

## Environment Variables (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=werent

# Server
PORT=5000
NODE_ENV=development

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Security
JWT_SECRET=your_jwt_secret_here
BCRYPT_ROUNDS=12

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5000000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Schema

```sql
-- Properties table
CREATE TABLE properties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type ENUM('rental', 'sale') NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  bedrooms INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  images JSON,
  amenities JSON,
  available_dates JSON,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Rental bookings table
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  contact VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  adults INT NOT NULL,
  children INT DEFAULT 0,
  bedrooms_needed INT NOT NULL,
  special_requests TEXT,
  total_price DECIMAL(10,2),
  status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Sale viewings table
CREATE TABLE viewings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  contact VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  comments TEXT,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id)
);

-- Contact submissions table
CREATE TABLE contacts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  service_type VARCHAR(100),
  status ENUM('new', 'read', 'replied') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Properties
- GET /api/properties - Get all properties
- GET /api/properties/rentals - Get rental properties only
- GET /api/properties/sales - Get sale properties only
- GET /api/properties/:id - Get single property details

### Rentals
- POST /api/rentals/book - Create rental booking
- GET /api/rentals/:id - Get booking details
- GET /api/rentals/property/:propertyId - Get all bookings for property

### Sales
- POST /api/sales/viewing - Schedule property viewing
- GET /api/sales/viewings/:id - Get viewing details
- GET /api/sales/viewings/property/:propertyId - Get all viewings for property

### Availability
- GET /api/availability/:propertyId - Get property availability calendar
- GET /api/availability/:propertyId/rentals - Get rental availability
- GET /api/availability/:propertyId/viewings - Get viewing availability

### Contact & Services
- POST /api/contact - Submit contact form
- GET /api/services - Get all services information

## Development Priority

1. **Setup core files** (server.js, app.js, config/database.js)
2. **Create database schema** (run schema.sql)
3. **Build property endpoints** (propertyController, propertyRoutes, propertyService)
4. **Add rental booking system** (rentalController, bookingService)
5. **Add viewing system** (saleController, viewingService)
6. **Implement availability calendar** (availabilityController, calendarService)
7. **Add contact system** (contactController, emailService)
8. **Test all endpoints**

Each file has a specific single responsibility. Controllers handle HTTP requests/responses. Services handle database operations. Routes define endpoints. This structure separates concerns properly for a production application.