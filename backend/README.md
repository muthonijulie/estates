# WeRent Backend API - MongoDB Structure

A comprehensive property rental and sales management system for **Watamu vacation properties** built with Node.js, Express, and MongoDB.

## 🏖️ About WeRent

**"Your Dream Home, Just a Click Away. Find a home to rent or buy effortlessly."**

WeRent specializes in connecting travelers with handpicked villas, cottages, and vacation homes across Watamu, Kenya. From beachfront bliss to quiet garden escapes, we provide seamless booking experiences with additional services like airport transfers, housekeeping, and safari excursions.

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
│   └── index.js                       # Export all models
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
│   │   ├── propertySeeder.js          # Sample Watamu properties
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
MONGODB_TEST_URI=mongodb://localhost:27017/werent_test

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

# WhatsApp Integration
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_TOKEN=your_whatsapp_token

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🏗️ Database Models (Based on Document Requirements)

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
  propertyCategory: ['villa', 'apartment', 'cottage', 'house'] (required),
  location: {
    address: String,
    city: String (default: 'Watamu'),
    county: String (default: 'Kilifi'),
    coordinates: [Number] // [longitude, latitude]
  },
  images: [String], // Cloudinary URLs - multiple images for "View More"
  amenities: [String], // WiFi, parking, pool, etc.
  availableDates: [{
    date: Date,
    isAvailable: Boolean,
    bookingType: String // 'rental' or 'viewing'
  }],
  status: ['active', 'inactive', 'rented', 'sold'],
  owner: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model (Rental Properties)
```javascript
// models/Booking.js - Exactly matches document requirements
{
  property: ObjectId (ref: 'Property', required),
  
  // Booking Form Fields (as specified in document)
  fullName: String (required),
  contact: String (required), // Phone number
  email: String (required),
  checkInDate: Date (required),
  checkOutDate: Date (required),
  numberOfAdults: Number (required),
  numberOfChildren: Number (default: 0),
  numberOfBedrooms: Number (required),
  specialRequests: String, // Additional notes
  
  // System fields
  totalPrice: Number,
  status: ['pending', 'confirmed', 'cancelled', 'completed'],
  paymentStatus: ['pending', 'paid', 'refunded'],
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Viewing Model (Sale Properties)
```javascript
// models/Viewing.js - Exactly matches document requirements
{
  property: ObjectId (ref: 'Property', required),
  
  // Viewing Form Fields (as specified in document)
  fullName: String (required),
  contactInfo: String (required), // Phone number
  email: String (required), // Added for completeness
  preferredDate: Date (required),
  preferredTime: String (required), // Time string like "10:00 AM"
  comments: String, // Any comments
  
  // System fields
  actualDateTime: Date, // When viewing actually happened
  status: ['pending', 'confirmed', 'completed', 'cancelled'],
  agent: ObjectId (ref: 'User'),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Contact Model
```javascript
// models/Contact.js - For contact forms and service inquiries
{
  name: String (required),
  email: String (required),
  phone: String,
  subject: String,
  message: String (required),
  serviceType: ['property_rentals', 'booking_assistance', 'airport_transfers', 
               'housekeeping', 'safaris_excursions', 'property_management', 'general'],
  status: ['new', 'read', 'replied', 'resolved'],
  priority: ['low', 'medium', 'high'],
  assignedTo: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### User Model
```javascript
// models/User.js
{
  name: String (required),
  email: String (required, unique),
  phone: String,
  password: String (required, hashed),
  role: ['admin', 'agent', 'customer'],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## 🛣️ API Endpoints (Matching Document Flow)

### Properties
```
GET    /api/v1/properties              # Get all properties with filters
GET    /api/v1/properties/rentals      # Find Rentals page
GET    /api/v1/properties/sales        # Buy a Home page
GET    /api/v1/properties/:id          # Single property with calendar
POST   /api/v1/properties              # Create new property (admin)
PUT    /api/v1/properties/:id          # Update property (admin)
DELETE /api/v1/properties/:id          # Delete property (admin)
```

### Rentals (Book Now Functionality)
```
POST   /api/v1/rentals/book            # Submit "Book Now" form
GET    /api/v1/rentals/:id             # Get booking details
GET    /api/v1/rentals/property/:id    # Get all bookings for property
PUT    /api/v1/rentals/:id/status      # Update booking status
```

### Sales & Viewings (Book a Viewing Functionality)
```
POST   /api/v1/sales/viewing           # Submit "Book a Viewing" form
GET    /api/v1/sales/viewings/:id      # Get viewing details
GET    /api/v1/sales/viewings/property/:id  # Get all viewings for property
PUT    /api/v1/sales/viewings/:id/status   # Update viewing status
```

### Availability Calendar
```
GET    /api/v1/availability/:propertyId     # Get property calendar
# Returns dates with color codes:
# - Green dates = Available
# - Red dates = Booked (for rentals)
# - Blue dates = Viewing booked (for sales)
```

### Services (Watamu Services)
```
GET    /api/v1/services                # Get all services data
GET    /api/v1/services/transfers      # Airport transfer service
GET    /api/v1/services/housekeeping   # Housekeeping service
GET    /api/v1/services/safaris        # Safari & excursions
GET    /api/v1/services/management     # Property management
```

### Contact & Communication
```
POST   /api/v1/contact                 # Submit contact form
GET    /api/v1/contact                 # Get all contacts (admin)
PUT    /api/v1/contact/:id/status      # Update contact status
POST   /api/v1/whatsapp/send          # Send WhatsApp message
```

## 📊 Query Examples & Filters

### Property Filtering (As per Document)
```javascript
GET /api/v1/properties/rentals?
  priceMin=5000&
  priceMax=20000&
  location=Watamu&
  bedrooms=2&
  propertyType=villa&
  amenities=pool,wifi&
  sortBy=price&
  sortOrder=asc&
  page=1&
  limit=10
```

### Property Search
```javascript
GET /api/v1/properties/search?
  q=beachfront villa&
  location=Watamu&
  available=true
```

## 🏖️ Watamu Services Integration

### Services Data Structure
```javascript
// Services as per document requirements
const services = {
  propertyRentals: {
    title: "Property Rentals",
    description: "We connect you with handpicked villas, cottages, and vacation homes across Watamu.",
    icon: "🏖️"
  },
  bookingAssistance: {
    title: "Booking Assistance", 
    description: "Our team helps you book accommodations, transfers, or activities with ease.",
    icon: "📞"
  },
  airportTransfers: {
    title: "Airport Transfers",
    description: "Reliable airport pickups and drop-offs so you can travel stress-free.",
    icon: "✈️"
  },
  housekeeping: {
    title: "Housekeeping & Maintenance",
    description: "Daily or on-request cleaning, villa maintenance, and fast fixes.",
    icon: "🧹"
  },
  safaris: {
    title: "Safaris & Excursions", 
    description: "From Arabuko Sokoke Forest elephants to boat trips in Mida Creek.",
    icon: "🐘"
  },
  propertyManagement: {
    title: "Property Management",
    description: "We take care of your investment—from guest handling to maintenance.",
    icon: "🏠"
  }
}
```

## 📱 Frontend Integration Features

### Popup Messages (As per Document)
```javascript
// After successful booking submission
const bookingSuccessMessage = "Thank you for booking with us. Kindly wait as we confirm availability. We'll contact you shortly!";

// After successful viewing submission  
const viewingSuccessMessage = "Thank you for scheduling a viewing. We'll be in touch to confirm the time and guide you through the process!";
```

### Calendar Color Coding
```javascript
// Rental Properties Calendar
const rentalCalendar = {
  green: "Available dates",
  red: "Booked dates"
};

// Sale Properties Calendar
const saleCalendar = {
  green: "Available for viewing", 
  blue: "Viewing already booked"
};
```

### Social Media & Communication
```javascript
// Social media links (as requested in document)
const socialMedia = {
  whatsapp: "WhatsApp icon in menu bar",
  tiktok: "TikTok profile link",
  instagram: "Instagram profile link", 
  facebook: "Facebook profile link"
};

// Live chat with sound notification
const liveChatConfig = {
  popupSound: true,
  phoneIconCustom: true // Changed phone icon as requested
};
```

## 🔐 Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Prevent API abuse
- **CORS**: Cross-origin request handling
- **Input Validation**: Joi schema validation matching exact form fields
- **File Upload Security**: Image type and size validation
- **MongoDB Injection Prevention**: Mongoose sanitization

## 📈 Development Priority (Based on Document)

### Phase 1: Core Functionality
1. **Homepage API** - Welcome message and navigation buttons
2. **Property Models** - Rental and sale property schemas
3. **Rental Booking** - "Book Now" form with exact fields
4. **Sale Viewing** - "Book a Viewing" form with exact fields

### Phase 2: Calendar & Availability
5. **Calendar System** - Color-coded availability (green/red/blue)
6. **Availability API** - Real-time booking status
7. **Image Gallery** - "View More" functionality

### Phase 3: Services & Communication  
8. **Services Page** - Watamu services integration
9. **Contact System** - Contact forms and WhatsApp integration
10. **Social Media** - Links and live chat with sound

### Phase 4: Admin & Management
11. **Property Management** - CRUD operations
12. **Booking Management** - Status updates and confirmations
13. **Email Notifications** - Booking and viewing confirmations

## 🚀 Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch", 
    "seed": "node database/seeders/index.js",
    "seed:watamu": "node database/seeders/watamuProperties.js",
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix",
    "format": "prettier --write .",
    "logs": "tail -f logs/app.log"
  }
}
```

## 🌐 Deployment

### Development
```bash
npm run dev
# Server runs on http://localhost:5000
# API available at http://localhost:5000/api/v1
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

## 📚 API Documentation

- **Swagger/OpenAPI**: Available at `/api/docs` when server is running
- **Postman Collection**: Import `docs/WeRent-API.postman_collection.json`
- **API Reference**: See `docs/api-docs.md` for detailed endpoint documentation

## 🧪 Testing Strategy

- **Unit Tests**: Test booking and viewing form validation
- **Integration Tests**: Test API endpoints with exact document requirements  
- **E2E Tests**: Test complete booking and viewing workflows
- **Calendar Tests**: Test availability color coding system

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/watamu-bookings`
3. Commit changes: `git commit -m 'Add Watamu booking system'`
4. Push to branch: `git push origin feature/watamu-bookings`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Contact

**WeRent Watamu Properties**
- 📧 Email: info@werent-watamu.com
- 📱 WhatsApp: Available via menu bar icon
- 🌐 Website: [WeRent Watamu](https://werent-watamu.com)
- 📍 Location: Watamu, Kilifi County, Kenya

### Social Media
- 📘 Facebook: [WeRent Watamu](https://facebook.com/werent-watamu)
- 📸 Instagram: [@werentwatamu](https://instagram.com/werentwatamu)  
- 🎵 TikTok: [@werentwatamu](https://tiktok.com/@werentwatamu)

**"Start your holiday from the runway! Why worry about how to get there? We offer private airport transfers straight to your villa. No delays. No stress. Just vibes."**

💬 *Need a ride? Just say the word.*

---

**WeRent Backend API** - Built with ❤️ for Watamu vacation property management