// migration.js
const mongoose = require('mongoose');

// Connect to your MongoDB
mongoose.connect('mongodb+srv://CHEGEBB:Phil%402003@glamour.cjncwua.mongodb.net/werent', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function migrateProperties() {
  try {
    console.log('Starting property migration...');
    
    // Update all documents with null status to 'available'
    const result = await mongoose.connection.db.collection('properties').updateMany(
      { status: null },
      { $set: { status: 'available' } }
    );
    
    console.log(`Updated ${result.modifiedCount} properties with null status to 'available'`);
    
    // Also update any documents that might have status not in the new enum
    const result2 = await mongoose.connection.db.collection('properties').updateMany(
      { status: { $nin: ['available', 'booked', 'rented', 'sold'] } },
      { $set: { status: 'available' } }
    );
    
    console.log(`Updated ${result2.modifiedCount} properties with invalid status to 'available'`);
    
    // Verify the changes
    const count = await mongoose.connection.db.collection('properties').countDocuments({ status: null });
    console.log(`Properties with null status remaining: ${count}`);
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateProperties();