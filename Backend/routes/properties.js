import express from 'express';
import Property from '../models/Property.js';

const router = express.Router();

// GET all properties (with filtering)
router.get('/', async (req, res) => {
    try {
        const { type, propertyType, location } = req.query;

        // Build query object
        let query = {};

        if (type) {
            query.type = type;
        }

        if (propertyType && propertyType !== 'Property Type' && propertyType !== 'Any') {
            // Case-insensitive regex match
            query.propertyType = { $regex: new RegExp(propertyType, 'i') };
        }

        if (location && location !== 'Any') {
            const keyword = location; // Search by location keyword
            // Simple search on location or title
            query.$or = [
                { location: { $regex: new RegExp(keyword, 'i') } },
                { title: { $regex: new RegExp(keyword, 'i') } }
            ];
        }

        const properties = await Property.find(query).sort({ createdAt: -1 }).populate('owner', 'name email phone');
        res.json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

import { upload } from '../config/cloudinary.js';

// POST new property
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const newPropertyData = req.body;

        // If an image file was uploaded, usage its Cloudinary URL
        if (req.file && req.file.path) {
            newPropertyData.image = req.file.path;
        } else if (!newPropertyData.image) {
            // Default image if neither file nor URL is provided
            newPropertyData.image = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80';
        }

        const property = await Property.create(newPropertyData);
        const populatedProperty = await Property.findById(property._id).populate('owner', 'name email phone');
        res.status(201).json(populatedProperty);
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ error: 'Failed to save property' });
    }
});

// DELETE property
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProperty = await Property.findByIdAndDelete(id);

        if (!deletedProperty) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json({ message: 'Property deleted successfully', id });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

export default router;
