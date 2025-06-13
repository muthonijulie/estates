// test-login.js - Run this to test your login functionality
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if admin exists
    const admin = await Admin.findOne({ username: 'brayoadmin' });
    
    if (!admin) {
      console.log('❌ Admin not found');
      return;
    }

    console.log('✅ Admin found:', {
      id: admin._id,
      username: admin.username,
      role: admin.role,
      hasPassword: !!admin.password
    });

    // Test password comparison
    const isPasswordValid = await admin.comparePassword('password1234');
    console.log('Password test result:', isPasswordValid ? '✅ Valid' : '❌ Invalid');

    // Test with wrong password
    const isWrongPasswordValid = await admin.comparePassword('wrongpassword');
    console.log('Wrong password test:', isWrongPasswordValid ? '❌ Should be false' : '✅ Correctly invalid');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the test
testLogin();