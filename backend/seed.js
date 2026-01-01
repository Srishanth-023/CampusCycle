/**
 * Seed Script - Initialize database with sample data
 * Run with: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Booth = require('./models/Booth');
const Unit = require('./models/Unit');
const Cycle = require('./models/Cycle');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Booth.deleteMany({});
    await Unit.deleteMany({});
    await Cycle.deleteMany({});

    // Create Booths
    console.log('📍 Creating booths...');
    const booths = await Booth.insertMany([
      {
        name: 'Main Gate Booth',
        location: { lat: 28.6139, lon: 77.2090, radius: 100 }
      },
      {
        name: 'Library Booth',
        location: { lat: 28.6145, lon: 77.2085, radius: 100 }
      },
      {
        name: 'Cafeteria Booth',
        location: { lat: 28.6135, lon: 77.2095, radius: 100 }
      }
    ]);
    console.log(`✅ Created ${booths.length} booths`);

    // Create Units
    console.log('🔢 Creating units...');
    const units = [];
    for (let i = 0; i < booths.length; i++) {
      for (let j = 1; j <= 5; j++) {
        units.push({
          unitId: `${booths[i].name.split(' ')[0]}-U${j}`,
          boothId: booths[i]._id,
          status: 'FREE',
          cycleRfid: null
        });
      }
    }
    await Unit.insertMany(units);
    console.log(`✅ Created ${units.length} units`);

    // Create Cycles
    console.log('🚴 Creating cycles...');
    const cycles = [];
    for (let i = 1; i <= 10; i++) {
      cycles.push({
        rfid: `RFID${String(i).padStart(5, '0')}`,
        status: 'PARKED'
      });
    }
    await Cycle.insertMany(cycles);
    console.log(`✅ Created ${cycles.length} cycles`);

    // Park some cycles in units (first 3 units of first booth)
    console.log('🅿️  Parking some cycles...');
    const firstBoothUnits = await Unit.find({ boothId: booths[0]._id }).limit(3);
    for (let i = 0; i < firstBoothUnits.length; i++) {
      firstBoothUnits[i].status = 'OCCUPIED';
      firstBoothUnits[i].cycleRfid = cycles[i].rfid;
      await firstBoothUnits[i].save();
    }
    console.log(`✅ Parked 3 cycles in ${booths[0].name}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Booths: ${booths.length}`);
    console.log(`   Units: ${units.length}`);
    console.log(`   Cycles: ${cycles.length}`);
    console.log(`   Occupied Units: 3`);
    console.log(`   Free Units: ${units.length - 3}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

// Run the seed
connectDB().then(seedData);
