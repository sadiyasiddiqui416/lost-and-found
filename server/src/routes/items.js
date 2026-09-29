import { Router } from 'express';
import mongoose from 'mongoose';
import Item from '../models/Item.js';

const router = Router();

router.get('/stats', async (_req, res, next) => {
  try {
    const [open, reunited, lost, found] = await Promise.all([
      Item.countDocuments({ status: 'open' }),
      Item.countDocuments({ status: 'resolved' }),
      Item.countDocuments({ status: 'open', type: 'lost' }),
      Item.countDocuments({ status: 'open', type: 'found' }),
    ]);
    res.json({ open, reunited, lost, found });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const { q, type, category } = req.query;
    const filter = { status: 'open' };
    if (['lost', 'found'].includes(type)) filter.type = type;
    if (category && category !== 'All categories') filter.category = category;
    if (typeof q === 'string' && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'i');
      filter.$or = ['title', 'description', 'location', 'category'].map((field) => ({ [field]: regex }));
    }
    res.json(await Item.find(filter).sort({ date: -1, createdAt: -1 }).limit(100));
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, type, category, description, location, date, contactName, contactEmail } = req.body;
    const item = await Item.create({ title, type, category, description, location, date, contactName, contactEmail });
    res.status(201).json(item);
  } catch (error) {
    if (error.name === 'ValidationError') return res.status(400).json({ message: Object.values(error.errors).map((entry) => entry.message).join('. ') });
    next(error);
  }
});

router.patch('/:id/resolve', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid report ID.' });
    const item = await Item.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Report not found.' });
    res.json(item);
  } catch (error) { next(error); }
});

export default router;
