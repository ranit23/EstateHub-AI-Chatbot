import './config/env.js';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import propertiesRoutes from './routes/properties.js';
import landRoutes from './routes/lands.js';
import authRoutes from './routes/auth.js';
import aiRoutes from './routes/ai.js';

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Built-in body parser replaces body-parser package

// Routes
app.use('/api/properties', propertiesRoutes);
app.use('/api/lands', landRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('EstateHub API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
