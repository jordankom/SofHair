import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model";
import { ServiceModel } from "../models/service.model";

async function main() {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/salon_coiffure_db";
    if (!MONGO_URI) throw new Error("MONGO_URI manquant");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // OWNER
    const ownerEmail = "owner@softhair.com";
    const existingOwner = await UserModel.findOne({ email: ownerEmail });

    if (!existingOwner) {
        const passwordHash = await bcrypt.hash("password123", 10);
        await UserModel.create({
            email: ownerEmail,
            passwordHash,
            firstName: "Jordan",
            lastName: "Owner",
            role: "owner",
        });
    }

    // RESET SERVICES
    await ServiceModel.deleteMany({});
    console.log("🧹 Prestations supprimées");

    const services = [
        // ===== COUPE FEMME =====
        {
            name: "Coupe femme",
            category: "Coupe Femme",
            price: 35,
            durationMinutes: 45,
            imageUrl: "https://picsum.photos/seed/coupe-femme/800/600",
        },
        {
            name: "Coupe femme + brushing",
            category: "Coupe Femme",
            price: 55,
            durationMinutes: 75,
            imageUrl: "https://picsum.photos/seed/coupe-femme-brushing/800/600",
        },

        // ===== BRUSHING =====
        {
            name: "Brushing court",
            category: "Brushing",
            price: 22,
            durationMinutes: 30,
            imageUrl: "https://picsum.photos/seed/brushing-court/800/600",
        },
        {
            name: "Brushing mi-long",
            category: "Brushing",
            price: 28,
            durationMinutes: 40,
            imageUrl: "https://picsum.photos/seed/brushing-mi-long/800/600",
        },
        {
            name: "Brushing long",
            category: "Brushing",
            price: 35,
            durationMinutes: 50,
            imageUrl: "https://picsum.photos/seed/brushing-long/800/600",
        },

        // ===== COUPE HOMME =====
        {
            name: "Coupe homme classique",
            category: "Coupe Homme",
            price: 22,
            durationMinutes: 30,
            imageUrl: "https://picsum.photos/seed/coupe-homme/800/600",
        },
        {
            name: "Dégradé (fade)",
            category: "Coupe Homme",
            price: 25,
            durationMinutes: 35,
            imageUrl: "https://picsum.photos/seed/fade-haircut/800/600",
        },

        // ===== BARBE =====
        {
            name: "Taille de barbe",
            category: "Barbe",
            price: 15,
            durationMinutes: 20,
            imageUrl: "https://picsum.photos/seed/barbe/800/600",
        },
        {
            name: "Barbe + contours",
            category: "Barbe",
            price: 20,
            durationMinutes: 30,
            imageUrl: "https://picsum.photos/seed/barbe-contours/800/600",
        },

        // ===== ENFANT =====
        {
            name: "Coupe enfant (-10 ans)",
            category: "Enfant",
            price: 15,
            durationMinutes: 20,
            imageUrl: "https://picsum.photos/seed/coupe-enfant/800/600",
        },
        {
            name: "Coupe ado (10-16 ans)",
            category: "Enfant",
            price: 18,
            durationMinutes: 25,
            imageUrl: "https://picsum.photos/seed/coupe-ado/800/600",
        },

        // ===== COLORATION =====
        {
            name: "Coloration racines",
            category: "Coloration",
            price: 45,
            durationMinutes: 75,
            imageUrl: "https://picsum.photos/seed/coloration-racines/800/600",
        },
        {
            name: "Coloration complète",
            category: "Coloration",
            price: 65,
            durationMinutes: 90,
            imageUrl: "https://picsum.photos/seed/coloration-complete/800/600",
        },

        // ===== BALAYAGE =====
        {
            name: "Balayage naturel",
            category: "Balayage",
            price: 95,
            durationMinutes: 150,
            imageUrl: "https://picsum.photos/seed/balayage/800/600",
        },
        {
            name: "Balayage + coupe + brushing",
            category: "Balayage",
            price: 150,
            durationMinutes: 180,
            imageUrl: "https://picsum.photos/seed/balayage-complet/800/600",
        },

        // ===== SOIN =====
        {
            name: "Soin capillaire profond",
            category: "Soin",
            price: 30,
            durationMinutes: 30,
            imageUrl: "https://picsum.photos/seed/soin-cheveux/800/600",
        },
        {
            name: "Soin réparateur kératine",
            category: "Soin",
            price: 45,
            durationMinutes: 45,
            imageUrl: "https://picsum.photos/seed/soin-keratine/800/600",
        },

        // ===== LISSAGE =====
        {
            name: "Lissage brésilien",
            category: "Lissage",
            price: 150,
            durationMinutes: 180,
            imageUrl: "https://picsum.photos/seed/lissage-bresilien/800/600",
        },

        // ===== ÉVÉNEMENT =====
        {
            name: "Chignon classique",
            category: "Coiffure Événement",
            price: 55,
            durationMinutes: 60,
            imageUrl: "https://picsum.photos/seed/chignon/800/600",
        },
        {
            name: "Coiffure de soirée",
            category: "Coiffure Événement",
            price: 45,
            durationMinutes: 50,
            imageUrl: "https://tse3.mm.bing.net/th/id/OIP.78SHoqrgH8viaATfiCNoVQHaLG?rs=1&pid=ImgDetMain&o=7&rm=3",
        },
        {
            name: "Coiffure mariage",
            category: "Coiffure Événement",
            price: 80,
            durationMinutes: 90,
            imageUrl: "https://picsum.photos/seed/coiffure-mariage/800/600",
        },
    ];

    // if (services.length !== 30) {
    //     throw new Error(`La liste doit contenir 30 prestations. Actuel: ${services.length}`);
    // }

    await ServiceModel.insertMany(
        services.map((s) => ({ ...s, isActive: true }))
    );

    console.log("✅ 30 prestations réalistes créées");
    await mongoose.disconnect();
    console.log("✅ Terminé");
}

main().catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
});
