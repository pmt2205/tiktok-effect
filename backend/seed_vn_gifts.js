const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const jsonPath = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\68edc9df-8662-4e24-b1f5-6462d94661b6\\scratch\\vn_gifts.json';
const giftsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function seed() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/tiktok-effect';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    const usersColl = mongoose.connection.db.collection('users');
    const giftsColl = mongoose.connection.db.collection('gifts');

    const dbUsers = await usersColl.find().toArray();
    let usernames = dbUsers.map(u => u.username).filter(Boolean);
    if (usernames.length === 0) {
      usernames = ['admin', 'user', 'default'];
    }

    console.log(`Seeding ${giftsData.length} VN gifts for ${usernames.length} users: ${usernames.join(', ')}`);

    for (const username of usernames) {
      const bulkOps = giftsData.map(g => ({
        updateOne: {
          filter: { username, giftId: g.giftId },
          update: {
            $set: {
              username,
              giftId: g.giftId,
              name: g.name,
              coins: g.coins,
              icon: g.icon,
              menuShow: false,
            },
            $setOnInsert: {
              videos: [],
              activeVideo: '',
              sounds: [],
              activeSound: '',
              menuText: '',
            }
          },
          upsert: true
        }
      }));

      const res = await giftsColl.bulkWrite(bulkOps);
      console.log(`User '${username}': Upserted ${res.upsertedCount} new gifts, modified ${res.modifiedCount} existing gifts.`);
    }

    const totalInDb = await giftsColl.countDocuments();
    console.log(`\nSUCCESS! Total gift records in database: ${totalInDb}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
}

seed();
