// create-admin.js - Run this once to create your first admin
require("dotenv").config();
const mongoose = require('mongoose');
const Admin = require('./models/Login');

async function createFirstAdmin() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log("Connected to MongoDB");

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log("Admin already exists!");
            process.exit(0);
        }

        // Create new admin
        const admin = new Admin({
            username: 'admin',
            password: 'admin123' // Change this to a secure password
        });

        await admin.save();
        console.log("Admin created successfully!");
        console.log("Username: admin");
        console.log("Password: admin123");
        console.log("Please change the password after first login!");
        
        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
}

createFirstAdmin();