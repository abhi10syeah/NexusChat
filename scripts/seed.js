require('dotenv').config({ path: './.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User').default;
const Room = require('../src/models/Room').default;

const usersData = [
  { username: 'Alice', email: 'alice@example.com', password: 'password123' },
  { username: 'Bob', email: 'bob@example.com', password: 'password123' },
  { username: 'Charlie', email: 'charlie@example.com', password: 'password123' },
  { username: 'David', email: 'david@example.com', password: 'password123' },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI not found in .env.local file. Please add it.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded. Skipping.');
      return;
    }

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Room.deleteMany({});

    console.log('Seeding users...');
    const createdUsers = [];
    for (const userData of usersData) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(userData.password, salt);
      const user = new User({
        username: userData.username,
        email: userData.email,
        passwordHash: passwordHash,
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`- Created user: ${savedUser.username}`);
    }

    console.log('Seeding rooms...');
    const generalRoom = new Room({
      name: '#general',
      isPublic: true,
      members: createdUsers.map(u => u._id),
    });
    await generalRoom.save();
    console.log('- Created room: #general');

    const randomRoom = new Room({
        name: '#random',
        isPublic: true,
        members: createdUsers.map(u => u._id),
    });
    await randomRoom.save();
    console.log('- Created room: #random');

    const techRoom = new Room({
        name: '#tech',
        isPublic: true,
        members: createdUsers.map(u => u._id),
    });
    await techRoom.save();
    console.log('- Created room: #tech');


    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
