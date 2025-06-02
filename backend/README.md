# WeRent Backend API - Complete MongoDB Structure

A comprehensive property rental and sales management system built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/werent-backend.git
cd werent-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start MongoDB service (if running locally)
mongod

# Run database seeders (optional)
npm run seed

# Start development server
npm run dev

# Start production server
npm start
```

## 📦 Dependencies

```bash
npm init -y
npm install express mongoose cors dotenv joi nodemailer helmet express-rate-limit bcryptjs jsonwebtoken multer cloudinary express-validator moment
npm install -D nodemon eslint prettier jest supertest
```

## 📁 Complete Project Structure

```
werent-backend/
├── server.js                          # Main entry point, starts server
├── package.json
├── .env                               # Environment variables
├── .gitignore
├── README.md
├── config/
│   ├── database.js                    # MongoDB connection setup
│   ├── email.js                       # Email service configuration  
│   ├── cloudinary.js                  # Image upload configuration
│   └── constants.js                   # App constants and enums
├── models/
│   ├── Property.js                    # Property schema and model
│   ├── Booking.js                     # Rental booking schema
│   ├── Viewing.js                     # Sale viewing schema
│   ├── Contact.js                     # Contact form schema
│   ├── User.js                        # User schema (future auth)
├── controllers/
│   ├── propertyController.js          # Get properties, filters, search
│   ├── rentalController.js            # Handle rental bookings
│   ├── saleController.js              # Handle sale viewings
│   ├── contactController.js           # Contact form submissions
│   ├── availabilityController.js     # Property availability calendar
│   └── serviceController.js           # Services page data
├── routes/
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
│   ├── cors.js                        # CORS configuration
│   ├── auth.js                        # Authentication middleware
│   └── upload.js                      # File upload middleware
├── services/
│   ├── propertyService.js             # Property database operations
│   ├── bookingService.js              # Booking database operations
│   ├── viewingService.js              # Viewing database operations
│   ├── emailService.js                # Send emails (confirmations, notifications)
│   ├── calendarService.js             # Availability calendar logic
│   └── uploadService.js               # File upload handling
├── database/
│   ├── seeders/                       # Database seeding scripts
│   │   ├── propertySeeder.js          # Sample properties
│   │   ├── userSeeder.js              # Sample users
│   │   └── index.js                   # Run all seeders
│   └── connection.js                  # Database connection utilities
├── utils/
│   ├── responseHandler.js             # Standardized API responses
│   ├── dateHelper.js                  # Date formatting and validation
│   ├── validator.js                   # Custom validation functions
│   ├── logger.js                      # Application logging
│   └── helpers.js                     # General utility functions
└── uploads/                           # Local file storage (development)
    └── properties/
```

## 🔧 Environment Variables (.env)

```env
# Application
NODE_ENV=development
PORT=5000
APP_NAME=WeRent API
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/werent
MONGODB_TEST_URI=mongodb://localhost:27017/werent

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=12

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@werent.com

# File Upload - Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://werent.com

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🏗️ Database Models

### Property Model
```javascript
// models/Property.js
{
  title: String (required),
  description: String,
  propertyType: ['rental', 'sale'] (required),
  price: Number (required),
  bedrooms: Number (required),
  bathrooms: Number,
  location: {
    address: String,
    city: String,
    county: String,
    coordinates: [longitude, latitude]
  },
  images: [String], // Cloudinary URLs
  amenities: [String],
  availableDates: [{
    startDate: Date,
    endDate: Date,
    isAvailable: Boolean
  }],
  status: ['active', 'inactive', 'rented', 'sold'],
  owner: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
// models/Booking.js
{
  property: ObjectId (ref: 'Property', required),
  tenant: {
    fullName: String (required),
    email: String (required),
    phone: String (required)
  },
  checkInDate: Date (required),
  checkOutDate: Date (required),
  guests: {
    adults: Number (required),
    children: Number (default: 0)
  },
  bedroomsNeeded: Number (required),
  specialRequests: String,
  totalPrice: Number,
  status: ['pending', 'confirmed', 'cancelled', 'completed'],
  paymentStatus: ['pending', 'paid', 'refunded'],
  createdAt: Date,
  updatedAt: Date
}
```

### Viewing Model
```javascript
// models/Viewing.js
{
  property: ObjectId (ref: 'Property', required),
  client: {
    fullName: String (required),
    email: String (required),
    phone: String (required)
  },
  preferredDateTime: Date (required),
  actualDateTime: Date,
  comments: String,
  status: ['pending', 'confirmed', 'completed', 'cancelled'],
  agent: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Contact Model
```javascript
// models/Contact.js
{
  name: String (required),
  email: String (required),
  phone: String,
  subject: String,
  message: String (required),
  serviceType: String,
  status: ['new', 'read', 'replied', 'resolved'],
  priority: ['low', 'medium', 'high'],
  assignedTo: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

## 🛣️ API Endpoints

### Properties
```
GET    /api/v1/properties              # Get all properties with filters
GET    /api/v1/properties/rentals      # Get rental properties only
GET    /api/v1/properties/sales        # Get sale properties only
GET    /api/v1/properties/:id          # Get single property details
POST   /api/v1/properties              # Create new property (auth required)
PUT    /api/v1/properties/:id          # Update property (auth required)
DELETE /api/v1/properties/:id          # Delete property (auth required)
```

### Rentals
```
POST   /api/v1/rentals/book            # Create rental booking
GET    /api/v1/rentals/:id             # Get booking details
GET    /api/v1/rentals/property/:id    # Get all bookings for property
PUT    /api/v1/rentals/:id/status      # Update booking status
GET    /api/v1/rentals/user/:userId    # Get user's bookings
```

### Sales & Viewings
```
POST   /api/v1/sales/viewing           # Schedule property viewing
GET    /api/v1/sales/viewings/:id      # Get viewing details
GET    /api/v1/sales/viewings/property/:id  # Get all viewings for property
PUT    /api/v1/sales/viewings/:id/status   # Update viewing status
GET    /api/v1/sales/viewings/agent/:id    # Get agent's viewings
```

### Availability
```
GET    /api/v1/availability/:propertyId     # Get property availability calendar
POST   /api/v1/availability/:propertyId    # Update availability
GET    /api/v1/availability/:propertyId/bookings  # Get booking calendar
```

### Contact & Services
```
POST   /api/contact                    # Submit contact form
GET    /api/contact                    # Get all contacts (auth required)
PUT    /api/contact/:id/status         # Update contact status
GET    /api/services                   # Get all services information
```

### File Upload
```
POST   /api/v1/upload/property-images  # Upload property images
DELETE /api/v1/upload/images/:publicId # Delete uploaded image
```

## 📊 Query Examples

### Get Filtered Properties
```javascript
GET /api/v1/properties?
  propertyType=rental&
  minPrice=1000&
  maxPrice=5000&
  bedrooms=2&
  location=Nairobi&
  amenities=parking,wifi&
  sortBy=price&
  sortOrder=asc&
  page=1&
  limit=10
```

### Property Search
```javascript
GET /api/v1/properties/search?
  q=furnished apartment&
  location=Westlands&
  radius=5
```

## 🚀 Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "seed": "node database/seeders/index.js",
    "seed:properties": "node database/seeders/propertySeeder.js",
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix",
    "format": "prettier --write .",
    "build": "echo 'No build step required'",
    "logs": "tail -f logs/app.log"
  }
}
```

## 🔐 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Prevent API abuse
- **CORS**: Cross-origin request handling
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcryptjs encryption
- **JWT Authentication**: Secure token-based auth
- **File Upload Security**: Type and size validation
- **MongoDB Injection Prevention**: Mongoose sanitization

## 📈 Development Workflow

### 1. Environment Setup
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configurations

# Start MongoDB
mongod
```

### 2. Database Setup
```bash
# Seed database with sample data
npm run seed

# Or seed specific collections
npm run seed:properties
```

### 3. Development Server
```bash
# Start development server with hot reload
npm run dev

# Server runs on http://localhost:5000
# API available at http://localhost:5000/api/v1
```

### 4. Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Test specific endpoint
npm test -- propertyController.test.js
```

## 🏗️ File Responsibilities

### Core Application
- **server.js** - Application entry point, server startup
- **app.js** - Express configuration, middleware setup, route mounting

### Models (MongoDB Schemas)
- **Property.js** - Property document schema and methods
- **Booking.js** - Rental booking schema and validation
- **Viewing.js** - Property viewing schema
- **Contact.js** - Contact form submission schema
- **User.js** - User authentication schema

### Controllers (Business Logic)
- **propertyController.js** - Property CRUD operations, filtering, search
- **rentalController.js** - Booking creation, management, validation
- **saleController.js** - Viewing scheduling, agent assignment
- **contactController.js** - Contact form processing, email notifications
- **availabilityController.js** - Calendar management, date availability

### Services (Data Layer)
- **propertyService.js** - Property database operations and queries
- **bookingService.js** - Booking-related database operations
- **viewingService.js** - Viewing-related database operations
- **emailService.js** - Email sending, template processing
- **uploadService.js** - File upload to Cloudinary, image processing

### Middleware
- **validation.js** - Request validation using Joi schemas
- **errorHandler.js** - Global error handling and formatting
- **auth.js** - JWT token verification, user authentication
- **rateLimiter.js** - API rate limiting configuration
- **upload.js** - Multer file upload configuration

## 🌐 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
# Set environment to production
export NODE_ENV=production

# Start with PM2 (recommended)
pm2 start ecosystem.config.js

# Or start directly
npm start
```

### Docker Support
```dockerfile
# Dockerfile included for containerized deployment
docker build -t werent-api .
docker run -p 5000:5000 werent-api
```

## 📚 API Documentation

- **Swagger/OpenAPI**: Available at `/api/docs` when server is running
- **Postman Collection**: Import `docs/WeRent-API.postman_collection.json`
- **API Reference**: See `docs/api-docs.md` for detailed endpoint documentation

## 🧪 Testing Strategy

- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user workflows
- **Load Tests**: Test API performance under load

## 🔍 Monitoring & Logging

- **Winston Logger**: Structured logging with different levels
- **Morgan**: HTTP request logging
- **Error Tracking**: Comprehensive error logging and reporting
- **Performance Monitoring**: Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@werent.com
- Documentation: [API Docs](./docs/api-docs.md)
- Issues: [GitHub Issues](https://github.com/yourusername/werent-backend/issues)

---

**WeRent Backend API** - Built with ❤️ for seamless property management