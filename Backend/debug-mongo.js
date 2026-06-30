import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const logStream = fs.createWriteStream('db-debug.log', { flags: 'a' });

function log(message) {
    console.log(message);
    logStream.write(message + '\n');
}

log('--- Starting Connection Test ---');
log(`Time: ${new Date().toISOString()}`);
log(`URI: ${process.env.MONGO_URI ? 'Defined' : 'Undefined'}`);

mongoose.connect(process.env.MONGO_URI)
    .then((conn) => {
        log(`Success! Connected to host: ${conn.connection.host}`);
        process.exit(0);
    })
    .catch((err) => {
        log('Connection FAILED.');
        log(`Error Name: ${err.name}`);
        log(`Error Message: ${err.message}`);
        log(`Full Error: ${JSON.stringify(err, null, 2)}`);
        process.exit(1);
    });
