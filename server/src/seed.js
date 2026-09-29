import 'dotenv/config';
import mongoose from 'mongoose';
import Item from './models/Item.js';

const daysAgo = (days) => new Date(Date.now() - days * 86400000);
const samples = [
  { title: 'Blue water bottle', type: 'found', category: 'Accessories', description: 'Blue insulated bottle with a small sticker on the side.', location: 'Central Library, 2nd floor', date: daysAgo(0), contactName: 'Aarav Student', contactEmail: 'aarav.demo@example.com' },
  { title: 'Student ID card', type: 'lost', category: 'ID & Cards', description: 'Integral University student card. Please email if you picked it up.', location: 'Near the main auditorium', date: daysAgo(1), contactName: 'Sara Student', contactEmail: 'sara.demo@example.com' },
  { title: 'Wireless earbuds case', type: 'found', category: 'Electronics', description: 'Small black charging case found near the cafeteria.', location: 'Cafeteria, east entrance', date: daysAgo(2), contactName: 'Rehan Student', contactEmail: 'rehan.demo@example.com' },
  { title: 'Data Structures notebook', type: 'lost', category: 'Books & Notes', description: 'Green spiral notebook with class notes. Name is written inside.', location: 'Computer Science block, Room 204', date: daysAgo(3), contactName: 'Maya Student', contactEmail: 'maya.demo@example.com' },
  { title: 'Keys on a silver keyring', type: 'found', category: 'Personal items', description: 'Two keys on a plain silver ring handed in after morning class.', location: 'Lecture Hall 3', date: daysAgo(4), contactName: 'Zoya Student', contactEmail: 'zoya.demo@example.com' },
  { title: 'Grey hoodie', type: 'lost', category: 'Clothing', description: 'Medium grey hoodie, possibly left during a study session.', location: 'Sports complex bleachers', date: daysAgo(5), contactName: 'Kabir Student', contactEmail: 'kabir.demo@example.com' },
];

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/integral_lost_found');
  await Item.deleteMany({ contactEmail: { $in: samples.map((item) => item.contactEmail) } });
  await Item.insertMany(samples);
  console.log(`Inserted ${samples.length} demo reports.`);
} catch (error) {
  console.error('Could not seed demo reports:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
