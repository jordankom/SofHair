// Gestion de la connexion à MongoDB via Mongoose (ODM)

import mongoose from 'mongoose';
import env from './env';

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(env.mongoUri);
        console.log('✅ MongoDB connecté');
    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB :', (error as Error).message);
        throw error;
    }
}
