// Utilisé pour centraliser la lecture de process.env
// et fournir des valeurs typées au reste de l'app.

import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    port: number;
    mongoUri: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    nodeEnv: string;
}

const env: EnvConfig = {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/salon_coiffure_db',
    jwtSecret: process.env.JWT_SECRET || 'change-moi-en-prod',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    nodeEnv: process.env.NODE_ENV || 'development'
};

export default env;
