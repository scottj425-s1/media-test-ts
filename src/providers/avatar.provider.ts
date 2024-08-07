// connect to mongoose
import mongoose from 'mongoose';

const connectAvatarDB = async (): Promise<typeof mongoose> => {
    if (!process.env['MONGODB_URI']) {
        throw new Error('MONGODB_URI not found');
    }
    return mongoose.connect(process.env.MONGODB_URI);
};

export { connectAvatarDB };