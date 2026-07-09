import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Land from '../models/Land.js';

dotenv.config({ path: '../.env' });

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://ranitsarkar178_db_user:Ranit12345@cluster0.wq8txn4.mongodb.net/?appName=Cluster0');
        console.log('Connected to DB');

        const updates = [
            { location: 'New Town, Kolkata', title: 'Residential Plot in New Town' },
            { location: 'EM Bypass, Kolkata', title: 'Commercial Land on EM Bypass' },
            { location: 'Rajarhat, Kolkata', title: 'Residential Land near Rajarhat' },
            { location: 'Barasat, North 24 Parganas', title: 'Agricultural Land in Barasat' },
            { location: 'Salt Lake, Kolkata', title: 'Residential Plot in Salt Lake' },
            { location: 'Dankuni, Hooghly', title: 'Industrial Land in Dankuni' }
        ];

        for (const item of updates) {
            const result = await Land.updateMany(
                { location: item.location, title: { $exists: false } },
                { $set: { title: item.title } }
            );
            console.log(`Updated documents for ${item.location}:`, result.modifiedCount);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
