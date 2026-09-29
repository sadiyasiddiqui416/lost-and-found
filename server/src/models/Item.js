import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, enum: ['lost', 'found'], required: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 700 },
  location: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  contactName: { type: String, required: true, trim: true, maxlength: 80 },
  contactEmail: { type: String, required: true, trim: true, lowercase: true },
  status: { type: String, enum: ['open', 'resolved'], default: 'open' },
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
