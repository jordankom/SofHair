// BACKEND
// Script de seed : insère ~100 prestations dans la base.
// À lancer manuellement : npm run seed:services

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { ServiceModel } from '../models/service.model';

async function seedServices() {
    try {
        await connectDB();
        console.log('✅ DB connectée, suppression des anciennes prestations...');

        await ServiceModel.deleteMany({});

        const categories = ['Coiffure', 'Coloration', 'Soin', 'Homme', 'Enfant'];

        // Quelques images génériques (tu pourras les remplacer plus tard
        // par tes vraies images dans un bucket ou un /public/images).
        const imageUrls = [
            'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
            'https://images.pexels.com/photos/3738341/pexels-photo-3738341.jpeg',
            'https://images.pexels.com/photos/3993439/pexels-photo-3993439.jpeg',
            'https://images.pexels.com/photos/3738346/pexels-photo-3738346.jpeg',
            'https://images.pexels.com/photos/3738344/pexels-photo-3738344.jpeg',
        ];

        const services = [];

        // On génère 100 prestations
        for (let i = 1; i <= 100; i++) {
            const category = categories[i % categories.length];
            const imageUrl = imageUrls[i % imageUrls.length];

            services.push({
                name: `Prestation ${i}`,
                category,
                price: 20 + (i % 10) * 5,          // Prix entre 20 et 65€
                durationMinutes: 30 + (i % 4) * 15, // Durée entre 30 et 75 min
                imageUrl,
                isActive: true,
            });
        }

        await ServiceModel.insertMany(services);

        console.log(`✅ ${services.length} prestations créées en base.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur seedServices :', error);
        process.exit(1);
    }
}

seedServices();
