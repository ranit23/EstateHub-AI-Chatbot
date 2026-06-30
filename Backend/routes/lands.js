import express from 'express';
import Land from '../models/Land.js';

const router = express.Router();

// GET all lands
router.get('/', async (req, res) => {
    try {
        const lands = await Land.find().sort({ createdAt: -1 }).populate('owner', 'name email phone');
        res.json(lands);
    } catch (error) {
        console.error('Error fetching lands:', error);
        res.status(500).json({ error: 'Failed to fetch lands' });
    }
});

import { upload } from '../config/cloudinary.js';

// POST new land
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const newLandData = req.body;

        // If an image file was uploaded, use its Cloudinary URL
        if (req.file && req.file.path) {
            newLandData.image = req.file.path;
        } else if (!newLandData.image) {
            // Default image if neither file nor URL is provided
            newLandData.image = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
        }

        const land = await Land.create(newLandData);
        const populatedLand = await Land.findById(land._id).populate('owner', 'name email phone');
        res.status(201).json(populatedLand);
    } catch (error) {
        console.error('Error creating land:', error);
        res.status(500).json({ error: 'Failed to save land' });
    }
});

// DELETE land
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedLand = await Land.findByIdAndDelete(id);

        if (!deletedLand) {
            return res.status(404).json({ error: 'Land not found' });
        }

        res.json({ message: 'Land deleted successfully', id });
    } catch (error) {
        console.error('Error deleting land:', error);
        res.status(500).json({ error: 'Failed to delete land' });
    }
});

export default router;
