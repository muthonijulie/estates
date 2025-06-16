
const mongoose = require('mongoose');
const Admin = require('./models/Login'); // Go up two levels from config // Adjust the path as necessary
require('dotenv').config();

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const admin = await Admin.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('❌ Admin not found');
      return;
    }

    console.log('✅ Admin found:', {
      id: admin._id,
      username: admin.username,

      hasPassword: !!admin.password
    });

    // Test password comparison
    const isPasswordValid = await admin.comparePassword('admin123');
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