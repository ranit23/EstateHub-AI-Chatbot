import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Land from '../models/Land.js';

dotenv.config({ path: '../.env' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://ranitsarkar178_db_user:Ranit12345@cluster0.wq8txn4.mongodb.net/?appName=Cluster0');
        console.log('Connected to DB');
        const lands = await Land.find({});
        console.log('LANDS IN DB:');
        lands.forEach(l => {
            console.log({
                id: l._id,
                title: l.title,
                description: l.description,
                price: l.price,
                location: l.location,
                area: l.area
            });
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
