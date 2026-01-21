import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model";
import { ServiceModel } from "../models/service.model";

type SeedService = {
    name: string;
    category: string;
    price: number;
    durationMinutes: number;
    description?: string;
    imageUrl: string; // URL locale servie par Vite (public/)
    isActive: boolean;
};

async function main() {
    const MONGO_URI = process.env.MONGO_URI ||"mongodb+srv://jordankom4_db_user:Réussite100@cluster0.ywwo2ir.mongodb.net/softhair?appName=Cluster0";
    if (!MONGO_URI) throw new Error("MONGO_URI manquant");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // 1) OWNER
    const ownerEmail = "owner@softhair.com";
    const ownerPassword = "password123";

    const existingOwner = await UserModel.findOne({ email: ownerEmail });
    if (!existingOwner) {
        const passwordHash = await bcrypt.hash(ownerPassword, 10);
        await UserModel.create({
            email: ownerEmail,
            passwordHash,
            firstName: "Jordan",
            lastName: "Owner",
            role: "owner",
        });
        console.log("✅ Owner créé :", ownerEmail);
    } else {
        console.log("ℹ️ Owner déjà présent :", ownerEmail);
    }

    // 2) SERVICES (30) - images locales
    const services: SeedService[] = [
        // Coupe Femme
        { name: "Coupe femme (shampoing + coupe)", category: "Coupe Femme", price: 35, durationMinutes: 45, imageUrl: "/services/coupe-femme.jpg", isActive: true },
        { name: "Coupe femme + brushing", category: "Coupe Femme", price: 50, durationMinutes: 60, imageUrl: "/services/coupe-femme-brushing.jpg", isActive: true },
        { name: "Frange", category: "Coupe Femme", price: 10, durationMinutes: 15, imageUrl: "/services/frange.jpg", isActive: true },
        { name: "Coupe transformation", category: "Coupe Femme", price: 65, durationMinutes: 75, imageUrl: "/services/coupe-transformation.jpg", isActive: true },

        // Brushing
        { name: "Brushing court", category: "Brushing", price: 25, durationMinutes: 30, imageUrl: "/services/brushing-court.jpg", isActive: true },
        { name: "Brushing mi-long", category: "Brushing", price: 32, durationMinutes: 45, imageUrl: "/services/brushing-mi-long.jpg", isActive: true },
        { name: "Brushing long", category: "Brushing", price: 40, durationMinutes: 60, imageUrl: "/services/brushing-long.jpg", isActive: true },
        { name: "Wavy / boucles", category: "Brushing", price: 20, durationMinutes: 30, imageUrl: "/services/wavy-boucles.jpg", isActive: true },

        // Coupe Homme
        { name: "Coupe homme classique", category: "Coupe Homme", price: 20, durationMinutes: 30, imageUrl: "/services/coupe-homme.jpg", isActive: true },
        { name: "Coupe homme dégradé", category: "Coupe Homme", price: 25, durationMinutes: 35, imageUrl: "/services/coupe-homme-degrade.jpg", isActive: true },
        { name: "Coupe + shampoing", category: "Coupe Homme", price: 24, durationMinutes: 35, imageUrl: "/services/coupe-homme-shampoing.jpg", isActive: true },
        { name: "Coiffage / finition", category: "Coupe Homme", price: 10, durationMinutes: 15, imageUrl: "/services/coiffage-homme.jpg", isActive: true },

        // Barbe
        { name: "Taille de barbe", category: "Barbe", price: 15, durationMinutes: 20, imageUrl: "/services/taille-barbe.jpg", isActive: true },
        { name: "Barbe + contours rasoir", category: "Barbe", price: 22, durationMinutes: 30, imageUrl: "/services/barbe-contours.jpg", isActive: true },
        { name: "Rasage traditionnel", category: "Barbe", price: 25, durationMinutes: 30, imageUrl: "/services/rasage-traditionnel.jpg", isActive: true },

        // Enfant
        { name: "Coupe enfant (-12 ans)", category: "Enfant", price: 15, durationMinutes: 20, imageUrl: "/services/coupe-enfant.jpg", isActive: true },
        { name: "Coupe ado", category: "Enfant", price: 18, durationMinutes: 30, imageUrl: "/services/coupe-ado.jpg", isActive: true },

        // Coloration
        { name: "Coloration racines", category: "Coloration", price: 55, durationMinutes: 90, imageUrl: "/services/coloration-racines.jpg", isActive: true },
        { name: "Coloration complète", category: "Coloration", price: 75, durationMinutes: 120, imageUrl: "/services/coloration-complete.jpg", isActive: true },
        { name: "Patine / gloss", category: "Coloration", price: 30, durationMinutes: 45, imageUrl: "/services/patine-gloss.jpg", isActive: true },
        { name: "Décoloration", category: "Coloration", price: 95, durationMinutes: 150, imageUrl: "/services/decoloration.jpg", isActive: true },

        // Balayage
        { name: "Balayage naturel", category: "Balayage", price: 110, durationMinutes: 150, imageUrl: "/services/balayage-naturel.jpg", isActive: true },
        { name: "Mèches alu", category: "Balayage", price: 120, durationMinutes: 150, imageUrl: "/services/meches-alu.jpg", isActive: true },
        { name: "Ombré hair", category: "Balayage", price: 140, durationMinutes: 180, imageUrl: "/services/ombre-hair.jpg", isActive: true },

        // Soins
        { name: "Soin profond", category: "Soin", price: 20, durationMinutes: 30, imageUrl: "/services/soin-profond.jpg", isActive: true },
        { name: "Soin botox capillaire", category: "Soin", price: 55, durationMinutes: 60, imageUrl: "/services/soin-botox.jpg", isActive: true },

        // Lissage
        { name: "Lissage kératine", category: "Lissage", price: 160, durationMinutes: 180, imageUrl: "/services/lissage-keratine.jpg", isActive: true },
        { name: "Lissage brésilien", category: "Lissage", price: 150, durationMinutes: 180, imageUrl: "/services/lissage-bresilien.jpg", isActive: true },

        // Événement
        { name: "Chignon", category: "Coiffure Événement", price: 60, durationMinutes: 60, imageUrl: "/services/chignon.jpg", isActive: true },
        { name: "Coiffure mariée (essai non inclus)", category: "Coiffure Événement", price: 95, durationMinutes: 90, imageUrl: "/services/coiffure-mariee.jpg", isActive: true },
    ];

    // reset total
    await ServiceModel.deleteMany({});
    console.log("🧹 Prestations supprimées");

    if (services.length !== 30) {
        throw new Error(`La liste doit contenir 30 prestations. Actuel: ${services.length}`);
    }

    await ServiceModel.insertMany(services);
    console.log("✅ 30 prestations insérées");

    await mongoose.disconnect();
    console.log("✅ Terminé");
}

main().catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
});
